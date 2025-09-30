import { RoseObject, RoseClass, RoseOperation } from '../types/RoseTypes';

export class RoseParserV2 {
  private tokens: string[] = [];
  private position: number = 0;

  parse(content: string): RoseObject {
    this.tokenize(content);
    this.position = 0;
    
    const rootObject: RoseObject = {
      type: 'RoseFile',
      properties: {},
      children: []
    };
    
    while (this.position < this.tokens.length) {
      if (this.tokens[this.position] === '(' && this.tokens[this.position + 1] === 'object') {
        rootObject.children.push(this.parseObject());
      } else {
        this.position++;
      }
    }
    
    return rootObject;
  }

  private tokenize(content: string): void {
    // Clean up the content and split into tokens
    const cleaned = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    
    // More sophisticated tokenization to handle nested structures
    const tokens: string[] = [];
    let current = '';
    let inString = false;
    // let parenDepth = 0;
    
    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      
      if (char === '"' && cleaned[i-1] !== '\\') {
        inString = !inString;
        current += char;
      } else if (inString) {
        current += char;
      } else if (char === '(' || char === ')') {
        if (current.trim()) {
          tokens.push(current.trim());
          current = '';
        }
        tokens.push(char);
        // if (char === '(') parenDepth++;
        // else parenDepth--;
      } else if (/\s/.test(char)) {
        if (current.trim()) {
          tokens.push(current.trim());
          current = '';
        }
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      tokens.push(current.trim());
    }
    
    this.tokens = tokens.filter(token => token.length > 0);
  }

  private parseObject(): RoseObject {
    if (this.tokens[this.position] !== '(') {
      throw new Error(`Expected '(' at position ${this.position}, found '${this.tokens[this.position]}'`);
    }
    this.position++; // skip '('

    if (this.tokens[this.position] !== 'object') {
      const context = this.tokens.slice(Math.max(0, this.position - 3), this.position + 3).join(' ');
      throw new Error(`Expected 'object' at position ${this.position}, found '${this.tokens[this.position]}'. Context: ${context}`);
    }
    this.position++; // skip 'object'

    const type = this.tokens[this.position++];
    let name: string | undefined;
    
    // Check if next token is a quoted string (name)
    if (this.tokens[this.position]?.startsWith('"')) {
      name = this.tokens[this.position].slice(1, -1);
      this.position++;
    }

    const properties: Record<string, any> = {};
    const children: RoseObject[] = [];

    while (this.position < this.tokens.length && this.tokens[this.position] !== ')') {
      const token = this.tokens[this.position];
      
      if (token === '(') {
        // Check if this is a list
        if (this.tokens[this.position + 1] === 'list') {
          this.position++; // skip '('
          this.position++; // skip 'list'
          const listType = this.tokens[this.position++];
          const listItems = this.parseList();
          properties[listType] = listItems;
        } else if (this.tokens[this.position + 1] === 'object') {
          // Nested object
          children.push(this.parseObject());
        } else {
          // This is likely a parenthesized value that got misplaced
          // Skip it for now or handle as needed
          this.position++;
          while (this.position < this.tokens.length && this.tokens[this.position] !== ')') {
            this.position++;
          }
          if (this.tokens[this.position] === ')') {
            this.position++;
          }
        }
      } else {
        // Check if this is a property followed by a list
        const key = token;
        this.position++;
        
        if (this.position < this.tokens.length && 
            this.tokens[this.position] === '(' && 
            this.tokens[this.position + 1] === 'list') {
          // This is a property with a list value
          this.position++; // skip '('
          this.position++; // skip 'list'
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const listType = this.tokens[this.position++];
          const listItems = this.parseList();
          properties[key] = listItems;
        } else {
          // Regular property - parseValue will handle the current position
          const value = this.parseValue();
          properties[key] = value;
        }
      }
    }

    if (this.tokens[this.position] === ')') {
      this.position++; // skip ')'
    }

    return { type, name, properties, children };
  }

  private parseList(): any[] {
    const items: any[] = [];
    
    if (this.tokens[this.position] === '(') {
      this.position++; // skip '('
      
      while (this.position < this.tokens.length && this.tokens[this.position] !== ')') {
        if (this.tokens[this.position] === '(') {
          // This could be an object or another nested structure
          if (this.tokens[this.position + 1] === 'object') {
            items.push(this.parseObject());
          } else {
            // Skip the '(' and treat as values for now
            this.position++;
            while (this.position < this.tokens.length && this.tokens[this.position] !== ')') {
              items.push(this.parseValue());
            }
            if (this.tokens[this.position] === ')') {
              this.position++; // skip ')'
            }
          }
        } else if (this.tokens[this.position] === 'object') {
          // We're at 'object' but we need to check if there was a '(' before it
          // This means we're inside a list and found an object definition
          // We need to back up and parse it as an object
          this.position--; // go back to the '('
          items.push(this.parseObject());
        } else {
          // This is a simple value
          items.push(this.parseValue());
        }
      }
      
      if (this.tokens[this.position] === ')') {
        this.position++; // skip ')'
      }
    }
    
    return items;
  }

  private parseValue(): any {
    const token = this.tokens[this.position];
    
    if (token === '(') {
      // Handle complex values like ("OperationKindSet" 202)
      this.position++; // skip '('
      const values: any[] = [];
      while (this.position < this.tokens.length && this.tokens[this.position] !== ')') {
        values.push(this.parseValue());
      }
      if (this.tokens[this.position] === ')') {
        this.position++; // skip ')'
      }
      return values;
    }
    
    this.position++;
    
    if (token.startsWith('"') && token.endsWith('"')) {
      return token.slice(1, -1);
    }
    
    if (token === 'TRUE') return true;
    if (token === 'FALSE') return false;
    
    const num = Number(token);
    if (!isNaN(num)) return num;
    
    return token;
  }

  static extractClasses(roseObject: RoseObject): RoseClass[] {
    const classes: RoseClass[] = [];
    
    function findClasses(obj: RoseObject): void {
      // Look for Class objects directly
      if (obj.type === 'Class') {
        const roseClass: RoseClass = {
          name: obj.name || 'Unknown',
          quid: obj.properties.quid || '',
          documentation: obj.properties.documentation,
          attributes: [],
          operations: [],
          superclasses: [],
          classAttributes: [],
          language: obj.properties.language
        };

        // Extract file attributes (like BodyFile, CodeFile)
        if (obj.properties.attributes && Array.isArray(obj.properties.attributes)) {
          obj.properties.attributes.forEach((attr: any) => {
            if (attr && typeof attr === 'object' && attr.type === 'Attribute') {
              roseClass.attributes.push({
                tool: attr.properties?.tool || '',
                name: attr.properties?.name || '',
                value: attr.properties?.value || ''
              });
            }
          });
        }

        // Extract operations/methods
        if (obj.properties.operations && Array.isArray(obj.properties.operations)) {
          obj.properties.operations.forEach((op: any) => {
            if (op && typeof op === 'object' && op.type === 'Operation') {
              const operation: RoseOperation = {
                name: op.name || '',
                quid: op.properties?.quid || '',
                documentation: op.properties?.documentation,
                parameters: [],
                result: op.properties?.result,
                concurrency: op.properties?.concurrency,
                opExportControl: op.properties?.opExportControl,
                uid: op.properties?.uid,
                attributes: []
              };

              // Extract parameters
              if (op.properties?.parameters && Array.isArray(op.properties.parameters)) {
                op.properties.parameters.forEach((param: any) => {
                  if (param && typeof param === 'object' && param.type === 'Parameter') {
                    operation.parameters.push({
                      name: param.name || '',
                      type: param.properties?.type || ''
                    });
                  }
                });
              }

              // Extract operation attributes (for documentation, etc.)
              if (op.properties?.attributes && Array.isArray(op.properties.attributes)) {
                op.properties.attributes.forEach((attr: any) => {
                  if (attr && typeof attr === 'object' && attr.type === 'Attribute') {
                    operation.attributes.push({
                      tool: attr.properties?.tool || '',
                      name: attr.properties?.name || '',
                      value: Array.isArray(attr.properties?.value) 
                        ? attr.properties.value.join(' ') 
                        : attr.properties?.value || ''
                    });
                  }
                });
              }

              roseClass.operations.push(operation);
            }
          });
        }

        // Extract superclasses/inheritance
        if (obj.properties.superclasses && Array.isArray(obj.properties.superclasses)) {
          obj.properties.superclasses.forEach((sc: any) => {
            if (sc && typeof sc === 'object' && sc.type === 'Inheritance_Relationship') {
              roseClass.superclasses.push({
                quid: sc.properties?.quid || '',
                supplier: sc.properties?.supplier || '',
                quidu: sc.properties?.quidu || ''
              });
            }
          });
        }

        // Extract class attributes (member variables)
        if (obj.properties.class_attributes && Array.isArray(obj.properties.class_attributes)) {
          obj.properties.class_attributes.forEach((attr: any) => {
            if (attr && typeof attr === 'object' && attr.type === 'ClassAttribute') {
              roseClass.classAttributes.push({
                name: attr.name || '',
                quid: attr.properties?.quid || '',
                type: attr.properties?.type || ''
              });
            }
          });
        }

        classes.push(roseClass);
      }

      // Recursively search in children
      obj.children.forEach(findClasses);
      
      // Also search in properties that might contain nested objects or arrays
      Object.values(obj.properties).forEach(value => {
        if (Array.isArray(value)) {
          value.forEach(item => {
            if (item && typeof item === 'object' && item.type) {
              findClasses(item);
            }
          });
        } else if (value && typeof value === 'object' && value.type) {
          findClasses(value);
        }
      });
    }
    
    findClasses(roseObject);
    return classes;
  }
}
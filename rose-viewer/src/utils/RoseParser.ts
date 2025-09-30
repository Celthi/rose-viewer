import { RoseObject, RoseClass, RoseOperation } from '../types/RoseTypes';

export class RoseParser {
  private tokens: string[] = [];
  private position: number = 0;

  parse(content: string): RoseObject {
    this.tokenize(content);
    this.position = 0;
    
    // Rose files can have multiple top-level objects
    // We'll create a root container to hold them all
    const rootObject: RoseObject = {
      type: 'RoseFile',
      properties: {},
      children: []
    };
    
    while (this.position < this.tokens.length) {
      if (this.tokens[this.position] === '(') {
        rootObject.children.push(this.parseObject());
      } else {
        this.position++; // skip unexpected tokens
      }
    }
    
    return rootObject;
  }

  private tokenize(content: string): void {
    // Remove comments and normalize whitespace
    const cleaned = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    
    // Split into tokens, preserving strings and parentheses
    const tokenRegex = /"[^"]*"|[(){}]|[^\s(){}]+/g;
    this.tokens = cleaned.match(tokenRegex) || [];
    
    // Clean up tokens - remove empty ones
    this.tokens = this.tokens.filter(token => token.trim().length > 0);
  }

  private parseObject(): RoseObject {
    if (this.tokens[this.position] !== '(') {
      throw new Error(`Expected '(' at position ${this.position}, found '${this.tokens[this.position]}'`);
    }
    this.position++; // skip '('

    if (this.tokens[this.position] !== 'object') {
      throw new Error(`Expected 'object' at position ${this.position}, found '${this.tokens[this.position]}'`);
    }
    this.position++; // skip 'object'

    const type = this.tokens[this.position++];
    let name: string | undefined;
    
    // Check if next token is a quoted string (name)
    if (this.tokens[this.position]?.startsWith('"')) {
      name = this.tokens[this.position].slice(1, -1); // remove quotes
      this.position++;
    }

    const properties: Record<string, any> = {};
    const children: RoseObject[] = [];

    while (this.position < this.tokens.length && this.tokens[this.position] !== ')') {
      const token = this.tokens[this.position];
      
      if (token === '(') {
        // Check if this is a list or nested object
        if (this.tokens[this.position + 1] === 'list') {
          this.position++; // skip '('
          this.position++; // skip 'list'
          const listType = this.tokens[this.position++];
          const listItems = this.parseList();
          properties[listType] = listItems;
        } else {
          // Nested object
          children.push(this.parseObject());
        }
      } else {
        // Property
        const key = token;
        this.position++;
        const value = this.parseValue();
        properties[key] = value;
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
          items.push(this.parseObject());
        } else {
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
      return token.slice(1, -1); // remove quotes
    }
    
    if (token === 'TRUE') return true;
    if (token === 'FALSE') return false;
    
    const num = Number(token);
    if (!isNaN(num)) return num;
    
    return token;
  }

  static extractClasses(roseObject: RoseObject): RoseClass[] {
    const classes: RoseClass[] = [];
    
    function extractFromArray(arr: any[]): void {
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        
        // Check if this is a class definition
        if (item === 'object' && i + 2 < arr.length && arr[i + 1] === 'Class') {
          const className = arr[i + 2];
          const roseClass: RoseClass = {
            name: className,
            quid: '',
            attributes: [],
            operations: [],
            superclasses: [],
            classAttributes: [],
            language: undefined
          };
          
          // Parse the rest of the class definition
          for (let j = i + 3; j < arr.length; j++) {
            const key = arr[j];
            const value = arr[j + 1];
            
            if (key === 'quid' && typeof value === 'string') {
              roseClass.quid = value;
              j++; // skip value
            } else if (key === 'language' && typeof value === 'string') {
              roseClass.language = value;
              j++; // skip value
            } else if (key === 'attributes' && Array.isArray(value)) {
              extractAttributes(value, roseClass);
              j++; // skip value
            } else if (key === 'operations' && Array.isArray(value)) {
              extractOperations(value, roseClass);
              j++; // skip value
            } else if (key === 'superclasses' && Array.isArray(value)) {
              extractSuperclasses(value, roseClass);
              j++; // skip value
            } else if (key === 'class_attributes' && Array.isArray(value)) {
              extractClassAttributes(value, roseClass);
              j++; // skip value
            } else if (Array.isArray(value)) {
              extractFromArray(value);
              j++; // skip value
            }
          }
          
          classes.push(roseClass);
          break; // Found a class, move to next item
        } else if (Array.isArray(item)) {
          extractFromArray(item);
        }
      }
    }
    
    function extractAttributes(arr: any[], roseClass: RoseClass): void {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === 'object' && arr[i + 1] === 'Attribute') {
          const attr = { tool: '', name: '', value: '' };
          for (let j = i + 2; j < arr.length && j < i + 10; j += 2) {
            if (arr[j] === 'tool') attr.tool = arr[j + 1] || '';
            else if (arr[j] === 'name') attr.name = arr[j + 1] || '';
            else if (arr[j] === 'value') attr.value = arr[j + 1] || '';
          }
          roseClass.attributes.push(attr);
        }
      }
    }
    
    function extractOperations(arr: any[], roseClass: RoseClass): void {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === 'object' && arr[i + 1] === 'Operation') {
          const operation: RoseOperation = {
            name: arr[i + 2] || '',
            quid: '',
            parameters: [],
            attributes: []
          };
          
          for (let j = i + 3; j < arr.length; j += 2) {
            const key = arr[j];
            const value = arr[j + 1];
            
            if (key === 'quid') operation.quid = value || '';
            else if (key === 'result') operation.result = value;
            else if (key === 'concurrency') operation.concurrency = value;
            else if (key === 'opExportControl') operation.opExportControl = value;
            else if (key === 'uid') operation.uid = value;
            else if (key === 'parameters' && Array.isArray(value)) {
              extractParameters(value, operation);
            }
            else if (key === 'attributes' && Array.isArray(value)) {
              extractOperationAttributes(value, operation);
            }
          }
          
          roseClass.operations.push(operation);
        }
      }
    }
    
    function extractParameters(arr: any[], operation: RoseOperation): void {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === 'object' && arr[i + 1] === 'Parameter') {
          const param = { name: arr[i + 2] || '', type: '' };
          for (let j = i + 3; j < arr.length && j < i + 8; j += 2) {
            if (arr[j] === 'type') param.type = arr[j + 1] || '';
          }
          operation.parameters.push(param);
        }
      }
    }
    
    function extractOperationAttributes(arr: any[], operation: RoseOperation): void {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === 'object' && arr[i + 1] === 'Attribute') {
          const attr = { tool: '', name: '', value: '' };
          for (let j = i + 2; j < arr.length && j < i + 10; j += 2) {
            if (arr[j] === 'tool') attr.tool = arr[j + 1] || '';
            else if (arr[j] === 'name') attr.name = arr[j + 1] || '';
            else if (arr[j] === 'value') attr.value = Array.isArray(arr[j + 1]) ? arr[j + 1].join(' ') : arr[j + 1] || '';
          }
          operation.attributes.push(attr);
        }
      }
    }
    
    function extractSuperclasses(arr: any[], roseClass: RoseClass): void {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === 'object' && arr[i + 1] === 'Inheritance_Relationship') {
          const inheritance = { quid: '', supplier: '', quidu: '' };
          for (let j = i + 2; j < arr.length && j < i + 10; j += 2) {
            if (arr[j] === 'quid') inheritance.quid = arr[j + 1] || '';
            else if (arr[j] === 'supplier') inheritance.supplier = arr[j + 1] || '';
            else if (arr[j] === 'quidu') inheritance.quidu = arr[j + 1] || '';
          }
          roseClass.superclasses.push(inheritance);
        }
      }
    }
    
    function extractClassAttributes(arr: any[], roseClass: RoseClass): void {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === 'object' && arr[i + 1] === 'ClassAttribute') {
          const attr = { name: arr[i + 2] || '', quid: '', type: '' };
          for (let j = i + 3; j < arr.length && j < i + 8; j += 2) {
            if (arr[j] === 'quid') attr.quid = arr[j + 1] || '';
            else if (arr[j] === 'type') attr.type = arr[j + 1] || '';
          }
          roseClass.classAttributes.push(attr);
        }
      }
    }
    
    function traverse(obj: RoseObject): void {
      // Check all properties for arrays that might contain classes
      Object.values(obj.properties).forEach(value => {
        if (Array.isArray(value)) {
          extractFromArray(value);
        }
      });
      
      // Traverse children
      obj.children.forEach(traverse);
    }
    
    traverse(roseObject);
    return classes;
  }
}
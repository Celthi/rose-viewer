// Test the parser with a minimal example
const testContent = `(object Class_Category "AggFunc"
  logical_models (list unit_reference_list
    (object Class "TestClass"
      quid "123"
      language "C++")))`;

// Simple parser implementation
class SimpleParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  tokenize(content) {
    const tokens = [];
    let current = '';
    let inString = false;
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      
      if (char === '"' && content[i-1] !== '\\') {
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

  parseObject() {
    if (this.tokens[this.position] !== '(') {
      throw new Error(`Expected '(' at position ${this.position}`);
    }
    this.position++; // skip '('

    if (this.tokens[this.position] !== 'object') {
      throw new Error(`Expected 'object' at position ${this.position}`);
    }
    this.position++; // skip 'object'

    const type = this.tokens[this.position++];
    let name;
    
    // Check if next token is a quoted string (name)
    if (this.tokens[this.position]?.startsWith('"')) {
      name = this.tokens[this.position].slice(1, -1);
      this.position++;
    }

    const properties = {};
    const children = [];

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
        } else {
          // Nested object
          children.push(this.parseObject());
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
          const listType = this.tokens[this.position++];
          const listItems = this.parseList();
          properties[key] = listItems;
        } else {
          // Regular property - position is already advanced
          this.position--; // go back one step since parseValue will advance
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

  parseList() {
    const items = [];
    
    console.log(`parseList: position=${this.position}, token='${this.tokens[this.position]}'`);
    
    // The opening '(' for the list content should be next
    if (this.tokens[this.position] === '(') {
      this.position++; // skip '('
      console.log(`parseList: after skipping '(', position=${this.position}, token='${this.tokens[this.position]}'`);
      
      while (this.position < this.tokens.length && this.tokens[this.position] !== ')') {
        console.log(`parseList loop: position=${this.position}, token='${this.tokens[this.position]}'`);
        
        if (this.tokens[this.position] === '(') {
          // This could be an object or another nested structure
          if (this.tokens[this.position + 1] === 'object') {
            console.log('parseList: found object, parsing...');
            items.push(this.parseObject());
          } else {
            console.log('parseList: found non-object parenthesis, treating as values');
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
          console.log('parseList: found object token, backing up to parse as object');
          items.push(this.parseObject());
        } else {
          // This is a simple value
          console.log('parseList: parsing simple value');
          items.push(this.parseValue());
        }
      }
      
      if (this.tokens[this.position] === ')') {
        this.position++; // skip ')'
        console.log(`parseList: skipped closing ')', position=${this.position}`);
      }
    }
    
    console.log('parseList result:', items);
    return items;
  }

  parseValue() {
    const token = this.tokens[this.position++];
    
    if (token.startsWith('"') && token.endsWith('"')) {
      return token.slice(1, -1);
    }
    
    if (token === 'TRUE') return true;
    if (token === 'FALSE') return false;
    
    const num = Number(token);
    if (!isNaN(num)) return num;
    
    return token;
  }

  parse(content) {
    this.tokenize(content);
    this.position = 0;
    
    const rootObject = {
      type: 'RoseFile',
      properties: {},
      children: []
    };
    
    while (this.position < this.tokens.length) {
      if (this.tokens[this.position] === '(') {
        rootObject.children.push(this.parseObject());
      } else {
        this.position++;
      }
    }
    
    return rootObject;
  }
}

const parser = new SimpleParser();
parser.tokenize(testContent);
console.log('Tokens:', parser.tokens);

const result = parser.parse(testContent);

console.log('Parsed result:');
console.log(JSON.stringify(result, null, 2));

// Look for classes
function findClasses(obj, depth = 0) {
  const indent = '  '.repeat(depth);
  console.log(`${indent}Checking object type: ${obj.type}, name: ${obj.name}`);
  
  if (obj.type === 'Class') {
    console.log(`${indent}FOUND CLASS: ${obj.name}`);
  }
  
  // Check children
  if (obj.children) {
    obj.children.forEach(child => findClasses(child, depth + 1));
  }
  
  // Check properties
  Object.entries(obj.properties).forEach(([key, value]) => {
    console.log(`${indent}Property ${key}:`, typeof value, Array.isArray(value) ? `array[${value.length}]` : value);
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item && typeof item === 'object' && item.type) {
          console.log(`${indent}  Array item ${index}:`);
          findClasses(item, depth + 2);
        }
      });
    }
  });
}

console.log('\nSearching for classes:');
findClasses(result);
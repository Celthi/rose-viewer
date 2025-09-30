// Test a simple case with parameters list
const testContent = `(object Operation "TestOp"
  quid "123"
  parameters (list Parameters
    (object Parameter "InType"
      type "DSSDataType_Type")))`;

// Copy the parser logic from RoseParserV2
class TestParser {
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
    console.log(`parseObject: position=${this.position}, token='${this.tokens[this.position]}'`);
    
    if (this.tokens[this.position] !== '(') {
      throw new Error(`Expected '(' at position ${this.position}`);
    }
    this.position++; // skip '('

    if (this.tokens[this.position] !== 'object') {
      throw new Error(`Expected 'object' at position ${this.position}, found '${this.tokens[this.position]}'`);
    }
    this.position++; // skip 'object'

    const type = this.tokens[this.position++];
    let name;
    
    if (this.tokens[this.position]?.startsWith('"')) {
      name = this.tokens[this.position].slice(1, -1);
      this.position++;
    }

    const properties = {};
    const children = [];

    while (this.position < this.tokens.length && this.tokens[this.position] !== ')') {
      const token = this.tokens[this.position];
      console.log(`parseObject loop: position=${this.position}, token='${token}'`);
      
      if (token === '(') {
        if (this.tokens[this.position + 1] === 'list') {
          console.log('Found direct list');
          this.position++; // skip '('
          this.position++; // skip 'list'
          const listType = this.tokens[this.position++];
          const listItems = this.parseList();
          properties[listType] = listItems;
        } else if (this.tokens[this.position + 1] === 'object') {
          console.log('Found nested object');
          children.push(this.parseObject());
        } else {
          console.log('Found other parenthesis, skipping');
          this.position++;
          while (this.position < this.tokens.length && this.tokens[this.position] !== ')') {
            this.position++;
          }
          if (this.tokens[this.position] === ')') {
            this.position++;
          }
        }
      } else {
        // Property
        const key = token;
        this.position++;
        console.log(`Property key: ${key}, next token: '${this.tokens[this.position]}'`);
        
        if (this.position < this.tokens.length && 
            this.tokens[this.position] === '(' && 
            this.tokens[this.position + 1] === 'list') {
          console.log(`Property ${key} has list value`);
          this.position++; // skip '('
          this.position++; // skip 'list'
          const listType = this.tokens[this.position++];
          const listItems = this.parseList();
          properties[key] = listItems;
        } else {
          console.log(`Property ${key} has simple value`);
          this.position--; // go back since parseValue will advance
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
    console.log(`parseList: position=${this.position}, token='${this.tokens[this.position]}'`);
    const items = [];
    
    if (this.tokens[this.position] === '(') {
      this.position++; // skip '('
      
      while (this.position < this.tokens.length && this.tokens[this.position] !== ')') {
        console.log(`parseList loop: position=${this.position}, token='${this.tokens[this.position]}'`);
        
        if (this.tokens[this.position] === '(' && this.tokens[this.position + 1] === 'object') {
          console.log('parseList: found object');
          items.push(this.parseObject());
        } else if (this.tokens[this.position] === 'object') {
          console.log('parseList: found object token, backing up');
          this.position--; // go back to the '('
          items.push(this.parseObject());
        } else {
          console.log('parseList: parsing simple value');
          items.push(this.parseValue());
        }
      }
      
      if (this.tokens[this.position] === ')') {
        this.position++; // skip ')'
      }
    }
    
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
    
    console.log('Tokens:', this.tokens);
    
    return this.parseObject();
  }
}

const parser = new TestParser();
try {
  const result = parser.parse(testContent);
  console.log('Success!');
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.log('Error:', error.message);
}
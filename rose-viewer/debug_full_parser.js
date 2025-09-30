// Test the full sample content with the exact parser logic
const fs = require('fs');

// Read the sample content from App.tsx
const appContent = fs.readFileSync('/workspace/rose-viewer/src/App.tsx', 'utf8');
const match = appContent.match(/const sampleContent = `([^`]+)`/s);
if (!match) {
  console.log('Could not find sample content in App.tsx');
  process.exit(1);
}

const sampleContent = match[1];

// Copy the exact parser logic from RoseParserV2
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
    console.log(`parseObject called at position ${this.position}, token: '${this.tokens[this.position]}'`);
    
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
    let name;
    
    if (this.tokens[this.position]?.startsWith('"')) {
      name = this.tokens[this.position].slice(1, -1);
      this.position++;
    }

    const properties = {};
    const children = [];

    while (this.position < this.tokens.length && this.tokens[this.position] !== ')') {
      const token = this.tokens[this.position];
      
      if (token === '(') {
        if (this.tokens[this.position + 1] === 'list') {
          this.position++; // skip '('
          this.position++; // skip 'list'
          const listType = this.tokens[this.position++];
          const listItems = this.parseList();
          properties[listType] = listItems;
        } else if (this.tokens[this.position + 1] === 'object') {
          children.push(this.parseObject());
        } else {
          // Skip parenthesized values
          this.position++;
          while (this.position < this.tokens.length && this.tokens[this.position] !== ')') {
            this.position++;
          }
          if (this.tokens[this.position] === ')') {
            this.position++;
          }
        }
      } else {
        const key = token;
        this.position++;
        
        if (this.position < this.tokens.length && 
            this.tokens[this.position] === '(' && 
            this.tokens[this.position + 1] === 'list') {
          this.position++; // skip '('
          this.position++; // skip 'list'
          const listType = this.tokens[this.position++];
          const listItems = this.parseList();
          properties[key] = listItems;
        } else {
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
    
    if (this.tokens[this.position] === '(') {
      this.position++; // skip '('
      
      while (this.position < this.tokens.length && this.tokens[this.position] !== ')') {
        if (this.tokens[this.position] === '(' && this.tokens[this.position + 1] === 'object') {
          items.push(this.parseObject());
        } else if (this.tokens[this.position] === 'object') {
          // Back up to find the '('
          this.position--;
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

  parseValue() {
    const token = this.tokens[this.position];
    
    if (token === '(') {
      this.position++; // skip '('
      const values = [];
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

  parse(content) {
    this.tokenize(content);
    this.position = 0;
    
    const objects = [];
    
    while (this.position < this.tokens.length) {
      if (this.tokens[this.position] === '(' && this.tokens[this.position + 1] === 'object') {
        objects.push(this.parseObject());
      } else {
        this.position++;
      }
    }
    
    return objects;
  }
}

const parser = new TestParser();
try {
  console.log('Starting parse...');
  const result = parser.parse(sampleContent);
  console.log('Success! Parsed', result.length, 'objects');
  
  // Extract classes
  const classes = [];
  function findClasses(obj) {
    if (obj.type === 'Class') {
      classes.push({
        name: obj.name || 'Unknown',
        quid: obj.properties.quid || '',
        operations: obj.properties.operations || []
      });
    }
    if (obj.children) {
      obj.children.forEach(findClasses);
    }
    Object.values(obj.properties || {}).forEach(prop => {
      if (Array.isArray(prop)) {
        prop.forEach(item => {
          if (typeof item === 'object' && item.type) {
            findClasses(item);
          }
        });
      }
    });
  }
  
  result.forEach(findClasses);
  console.log('Found', classes.length, 'classes:');
  classes.forEach(cls => console.log(`- ${cls.name} (${cls.quid})`));
  
} catch (error) {
  console.log('Error:', error.message);
  console.log('Position:', parser.position);
  console.log('Token at position:', parser.tokens[parser.position]);
  console.log('Context:', parser.tokens.slice(Math.max(0, parser.position - 5), parser.position + 5));
}
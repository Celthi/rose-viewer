// Get the full sample content from the user's original message
const fs = require('fs');

// Read the sample content from App.tsx
const appContent = fs.readFileSync('/workspace/rose-viewer/src/App.tsx', 'utf8');
const match = appContent.match(/const sampleContent = `([^`]+)`/s);
if (!match) {
  console.log('Could not find sample content in App.tsx');
  process.exit(1);
}

const sampleContent = match[1];

// Simple tokenizer
function tokenize(content) {
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
  
  return tokens.filter(token => token.length > 0);
}

const tokens = tokenize(sampleContent);

console.log('Total tokens:', tokens.length);

console.log('\nLooking for all problematic patterns:');
let problemCount = 0;
tokens.forEach((token, index) => {
  if (token === '(' && 
      tokens[index + 1] !== 'object' && 
      tokens[index + 1] !== 'list') {
    console.log(`Issue ${++problemCount} at ${index}: '${token}' followed by '${tokens[index + 1]}' '${tokens[index + 2] || ''}'`);
    
    // Show context
    const start = Math.max(0, index - 3);
    const end = Math.min(tokens.length, index + 6);
    console.log(`  Context: ${tokens.slice(start, end).join(' ')}`);
  }
});

console.log(`\nFound ${problemCount} problematic patterns.`);

// Check position 646 specifically
if (tokens.length > 646) {
  console.log(`\nToken at position 646: '${tokens[646]}'`);
  console.log('Context around 646:');
  for (let i = 643; i < 650 && i < tokens.length; i++) {
    console.log(`${i}: '${tokens[i]}'`);
  }
}
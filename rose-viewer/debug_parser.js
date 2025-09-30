// Simple debug script to understand the parsing structure
const sampleContent = `(object Petal
  version 42
  _written "Model Integrator 1.0.9062.0"
  charSet 0)
(object Class_Category "AggFunc"
  is_unit TRUE
  is_loaded TRUE
  quid "34FDC940022E"
  exportControl "Public"
  logical_models (list unit_reference_list
    (object Class "ICDSSAggregationFunc"
      attributes (list Attribute_Set
        (object Attribute
          tool "Traversal"
          name "BodyFile"
          value "$DFC_PATH\\SourceCode\\FunctionServer\\AggFunc\\ICDSSAggregationFunc.cpp"))
      quid "34FDCB89035C"
      operations (list Operations
        (object Operation "CheckResType"
          quid "34FDCB9E01AE"
          parameters (list Parameters
            (object Parameter "InType"
              type "DSSDataType_Type"))
          result "HRESULT STDMETHODCALLTYPE"))
      language "C++")))`;

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
console.log('First 50 tokens:');
console.log(tokens.slice(0, 50));

console.log('\nLooking for Class tokens:');
tokens.forEach((token, index) => {
  if (token === 'Class') {
    console.log(`Found "Class" at index ${index}, next tokens:`, tokens.slice(index, index + 5));
  }
});
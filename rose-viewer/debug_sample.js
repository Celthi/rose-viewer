// Debug the sample content to see what's at position 78
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
          value "$DFC_PATH\\SourceCode\\FunctionServer\\AggFunc\\ICDSSAggregationFunc.cpp")
        (object Attribute
          tool "Traversal"
          name "CodeFile"
          value "$DFC_PATH\\SourceCode\\FunctionServer\\AggFunc\\ICDSSAggregationFunc.h"))
      quid "34FDCB89035C"
      operations (list Operations
        (object Operation "CheckResType"
          attributes (list Attribute_Set
            (object Attribute
              tool "cg"
              name "OperationKind"
              value ("OperationKindSet" 202)))
          quid "34FDCB9E01AE"
          parameters (list Parameters
            (object Parameter "InType"
              type "DSSDataType_Type")
            (object Parameter "pResType"
              type "DSSDataType_Type *"))
          result "HRESULT STDMETHODCALLTYPE"
          concurrency "Sequential"
          opExportControl "Public"
          uid 889030061)
        (object Operation "Insert"
          attributes (list Attribute_Set
            (object Attribute
              tool "cg"
              name "OperationKind"
              value ("OperationKindSet" 202)))
          quid "34FDCB9E0258"
          parameters (list Parameters
            (object Parameter "Val"
              type "double"))
          result "HRESULT STDMETHODCALLTYPE"
          concurrency "Sequential"
          opExportControl "Public"
          uid 889030062)))`;

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
console.log('Tokens around position 78:');
for (let i = 75; i < 85 && i < tokens.length; i++) {
  console.log(`${i}: '${tokens[i]}'`);
}

console.log('\nLooking for problematic patterns:');
tokens.forEach((token, index) => {
  if (token === '(' && tokens[index + 1] !== 'object' && tokens[index + 1] !== 'list') {
    console.log(`Potential issue at ${index}: '${token}' followed by '${tokens[index + 1]}'`);
  }
});
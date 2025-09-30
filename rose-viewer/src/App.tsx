import React, { useState } from 'react';
import FileUploader from './components/FileUploader';
import ClassViewer from './components/ClassViewer';
import RawViewer from './components/RawViewer';
import { RoseParserV2 } from './utils/RoseParserV2';
import { RoseObject, RoseClass } from './types/RoseTypes';
import './App.css';

function App() {
  const [roseObject, setRoseObject] = useState<RoseObject | null>(null);
  const [classes, setClasses] = useState<RoseClass[]>([]);
  const [rawContent, setRawContent] = useState<string>('');
  const [filename, setFilename] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [activeView, setActiveView] = useState<'classes' | 'raw'>('classes');

  const handleFileLoad = (content: string, name: string) => {
    try {
      setError('');
      setRawContent(content);
      setFilename(name);
      
      const parser = new RoseParserV2();
      const parsed = parser.parse(content);
      console.log('Parsed object:', parsed);
      setRoseObject(parsed);
      
      const extractedClasses = RoseParserV2.extractClasses(parsed);
      console.log('Extracted classes:', extractedClasses);
      setClasses(extractedClasses);
      
      setActiveView('classes');
    } catch (err) {
      setError(`Error parsing Rose file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Parse error:', err);
    }
  };

  const loadSampleData = () => {
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
          uid 889030062)
        (object Operation "InsertMultiple"
          attributes (list Attribute_Set
            (object Attribute
              tool "cg"
              name "OperationKind"
              value ("OperationKindSet" 202)))
          quid "34FDCB9E02F8"
          parameters (list Parameters
            (object Parameter "nVal"
              type "long")
            (object Parameter "pVal"
              type "double *"))
          result "HRESULT STDMETHODCALLTYPE"
          concurrency "Sequential"
          opExportControl "Public"
          uid 889030063)
        (object Operation "Retrieve"
          attributes (list Attribute_Set
            (object Attribute
              tool "cg"
              name "OperationKind"
              value ("OperationKindSet" 202)))
          quid "34FDCB9E03A2"
          parameters (list Parameters
            (object Parameter "pVal"
              type "double*")
            (object Parameter "pFlags"
              type "DSSData_Flags *"))
          result "HRESULT STDMETHODCALLTYPE"
          concurrency "Sequential"
          opExportControl "Public"
          uid 889030064)
        (object Operation "Reset"
          attributes (list Attribute_Set
            (object Attribute
              tool "cg"
              name "OperationKind"
              value ("OperationKindSet" 202)))
          quid "34FDCB9F005A"
          parameters (list Parameters
            (object Parameter "nArgumentHint"
              type "long"))
          result "HRESULT STDMETHODCALLTYPE"
          concurrency "Sequential"
          opExportControl "Public"
          uid 889030065)
        (object Operation "Duplicate"
          attributes (list Attribute_Set
            (object Attribute
              tool "cg"
              name "OperationKind"
              value ("OperationKindSet" 202)))
          quid "35085702020E"
          parameters (list Parameters
            (object Parameter "ppCopy"
              type "ICDSSAggregationFunc **"))
          result "HRESULT STDMETHODCALLTYPE"
          concurrency "Sequential"
          opExportControl "Public"
          uid 0)
        (object Operation "SetProperty"
          attributes (list Attribute_Set
            (object Attribute
              tool "cg"
              name "OperationKind"
              value ("OperationKindSet" 202)))
          quid "351ACF49035A"
          parameters (list Parameters
            (object Parameter "pProp"
              type "ICDSSFunctionProperty *"))
          result "HRESULT STDMETHODCALLTYPE"
          concurrency "Sequential"
          opExportControl "Public"
          uid 0))
      language "C++")
    (object Class "CDSSVARIANCE"
      attributes (list Attribute_Set
        (object Attribute
          tool "Traversal"
          name "BodyFile"
          value "$DFC_PATH\\SourceCode\\FunctionServer\\AggFunc\\CDSSVARIANCE.cpp")
        (object Attribute
          tool "Traversal"
          name "CodeFile"
          value "$DFC_PATH\\SourceCode\\FunctionServer\\AggFunc\\CDSSVARIANCE.h")
        (object Attribute
          tool "cg"
          name "GenerateDefaultConstructor"
          value ("GenerateSet" 206)))
      quid "34FDCBDB0039"
      superclasses (list inheritance_relationship_list
        (object Inheritance_Relationship
          quid "34FDCBDB003A"
          supplier "ICDSSAggregationFunc1"
          quidu "34DBFE150379")
        (object Inheritance_Relationship
          quid "34FDCBDB003B"
          supplier "Logical View::ATL::CComObjectRootEx_M"
          quidu "341009D70109")
        (object Inheritance_Relationship
          quid "34FDCC3E038E"
          supplier "ICDSSAggregationFunc"
          quidu "34FDCB89035C"))
      operations (list Operations
        (object Operation "CheckResType"
          attributes (list Attribute_Set)
          quid "34FDCBDB003C"
          parameters (list Parameters
            (object Parameter "InType"
              type "DSSDataType_Type")
            (object Parameter "pResType"
              type "DSSDataType_Type *"))
          result "HRESULT STDMETHODCALLTYPE"
          concurrency "Sequential"
          opExportControl "Public"
          uid 889030072)
        (object Operation "Insert"
          attributes (list Attribute_Set)
          quid "34FDCBDB003E"
          parameters (list Parameters
            (object Parameter "Val"
              type "double"))
          result "HRESULT STDMETHODCALLTYPE"
          concurrency "Sequential"
          opExportControl "Public"
          uid 889030073)
        (object Operation "InsertMultiple"
          attributes (list Attribute_Set)
          quid "34FDCBDB0040"
          parameters (list Parameters
            (object Parameter "nVal"
              type "long")
            (object Parameter "pVal"
              type "double *"))
          result "HRESULT STDMETHODCALLTYPE"
          concurrency "Sequential"
          opExportControl "Public"
          uid 889030074)
        (object Operation "Retrieve"
          attributes (list Attribute_Set)
          quid "34FDCBDB0043"
          parameters (list Parameters
            (object Parameter "pVal"
              type "double*")
            (object Parameter "pFlags"
              type "DSSData_Flags *"))
          result "HRESULT STDMETHODCALLTYPE"
          concurrency "Sequential"
          opExportControl "Public"
          uid 889030075)
        (object Operation "Reset"
          attributes (list Attribute_Set)
          quid "34FDCBDB0046"
          parameters (list Parameters
            (object Parameter "nArgumentHint"
              type "long"))
          result "HRESULT STDMETHODCALLTYPE"
          concurrency "Sequential"
          opExportControl "Public"
          uid 889030076)
        (object Operation "Duplicate"
          attributes (list Attribute_Set)
          quid "3508571E0005"
          parameters (list Parameters
            (object Parameter "ppCopy"
              type "ICDSSAggregationFunc **"))
          result "HRESULT STDMETHODCALLTYPE"
          concurrency "Sequential"
          opExportControl "Public"
          uid 889732584)
        (object Operation "SetProperty"
          attributes (list Attribute_Set)
          quid "351ACF53005B"
          parameters (list Parameters
            (object Parameter "pProp"
              type "ICDSSFunctionProperty *"))
          result "HRESULT STDMETHODCALLTYPE"
          concurrency "Sequential"
          opExportControl "Public"
          uid 890930239))
      language "C++")
    (object Class "CDSSSUM"
      attributes (list Attribute_Set
        (object Attribute
          tool "Traversal"
          name "BodyFile"
          value "$DFC_PATH\\SourceCode\\FunctionServer\\AggFunc\\CDSSSUM.cpp")
        (object Attribute
          tool "Traversal"
          name "CodeFile"
          value "$DFC_PATH\\SourceCode\\FunctionServer\\AggFunc\\CDSSSUM.h")
        (object Attribute
          tool "cg"
          name "GenerateDefaultConstructor"
          value ("GenerateSet" 206)))
      quid "34FDCC0F03AF"
      superclasses (list inheritance_relationship_list
        (object Inheritance_Relationship
          quid "34FDCC3602F7"
          supplier "Logical View::ATL::CComObjectRootEx_M"
          quidu "341009D70109")
        (object Inheritance_Relationship
          quid "34FDCC39030F"
          supplier "ICDSSAggregationFunc"
          quidu "34FDCB89035C"))
      operations (list Operations
        (object Operation "CheckResType"
          attributes (list Attribute_Set)
          quid "34FDCC230371"
          parameters (list Parameters
            (object Parameter "InType"
              type "DSSDataType_Type")
            (object Parameter "pResType"
              type "DSSDataType_Type *"))
          result "HRESULT STDMETHODCALLTYPE"
          concurrency "Sequential"
          opExportControl "Public"
          uid 889030067)
        (object Operation "Insert"
          attributes (list Attribute_Set)
          quid "34FDCC240034"
          parameters (list Parameters
            (object Parameter "Val"
              type "double"))
          result "HRESULT STDMETHODCALLTYPE"
          concurrency "Sequential"
          opExportControl "Public"
          uid 889030068)
        (object Operation "InsertMultiple"
          attributes (list Attribute_Set)
          quid "34FDCC2400D4"
          parameters (list Parameters
            (object Parameter "nVal"
              type "long")
            (object Parameter "pVal"
              type "double *"))
          result "HRESULT STDMETHODCALLTYPE"
          concurrency "Sequential"
          opExportControl "Public"
          uid 889030069)
        (object Operation "Retrieve"
          attributes (list Attribute_Set)
          quid "34FDCC240174"
          parameters (list Parameters
            (object Parameter "pVal"
              type "double*")
            (object Parameter "pFlags"
              type "DSSData_Flags *"))
          result "HRESULT STDMETHODCALLTYPE"
          concurrency "Sequential"
          opExportControl "Public"
          uid 889030070)
        (object Operation "Reset"
          attributes (list Attribute_Set)
          quid "34FDCC240214"
          parameters (list Parameters
            (object Parameter "nArgumentHint"
              type "long"))
          result "HRESULT STDMETHODCALLTYPE"
          concurrency "Sequential"
          opExportControl "Public"
          uid 889030071)
        (object Operation "CDSSSUM"
          attributes (list Attribute_Set)
          quid "34FDCC2402B5"
          concurrency "Sequential"
          opExportControl "Public"
          uid 889030066)
        (object Operation "Duplicate"
          attributes (list Attribute_Set)
          quid "3508572903A4"
          parameters (list Parameters
            (object Parameter "ppCopy"
              type "ICDSSAggregationFunc **"))
          result "HRESULT STDMETHODCALLTYPE"
          concurrency "Sequential"
          opExportControl "Public"
          uid 889732585)
        (object Operation "SetProperty"
          attributes (list Attribute_Set)
          quid "351ACF5F00BD"
          parameters (list Parameters
            (object Parameter "pProp"
              type "ICDSSFunctionProperty *"))
          result "HRESULT STDMETHODCALLTYPE"
          concurrency "Sequential"
          opExportControl "Public"
          uid 890930238))
      class_attributes (list class_attribute_list
        (object ClassAttribute "mFlags"
          quid "34FDCFAE0109"
          type "DWORD")
        (object ClassAttribute "mVal"
          quid "34FDCFCB0114"
          type "double"))
      language "C++")))`;
    
    handleFileLoad(sampleContent, 'sample.rose');
  };

  const loadDocumentedSample = () => {
    const documentedSample = `(object Petal
  version 42
  _written "Model Integrator 1.0.9062.0"
  charSet 0)
(object Class_Category "DocumentedExample"
  is_unit TRUE
  is_loaded TRUE
  quid "34FDC940022E"
  exportControl "Public"
  logical_models (list unit_reference_list
    (object Class "DocumentedClass"
      quid "3378B28101A3"
      documentation "This is a well-documented class that demonstrates how Rose files can contain rich documentation. It handles data processing and validation operations."
      attributes (list Attribute_Set
        (object Attribute
          tool "Traversal"
          name "BodyFile"
          value "$DFC_PATH\\\\SourceCode\\\\DocumentedClass.cpp")
        (object Attribute
          tool "Traversal"
          name "CodeFile"
          value "$DFC_PATH\\\\SourceCode\\\\DocumentedClass.h"))
      operations (list Operations
        (object Operation "ProcessData"
          quid "34FDCB9E01AE"
          documentation "Calls update assoc on its internal vector of factassocs. This method processes incoming data and validates it against business rules before storing."
          parameters (list Parameters
            (object Parameter "inputData"
              type "DataStructure*")
            (object Parameter "validationFlags"
              type "int"))
          result "HRESULT STDMETHODCALLTYPE"
          concurrency "Sequential"
          opExportControl "Public"
          uid 889030061)
        (object Operation "ValidateInput"
          quid "34FDCB9E0258"
          documentation "Performs comprehensive validation of input parameters including null checks, range validation, and business rule compliance."
          parameters (list Parameters
            (object Parameter "data"
              type "void*")
            (object Parameter "size"
              type "size_t"))
          result "bool"
          concurrency "Sequential"
          opExportControl "Public"
          uid 889030062))
      language "C++")))`;
    
    handleFileLoad(documentedSample, 'documented-sample.rose');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌹 Rose File Viewer</h1>
        <p>A modern viewer for IBM Rational Rose model files</p>
      </header>

      {error && (
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}

      {!roseObject ? (
        <div className="upload-section">
          <FileUploader onFileLoad={handleFileLoad} />
          <div className="sample-section">
            <p>Don't have a Rose file? Try the sample data:</p>
            <button onClick={loadSampleData} className="sample-button">
              Load Sample Rose File
            </button>
            <button onClick={loadDocumentedSample} className="sample-button documented">
              Load Documented Sample (with documentation fields)
            </button>
          </div>
        </div>
      ) : (
        <div className="viewer-section">
          <div className="file-info">
            <h2>📄 {filename}</h2>
            <div className="view-controls">
              <button 
                className={`view-button ${activeView === 'classes' ? 'active' : ''}`}
                onClick={() => setActiveView('classes')}
              >
                Class View ({classes.length} classes)
              </button>
              <button 
                className={`view-button ${activeView === 'raw' ? 'active' : ''}`}
                onClick={() => setActiveView('raw')}
              >
                Raw Structure
              </button>
              <button 
                className="reset-button"
                onClick={() => {
                  setRoseObject(null);
                  setClasses([]);
                  setRawContent('');
                  setFilename('');
                  setError('');
                }}
              >
                Load New File
              </button>
            </div>
          </div>

          {activeView === 'classes' ? (
            <ClassViewer classes={classes} />
          ) : (
            <RawViewer roseObject={roseObject} rawContent={rawContent} />
          )}
        </div>
      )}
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import { RoseClass, RoseOperation } from '../types/RoseTypes';
import './ClassViewer.css';

interface ClassViewerProps {
  classes: RoseClass[];
}

interface CollapsibleSectionProps {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  count, 
  children, 
  defaultExpanded = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="collapsible-section">
      <button 
        className={`section-header ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
        <span className="section-title">
          {title} {count !== undefined && `(${count})`}
        </span>
      </button>
      {isExpanded && (
        <div className="section-content">
          {children}
        </div>
      )}
    </div>
  );
};

interface OperationItemProps {
  operation: RoseOperation;
  index: number;
}

const OperationItem: React.FC<OperationItemProps> = ({ operation, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getOperationDocumentation = (op: RoseOperation): string => {
    // Extract documentation from attributes
    const docAttr = op.attributes.find(attr => 
      attr.name.toLowerCase().includes('doc') || 
      attr.name.toLowerCase().includes('comment') ||
      attr.name.toLowerCase().includes('description')
    );
    return (typeof docAttr?.value === 'string' ? docAttr.value : String(docAttr?.value || ''));
  };

  const getParameterDocumentation = (paramName: string, op: RoseOperation): string => {
    // Look for parameter-specific documentation in attributes
    const paramDoc = op.attributes.find(attr => 
      attr.name.toLowerCase().includes(paramName.toLowerCase()) ||
      (typeof attr.value === 'string' && attr.value.toLowerCase().includes(paramName.toLowerCase()))
    );
    return (typeof paramDoc?.value === 'string' ? paramDoc.value : String(paramDoc?.value || ''));
  };

  const documentation = getOperationDocumentation(operation);

  return (
    <div className="operation-item">
      <button 
        className={`operation-header ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
        <div className="operation-signature">
          <span className="op-result">{operation.result || 'void'}</span>
          <span className="op-name">{operation.name}</span>
          <span className="op-params">
            ({operation.parameters.length > 0 
              ? `${operation.parameters.length} parameters` 
              : 'no parameters'})
          </span>
        </div>
      </button>
      
      {isExpanded && (
        <div className="operation-details">
          {/* Method signature with full parameters */}
          <div className="full-signature">
            <code>
              <span className="signature-result">{operation.result || 'void'}</span>{' '}
              <span className="signature-name">{operation.name}</span>
              <span className="signature-params">(
                {operation.parameters.map((param, idx) => (
                  <span key={idx}>
                    {idx > 0 && ', '}
                    <span className="param-type">{param.type}</span>{' '}
                    <span className="param-name">{param.name}</span>
                  </span>
                ))}
              )</span>
            </code>
          </div>

          {/* Method Documentation */}
          <div className="method-documentation">
            <h5>📖 Method Documentation</h5>
            {operation.documentation ? (
              <div className="actual-documentation">
                <div className="doc-content">{operation.documentation}</div>
              </div>
            ) : documentation ? (
              <div className="doc-content">{documentation}</div>
            ) : (
              <div className="method-purpose">
                <p><strong>Purpose:</strong> This method appears to be part of the {operation.name.includes('Check') ? 'validation' : 
                  operation.name.includes('Insert') ? 'data insertion' :
                  operation.name.includes('Retrieve') ? 'data retrieval' :
                  operation.name.includes('Reset') ? 'state management' :
                  operation.name.includes('Duplicate') ? 'object cloning' :
                  operation.name.includes('Set') ? 'configuration' : 'core functionality'} interface.</p>
                
                {operation.result && operation.result.includes('HRESULT') && (
                  <p><strong>Return Value:</strong> Returns an HRESULT indicating success/failure status (COM interface pattern).</p>
                )}
                
                {operation.parameters.length > 0 && (
                  <p><strong>Parameters:</strong> Takes {operation.parameters.length} parameter{operation.parameters.length !== 1 ? 's' : ''} - see details below.</p>
                )}
              </div>
            )}
          </div>

          {/* Parameters details */}
          {operation.parameters.length > 0 && (
            <div className="parameters-section">
              <h5>Parameters:</h5>
              <div className="parameters-list">
                {operation.parameters.map((param, idx) => {
                  const paramDoc = getParameterDocumentation(param.name, operation);
                  return (
                    <div key={idx} className="parameter-detail">
                      <div className="param-header">
                        <span className="param-name">{param.name}</span>
                        <span className="param-type">: {param.type}</span>
                      </div>
                      {paramDoc && (
                        <div className="param-documentation">{paramDoc}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Method metadata */}
          <div className="operation-meta">
            {operation.quid && <span className="meta-item">QUID: {operation.quid}</span>}
            {operation.concurrency && <span className="meta-item">Concurrency: {operation.concurrency}</span>}
            {operation.opExportControl && <span className="meta-item">Access: {operation.opExportControl}</span>}
            {operation.uid && <span className="meta-item">UID: {operation.uid}</span>}
          </div>

          {/* Additional attributes */}
          {operation.attributes.length > 0 && (
            <CollapsibleSection title="Technical Attributes" count={operation.attributes.length}>
              <div className="operation-attributes">
                {operation.attributes.map((attr, attrIdx) => (
                  <div key={attrIdx} className="op-attribute">
                    <span className="attr-tool">{attr.tool}</span>:
                    <span className="attr-name">{attr.name}</span> = 
                    <span className="attr-value">{typeof attr.value === 'string' ? attr.value : JSON.stringify(attr.value)}</span>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}
        </div>
      )}
    </div>
  );
};

const ClassViewer: React.FC<ClassViewerProps> = ({ classes }) => {
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());

  const toggleClass = (classId: string) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(classId)) {
      newExpanded.delete(classId);
    } else {
      newExpanded.add(classId);
    }
    setExpandedClasses(newExpanded);
  };

  return (
    <div className="class-viewer">
      <div className="viewer-header">
        <h2>Classes ({classes.length})</h2>
        <div className="viewer-controls">
          <button 
            onClick={() => setExpandedClasses(new Set(classes.map(c => c.quid || c.name)))}
            className="control-button"
          >
            Expand All
          </button>
          <button 
            onClick={() => setExpandedClasses(new Set())}
            className="control-button"
          >
            Collapse All
          </button>
        </div>
      </div>

      {classes.map((cls, index) => {
        const classId = cls.quid || cls.name;
        const isExpanded = expandedClasses.has(classId);

        return (
          <div key={classId} className="class-card">
            <button 
              className={`class-header ${isExpanded ? 'expanded' : ''}`}
              onClick={() => toggleClass(classId)}
            >
              <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
              <div className="class-title">
                <h3>{cls.name}</h3>
                <div className="class-summary">
                  {cls.operations.length} methods, {cls.classAttributes.length} attributes
                  {cls.superclasses.length > 0 && `, inherits from ${cls.superclasses.length} classes`}
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="class-content">
                <div className="class-meta">
                  <span className="quid">QUID: {cls.quid}</span>
                  {cls.language && <span className="language">Language: {cls.language}</span>}
                </div>

                {/* Documentation Section */}
                <CollapsibleSection title="📖 Documentation & Overview" defaultExpanded>
                  <div className="documentation-section">
                    {/* Actual Documentation (if available) */}
                    {cls.documentation && (
                      <div className="class-documentation">
                        <h4>📝 Class Documentation</h4>
                        <div className="doc-text">{cls.documentation}</div>
                      </div>
                    )}
                    
                    <div className="class-overview">
                      <h4>Class Overview</h4>
                      <p><strong>{cls.name}</strong> is a {cls.language || 'C++'} class with:</p>
                      <ul>
                        <li>{cls.operations.length} method{cls.operations.length !== 1 ? 's' : ''}</li>
                        <li>{cls.classAttributes.length} member variable{cls.classAttributes.length !== 1 ? 's' : ''}</li>
                        {cls.superclasses.length > 0 && (
                          <li>Inherits from {cls.superclasses.length} base class{cls.superclasses.length !== 1 ? 'es' : ''}</li>
                        )}
                      </ul>
                    </div>

                    {/* File Locations */}
                    {cls.attributes.length > 0 && (
                      <div className="file-locations">
                        <h4>📁 Source Files</h4>
                        <div className="file-list">
                          {cls.attributes.map((attr, idx) => (
                            <div key={idx} className="file-mapping">
                              <span className="file-type">{attr.name}:</span>
                              <code className="file-path">{typeof attr.value === 'string' ? attr.value : JSON.stringify(attr.value)}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interface Summary */}
                    {cls.operations.length > 0 && (
                      <div className="interface-summary">
                        <h4>🔧 Public Interface</h4>
                        <div className="method-signatures">
                          {cls.operations.slice(0, 5).map((op, idx) => (
                            <div key={idx} className="method-signature-preview">
                              <code>
                                <span className="return-type">{op.result || 'void'}</span>{' '}
                                <span className="method-name">{op.name}</span>
                                <span className="params">({op.parameters.length} param{op.parameters.length !== 1 ? 's' : ''})</span>
                              </code>
                            </div>
                          ))}
                          {cls.operations.length > 5 && (
                            <div className="more-methods">... and {cls.operations.length - 5} more methods</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Architecture Notes */}
                    {cls.superclasses.length > 0 && (
                      <div className="architecture-notes">
                        <h4>🏗️ Architecture</h4>
                        <p>This class is part of an inheritance hierarchy:</p>
                        <ul>
                          {cls.superclasses.map((sc, idx) => (
                            <li key={idx}>
                              Extends <strong>{sc.supplier}</strong> <span className="quid-ref">({sc.quidu})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CollapsibleSection>

                {cls.superclasses.length > 0 && (
                  <CollapsibleSection title="Inheritance" count={cls.superclasses.length}>
                    <ul className="inheritance-list">
                      {cls.superclasses.map((sc, idx) => (
                        <li key={sc.quid || idx} className="inheritance-item">
                          <span className="supplier">{sc.supplier}</span>
                          <span className="quid-small">({sc.quidu})</span>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleSection>
                )}

                {cls.classAttributes.length > 0 && (
                  <CollapsibleSection title="Member Variables" count={cls.classAttributes.length}>
                    <ul className="attributes-list">
                      {cls.classAttributes.map((attr, idx) => (
                        <li key={attr.quid || idx} className="attribute-item">
                          <span className="attr-type">{attr.type}</span>
                          <span className="attr-name">{attr.name}</span>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleSection>
                )}

                {cls.operations.length > 0 && (
                  <CollapsibleSection title="Methods" count={cls.operations.length} defaultExpanded>
                    <div className="operations-list">
                      {cls.operations.map((op, idx) => (
                        <OperationItem key={op.quid || idx} operation={op} index={idx} />
                      ))}
                    </div>
                  </CollapsibleSection>
                )}

                {cls.attributes.length > 0 && (
                  <CollapsibleSection title="File Mappings" count={cls.attributes.length}>
                    <div className="file-attributes">
                      {cls.attributes.map((attr, idx) => (
                        <div key={idx} className="file-attribute">
                          <span className="attr-tool">{attr.tool}</span>:
                          <span className="attr-name">{attr.name}</span> = 
                          <span className="attr-value">{typeof attr.value === 'string' ? attr.value : JSON.stringify(attr.value)}</span>
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ClassViewer;
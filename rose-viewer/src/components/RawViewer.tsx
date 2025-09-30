import React, { useState } from 'react';
import { RoseObject } from '../types/RoseTypes';
import './RawViewer.css';

interface RawViewerProps {
  roseObject: RoseObject;
  rawContent: string;
}

const RawViewer: React.FC<RawViewerProps> = ({ roseObject, rawContent }) => {
  const [activeTab, setActiveTab] = useState<'parsed' | 'raw'>('parsed');

  const renderObject = (obj: RoseObject, depth: number = 0): React.ReactNode => {
    
    return (
      <div key={`${obj.type}-${depth}`} className="object-item" style={{ marginLeft: `${depth * 20}px` }}>
        <div className="object-header">
          <span className="object-type">{obj.type}</span>
          {obj.name && <span className="object-name">"{obj.name}"</span>}
        </div>
        
        {Object.keys(obj.properties).length > 0 && (
          <div className="object-properties">
            {Object.entries(obj.properties).map(([key, value]) => (
              <div key={key} className="property-item">
                <span className="property-key">{key}:</span>
                <span className="property-value">
                  {typeof value === 'object' && value !== null 
                    ? JSON.stringify(value, null, 2)
                    : String(value)
                  }
                </span>
              </div>
            ))}
          </div>
        )}
        
        {obj.children.length > 0 && (
          <div className="object-children">
            {obj.children.map((child, index) => renderObject(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="raw-viewer">
      <div className="tab-header">
        <button 
          className={`tab-button ${activeTab === 'parsed' ? 'active' : ''}`}
          onClick={() => setActiveTab('parsed')}
        >
          Parsed Structure
        </button>
        <button 
          className={`tab-button ${activeTab === 'raw' ? 'active' : ''}`}
          onClick={() => setActiveTab('raw')}
        >
          Raw Content
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'parsed' ? (
          <div className="parsed-content">
            <h3>Parsed Rose Object Structure</h3>
            <div className="object-tree">
              {renderObject(roseObject)}
            </div>
          </div>
        ) : (
          <div className="raw-content">
            <h3>Raw File Content</h3>
            <pre className="raw-text">{rawContent}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default RawViewer;
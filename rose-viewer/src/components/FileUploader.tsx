import React, { useCallback } from 'react';
import './FileUploader.css';

interface FileUploaderProps {
  onFileLoad: (content: string, filename: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileLoad }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileLoad(content, file.name);
      };
      reader.readAsText(file);
    }
  }, [onFileLoad]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileLoad(content, file.name);
      };
      reader.readAsText(file);
    }
  }, [onFileLoad]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <div className="file-uploader">
      <div 
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="drop-zone-content">
          <div className="upload-icon">📁</div>
          <h3>Upload Rose File</h3>
          <p>Drag and drop a .rose file here, or click to browse</p>
          <input
            type="file"
            accept=".rose,.petal,.mdl,.cat"
            onChange={handleFileChange}
            className="file-input"
            id="file-input"
          />
          <label htmlFor="file-input" className="file-input-label">
            Choose File
          </label>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
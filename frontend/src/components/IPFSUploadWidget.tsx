import React, { useState, useRef } from 'react';

type IPFSUploadWidgetProps = {
  title?: string;
  onUploadSuccess?: (cid: string) => void;
};

const IPFSUploadWidget: React.FC<IPFSUploadWidgetProps> = ({ title, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cid, setCid] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setCid(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setCid(null);
    }
  };

  const simulateUpload = () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setCid(null);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          const generatedCid = 'Qm' + Array.from({ length: 44 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
          setCid(generatedCid);
          if (onUploadSuccess) onUploadSuccess(generatedCid);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const clearStaged = () => {
    setFile(null);
    setCid(null);
    setProgress(0);
  };

  return (
    <div className='p-5 border rounded-2xl shadow-md bg-surface glass-card flex flex-col gap-4'>
      <h3 className='text-lg font-bold tracking-wide'>{title || 'IPFS Gateway Upload'}</h3>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
          dragActive ? 'border-accent bg-accent-bg' : 'border-border hover:border-accent bg-elevated'
        }`}
      >
        <input
          ref={fileInputRef}
          type='file'
          onChange={handleFileChange}
          className='hidden'
        />
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-secondary">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
        </svg>
        {file ? (
          <div className='text-sm text-primary'>
            Selected: <span className='font-semibold'>{file.name}</span> ({Math.round(file.size / 1024)} KB)
          </div>
        ) : (
          <div className='text-sm text-secondary'>
            Drag and drop your asset here, or <span className='text-accent font-semibold'>browse files</span>
          </div>
        )}
      </div>

      {file && (
        <div className='flex gap-2 justify-end'>
          <button
            onClick={clearStaged}
            disabled={uploading}
            className='px-3 py-1.5 border rounded-lg text-xs text-secondary hover:bg-slate-50 transition'
          >
            Clear
          </button>
          <button
            onClick={simulateUpload}
            disabled={uploading}
            className='px-4 py-1.5 bg-accent hover:bg-accent-dark text-white rounded-lg text-xs font-semibold transition'
          >
            {uploading ? 'Uploading...' : 'Publish to IPFS'}
          </button>
        </div>
      )}

      {uploading && (
        <div className='w-full bg-elevated rounded-full h-2 mt-2 overflow-hidden border'>
          <div
            className='bg-accent h-full transition-all duration-150'
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {cid && (
        <div className='p-3 bg-success-bg border border-success/30 rounded-lg flex flex-col gap-1'>
          <span className='text-xs font-bold text-success'>IPFS CID GENERATED:</span>
          <span className='text-xs mono break-all text-primary'>{cid}</span>
        </div>
      )}
    </div>
  );
};

export default IPFSUploadWidget;
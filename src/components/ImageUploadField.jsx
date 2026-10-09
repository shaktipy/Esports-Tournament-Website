import { useRef, useState } from 'react';
import { UploadCloud, Link2, X, Image } from 'lucide-react';

/**
 * ImageUploadField — reusable component for admin forms.
 * Allows picking a local file (converted to base64) OR pasting a URL.
 * Props:
 *   value    — current image string (base64 or URL)
 *   onChange — (newValue: string) => void
 *   label    — optional field label (default: "Image")
 *   maxSizeKB — max file size in KB (default: 800)
 */
const ImageUploadField = ({ value, onChange, label = 'Image', maxSizeKB = 800 }) => {
  const fileRef = useRef(null);
  const [mode, setMode] = useState('upload'); // 'upload' | 'url'
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isBase64 = value && value.startsWith('data:');
  const hasImage = !!value;

  const uploadToServer = async (fileOrDataUrl) => {
    try {
      if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:image/')) {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: fileOrDataUrl }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.url) return data.url;
        }
      } else if (fileOrDataUrl instanceof File) {
        const fd = new FormData();
        fd.append('file', fileOrDataUrl);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: fd,
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.url) return data.url;
        }
      }
    } catch (err) {
      console.warn('[ImageUploadField] direct upload failed:', err);
    }
    return null;
  };

  const processFile = async (file) => {
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return;
    }
    setUploading(true);

    // Try direct multipart upload to server first
    const serverUrl = await uploadToServer(file);
    if (serverUrl) {
      onChange(serverUrl);
      setUploading(false);
      return;
    }

    // Fallback: Read as Data URL and upload as base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      const uploadedUrl = await uploadToServer(dataUrl);
      onChange(uploadedUrl || dataUrl);
      setUploading(false);
    };
    reader.onerror = () => {
      setError('Failed to read image file.');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
    e.target.value = ''; // reset so same file can be re-picked
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleClear = () => {
    onChange('');
    setError('');
  };

  return (
    <div className="img-upload-field">
      <div className="img-upload-label-row">
        <label className="img-upload-label">{label}</label>
        <div className="img-upload-tabs">
          <button
            type="button"
            className={`img-tab ${mode === 'upload' ? 'active' : ''}`}
            onClick={() => setMode('upload')}
          >
            <UploadCloud size={13} /> Upload
          </button>
          <button
            type="button"
            className={`img-tab ${mode === 'url' ? 'active' : ''}`}
            onClick={() => setMode('url')}
          >
            <Link2 size={13} /> URL
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div
          className={`img-dropzone ${dragging ? 'dragging' : ''} ${hasImage ? 'has-image' : ''}`}
          onClick={() => !hasImage && fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {hasImage ? (
            <>
              <img src={value} alt="preview" className="img-preview" />
              <div className="img-preview-overlay">
                <button
                  type="button"
                  className="img-change-btn"
                  onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                >
                  Change Image
                </button>
                <button
                  type="button"
                  className="img-clear-btn"
                  onClick={(e) => { e.stopPropagation(); handleClear(); }}
                >
                  <X size={14} /> Remove
                </button>
              </div>
            </>
          ) : (
            <div className="img-placeholder">
              {uploading ? (
                <>
                  <UploadCloud size={32} className="img-upload-icon" style={{ animation: 'pulse 1s infinite', color: '#66fcf1' }} />
                  <span className="img-upload-hint">Saving image to server...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={32} className="img-upload-icon" />
                  <span className="img-upload-hint">Click or drag &amp; drop image here</span>
                  <span className="img-upload-sub">PNG, JPG, WEBP — auto saved to server</span>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="img-url-row">
          <input
            type="text"
            className="img-url-input"
            value={isBase64 ? '' : (value || '')}
            onChange={(e) => { setError(''); onChange(e.target.value); }}
            placeholder="https://images.unsplash.com/..."
          />
          {hasImage && !isBase64 && (
            <img src={value} alt="url preview" className="img-url-thumb" onError={() => setError('Invalid image URL')} />
          )}
          {hasImage && (
            <button type="button" className="img-clear-icon" onClick={handleClear}>
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {error && <p className="img-upload-error">{error}</p>}

      {/* hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUploadField;

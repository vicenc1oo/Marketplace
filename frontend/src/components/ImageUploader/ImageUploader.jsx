import { useRef, useState } from 'react';
import Icon from '../Icon/Icon.jsx';
import Spinner from '../Spinner/Spinner.jsx';
import { uploadImage } from '../../services/upload.service.js';
import './ImageUploader.css';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// Multi-image picker with previews; validates type/size and uploads via the service.
// Reports the image list through onChange; the first image is the cover.
export default function ImageUploader({ images = [], onChange, max = 6 }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState('');

  const pick = () => inputRef.current?.click();

  const handleFiles = async (fileList) => {
    setError('');
    const files = Array.from(fileList);
    const room = max - images.length;
    if (room <= 0) {
      setError(`You can upload up to ${max} images.`);
      return;
    }

    const valid = [];
    for (const file of files.slice(0, room)) {
      if (!ACCEPTED.includes(file.type)) {
        setError('Only JPG, PNG, WebP or GIF images are allowed.');
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError('Each image must be 5 MB or smaller.');
        continue;
      }
      valid.push(file);
    }

    if (!valid.length) return;
    setUploading((n) => n + valid.length);
    try {
      const uploaded = await Promise.all(valid.map((f) => uploadImage(f)));
      onChange([...images, ...uploaded.map((u) => u.url)]);
    } catch {
      setError('Something went wrong uploading. Please try again.');
    } finally {
      setUploading(0);
    }
  };

  const remove = (index) => onChange(images.filter((_, i) => i !== index));

  return (
    <div className="uploader">
      <div className="uploader__grid">
        {images.map((src, i) => (
          <div key={src + i} className="uploader__thumb">
            <img src={src} alt={`Upload ${i + 1}`} />
            {i === 0 && <span className="uploader__cover">Cover</span>}
            <button
              type="button"
              className="uploader__remove"
              onClick={() => remove(i)}
              aria-label={`Remove image ${i + 1}`}
            >
              <Icon name="trash" size={15} />
            </button>
          </div>
        ))}

        {uploading > 0 &&
          Array.from({ length: uploading }).map((_, i) => (
            <div key={`up-${i}`} className="uploader__thumb uploader__thumb--loading">
              <Spinner size={22} label="Uploading" />
            </div>
          ))}

        {images.length + uploading < max && (
          <button type="button" className="uploader__add" onClick={pick}>
            <Icon name="image" size={22} />
            <span>Add photos</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        multiple
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <p className="uploader__hint">
        Up to {max} photos · JPG, PNG, WebP or GIF · max 5 MB each. The first photo is the cover.
      </p>
      {error && <p className="uploader__error" role="alert">{error}</p>}
    </div>
  );
}

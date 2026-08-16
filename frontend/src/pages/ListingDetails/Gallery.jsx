import { useState } from 'react';
import Icon from '../../components/Icon/Icon.jsx';
import './Gallery.css';

// Listing image gallery: main image with prev/next and a thumbnail strip.
export default function Gallery({ images = [], title }) {
  const [index, setIndex] = useState(0);
  const has = images.length > 0;
  const go = (next) => setIndex((i) => (i + next + images.length) % images.length);

  if (!has) {
    return (
      <div className="gallery gallery--empty">
        <Icon name="image" size={40} />
      </div>
    );
  }

  return (
    <div className="gallery">
      <div className="gallery__main">
        <img src={images[index]} alt={`${title} — photo ${index + 1} of ${images.length}`} />
        {images.length > 1 && (
          <>
            <button type="button" className="gallery__nav gallery__nav--prev" onClick={() => go(-1)} aria-label="Previous photo">
              <Icon name="chevron-left" />
            </button>
            <button type="button" className="gallery__nav gallery__nav--next" onClick={() => go(1)} aria-label="Next photo">
              <Icon name="chevron-right" />
            </button>
            <span className="gallery__counter">{index + 1} / {images.length}</span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="gallery__thumbs">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              className={`gallery__thumb ${i === index ? 'is-active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`View photo ${i + 1}`}
              aria-current={i === index}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

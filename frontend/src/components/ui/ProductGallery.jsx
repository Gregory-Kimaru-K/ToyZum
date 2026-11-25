import { useState } from 'react';
import Icon from '../storefront/Icon';

export default function ProductGallery({ images = [], name = 'Product' }) {
  const [selected, setSelected] = useState(0);
  const [failed, setFailed] = useState({});
  const index = selected < images.length ? selected : 0;
  return <div className="gh-gallery"><div className="gh-gallery-main">{images[index] && !failed[index] ? <img src={images[index]} alt={`${name}, view ${index + 1}`} onError={() => setFailed(previous => ({ ...previous, [index]: true }))} /> : <div className="gh-image-fallback"><Icon name="box" size={70} /><span>Image unavailable</span></div>}</div>{images.length > 1 && <div className="gh-gallery-thumbnails" aria-label={`${name} images`}>{images.map((image, i) => <button type="button" key={`${image}-${i}`} aria-label={`Show image ${i + 1}`} aria-pressed={i === index} onClick={() => setSelected(i)}>{failed[i] ? <Icon name="box" /> : <img src={image} alt="" loading="lazy" onError={() => setFailed(previous => ({ ...previous, [i]: true }))} />}</button>)}</div>}</div>;
}

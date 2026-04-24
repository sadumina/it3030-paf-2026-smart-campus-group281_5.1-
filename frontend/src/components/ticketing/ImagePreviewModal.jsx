import { useEffect, useRef } from "react";
import { BACKEND_URL } from "../../services/apiConfig";

export default function ImagePreviewModal({ src, onClose }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="tkt-lightbox"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <button className="tkt-lightbox-close" onClick={onClose} title="Close">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <img src={`${BACKEND_URL}${src}`} alt="Full preview" />
    </div>
  );
}

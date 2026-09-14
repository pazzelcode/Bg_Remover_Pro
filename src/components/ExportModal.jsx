import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { downloadImage } from '../utils/imageHelper';

export const ExportModal = () => {
  const { processedImage } = useAppStore();

  if (!processedImage) return null;

  const handleDownload = () => {
    downloadImage(
      processedImage,
      'bg-removed-pro.png'
    );
  };

  return (
    <div className="export-panel">

      <div className="export-panel-info">

        <div className="export-success">
          ✓
        </div>

        <div className="export-panel-text">
          <div className="export-label">
            HASIL SELESAI
          </div>

          <h3>
            Hasil Siap Unduh
          </h3>

          <p>
            Latar belakang berhasil dihapus dengan bersih.
          </p>
        </div>

      </div>


      <button
        type="button"
        className="export-download-button"
        onClick={handleDownload}
      >

        <span className="export-download-icon">
          ↓
        </span>

        <span className="export-download-content">

          <strong>
            Unduh Gambar
          </strong>

          <small>
            PNG • Transparan
          </small>

        </span>

      </button>

    </div>
  );
};

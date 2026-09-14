import React, { useCallback, useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { fileToDataUrl } from '../utils/imageHelper';
import { useImageProcessor } from '../hooks/useImageProcessor';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const SUPPORTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const Dropzone = () => {
  const setOriginalImage = useAppStore(
    (state) => state.setOriginalImage
  );

  const { processImage } = useImageProcessor();

  const inputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState('');

  /* =========================================================
     FILE VALIDATION
  ========================================================= */

  const validateFile = (file) => {
    if (!file) {
      return 'File tidak ditemukan.';
    }

    if (!SUPPORTED_TYPES.includes(file.type)) {
      return 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP.';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'Ukuran gambar terlalu besar. Maksimal 10 MB.';
    }

    return null;
  };


  /* =========================================================
     PROCESS FILE
  ========================================================= */

  const handleFile = useCallback(
    async (file) => {
      setError('');

      const validationError = validateFile(file);

      if (validationError) {
        setError(validationError);
        return;
      }

      try {
        setIsReading(true);

        const dataUrl = await fileToDataUrl(file);

        setOriginalImage(dataUrl);

        await processImage(dataUrl);

      } catch (err) {
        console.error(
          'BgRemove Pro - Failed to process image:',
          err
        );

        setError(
          'Gagal membaca gambar. Silakan coba gambar lain.'
        );
      } finally {
        setIsReading(false);
      }
    },
    [setOriginalImage, processImage]
  );


  /* =========================================================
     FILE PICKER
  ========================================================= */

  const openFilePicker = () => {
    if (isReading) return;

    inputRef.current?.click();
  };


  const handleInputChange = async (e) => {
    const file = e.target.files?.[0];

    if (file) {
      await handleFile(file);
    }

    /*
      Reset input supaya file yang sama
      tetap bisa dipilih kembali.
    */
    e.target.value = '';
  };


  /* =========================================================
     DRAG & DROP
  ========================================================= */

  const onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isReading) {
      setIsDragging(true);
      setError('');
    }
  };


  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };


  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();

    /*
      Hanya matikan state ketika pointer
      benar-benar meninggalkan dropzone.
    */
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };


  const onDrop = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDragging(false);

      if (isReading) return;

      const file = e.dataTransfer.files?.[0];

      if (file) {
        await handleFile(file);
      }
    },
    [handleFile, isReading]
  );


  /* =========================================================
     PASTE
  ========================================================= */

  const onPaste = useCallback(
    async (e) => {
      if (isReading) return;

      const items = e.clipboardData?.items;

      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();

          const file = item.getAsFile();

          if (file) {
            await handleFile(file);
          }

          break;
        }
      }
    },
    [handleFile, isReading]
  );


  /* =========================================================
     UI STATE
  ========================================================= */

  const dropzoneClass = [
    'dropzone-card',
    isDragging ? 'dropzone-active' : '',
    isReading ? 'dropzone-reading' : '',
  ]
    .filter(Boolean)
    .join(' ');


  return (
    <div className="dropzone-wrapper">

      {/* =====================================================
          DROPZONE
      ===================================================== */}

      <div
        className={dropzoneClass}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onPaste={onPaste}
        onClick={openFilePicker}
        onKeyDown={(e) => {
          if (
            e.key === 'Enter' ||
            e.key === ' '
          ) {
            e.preventDefault();
            openFilePicker();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Upload gambar"
      >

        {/* Decorative glow */}
        <div className="dropzone-glow"></div>


        {/* =================================================
            ICON
        ================================================= */}

        <div className="upload-icon">

          {isReading ? (
            <div className="upload-spinner"></div>
          ) : isDragging ? (
            <span className="upload-icon-symbol">↓</span>
          ) : (
            <span className="upload-icon-symbol">↑</span>
          )}

        </div>


        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="dropzone-content">

          {isReading ? (

            <>
              <h2>
                Menyiapkan gambar...
              </h2>

              <p>
                Membaca file dan menyiapkan AI.
              </p>
            </>

          ) : isDragging ? (

            <>
              <h2>
                Lepaskan gambar di sini
              </h2>

              <p>
                BgRemove Pro siap memproses gambar kamu.
              </p>
            </>

          ) : (

            <>
              <div className="upload-eyebrow">
                <span>✦</span>
                AI BACKGROUND REMOVER
              </div>

              <h2>
                Drop your image here
              </h2>

              <p>
                Seret gambar ke area ini atau pilih
                file dari perangkat kamu.
              </p>
            </>

          )}

        </div>


        {/* =================================================
            BUTTON
        ================================================= */}

        {!isReading && !isDragging && (

          <button
            type="button"
            className="upload-button"
            onClick={(e) => {
              e.stopPropagation();
              openFilePicker();
            }}
          >
            <span>＋</span>
            Pilih Gambar
          </button>

        )}


        {/* =================================================
            FILE INFO
        ================================================= */}

        <div className="upload-meta">

          <span>
            JPG
          </span>

          <span className="meta-dot">
            •
          </span>

          <span>
            PNG
          </span>

          <span className="meta-dot">
            •
          </span>

          <span>
            WEBP
          </span>

          <span className="meta-divider">
            |
          </span>

          <span>
            Maks. 10 MB
          </span>

        </div>


        {/* =================================================
            PASTE
        ================================================= */}

        {!isReading && !isDragging && (

          <div className="paste-hint">
            <span>⌘</span>
            <span className="paste-key">
              Ctrl + V
            </span>
            <span>
              untuk paste gambar
            </span>
          </div>

        )}


        {/* =================================================
            HIDDEN INPUT
        ================================================= */}

        <input
  ref={inputRef}
  type="file"
  accept="image/jpeg,image/png,image/webp"
  onChange={handleInputChange}
  disabled={isReading}
  style={{
    position: 'fixed',
    width: '1px',
    height: '1px',
    opacity: 0,
    pointerEvents: 'none',
    left: '-9999px',
    top: '-9999px',
  }}
/>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="dropzone-error">

          <span className="error-icon">
            !
          </span>

          <span>
            {error}
          </span>

        </div>

      )}


      {/* =====================================================
          PRIVACY NOTE
      ===================================================== */}

      <div className="privacy-note">

        <span className="privacy-icon">
          🔒
        </span>

        <span>
          Gambar diproses secara lokal di perangkat kamu.
        </span>

      </div>

    </div>
  );
};

import React from 'react';
import { useAppStore } from '../store/useAppStore';

export const Toolbar = () => {
  const {
    activeTool,
    setActiveTool,
    brushSize,
    setBrushSize,
    brushType,
    setBrushType,
    resetState,
  } = useAppStore();

  const isBrushMode = activeTool === 'brush';

  return (
    <section className="toolbar-panel">
      {/* =====================================================
          TOOLBAR HEADER
      ===================================================== */}
      <div className="toolbar-top">
        <div className="toolbar-heading">
          <div className="toolbar-heading-icon">
            ✦
          </div>

          <div>
            <strong>Editor Tools</strong>
            <span>
              Atur cara kamu mengedit hasil gambar
            </span>
          </div>
        </div>

        <div className="toolbar-current-mode">
          <span className="toolbar-mode-dot"></span>
          {isBrushMode ? 'Manual' : 'AI Auto'}
        </div>
      </div>

      {/* =====================================================
          MAIN TOOL SELECTION
      ===================================================== */}
      <div className="toolbar-main">
        <div className="toolbar-tool-group">

          <button
            type="button"
            onClick={() => setActiveTool('auto')}
            className={`toolbar-tool-button ${
              activeTool === 'auto'
                ? 'toolbar-tool-active'
                : ''
            }`}
            aria-pressed={activeTool === 'auto'}
          >
            <span className="toolbar-tool-icon">
              ✨
            </span>

            <span className="toolbar-tool-content">
              <strong>AI Otomatis</strong>
              <small>
                Hasil background removal
              </small>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('brush')}
            className={`toolbar-tool-button ${
              activeTool === 'brush'
                ? 'toolbar-tool-active'
              : ''
            }`}
            aria-pressed={activeTool === 'brush'}
          >
            <span className="toolbar-tool-icon">
              ✎
            </span>

            <span className="toolbar-tool-content">
              <strong>Kuas Manual</strong>
              <small>
                Rapikan area gambar
              </small>
            </span>
          </button>

        </div>

        {/* ===================================================
            BRUSH SETTINGS
        =================================================== */}
        {isBrushMode && (
          <div className="toolbar-brush-panel">

            <div className="toolbar-brush-row">

              <div className="toolbar-brush-label">
                <span>Mode Brush</span>
                <small>
                  {brushType === 'erase'
                    ? 'Menghapus area'
                    : 'Memulihkan area'}
                </small>
              </div>

              <div className="toolbar-brush-actions">

                <button
                  type="button"
                  onClick={() => setBrushType('erase')}
                  className={`toolbar-brush-mode ${
                    brushType === 'erase'
                      ? 'toolbar-brush-mode-erase'
                      : ''
                  }`}
                  aria-pressed={brushType === 'erase'}
                >
                  <span>⌫</span>
                  Hapus
                </button>

                <button
                  type="button"
                  onClick={() => setBrushType('restore')}
                  className={`toolbar-brush-mode ${
                    brushType === 'restore'
                      ? 'toolbar-brush-mode-restore'
                      : ''
                  }`}
                  aria-pressed={brushType === 'restore'}
                >
                  <span>↶</span>
                  Pulihkan
                </button>

              </div>

            </div>

            {/* ===============================================
                BRUSH SIZE
            =============================================== */}
            <div className="toolbar-size">

              <div className="toolbar-size-header">
                <div>
                  <span>Ukuran Kuas</span>
                  <small>
                    Atur ukuran area edit
                  </small>
                </div>

                <strong>
                  {brushSize}px
                </strong>
              </div>

              <div className="toolbar-size-control">

                <span className="brush-size-preview">
                  <span
                    style={{
                      width: `${Math.min(
                        Math.max(brushSize / 2, 4),
                        24
                      )}px`,
                      height: `${Math.min(
                        Math.max(brushSize / 2, 4),
                        24
                      )}px`,
                    }}
                  />
                </span>

                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={brushSize}
                  onChange={(event) =>
                    setBrushSize(
                      Number(event.target.value)
                    )
                  }
                  className="toolbar-range"
                  aria-label="Ukuran kuas"
                />

              </div>

            </div>

          </div>
        )}
      </div>

      {/* =====================================================
          RESET
      ===================================================== */}
      <div className="toolbar-bottom">

        <div className="toolbar-tip">
          <span>💡</span>
          <span>
            {isBrushMode
              ? 'Gunakan kuas untuk merapikan hasil secara manual.'
              : 'AI otomatis digunakan untuk hasil background removal.'}
          </span>
        </div>

        <button
          type="button"
          onClick={resetState}
          className="toolbar-reset"
        >
          <span className="toolbar-reset-icon">
            ↻
          </span>

          <span>
            Reset Gambar
          </span>
        </button>

      </div>
    </section>
  );
};

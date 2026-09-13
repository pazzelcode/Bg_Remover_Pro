import React from 'react';
import { useAppStore } from './store/useAppStore';
import { Dropzone } from './components/Dropzone';
import { Toolbar } from './components/Toolbar';
import { CanvasEditor } from './components/CanvasEditor';
import { ExportModal } from './components/ExportModal';

export function App() {
  const {
    originalImage,
    isLoading,
    loadingProgress,
    statusText
  } = useAppStore();

  return (
    <div className="app-shell">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="app-header">
        <div className="app-header-inner">

          <div className="brand">
            <div className="brand-icon">
              <span>✦</span>
            </div>

            <div className="brand-info">
              <h1>BgRemove Pro</h1>
              <p>AI Background Remover</p>
            </div>
          </div>

          <div className="status-pill">
            <span className="status-dot"></span>
            <span>Offline AI Ready</span>
          </div>

        </div>
      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}
      <main className="app-main">

        {!originalImage ? (

          <section className="landing">

            {/* Hero */}
            <div className="hero animate-fadeIn">

              <div className="hero-badge">
                <span>✦</span>
                AI POWERED
              </div>

              <h2>
                Remove backgrounds.
                <br />
                <span>Keep what matters.</span>
              </h2>

              <p>
                Hapus background foto dengan cepat dan mudah.
                Semua proses dilakukan langsung di perangkatmu.
              </p>

            </div>


            {/* Upload */}
            <div className="upload-wrapper animate-fadeIn">
              <Dropzone />
            </div>


            {/* Features */}
            <div className="feature-grid animate-fadeIn">

              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <div>
                  <h3>Fast Processing</h3>
                  <p>Proses gambar langsung di perangkat.</p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <div>
                  <h3>Private</h3>
                  <p>Foto tidak perlu dikirim ke server.</p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">✦</div>
                <div>
                  <h3>Transparent PNG</h3>
                  <p>Hasil siap digunakan kembali.</p>
                </div>
              </div>

            </div>


            {/* How it works */}
            <div className="how-section animate-fadeIn">

              <div className="section-heading">
                <span>WORKFLOW</span>
                <h3>Three simple steps</h3>
              </div>

              <div className="steps">

                <div className="step">
                  <div className="step-number">01</div>
                  <div>
                    <strong>Upload</strong>
                    <p>Pilih foto dari perangkatmu.</p>
                  </div>
                </div>

                <div className="step-line"></div>

                <div className="step">
                  <div className="step-number">02</div>
                  <div>
                    <strong>Remove</strong>
                    <p>AI mendeteksi dan menghapus background.</p>
                  </div>
                </div>

                <div className="step-line"></div>

                <div className="step">
                  <div className="step-number">03</div>
                  <div>
                    <strong>Export</strong>
                    <p>Download hasil sebagai PNG.</p>
                  </div>
                </div>

              </div>

            </div>

          </section>

        ) : (

          /* ===================================================
             EDITOR
          =================================================== */
          <section className="editor-workspace animate-fadeIn">

            <Toolbar />

            <div className="canvas-container">
              <CanvasEditor />
            </div>

            <ExportModal />

          </section>

        )}

      </main>


      {/* =====================================================
          PROCESSING OVERLAY
      ===================================================== */}
      {isLoading && (

        <div className="processing-overlay">

          <div className="processing-card">

            <div className="processing-icon">
              <div className="processing-spinner"></div>
              <span>✦</span>
            </div>

            <div className="processing-content">

              <div className="processing-label">
                AI PROCESSING
              </div>

              <h3>
                Memproses gambar...
              </h3>

              <p>
                {statusText ||
                  'Sedang mengekstrak latar belakang...'}
              </p>

            </div>


            <div className="progress-wrapper">

              <div className="progress-header">
                <span>Processing</span>
                <strong>{loadingProgress}%</strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-bar"
                  style={{
                    width: `${loadingProgress}%`
                  }}
                />
              </div>

            </div>


            <div className="processing-tip">
              <span>💡</span>
              Jangan tutup halaman selama proses berlangsung.
            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="app-footer">

        <div className="footer-inner">

          <span>
            BgRemove Pro
          </span>

          <span className="footer-separator">
            •
          </span>

          <span>
            PZC
          </span>

          <span className="footer-version">
            v1.0
          </span>

        </div>

      </footer>

    </div>
  );
}

export default App;
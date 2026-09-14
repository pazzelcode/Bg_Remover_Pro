import React, {
  useRef,
  useEffect,
  useCallback,
} from 'react';

import { useAppStore } from '../store/useAppStore';

export const CanvasEditor = () => {
  const {
    originalImage,
    processedImage,
    activeTool,
    brushSize,
    brushType,
    setProcessedImage,
  } = useAppStore();

  const canvasRef = useRef(null);

  const restoreCanvasRef = useRef(null);

  const originalImageRef = useRef(null);

  const isDrawing = useRef(false);

  const lastPoint = useRef(null);

  /* =========================================================
     LOAD ORIGINAL IMAGE
     Dipakai khusus untuk mode RESTORE.
  ========================================================= */

  useEffect(() => {
    if (!originalImage) {
      originalImageRef.current = null;
      return;
    }

    const img = new Image();

    img.onload = () => {
      originalImageRef.current = img;
    };

    img.onerror = () => {
      console.error(
        'BgRemove Pro: gagal memuat original image'
      );

      originalImageRef.current = null;
    };

    img.src = originalImage;
  }, [originalImage]);


  /* =========================================================
     LOAD PROCESSED IMAGE
  ========================================================= */

  useEffect(() => {
    if (!processedImage || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const img = new Image();

    img.onload = () => {
      /*
       * Jangan menggambar jika canvas sudah berubah
       * karena image sebelumnya.
       */
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      ctx.globalCompositeOperation =
        'source-over';

      ctx.globalAlpha = 1;

      ctx.drawImage(
        img,
        0,
        0,
        canvas.width,
        canvas.height
      );

      /*
       * Siapkan canvas sementara untuk restore.
       */
      if (!restoreCanvasRef.current) {
        restoreCanvasRef.current =
          document.createElement('canvas');
      }

      const restoreCanvas =
        restoreCanvasRef.current;

      restoreCanvas.width = canvas.width;
      restoreCanvas.height = canvas.height;
    };

    img.onerror = () => {
      console.error(
        'BgRemove Pro: gagal memuat processed image'
      );
    };

    img.src = processedImage;

  }, [processedImage]);


  /* =========================================================
     GET POINTER POSITION
  ========================================================= */

  const getPointerPosition = useCallback(
    (event) => {
      const canvas = canvasRef.current;

      if (!canvas) {
        return null;
      }

      const rect =
        canvas.getBoundingClientRect();

      if (
        !rect.width ||
        !rect.height ||
        !canvas.width ||
        !canvas.height
      ) {
        return null;
      }

      const clientX = event.clientX;
      const clientY = event.clientY;

      if (
        typeof clientX !== 'number' ||
        typeof clientY !== 'number'
      ) {
        return null;
      }

      const scaleX =
        canvas.width / rect.width;

      const scaleY =
        canvas.height / rect.height;

      return {
        x:
          (clientX - rect.left) *
          scaleX,

        y:
          (clientY - rect.top) *
          scaleY,

        scaleX,
        scaleY,
      };
    },
    []
  );


  /* =========================================================
     CREATE BRUSH PATH
  ========================================================= */

  const createBrushPath = useCallback(
    (ctx, point, radius) => {
      if (!ctx || !point) {
        return;
      }

      ctx.beginPath();

      /*
       * Stroke antar point membuat brush lebih halus
       * dan tidak putus ketika pointer bergerak cepat.
       */
      if (lastPoint.current) {
        const previous =
          lastPoint.current;

        ctx.moveTo(
          previous.x,
          previous.y
        );

        ctx.lineTo(
          point.x,
          point.y
        );

        ctx.lineWidth = radius * 2;

        ctx.lineCap = 'round';

        ctx.lineJoin = 'round';

        ctx.strokeStyle =
          'rgba(255,255,255,1)';

        ctx.stroke();

      } else {
        ctx.arc(
          point.x,
          point.y,
          radius,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          'rgba(255,255,255,1)';

        ctx.fill();
      }
    },
    []
  );


  /* =========================================================
     ERASE
  ========================================================= */

  const eraseAtPoint = useCallback(
    (point) => {
      const canvas = canvasRef.current;

      if (!canvas || !point) {
        return;
      }

      const ctx =
        canvas.getContext('2d');

      if (!ctx) {
        return;
      }

      const brushScale =
        (point.scaleX + point.scaleY) / 2;

      const radius =
        Math.max(
          1,
          brushSize * brushScale
        );

      ctx.save();

      ctx.globalCompositeOperation =
        'destination-out';

      ctx.globalAlpha = 1;

      /*
       * Gambar brush transparan.
       */
      createBrushPath(
        ctx,
        point,
        radius
      );

      ctx.restore();

      lastPoint.current = point;
    },
    [
      brushSize,
      createBrushPath,
    ]
  );


  /* =========================================================
     RESTORE
  =========================================================
     Mengambil pixel dari ORIGINAL IMAGE.
     
     BUKAN menggambar warna putih.
  ========================================================= */

  const restoreAtPoint = useCallback(
    (point) => {
      const canvas = canvasRef.current;

      const original =
        originalImageRef.current;

      if (
        !canvas ||
        !original ||
        !point
      ) {
        return;
      }

      const ctx =
        canvas.getContext('2d');

      if (!ctx) {
        return;
      }

      /*
       * Pastikan canvas mask tersedia.
       */
      if (!restoreCanvasRef.current) {
        restoreCanvasRef.current =
          document.createElement('canvas');
      }

      const maskCanvas =
        restoreCanvasRef.current;

      if (
        maskCanvas.width !== canvas.width ||
        maskCanvas.height !== canvas.height
      ) {
        maskCanvas.width =
          canvas.width;

        maskCanvas.height =
          canvas.height;
      }

      const maskCtx =
        maskCanvas.getContext('2d');

      if (!maskCtx) {
        return;
      }

      const brushScale =
        (point.scaleX + point.scaleY) / 2;

      const radius =
        Math.max(
          1,
          brushSize * brushScale
        );

      /*
       * Bersihkan mask.
       */
      maskCtx.clearRect(
        0,
        0,
        maskCanvas.width,
        maskCanvas.height
      );

      /*
       * Buat area brush putih.
       */
      maskCtx.save();

      createBrushPath(
        maskCtx,
        point,
        radius
      );

      maskCtx.restore();

      /*
       * Temporary canvas berisi original image.
       */
      const restoreCtx =
        maskCanvas.getContext('2d');

      /*
       * Kita menggunakan canvas tambahan kedua
       * agar original image tidak merusak mask.
       */
      if (!restoreAtPoint.originalCanvas) {
        restoreAtPoint.originalCanvas =
          document.createElement('canvas');
      }

      const sourceCanvas =
        restoreAtPoint.originalCanvas;

      if (
        sourceCanvas.width !== canvas.width ||
        sourceCanvas.height !== canvas.height
      ) {
        sourceCanvas.width =
          canvas.width;

        sourceCanvas.height =
          canvas.height;
      }

      const sourceCtx =
        sourceCanvas.getContext('2d');

      if (!sourceCtx) {
        return;
      }

      /*
       * Bersihkan source.
       */
      sourceCtx.clearRect(
        0,
        0,
        sourceCanvas.width,
        sourceCanvas.height
      );

      /*
       * Gambar original image.
       */
      sourceCtx.globalCompositeOperation =
        'source-over';

      sourceCtx.globalAlpha = 1;

      sourceCtx.drawImage(
        original,
        0,
        0,
        sourceCanvas.width,
        sourceCanvas.height
      );

      /*
       * Ambil alpha berdasarkan mask.
       */
      sourceCtx.globalCompositeOperation =
        'destination-in';

      sourceCtx.drawImage(
        maskCanvas,
        0,
        0
      );

      /*
       * Masukkan pixel original ke canvas editor.
       */
      ctx.save();

      ctx.globalCompositeOperation =
        'source-over';

      ctx.globalAlpha = 1;

      ctx.drawImage(
        sourceCanvas,
        0,
        0
      );

      ctx.restore();

      /*
       * Bersihkan source untuk stroke berikutnya.
       */
      sourceCtx.clearRect(
        0,
        0,
        sourceCanvas.width,
        sourceCanvas.height
      );

      lastPoint.current = point;
    },
    [
      brushSize,
      createBrushPath,
    ]
  );


  /* =========================================================
     DRAW DISPATCHER
  ========================================================= */

  const drawAtPoint = useCallback(
    (point) => {
      if (
        !point ||
        !canvasRef.current ||
        activeTool !== 'brush'
      ) {
        return;
      }

      if (brushType === 'erase') {
        eraseAtPoint(point);
        return;
      }

      if (brushType === 'restore') {
        restoreAtPoint(point);
      }
    },
    [
      activeTool,
      brushType,
      eraseAtPoint,
      restoreAtPoint,
    ]
  );


  /* =========================================================
     POINTER START
  ========================================================= */

  const startDrawing = useCallback(
    (event) => {
      if (
        activeTool !== 'brush' ||
        !canvasRef.current
      ) {
        return;
      }

      event.preventDefault();

      /*
       * Capture pointer supaya touch/stylus tetap
       * diterima walaupun bergerak sedikit keluar canvas.
       */
      try {
        event.currentTarget.setPointerCapture(
          event.pointerId
        );
      } catch {
        // Browser lama mungkin tidak support.
      }

      isDrawing.current = true;

      lastPoint.current = null;

      const point =
        getPointerPosition(event);

      drawAtPoint(point);
    },
    [
      activeTool,
      getPointerPosition,
      drawAtPoint,
    ]
  );


  /* =========================================================
     POINTER MOVE
  ========================================================= */

  const moveDrawing = useCallback(
    (event) => {
      if (
        !isDrawing.current ||
        activeTool !== 'brush'
      ) {
        return;
      }

      event.preventDefault();

      const point =
        getPointerPosition(event);

      drawAtPoint(point);
    },
    [
      activeTool,
      getPointerPosition,
      drawAtPoint,
    ]
  );


  /* =========================================================
     POINTER END
  ========================================================= */

  const stopDrawing = useCallback(
    (event) => {
      if (!isDrawing.current) {
        return;
      }

      isDrawing.current = false;

      lastPoint.current = null;

      /*
       * Lepaskan pointer capture.
       */
      if (
        event?.currentTarget &&
        event.pointerId !== undefined
      ) {
        try {
          event.currentTarget.releasePointerCapture(
            event.pointerId
          );
        } catch {
          // Abaikan jika pointer capture sudah lepas.
        }
      }

      const canvas =
        canvasRef.current;

      if (!canvas) {
        return;
      }

      try {
        const result =
          canvas.toDataURL(
            'image/png'
          );

        setProcessedImage(result);

      } catch (error) {
        console.error(
          'BgRemove Pro: gagal menyimpan perubahan canvas',
          error
        );
      }
    },
    [setProcessedImage]
  );


  /* =========================================================
     CONTEXT MENU
  ========================================================= */

  const handleContextMenu =
    useCallback(
      (event) => {
        if (activeTool === 'brush') {
          event.preventDefault();
        }
      },
      [activeTool]
    );


  /* =========================================================
     EMPTY STATE
  ========================================================= */

  if (
    !processedImage &&
    !originalImage
  ) {
    return (
      <div className="canvas-editor-empty">
        <span>Belum ada gambar</span>
      </div>
    );
  }


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      className="canvas-editor"
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="canvas-editor-header">

        <div className="canvas-editor-title">

          <div className="canvas-status-icon">
            ✦
          </div>

          <div>
            <strong>
              Background Removed
            </strong>

            <span>
              Edit hasil gambar kamu
            </span>
          </div>

        </div>


        <div className="canvas-editor-status">

          <span className="canvas-status-dot"></span>

          Transparent PNG

        </div>

      </div>


      {/* =====================================================
          CANVAS STAGE
      ===================================================== */}

      <div
        className="canvas-stage"
        onContextMenu={handleContextMenu}
      >

        <div className="canvas-checkerboard"></div>


        <div className="canvas-stage-inner">

          {processedImage ? (

            <canvas
              ref={canvasRef}

              onPointerDown={startDrawing}

              onPointerMove={moveDrawing}

              onPointerUp={stopDrawing}

              onPointerCancel={stopDrawing}

              onPointerLeave={(event) => {
                /*
                 * Jangan menghentikan touch/stylus.
                 * Pointer capture akan menjaga drawing.
                 */
                if (
                  event.pointerType === 'mouse' &&
                  isDrawing.current
                ) {
                  stopDrawing(event);
                }
              }}

              className={[
                'editor-canvas',

                activeTool === 'brush'
                  ? 'editor-canvas-brush'
                  : 'editor-canvas-default',
              ].join(' ')}

              style={{
                touchAction:
                  activeTool === 'brush'
                    ? 'none'
                    : 'auto',
              }}

              aria-label="Canvas editor"
            />

          ) : (

            <img
              src={originalImage}
              alt="Original"
              className="editor-original-image"
              draggable="false"
            />

          )}

        </div>


        {/* =================================================
            FLOATING STATUS
        ================================================= */}

        <div className="canvas-floating-badge">

          <span className="badge-dot"></span>

          {activeTool === 'brush'
            ? brushType === 'erase'
              ? 'Erase mode'
              : 'Restore mode'
            : 'Preview'}

        </div>

      </div>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="canvas-editor-footer">

        <div className="canvas-hint">

          <span className="hint-icon">
            ✦
          </span>

          {activeTool === 'brush'
            ? brushType === 'erase'
              ? 'Sapukan brush untuk menghapus area gambar.'
              : 'Sapukan brush untuk mengembalikan bagian gambar asli.'
            : 'Gunakan toolbar untuk mengedit hasil background remover.'}

        </div>


        {activeTool === 'brush' && (

          <div className="brush-info">

            <span>
              Brush
            </span>

            <strong>
              {brushSize}px
            </strong>

          </div>

        )}

      </div>

    </div>
  );
};

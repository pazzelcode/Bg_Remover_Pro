import { removeBackground } from '@imgly/background-removal';
import { useAppStore } from '../store/useAppStore';

/* =========================================================
   BGREMOVE PRO
   IMAGE PROCESSOR - OPTIMIZED
========================================================= */

const MAX_AI_DIMENSION = 1536;
const PROGRESS_UPDATE_INTERVAL = 120;

let lastProgressUpdate = 0;

/* =========================================================
   RESIZE IMAGE FOR AI
   - Menggunakan Blob, bukan Base64
   - Mengurangi memory usage
========================================================= */

const resizeImageForAI = (dataUrl, maxDimension = MAX_AI_DIMENSION) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round(
              (height * maxDimension) / width
            );

            width = maxDimension;
          } else {
            width = Math.round(
              (width * maxDimension) / height
            );

            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', {
          alpha: false,
          willReadFrequently: false,
        });

        if (!ctx) {
          throw new Error('Canvas context tidak tersedia.');
        }

        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(
                new Error('Gagal membuat Blob gambar.')
              );
              return;
            }

            resolve(blob);
          },
          'image/jpeg',
          0.88
        );

      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(
        new Error('Gagal membaca gambar.')
      );
    };

    img.src = dataUrl;
  });
};


/* =========================================================
   PROCESSOR
========================================================= */

export const useImageProcessor = () => {

  const {
    setProcessedImage,
    setIsLoading,
  } = useAppStore();


  const processImage = async (imageSource) => {

    try {

      /* -----------------------------------------------------
         STEP 1
      ----------------------------------------------------- */

      setIsLoading(
        true,
        5,
        'Menyiapkan gambar...'
      );


      /* -----------------------------------------------------
         STEP 2
      ----------------------------------------------------- */

      const optimizedSource =
        await resizeImageForAI(
          imageSource,
          MAX_AI_DIMENSION
        );


      setIsLoading(
        true,
        15,
        'Menyiapkan AI...'
      );


      /* -----------------------------------------------------
         STEP 3
      ----------------------------------------------------- */

      let lastDisplayedProgress = 15;

      const config = {

        model: 'isnet',

        debug: false,

        progress: (
          key,
          current,
          total
        ) => {

          if (!total) return;

          const now = Date.now();

          if (
            now - lastProgressUpdate <
            PROGRESS_UPDATE_INTERVAL
          ) {
            return;
          }

          lastProgressUpdate = now;

          const aiProgress =
            current / total;

          const percent =
            Math.round(
              15 +
              aiProgress * 85
            );

          if (
            percent <=
            lastDisplayedProgress
          ) {
            return;
          }

          lastDisplayedProgress =
            percent;

          setIsLoading(
            true,
            Math.min(percent, 99),
            `AI memproses gambar... ${Math.min(
              percent,
              99
            )}%`
          );
        },
      };


      /* -----------------------------------------------------
         STEP 4
         AI BACKGROUND REMOVAL
      ----------------------------------------------------- */

      const blob =
        await removeBackground(
          optimizedSource,
          config
        );


      /* -----------------------------------------------------
         STEP 5
      ----------------------------------------------------- */

      setIsLoading(
        true,
        99,
        'Menyelesaikan hasil...'
      );


      const url =
        URL.createObjectURL(blob);


      setProcessedImage(url);


    } catch (error) {

      console.error(
        'BgRemove Pro - Gagal memproses gambar:',
        error
      );

      alert(
        'Terjadi kesalahan saat menghapus background.'
      );

    } finally {

      setIsLoading(
        false,
        100,
        ''
      );

    }
  };


  return {
    processImage,
  };
};

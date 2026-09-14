import { create } from 'zustand';

export const useAppStore = create((set) => ({
  /* =========================================================
     IMAGE STATE
  ========================================================= */

  originalImage: null,

  processedImage: null,

  /* =========================================================
     PROCESSING STATE
  ========================================================= */

  isLoading: false,

  loadingProgress: 0,

  statusText: '',

  /* =========================================================
     EDITOR STATE
  ========================================================= */

  // auto    = AI otomatis
  // brush   = editor manual
  // background = reserved untuk pengembangan berikutnya
  activeTool: 'auto',

  // Ukuran brush dalam pixel
  brushSize: 20,

  // erase   = menghapus area
  // restore = memulihkan area
  brushType: 'erase',

  /* =========================================================
     HISTORY
     =========================================================
     Disiapkan untuk Undo / Redo.
     Belum dipakai penuh oleh Toolbar saat ini.
  */

  history: [],

  historyIndex: -1,

  /* =========================================================
     IMAGE ACTIONS
  ========================================================= */

  setOriginalImage: (img) =>
    set({
      originalImage: img,
      processedImage: null,

      history: [],
      historyIndex: -1,

      activeTool: 'auto',
      brushType: 'erase',
      brushSize: 20,
    }),

  setProcessedImage: (img) =>
    set((state) => {
      if (!img) {
        return {
          processedImage: null,
        };
      }

      const currentHistory = state.history;

      /*
       * Hindari menyimpan image yang sama berulang kali.
       */
      if (
        currentHistory[
          state.historyIndex
        ] === img
      ) {
        return {
          processedImage: img,
        };
      }

      /*
       * Jika sebelumnya melakukan undo,
       * history setelah posisi sekarang dibuang.
       */
      const nextHistory =
        state.historyIndex >= 0
          ? currentHistory.slice(
              0,
              state.historyIndex + 1
            )
          : [];

      nextHistory.push(img);

      /*
       * Batasi history agar memory browser
       * tidak terus membesar.
       */
      const MAX_HISTORY = 20;

      const limitedHistory =
        nextHistory.length > MAX_HISTORY
          ? nextHistory.slice(
              nextHistory.length - MAX_HISTORY
            )
          : nextHistory;

      return {
        processedImage: img,

        history: limitedHistory,

        historyIndex:
          limitedHistory.length - 1,
      };
    }),

  /* =========================================================
     PROCESSING ACTIONS
  ========================================================= */

  setIsLoading: (
    loading,
    progress = 0,
    text = ''
  ) =>
    set({
      isLoading: Boolean(loading),

      loadingProgress: Math.max(
        0,
        Math.min(100, Number(progress) || 0)
      ),

      statusText: text || '',
    }),

  /* =========================================================
     EDITOR ACTIONS
  ========================================================= */

  setActiveTool: (tool) => {
    const allowedTools = [
      'auto',
      'brush',
      'background',
    ];

    if (!allowedTools.includes(tool)) {
      return;
    }

    set({
      activeTool: tool,
    });
  },

  setBrushSize: (size) => {
    const numericSize = Number(size);

    if (!Number.isFinite(numericSize)) {
      return;
    }

    set({
      brushSize: Math.max(
        5,
        Math.min(50, numericSize)
      ),
    });
  },

  setBrushType: (type) => {
    if (
      type !== 'erase' &&
      type !== 'restore'
    ) {
      return;
    }

    set({
      brushType: type,
    });
  },

  /* =========================================================
     EDITOR RESET
     =========================================================
     Mengembalikan hasil editor ke hasil AI terakhir
     tanpa membuang gambar yang sedang diedit.
  */

  resetEditor: () =>
    set((state) => ({
      processedImage:
        state.history.length > 0
          ? state.history[0]
          : state.processedImage,

      history:
        state.history.length > 0
          ? [state.history[0]]
          : state.history,

      historyIndex:
        state.history.length > 0
          ? 0
          : state.historyIndex,

      activeTool: 'auto',
      brushType: 'erase',
      brushSize: 20,
    })),

  /* =========================================================
     UNDO
     ========================================================= */

  undo: () =>
    set((state) => {
      if (
        state.historyIndex <= 0 ||
        state.history.length === 0
      ) {
        return {};
      }

      const nextIndex =
        state.historyIndex - 1;

      return {
        historyIndex: nextIndex,
        processedImage:
          state.history[nextIndex],
      };
    }),

  /* =========================================================
     REDO
     ========================================================= */

  redo: () =>
    set((state) => {
      if (
        state.historyIndex >=
          state.history.length - 1 ||
        state.history.length === 0
      ) {
        return {};
      }

      const nextIndex =
        state.historyIndex + 1;

      return {
        historyIndex: nextIndex,
        processedImage:
          state.history[nextIndex],
      };
    }),

  /* =========================================================
     FULL RESET
     =========================================================
     Kembali ke kondisi awal aplikasi.
  */

  resetState: () =>
    set({
      originalImage: null,

      processedImage: null,

      isLoading: false,

      loadingProgress: 0,

      statusText: '',

      activeTool: 'auto',

      brushSize: 20,

      brushType: 'erase',

      history: [],

      historyIndex: -1,
    }),
}));

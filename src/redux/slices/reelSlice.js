import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reels: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pages: 1,
    per_page: 20,
    total: 0,
  },
  // Public reels state
  publicReels: [],
  publicReelsLoading: false,
  publicReelsError: null,
  publicReelsPagination: {
    page: 1,
    pages: 1,
    per_page: 20,
    total: 0,
  },
};

const reelSlice = createSlice({
  name: 'reels',
  initialState,
  reducers: {
    // =========================================
    // 🔥 FETCH MERCHANT REELS REQUEST (UI → Saga)
    // =========================================
    fetchMerchantReels_Request(state, action) {
      state.loading = true;
      state.error = null;
    },

    // =========================================
    // 🔥 FETCH MERCHANT REELS SUCCESS (Saga → Redux)
    // =========================================
    fetchMerchantReels_Success(state, action) {
      const payload = action.payload ?? {};
      state.loading = false;
      state.error = null;
      state.reels = payload.reels || [];
      state.pagination = payload.pagination || {
        page: 1,
        pages: 1,
        per_page: 20,
        total: 0,
      };
    },

    // =========================================
    // 🔥 FETCH MERCHANT REELS FAILED
    // =========================================
    fetchMerchantReels_Failed(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.reels = [];
    },

    // =========================================
    // 🔥 CLEAR REELS STATE
    // =========================================
    clearReels(state) {
      state.reels = [];
      state.loading = false;
      state.error = null;
      state.pagination = {
        page: 1,
        pages: 1,
        per_page: 20,
        total: 0,
      };
    },

    // =========================================
    // 🔥 FETCH PUBLIC REELS REQUEST (UI → Saga)
    // =========================================
    fetchPublicReels_Request(state, action) {
      state.publicReelsLoading = true;
      state.publicReelsError = null;
    },

    // =========================================
    // 🔥 FETCH PUBLIC REELS SUCCESS (Saga → Redux)
    // =========================================
    fetchPublicReels_Success(state, action) {
      const payload = action.payload ?? {};
      state.publicReelsLoading = false;
      state.publicReelsError = null;
      state.publicReels = payload.reels || [];
      state.publicReelsPagination = payload.pagination || {
        page: 1,
        pages: 1,
        per_page: 20,
        total: 0,
      };
    },

    // =========================================
    // 🔥 FETCH PUBLIC REELS FAILED
    // =========================================
    fetchPublicReels_Failed(state, action) {
      state.publicReelsLoading = false;
      state.publicReelsError = action.payload;
      state.publicReels = [];
    },

    // =========================================
    // 🔥 LIKE REEL REQUEST (UI → Saga)
    // =========================================
    likeReel_Request(state, action) {
      const reelId = action.payload?.reelId;
      // Optimistically update local state
      const updateReel = (reel) => {
        if (reel.id === reelId || reel.reel_id?.toString() === reelId?.toString()) {
          return {
            ...reel,
            isLiked: true,
            likes: (reel.likes || 0) + 1,
          };
        }
        return reel;
      };
      state.reels = state.reels.map(updateReel);
      state.publicReels = state.publicReels.map(updateReel);
    },

    // =========================================
    // 🔥 LIKE REEL SUCCESS (Saga → Redux)
    // =========================================
    likeReel_Success(state, action) {
      // State already updated optimistically
    },

    // =========================================
    // 🔥 LIKE REEL FAILED
    // =========================================
    likeReel_Failed(state, action) {
      // Revert optimistic update
      const reelId = action.payload?.reelId;
      const revertReel = (reel) => {
        if (reel.id === reelId || reel.reel_id?.toString() === reelId?.toString()) {
          return {
            ...reel,
            isLiked: false,
            likes: Math.max(0, (reel.likes || 0) - 1),
          };
        }
        return reel;
      };
      state.reels = state.reels.map(revertReel);
      state.publicReels = state.publicReels.map(revertReel);
    },

    // =========================================
    // 🔥 UNLIKE REEL REQUEST (UI → Saga)
    // =========================================
    unlikeReel_Request(state, action) {
      const reelId = action.payload?.reelId;
      // Optimistically update local state
      const updateReel = (reel) => {
        if (reel.id === reelId || reel.reel_id?.toString() === reelId?.toString()) {
          return {
            ...reel,
            isLiked: false,
            likes: Math.max(0, (reel.likes || 0) - 1),
          };
        }
        return reel;
      };
      state.reels = state.reels.map(updateReel);
      state.publicReels = state.publicReels.map(updateReel);
    },

    // =========================================
    // 🔥 UNLIKE REEL SUCCESS (Saga → Redux)
    // =========================================
    unlikeReel_Success(state, action) {
      // State already updated optimistically
    },

    // =========================================
    // 🔥 UNLIKE REEL FAILED
    // =========================================
    unlikeReel_Failed(state, action) {
      // Revert optimistic update
      const reelId = action.payload?.reelId;
      const revertReel = (reel) => {
        if (reel.id === reelId || reel.reel_id?.toString() === reelId?.toString()) {
          return {
            ...reel,
            isLiked: true,
            likes: (reel.likes || 0) + 1,
          };
        }
        return reel;
      };
      state.reels = state.reels.map(revertReel);
      state.publicReels = state.publicReels.map(revertReel);
    },

    // =========================================
    // 🔥 SHARE REEL REQUEST (UI → Saga)
    // =========================================
    shareReel_Request(state, action) {
      const reelId = action.payload?.reelId;
      // Optimistically update local state
      const updateReel = (reel) => {
        if (reel.id === reelId || reel.reel_id?.toString() === reelId?.toString()) {
          return {
            ...reel,
            shares: (reel.shares || 0) + 1,
          };
        }
        return reel;
      };
      state.reels = state.reels.map(updateReel);
      state.publicReels = state.publicReels.map(updateReel);
    },

    // =========================================
    // 🔥 SHARE REEL SUCCESS (Saga → Redux)
    // =========================================
    shareReel_Success(state, action) {
      // State already updated optimistically
    },

    // =========================================
    // 🔥 SHARE REEL FAILED
    // =========================================
    shareReel_Failed(state, action) {
      // Revert optimistic update
      const reelId = action.payload?.reelId;
      const revertReel = (reel) => {
        if (reel.id === reelId || reel.reel_id?.toString() === reelId?.toString()) {
          return {
            ...reel,
            shares: Math.max(0, (reel.shares || 0) - 1),
          };
        }
        return reel;
      };
      state.reels = state.reels.map(revertReel);
      state.publicReels = state.publicReels.map(revertReel);
    },
  },
});

export const {
  fetchMerchantReels_Request,
  fetchMerchantReels_Success,
  fetchMerchantReels_Failed,
  clearReels,
  fetchPublicReels_Request,
  fetchPublicReels_Success,
  fetchPublicReels_Failed,
  likeReel_Request,
  likeReel_Success,
  likeReel_Failed,
  unlikeReel_Request,
  unlikeReel_Success,
  unlikeReel_Failed,
  shareReel_Request,
  shareReel_Success,
  shareReel_Failed,
} = reelSlice.actions;

export default reelSlice.reducer;


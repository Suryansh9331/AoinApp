import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reels: [],
  loading: false,
  error: null,
};

const reelsSlice = createSlice({
  name: 'reels',
  initialState,
  reducers: {
    setReelsData: (state, action) => {
      state.reels = action.payload;
    },
    clearReelsData: (state) => {
      state.reels = [];
    },
    setReelsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setReelsError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setReelsData, clearReelsData, setReelsLoading, setReelsError } = reelsSlice.actions;
export default reelsSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  themeMode: 'light', // 'light', 'dark', or 'system'
  systemTheme: 'light', // Will be updated from device settings
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action) => {
      state.themeMode = action.payload;
    },
    setSystemTheme: (state, action) => {
      state.systemTheme = action.payload;
    },
  },
});

export const { setThemeMode, setSystemTheme } = themeSlice.actions;
export default themeSlice.reducer;


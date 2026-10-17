import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action) {
      state.sidebarCollapsed = action.payload;
    },
    toggleMobileSidebar(state) {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
    },
    setMobileSidebarOpen(state, action) {
      state.mobileSidebarOpen = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileSidebar,
  setMobileSidebarOpen,
  toggleTheme,
} = uiSlice.actions;

export default uiSlice.reducer;

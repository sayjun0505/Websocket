import { createSlice } from '@reduxjs/toolkit';

const sidebarsSlice = createSlice({
  name: 'todoApp/sidebars',
  initialState: {
    mobileChatsSidebarOpen: true,
    customerSidebarOpen: false,
  },
  reducers: {
    openMobileChatsSidebar: (state, action) => {
      state.mobileChatsSidebarOpen = true;
    },
    closeMobileChatsSidebar: (state, action) => {
      state.mobileChatsSidebarOpen = false;
    },
    openCustomerSidebar: (state, action) => {
      state.customerSidebarOpen = true;
    },
    closeCustomerSidebar: (state, action) => {
      state.customerSidebarOpen = false;
    },
  },
});

export const {
  openMobileChatsSidebar,
  closeMobileChatsSidebar,
  openCustomerSidebar,
  closeCustomerSidebar,
} = sidebarsSlice.actions;

export default sidebarsSlice.reducer;

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

/**
 * Update Card
 */
export const updateCard = createAsyncThunk(
  'scrumboardApp/card/updateCard',
  async (newData, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const { board, card } = getState().scrumboardApp;

    // if (!card.data || card.data.cardId) {
    //   return null;
    // }

    // console.log('[CARD newData] ', newData);
    const tempData = newData.chatId ? { ...newData, listChatId: newData.id } : newData;

    const response = await axios.put(
      `/api/${organizationId}/scrumboard/board/${board.id}/card/${newData.cardId}`,
      { data: tempData },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.data;

    dispatch(
      showMessage({
        message: 'Card Saved',
        autoHideDuration: 2000,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      })
    );
    // console.log('[CARD data] ', data);
    return data;
  }
);

/**
 * Remove Card
 */
export const removeCard = createAsyncThunk(
  'scrumboardApp/card/removeCard',
  async (params, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const { board, card } = getState().scrumboardApp;

    const response = await axios.delete(
      `/api/${organizationId}/scrumboard/board/${board.id}/card/${card.data.id}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.data;

    dispatch(closeCardDialog());

    return data;
  }
);

/**
 * File Attachment
 */

export const sendFileAttachment = createAsyncThunk(
  'scrumboardApp/card/sendFileAttachment',
  async ({ boardId, cardId, formData }, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;

    const response = await axios.post(
      `/api/${organizationId}/scrumboard/board/${boardId}/card/${cardId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.data;
    // return setTimeout(async () => {
    return data;
    // }, 3000);
  }
);

//  export const removeAttachmentFile = createAsyncThunk(
//   'scrumboardApp/card/removeAttachmentFile',
//   async ({ item }, { dispatch, getState }) => {
//     const token = await firebaseAuthService.getAccessToken();
//     if (!token) return null;
//     const { id: orgId } = getState().auth.organization.organization;
//     const response = await axios.post(
//       `/api/${orgId}/scrumboard/card/removeAttachmentFile`,
//       {
//         item,
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     const data = await response.data;

//     return data;
//   }
// );

const cardSlice = createSlice({
  name: 'scrumboardApp/card',
  initialState: {
    dialogOpen: false,
    data: null,
  },
  reducers: {
    openCardDialog: (state, action) => {
      state.dialogOpen = true;
      state.data = action.payload;
    },
    closeCardDialog: (state, action) => {
      state.dialogOpen = false;
      state.data = null;
    },
  },
  extraReducers: {
    [updateCard.fulfilled]: (state, action) => {
      // state.data = { ...state.data, ...action.payload };
      state.data = action.payload;
    },
  },
});

export const { openCardDialog, closeCardDialog } = cardSlice.actions;

export const selectCardDialogOpen = ({ scrumboardApp }) => scrumboardApp.card.dialogOpen;
export const selectCardData = ({ scrumboardApp }) => scrumboardApp.card.data;

export default cardSlice.reducer;

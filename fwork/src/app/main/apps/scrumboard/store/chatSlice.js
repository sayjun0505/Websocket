import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import { getCards } from './cardsSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getChat = createAsyncThunk(
  'scrumboardApp/chat/getChat',
  async ({ chatId }, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const { board } = getState().scrumboardApp;
    try {
      // /board/:boardId/chat/:chatId
      const response = await axios.get(
        `/api/${organizationId}/scrumboard/board/${board.id}/chat/${chatId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          params: {
            id: chatId,
          },
        }
      );

      const data = await response.data;
      return data;
    } catch (error) {
      // console.error('Get Chat error ', error);
      dispatch(
        showMessage({
          message: 'Get Chat error',
          variant: 'error',
        })
      );
      return {};
    }
  }
);
export const getChatinScrum = createAsyncThunk(
  'scrumboardApp/chat/getChat',
  async (data, { dispatch, getState }) => {
    // const token = await firebaseAuthService.getAccessToken();
    // const { organizationId } = getState().organization;
    // const { board } = getState().scrumboardApp;
    try {
    //   // /board/:boardId/chat/:chatId
    //   const response = await axios.get(
    //     `/api/${organizationId}/scrumboard/board/${board.id}/chat/${chatId}`,
    //     {
    //       headers: {
    //         'Content-Type': 'application/json',
    //         Authorization: `Bearer ${token}`,
    //       },
    //       params: {
    //         id: chatId,
    //       },
    //     }
    //   );

    //   const data = await response.data;
      return data;
    } catch (error) {
      // console.error('Get Chat error ', error);
      dispatch(
        showMessage({
          message: 'Get Chat error',
          variant: 'error',
        })
      );
      return {};
    }
  }
);


export const updateChat = createAsyncThunk(
  'scrumboardApp/chat/updateChat',
  async (chat, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const { board } = getState().scrumboardApp;
      const response = await axios.put(
        `/api/${organizationId}/chat`,
        { chat },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const chatResult = await response.data;
      dispatch(showMessage({ message: 'Chat Updated', variant: 'success' }));
      dispatch(getCards(board.id));
      return chatResult;
    } catch (error) {
      // console.error('Update ChatSs error ', error);
      dispatch(showMessage({ message: 'Update Chat error', variant: 'error' }));
      return {};
    }
  }
);
export const updateChatOwner = createAsyncThunk(
  'scrumboardApp/chat/updateChatOwner',
  async (chat, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.put(
        `/api/${organizationId}/chat/owner`,
        { chat },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const chatResult = await response.data;
      dispatch(showMessage({ message: 'Chat Updated', variant: 'success' }));
      // dispatch(getChat({ chatId: chat.id }));
      return chatResult;
    } catch (error) {
      // console.error('Update ChatSs error ', error);
      dispatch(showMessage({ message: 'Update Chat error', variant: 'error' }));
      return {};
    }
  }
);

export const sendMessage = createAsyncThunk(
  'scrumboardApp/chats/sendMessage',
  async ({ messageText, chatId }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const { board } = getState().scrumboardApp;
      const response = await axios.post(
        `/api/${organizationId}/chat/sendMessage`,
        {
          chatId,
          message: {
            data: JSON.stringify({ text: messageText }),
            type: 'text',
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const chatResult = await response.data;
      console.error("orgsend:",chatResult)
      dispatch(getChat({ chatId }));
      dispatch(getCards(board.id));
      return chatResult;
    } catch (error) {
      // console.error('[chatApp/chats/sendMessage] ', error);
      dispatch(
        showMessage({
          message: 'Send message error',
          variant: 'error',
        })
      );
      return null;
    }
  }
);
export const sendMessageinScrum = createAsyncThunk(
  'scrumboardApp/chats/sendMessage',
  async (chatResult, { dispatch, getState }) => {
    try {
      // const token = await firebaseAuthService.getAccessToken();
      // const { organizationId } = getState().organization;
      // const { board } = getState().scrumboardApp;
      // const response = await axios.post(
      //   `/api/${organizationId}/chat/sendMessage`,
      //   {
      //     chatId,
      //     message: {
      //       data: JSON.stringify({ text: messageText }),
      //       type: 'text',
      //     },
      //   },
      //   {
      //     headers: {
      //       'Content-Type': 'application/json',
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );
      // const chatResult = await response.data;
      // dispatch(getChat({ chatId }));
      // dispatch(getCards(board.id));
      return chatResult;
    } catch (error) {
      // console.error('[chatApp/chats/sendMessage] ', error);
      dispatch(
        showMessage({
          message: 'Send message error',
          variant: 'error',
        })
      );
      return null;
    }
  }
);

export const sendFileMessage = createAsyncThunk(
  'scrumboardApp/chat/sendFileMessage',
  async ({ formData, chat }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const { board } = getState().scrumboardApp;

      // Upload File
      const fileUploadResponse = await axios.post(
        `/api/${organizationId}/chat/uploads/${chat.channel.id}/${chat.customer.uid}`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const fileResponseResult = await fileUploadResponse.data;

      // wait file upload 3sec
      return setTimeout(async () => {
        const response = await axios.post(
          `/api/${organizationId}/chat/sendMessage`,
          {
            chatId: chat.id,
            message: {
              data: JSON.stringify({ filename: fileResponseResult.fileName }),
              type: 'image',
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const sendImageMsgResponse = await response.data;

        dispatch(getChat({ chatId: chat.id }));
        dispatch(getCards(board.id));
        return sendImageMsgResponse;
      }, 3000);
    } catch (error) {
      // console.error('[chatApp/chat/sendFileMessage] ', error);
      return null;
    }
  }
);

// export const sendTeamChatMessage = createAsyncThunk(
//   'chatApp/chat/sendTeamChatMessage',
//   async ({ messageText, chat }, { dispatch, getState }) => {
//     try {
//       const token = await firebaseAuthService.getAccessToken();
//       const { organizationId } = getState().organization;
//       const response = await axios.post(
//         `/api/${organizationId}/chat/comment/sendMessage`,
//         {
//           chatId: chat.id,
//           message: {
//             data: JSON.stringify({ text: messageText }),
//             type: 'text',
//           },
//         },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       const chatResult = await response.data;
//       dispatch(getChat({ chatId: chat.id }));
//       return chatResult;
//     } catch (error) {
//       console.error('TeamChat ', error);
//       dispatch(
//         showMessage({
//           message: 'Send TeamChat message error',
//           variant: 'error', // success error info warning null
//         })
//       );
//       return null;
//     }
//   }
// );

// export const sendTeamChatFileMessage = createAsyncThunk(
//   'chatApp/chat/sendTeamChatFileMessage',
//   async ({ formData, chat }, { dispatch, getState }) => {
//     try {
//       const token = await firebaseAuthService.getAccessToken();

//       const { organizationId } = getState().organization;

//       // Upload File
//       const fileUploadResponse = await axios.post(
//         `/api/${organizationId}/chat/comment/uploads/${chat.id}`,
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       const fileResponseResult = await fileUploadResponse.data;

//       // wait file upload 3sec
//       return setTimeout(async () => {
//         const response = await axios.post(
//           `/api/${organizationId}/chat/comment/sendMessage`,

//           {
//             chatId: chat.id,
//             message: {
//               data: JSON.stringify({ filename: fileResponseResult.fileName }),
//               type: 'image',
//             },
//           },
//           {
//             headers: {
//               'Content-Type': 'application/json',
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         const sendImageMsgResponse = await response.data;

//         dispatch(getChat({ chatId: chat.id }));
//         // dispatch(getChats());
//         return sendImageMsgResponse;
//       }, 3000);
//     } catch (error) {
//       console.error('[chatApp/chats/sendTeamChatFileMessage] ', error);
//       return null;
//     }
//   }
// );

export const markMentionRead = createAsyncThunk(
  'scrumboardApp/chats/markMentionRead',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();

      const { organizationId } = getState().organization;
      const response = await axios.put(
        `/api/${organizationId}/chat/comment/read`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(getChat());
      // dispatch(getChats());
      return response;
    } catch (error) {
      // console.error('TeamChat ', error);
      // dispatch(
      //   showMessage({
      //     message: 'TeamChat message error',
      //     variant: 'error', // success error info warning null
      //   })
      // );
      return null;
    }
  }
);

const chatSlice = createSlice({
  name: 'scrumboardApp/chat',
  initialState: {},
  reducers: {
    removeChat: (state, action) => action.payload,
    addSendingMessage: (state, action) => {
      if (state && state.message) {
        const { message } = state;
        message.push(action.payload);
        state.message = message;
      }
    },
    // pinTeamChatMessage: (state, action) => {
    //   if (state && state.comment) {
    //     state.comment[action.payload.chatId].isPin = true;
    //   }
    // },
    // unPinTeamChatMessage: (state, action) => {
    //   if (state && state.comment) {
    //     state.comment[action.payload.chatId].isPin = false;
    //   }
    // },
  },
  extraReducers: {
    [getChat.fulfilled]: (state, action) => action.payload,
    [getChatinScrum.fulfilled]: (state, action) => action.payload,
    [updateChat.fulfilled]: (state, action) => action.payload,
    // [updateTeamChat.fulfilled]: (state, action) => action.payload,
    // [sendMessage.fulfilled]: (state, action) => [...state, action.payload],
  },
});

export const selectChat = ({ scrumboardApp }) => scrumboardApp.chat;

export const { addSendingMessage } = chatSlice.actions;
// export const { addSendingMessage, pinTeamChatMessage, unPinTeamChatMessage } = chatSlice.actions;

export default chatSlice.reducer;

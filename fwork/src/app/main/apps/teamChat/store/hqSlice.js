import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { showMessage } from 'app/store/fuse/messageSlice';
import axios from 'axios';
import { getOrganizationState } from 'app/store/organizationSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getHQData = createAsyncThunk(
  'teamchatApp/hq/getHQData',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;

      const response = await axios.get(`/api/${organizationId}/teamChat/hq`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      console.error("ccc")
      // dispatch(getOrganizationState(organizationId));
      return response.data;
    } catch (error) {
      dispatch(showMessage({ message: 'Get ChatHQ data error', variant: 'error' }));
      return {};
    }
  }
);

export const getHQMessages = createAsyncThunk(
  'teamchatApp/hq/getHQMessages',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;

      const response = await axios.get(`/api/${organizationId}/teamChat/hq/messages`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(getHQData());
      return response.data;
    } catch (error) {
      dispatch(showMessage({ message: 'Get ChatHQ messages error', variant: 'error' }));
      return {};
    }
  }
);

export const sendMessage = createAsyncThunk(
  'teamchatApp/hq/sendMessage',
  async ({ messageText }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const loginUser = getState().user;
      const response = await axios.post(
        `/api/${organizationId}/teamChat/hq/message`,
        {
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
      setTimeout(async () => {
        dispatch(getHQData());
      }, 1000);

      dispatch(
        addSendingMessage({
          data: JSON.stringify({ text: messageText }),
          type: 'text',
          createdAt: new Date(),
          createdBy: {
            id: loginUser.uuid,
            display: loginUser.data.display,
            picture: loginUser.data.picture,
          },
        })
      );

      return chatResult;
    } catch (error) {
      dispatch(
        showMessage({
          message: 'Send TeamChat message error',
          variant: 'error',
        })
      );
      return null;
    }
  }
);

export const sendFileMessage = createAsyncThunk(
  'teamchatApp/hq/sendFileMessage',
  async ({ formData }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const loginUser = getState().user;

      // console.log('[formData] ', formData);
      // Upload File
      const fileUploadResponse = await axios.post(
        `/api/${organizationId}/teamChat/hq/uploads`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const fileResponseResult = await fileUploadResponse.data;
      const fileExt = fileResponseResult.fileName.split('.').pop();
      let type = 'image';
      if (fileExt) {
        if (
          fileExt.toLowerCase() === 'jpg' ||
          fileExt.toLowerCase() === 'gif' ||
          fileExt.toLowerCase() === 'png'
        ) {
          type = 'image';
        } else if (fileExt.toLowerCase() === 'mp4') {
          type = 'video';
        } else {
          type = 'file';
        }
      }

      // wait file upload 3sec
      return setTimeout(async () => {
        const response = await axios.post(
          `/api/${organizationId}/teamChat/hq/message`,
          {
            message: {
              data: JSON.stringify({ filename: fileResponseResult.fileName }),
              type,
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

        setTimeout(async () => {
          dispatch(getHQData());
        }, 1000);
        dispatch(
          addSendingMessage({
            data: JSON.stringify({ url: fileResponseResult.url }),
            type,
            createdAt: new Date(),
            createdBy: {
              id: loginUser.uuid,
              display: loginUser.data.display,
              picture: loginUser.data.picture,
            },
          })
        );

        return sendImageMsgResponse;
      }, 3000);
    } catch (error) {
      // console.error('[teamchatApp/hq/sendFileMessage] ', error);
      return null;
    }
  }
);

export const setHqPinMessage = createAsyncThunk(
  'teamchatApp/hq/setPinMessage',
  async (message, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      // const loginUser = getState().user;
      const response = await axios.post(
        `/api/${organizationId}/teamChat/hq/setPin`,
        { message },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const chatResult = await response.data;
      await dispatch(getHQMessages());
      dispatch(
        showMessage({
          message: 'Pin message success',
          variant: 'success',
        })
      );
      return chatResult;
    } catch (error) {
      dispatch(
        showMessage({
          message: 'Pin message error',
          variant: 'error',
        })
      );
      return null;
    }
  }
);

export const setDeleteMessage = createAsyncThunk(
  'teamchatApp/HQ/setDeleteMessage',
  async (message, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.post(
        `/api/${organizationId}/teamChat/hq/setDeleteMessage`,
        { message },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.data;
      await dispatch(getHQMessages());
      dispatch(showMessage({ message: 'Message Deleted', variant: 'success' }));

      return result;
    } catch (error) {
      dispatch(showMessage({ message: 'Delete message error', variant: 'error' }));
      return null;
    }
  }
);

export const setEditMessage = createAsyncThunk(
  'teamchatApp/HQ/setEditMessage',
  async (message, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.post(
        `/api/${organizationId}/teamChat/hq/setEditMessage`,
        { message },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.data;
      await dispatch(getHQMessages());
      dispatch(showMessage({ message: 'Message Edited', variant: 'success' }));

      return result;
    } catch (error) {
      dispatch(showMessage({ message: 'Edit message error', variant: 'error' }));
      return null;
    }
  }
);

export const setHqReplyMessage = createAsyncThunk(
  'teamchatApp/hq/setReplyMessage',
  async (message, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.post(
        `/api/${organizationId}/teamChat/hq/setReplyMessage`,
        { message },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const chatResult = await response.data;
      await dispatch(getHQMessages());
      // dispatch(
      //   showMessage({
      //     message: 'Reply message success',
      //     variant: 'success',
      //   })
      // );
      return chatResult;
    } catch (error) {
      dispatch(
        showMessage({
          message: 'Reply message error',
          variant: 'error',
        })
      );
      return null;
    }
  }
);

const hqSlice = createSlice({
  name: 'teamchatApp/hq',
  initialState: {
    data: null,
    messages: [],
  },
  reducers: {
    addSendingMessage: (state, action) => {
      if (state && state.messages) {
        const { messages } = state;
        messages.push(action.payload);
        state.messages = messages;
      }
    },
  },
  extraReducers: {
    [getHQData.fulfilled]: (state, action) => {
      state.data = action.payload || null;
    },
    [getHQMessages.fulfilled]: (state, action) => {
      state.messages = action.payload || [];
    },
  },
});

export const selectMessages = ({ teamchatApp }) => teamchatApp.hq.messages;
export const selectData = ({ teamchatApp }) => teamchatApp.hq.data;
export const { addSendingMessage } = hqSlice.actions;
export default hqSlice.reducer;

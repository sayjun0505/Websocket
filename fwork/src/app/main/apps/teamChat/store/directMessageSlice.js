import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { showMessage } from 'app/store/fuse/messageSlice';
import axios from 'axios';
import { getOrganizationState } from 'app/store/organizationSlice';
import { getNavigationUsers, getUsers } from './directMessageUsersSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getMessage = createAsyncThunk(
  'teamchatApp/directMessage/getMessage',
  async ({ contactId }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;

      const response = await axios.get(
        `/api/${organizationId}/teamChat/getDirectMessages/${contactId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(getUsers());
      dispatch(getNavigationUsers());
      console.error("eee")
      dispatch(getOrganizationState(organizationId));
      return response.data;
    } catch (error) {
      dispatch(showMessage({ message: 'Get direct message error', variant: 'error' }));
      return {};
    }
  }
);

export const sendDirectMessage = createAsyncThunk(
  'teamchatApp/directMessage/sendDirectMessage',
  async ({ messageText, receiveUser }, { dispatch, getState }) => {
    const token = await firebaseAuthService.getAccessToken();
    const { organizationId } = getState().organization;
    const loginUser = getState().user;
    try {
      const response = await axios.post(
        `/api/${organizationId}/teamChat/sendDirectMessage/${receiveUser}`,
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

      const data = await response.data;

      setTimeout(async () => {
        dispatch(getUsers());
        dispatch(getNavigationUsers());
      }, 1000);

      dispatch(
        addSendingMessage({
          data: JSON.stringify({ text: messageText }),
          type: 'text',
          createdAt: new Date(),
          sendUser: {
            id: loginUser.uuid,
            display: loginUser.data.display,
            picture: loginUser.data.picture,
          },
        })
      );

      return data;
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
  'teamchatApp/directMessage/sendFileMessage',
  async ({ formData, receiveUser }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const loginUser = getState().user;

      // Upload File
      const fileUploadResponse = await axios.post(
        `/api/${organizationId}/teamChat/uploadsDirectMessage/${receiveUser}`,
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
          `/api/${organizationId}/teamChat/sendDirectMessage/${receiveUser}`,

          {
            receiveUser,
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
          dispatch(getUsers());
          dispatch(getNavigationUsers());
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
      // console.error('[teamchatApp/direct/sendFileMessage] ', error);
      return null;
    }
  }
);

export const setDmPinMessage = createAsyncThunk(
  'teamchatApp/directMessage/setPinMessage',
  async ({ message, contactId }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.post(
        `/api/${organizationId}/teamChat/directMessage/setPin`,
        { message },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const chatResult = await response.data;
      await dispatch(getMessage({ contactId }));
      dispatch(
        showMessage({
          message: 'DM-Pin success',
          variant: 'success',
        })
      );
      return chatResult;
    } catch (error) {
      dispatch(
        showMessage({
          message: 'DM-Pin error',
          variant: 'error',
        })
      );
      return null;
    }
  }
);

export const setDeleteMessage = createAsyncThunk(
  'teamchatApp/directMessage/setDeleteMessage',
  async ({ message, contactId }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.post(
        `/api/${organizationId}/teamChat/directMessage/setDeleteMessage`,
        { message },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.data;
      await dispatch(getMessage({ contactId }));
      dispatch(showMessage({ message: 'DirectMessage Deleted', variant: 'success' }));

      return result;
    } catch (error) {
      dispatch(showMessage({ message: 'Direct-Delete message error', variant: 'error' }));
      return null;
    }
  }
);

export const setEditMessage = createAsyncThunk(
  'teamchatApp/directMessage/setEditMessage',
  async ({ message, contactId }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.post(
        `/api/${organizationId}/teamChat/directMessage/setEditMessage`,
        { message },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.data;
      await dispatch(getMessage({ contactId }));
      dispatch(showMessage({ message: 'Direct-Message Edited', variant: 'success' }));

      return result;
    } catch (error) {
      dispatch(showMessage({ message: 'Direct-Edit message error', variant: 'error' }));
      return null;
    }
  }
);

export const setDmReplyMessage = createAsyncThunk(
  'teamchatApp/directMessage/setReplyMessage',
  async ({ message, contactId }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.post(
        `/api/${organizationId}/teamChat/directMessage/setReplyMessage`,
        { message },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const chatResult = await response.data;
      await dispatch(getMessage({ contactId }));
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
const directMessageSlice = createSlice({
  name: 'teamchatApp/directMessage',
  initialState: {},
  reducers: {
    addSendingMessage: (state, action) => {
      if (state && state.messages) {
        const { messages } = state;
        messages.push(action.payload);
        state.messages = messages;
      }
    },
    setMessageforSocket:(state, action) => action.payload
  },
  extraReducers: {
    [getMessage.fulfilled]: (state, action) => action.payload,
    // [getSSEDirectMessage.fulfilled]: (state, action) => action.payload,
  },
});

export const selectDirectMessage = ({ teamchatApp }) => teamchatApp.directMessage;
export const { addSendingMessage,setMessageforSocket } = directMessageSlice.actions;
export default directMessageSlice.reducer;

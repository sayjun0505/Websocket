import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { showMessage } from 'app/store/fuse/messageSlice';
import axios from 'axios';
import { getOrganizationState } from 'app/store/organizationSlice';
import { getChannels, updateTeamChannel } from './channelsSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

export const getChannel = createAsyncThunk(
  'teamchatApp/channel/getChannel',
  async ({ channelId }, { dispatch, getState }) => {
    if (channelId) {
      try {
        const token = await firebaseAuthService.getAccessToken();
        const { organizationId } = getState().organization;

        const response = await axios.get(`/api/${organizationId}/teamChat/channel/${channelId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        console.error("ggg")
        dispatch(getOrganizationState(organizationId));
        dispatch(getChannels());
        return response.data;
      } catch (error) {
        dispatch(showMessage({ message: 'Get channel error', variant: 'error' }));
        return {};
      }
    }
    return {};
  }
);

export const sendChannelMessage = createAsyncThunk(
  'teamchatApp/channel/sendChannelMessage',
  async ({ messageText, channelId }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const loginUser = getState().user;
      const response = await axios.post(
        `/api/${organizationId}/teamChat/message`,
        {
          channelId,
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
        dispatch(getChannels());
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
  'teamchatApp/channel/sendFileMessage',
  async ({ formData, channelId }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const loginUser = getState().user;

      // console.log('[formData] ', formData);
      // Upload File
      const fileUploadResponse = await axios.post(
        `/api/${organizationId}/teamChat/uploads/${channelId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const fileResponseResult = await fileUploadResponse.data;

      // console.log('[Upload response] ', fileResponseResult);

      const fileExt = fileResponseResult.fileName.split('.').pop();
      // console.log('[fileResponseResult.filename] ', fileResponseResult.filename);
      // console.log('[fileExt] ', fileExt);
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

      // console.log('[type] ', type);
      // return parts[parts.length - 1];

      // wait file upload 3sec
      return setTimeout(async () => {
        // console.log('[message] send message');
        const response = await axios.post(
          `/api/${organizationId}/teamChat/message`,

          {
            channelId,
            message: {
              data: JSON.stringify({ filename: fileResponseResult.fileName }),
              // type: 'image',
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
          dispatch(getChannels());
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
      // console.error('[teamchatApp/channel/sendFileMessage] ', error);
      return null;
    }
  }
);

export const setCmPinMessage = createAsyncThunk(
  'teamchatApp/message/setPinMessage',
  async ({ message, channelId }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      // const loginUser = getState().user;
      const response = await axios.post(
        `/api/${organizationId}/teamChat/message/setPin`,
        { message },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const chatResult = await response.data;
      await dispatch(getChannel({ channelId }));
      dispatch(
        showMessage({
          message: 'Channel-Pin message success',
          variant: 'success',
        })
      );
      return chatResult;
    } catch (error) {
      dispatch(
        showMessage({
          message: 'Channel-Pin message error',
          variant: 'error',
        })
      );
      return null;
    }
  }
);

export const setDeleteMessage = createAsyncThunk(
  'teamchatApp/channel/setDeleteMessage',
  async ({ message, channelId }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.post(
        `/api/${organizationId}/teamChat/message/setDeleteMessage`,
        { message },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.data;
      await dispatch(getChannel({ channelId }));
      dispatch(showMessage({ message: 'Channel-Message Deleted', variant: 'success' }));

      return result;
    } catch (error) {
      dispatch(showMessage({ message: 'Channel-Delete message error', variant: 'error' }));
      return null;
    }
  }
);

export const setEditMessage = createAsyncThunk(
  'teamchatApp/channel/setEditMessage',

  async ({ message, channelId }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.post(
        `/api/${organizationId}/teamChat/message/setEditMessage`,
        { message },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.data;
      await dispatch(getChannel({ channelId }));
      dispatch(showMessage({ message: 'Channel-Message Edited', variant: 'success' }));

      return result;
    } catch (error) {
      dispatch(showMessage({ message: 'Channel-Edit message error', variant: 'error' }));
      return null;
    }
  }
);

export const setCmReplyMessage = createAsyncThunk(
  'teamchatApp/hq/setReplyMessage',
  async ({ message, channelId }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { organizationId } = getState().organization;
      const response = await axios.post(
        `/api/${organizationId}/teamChat/message/setReplyMessage`,
        { message },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const chatResult = await response.data;
      await dispatch(getChannel({ channelId }));
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

const channelSlice = createSlice({
  name: 'teamchatApp/channel',
  initialState: {},
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
    [getChannel.fulfilled]: (state, action) => action.payload,
    [updateTeamChannel.fulfilled]: (state, action) => {
      state.name = action.payload.name;
      state.description = action.payload.description;
    },
  },
});

export const selectChannel = ({ teamchatApp }) => teamchatApp.channel;
export const { addSendingMessage } = channelSlice.actions;
export default channelSlice.reducer;

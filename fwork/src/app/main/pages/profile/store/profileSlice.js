import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { showMessage } from 'app/store/fuse/messageSlice';
import { setProfileImg, setUserData } from 'app/store/userSlice';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';
import { auth } from '../../../../auth/services/firebaseService/firebaseApp';

export const getProfile = createAsyncThunk(
  'profilePage/profile/getProfile',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const response = await axios.get(`/api/user/me`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const profile = await response.data;
      return profile;
    } catch (error) {
      dispatch(
        showMessage({
          message: 'Get Profile error',
          variant: 'error',
        })
      );
      throw error;
    }
  }
);

// export const updateProfile = createAsyncThunk(
//   'profilePage/profile/updateProfile',
//   async (user, { dispatch, getState }) => {
//     try {
//       const token = await firebaseAuthService.getAccessToken();
//       const { organizationId } = getState().organization;
//       const response = await axios.put(
//         `/api/${organizationId}/user`,
//         { user },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       const profile = await response.data;
//       dispatch(
//         showMessage({
//           message: 'Update profile success',
//           variant: 'success',
//         })
//       );
//       // dispatch(getProfile());
//       return profile;
//     } catch (error) {
//       dispatch(
//         showMessage({
//           message: 'Update Profile error',
//           variant: 'error',
//         })
//       );
//       throw error;
//     }
//   }
// );

export const uploadProfile = createAsyncThunk(
  'profilePage/profile/uploadProfile',
  async ({ formData }, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const userId = getState().user.uuid;
      // console.log('uploadProfile ', userId);
      // Upload File
      const fileUploadResponse = await axios.post(`/api/user/uploads/${userId}/profile`, formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const fileResponseResult = await fileUploadResponse.data;
      // console.log('fileResponseResult ', fileResponseResult);

      // wait file upload 3sec
      return setTimeout(async () => {
        dispatch(setProfileImg(fileResponseResult.url));
        dispatch(getProfile());
      }, 3000);
    } catch (error) {
      // console.error('[profilePage/profile/uploadProfile] ', error);
      return null;
    }
  }
);

export const updateProfilePictureWithFacebook = createAsyncThunk(
  'profilePage/profile/updateProfilePictureWithFacebook',
  async (params, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const { currentUser } = auth;
      const userId = getState().user.uuid;
      const providers = currentUser.providerData;
      const facebookProvider = currentUser.providerData.find(
        (_) => _.providerId === 'facebook.com'
      );
      if (facebookProvider && facebookProvider.pictureURL) {
        const response = await axios.put(
          `/api/user/picture/${userId}/facebook`,
          { picture: facebookProvider.pictureURL },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const profile = await response.data;

        // wait file upload 3sec
        return setTimeout(async () => {
          dispatch(setProfileImg(profile.url));
          dispatch(getProfile());
          dispatch(
            showMessage({
              message: 'Sync profile picture success',
              variant: 'success',
            })
          );
        }, 3000);
      }
      dispatch(
        showMessage({
          message: 'Sync profile picture error',
          variant: 'error',
        })
      );
      return null;
    } catch (error) {
      dispatch(
        showMessage({
          message: 'Sync profile picture error',
          variant: 'error',
        })
      );
      throw error;
    }
  }
);

export const updateProfileIsOnline = createAsyncThunk(
  'profilePage/profile/updateProfileIsOnline',
  async (data, { dispatch, getState }) => {
    try {
      const token = await firebaseAuthService.getAccessToken();
      const response = await axios.put(`/api/user/isOnline`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(setUserData({ isOnline: data.isOnline }));
      const user = await response.data;
      return user;
    } catch (error) {
      dispatch(showMessage({ message: 'updateProfileIsOnline error', variant: 'error' }));
      throw error;
    }
  }
);

export const selectProfile = ({ profilePage }) => profilePage.profile;

const profileSlice = createSlice({
  name: 'profilePage/profile',
  initialState: {
    profileDialog: {
      type: 'edit',
      props: {
        open: false,
      },
    },
  },
  reducers: {
    openEditProfileDialog: (state, action) => {
      state.profileDialog = {
        props: {
          open: true,
        },
      };
    },
    closeEditProfileDialog: (state, action) => {
      state.profileDialog = {
        props: {
          open: false,
        },
      };
    },
  },
  extraReducers: {
    [getProfile.pending]: (state, action) => null,
    [getProfile.fulfilled]: (state, action) => action.payload,
    // [updateProfile.fulfilled]: (state, action) => action.payload,
  },
});

export const { openEditProfileDialog, closeEditProfileDialog } = profileSlice.actions;

export default profileSlice.reducer;

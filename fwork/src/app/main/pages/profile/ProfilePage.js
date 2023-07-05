import withReducer from 'app/store/withReducer';
import FuseLoading from '@fuse/core/FuseLoading';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import ClickAwayListener from '@mui/material/ClickAwayListener';

import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Badge from '@mui/material/Badge';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
// import { useState } from 'react';
import Box from '@mui/material/Box';
// import PhotosVideosTab from './tabs/PhotosVideosTab';
// import TimelineTab from './tabs/TimelineTab';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import AboutTab from './tabs/AboutTab';
import ConnectionTab from './tabs/ConnectionTab';
import useThemeMediaQuery from '../../../../@fuse/hooks/useThemeMediaQuery';
import reducer from './store';
import {
  getProfile,
  selectProfile,
  updateProfilePictureWithFacebook,
  uploadProfile,
} from './store/profileSlice';
import { getOrganizations, selectOrganization } from './store/organizationsSlice';
import { auth } from '../../../auth/services/firebaseService/firebaseApp';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
  },
}));

const ProfilePage = () => {
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const profile = useSelector(selectProfile);
  const organizations = useSelector(selectOrganization);

  const [facebookProvider, setFacebookProvider] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const { currentUser } = auth;
    const _provider = currentUser.providerData.find((_) => _.providerId === 'facebook.com');
    if (_provider) {
      setFacebookProvider(true);
    }
  }, []);

  useEffect(() => {
    dispatch(getProfile()).then(() => {
      setLoading(false);
    });
    dispatch(getOrganizations());
  }, [dispatch]);

  function handleTabChange(event, value) {
    setSelectedTab(value);
  }

  const handleFileInput = (event) => {
    handleClose();
    setFileLoading(true);
    const formData = new FormData();
    formData.append('file', event.target.files[0]);

    dispatch(uploadProfile({ formData })).then(() => {
      setTimeout(() => {
        setFileLoading(false);
      }, 3000);
    });
  };

  const handleSyncProfilePictureWithFacebook = (event) => {
    handleClose();
    setFileLoading(true);

    dispatch(updateProfilePictureWithFacebook()).then(() => {
      setTimeout(() => {
        setFileLoading(false);
      }, 3000);
    });
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <FuseLoading />
      </div>
    );
  }

  return (
    <Root
      header={
        <div className="flex flex-col shadow pt-120 lg:pt-96">
          {/* <img
            className="h-160 lg:h-320 object-cover w-full"
            src="assets/images/pages/profile/cover.jpg"
            alt="Profile Cover"
          /> */}

          <div className="flex flex-col flex-0 lg:flex-row items-center max-w-5xl w-full mx-auto px-32 lg:h-72 ">
            <div className="-mt-96 lg:-mt-88 rounded-full">
              <ClickAwayListener
                onClickAway={() => {
                  handleClose();
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, transition: { delay: 0.1 } }}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <FuseSvgIcon
                        className="text-48 rounded-full p-4 bg-white border-2"
                        size={28}
                        color="action"
                        onClick={handleClick}
                      >
                        material-solid:file_upload
                      </FuseSvgIcon>
                    }
                  >
                    {fileLoading ? (
                      <Avatar
                        sx={{
                          borderColor: 'background.paper',
                          width: 120,
                          height: 120,
                        }}
                        className="border-4"
                      >
                        <CircularProgress color="inherit" size={20} />
                      </Avatar>
                    ) : (
                      <Avatar
                        sx={{
                          borderColor: 'background.paper',
                          width: 120,
                          height: 120,
                        }}
                        className="border-4"
                        src={profile.pictureURL}
                        alt={profile.display}
                        id="basic-button"
                        aria-controls={open ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick}
                      >
                        {profile.display.charAt(0)}
                      </Avatar>
                    )}
                  </Badge>

                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                      'aria-labelledby': 'basic-button',
                    }}
                    transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
                  >
                    <MenuItem component="label">
                      <FuseSvgIcon className="text-48 mr-8" size={24} color="action">
                        material-solid:file_upload
                      </FuseSvgIcon>
                      Upload File
                      <input
                        hidden
                        accept="image/png, image/jpeg"
                        onChange={handleFileInput}
                        type="file"
                      />
                    </MenuItem>
                    {facebookProvider ? (
                      <MenuItem
                        onClick={handleSyncProfilePictureWithFacebook}
                        disabled={!facebookProvider}
                      >
                        <FuseSvgIcon className="text-48 mr-8" size={24} color="action">
                          material-solid:sync
                        </FuseSvgIcon>
                        Sync with Facebook
                      </MenuItem>
                    ) : null}
                  </Menu>
                </motion.div>
              </ClickAwayListener>
            </div>

            <div className="flex flex-col items-center lg:items-start mt-16 lg:mt-0 lg:ml-32">
              <Typography className="text-lg font-bold leading-none">
                {profile.firstname && profile.lastname
                  ? `${profile.firstname} ${profile.lastname}`
                  : profile.display}
              </Typography>
              <Typography color="text.secondary">{profile.email}</Typography>
            </div>

            <div className="hidden lg:flex h-32 mx-32 border-l-2" />

            <div className="flex items-center mt-24 lg:mt-0 space-x-24">
              <div className="flex flex-col items-center">
                <Typography className="font-bold">
                  {organizations ? organizations.length : 0}
                </Typography>
                <Typography className="text-sm font-medium" color="text.secondary">
                  Organization
                </Typography>
              </div>
              {/* <div className="flex flex-col items-center">
                <Typography className="font-bold">1.2k</Typography>
                <Typography className="text-sm font-medium" color="text.secondary">
                  FOLLOWING
                </Typography>
              </div> */}
            </div>

            <div className="flex flex-1 justify-end my-16 lg:my-0">
              <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="inherit"
                variant="scrollable"
                scrollButtons={false}
                className="-mx-4 min-h-40"
                classes={{
                  indicator: 'flex justify-center bg-transparent w-full h-full',
                }}
                TabIndicatorProps={{
                  children: (
                    <Box
                      sx={{ bgcolor: 'text.disabled' }}
                      className="w-full h-full rounded-full opacity-20"
                    />
                  ),
                }}
              >
                {/* <Tab
                  className="text-14 font-semibold min-h-40 min-w-64 mx-4 px-12 "
                  disableRipple
                  label="Dashboard"
                /> */}
                <Tab
                  className="text-14 font-semibold min-h-40 min-w-64 mx-4 px-12 "
                  disableRipple
                  label="About"
                />
                <Tab
                  className="text-14 font-semibold min-h-40 min-w-64 mx-4 px-12 "
                  disableRipple
                  label="Connection"
                />
              </Tabs>
            </div>
          </div>
        </div>
      }
      content={
        <div className="flex flex-auto justify-center w-full max-w-5xl mx-auto p-24 sm:p-32">
          {/* {selectedTab === 0 && <TimelineTab />} */}
          {selectedTab === 0 && <AboutTab />}
          {selectedTab === 1 && <ConnectionTab />}
        </div>
      }
      scroll={isMobile ? 'normal' : 'page'}
    />
  );
};

export default withReducer('profilePage', reducer)(ProfilePage);
// export default ProfileApp;

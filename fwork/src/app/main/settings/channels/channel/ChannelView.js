import Button from '@mui/material/Button';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { useNavigate, useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FuseLoading from '@fuse/core/FuseLoading';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/system/Box';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import format from 'date-fns/format';
import { selectPermission } from 'app/store/permissionSlice';
import {
  getChannel,
  removeFacebookChannel,
  removeInstagramChannel,
  removeLineChannel,
  selectChannel,
} from '../store/channelSlice';

import ChannelsContext from '../ChannelsContext';

const ChannelView = () => {
  const { setRightSidebarOpen, rightSidebarOpen } = useContext(ChannelsContext);
  const channel = useSelector(selectChannel);
  const permission = useSelector(selectPermission);
  const routeParams = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (!routeParams.id) {
  //     history.push({ pathname: `/settings/channels` });
  //   }
  // }, [routeParams]);
  useEffect(() => {
    setRightSidebarOpen(Boolean(routeParams.id));
  }, [routeParams]);

  useEffect(() => {
    dispatch(getChannel(routeParams.id));
  }, [dispatch, routeParams]);

  const [removeConfirm, setRemoveConfirm] = useState({
    open: false,
  });

  const handleConfirmOpen = () => {
    setRemoveConfirm({
      open: true,
    });
  };

  const handleConfirmClose = () => {
    setRemoveConfirm({
      open: false,
    });
  };

  const handleConfirm = () => {
    if (channel && channel.channel === 'line' && channel.data) {
      dispatch(removeLineChannel(channel)).then(() => {
        navigate('/settings/channels');
      });
    }
    if (channel && channel.channel === 'facebook' && channel.data) {
      dispatch(removeFacebookChannel(channel)).then(() => {
        navigate('/settings/channels');
      });
    }
    if (channel && channel.channel === 'instagram' && channel.data) {
      dispatch(removeInstagramChannel(channel)).then(() => {
        navigate('/settings/channels');
      });
    }
    setRemoveConfirm({
      open: false,
    });
  };

  if (!channel) {
    return <FuseLoading />;
  }

  return (
    <>
      <div className="relative flex flex-col flex-auto items-center px-32 sm:px-24 mt-56">
        <div className="w-full max-w-3xl">
          <div className="flex flex-row justify-between items-center">
            <Typography className="w-full font-bold truncate" variant="h5">
              {channel.data && channel.data.name ? channel.data.name : ''}
            </Typography>
            {/* <div className="flex flex-col sm:flex-row sm:space-x-8 space-x-0 sm:space-y-0 space-y-8 ">
              <Button
                variant="contained"
                color="secondary"
                component={NavLinkAdapter}
                to="edit"
                disabled={!(permission && permission.channel && permission.channel.update)}
              >
                <FuseSvgIcon size={20}>heroicons-outline:pencil-alt</FuseSvgIcon>
                <span className="mx-8">Edit</span>
              </Button>
              <Button
                variant="contained"
                color="error"
                disabled={!(permission && permission.channel && permission.channel.delete)}
                // component={NavLinkAdapter}
                onClick={handleConfirmOpen}
              >
                <FuseSvgIcon size={20}>material-outline:delete</FuseSvgIcon>
                <span className="mx-8">Delete</span>
              </Button>
            </div> */}
          </div>

          <Divider className="mt-16 mb-24" />

          <div className="flex flex-col space-y-32">
            {channel.channel && (
              <div className="flex items-center">
                <FuseSvgIcon>heroicons-outline:identification</FuseSvgIcon>
                <div className="ml-24 leading-6 capitalize">{channel.channel}</div>
              </div>
            )}
            {channel.data && channel.data.pageId && (
              <div className="flex items-center">
                <FuseSvgIcon>heroicons-outline:identification</FuseSvgIcon>
                <div className="ml-24 leading-6 capitalize">{channel.data.pageId}</div>
              </div>
            )}
            {channel.data && channel.data.channelSecret && (
              <div className="flex items-center">
                <FuseSvgIcon>heroicons-outline:identification</FuseSvgIcon>
                <div className="ml-24 leading-6 capitalize">{channel.data.channelSecret}</div>
              </div>
            )}
            {channel.createdAt && (
              <div className="flex items-center">
                <FuseSvgIcon>heroicons-outline:calendar</FuseSvgIcon>
                <div className="ml-24 leading-6">
                  Created at {format(new Date(channel.createdAt), 'PP')}
                </div>
              </div>
            )}

            {/* {channel.updatedAt && (
              <div className="flex items-center">
                <FuseSvgIcon>heroicons-outline:calendar</FuseSvgIcon>
                <div className="ml-24 leading-6">
                  Last update{format(new Date(channel.updatedAt), 'PP')}
                </div>
              </div>
            )} */}
          </div>
        </div>
      </div>

      <Box
        className="flex items-center mt-40 py-14 pr-16 pl-4 sm:pr-48 sm:pl-36 border-t"
        sx={{ backgroundColor: 'background.default' }}
      >
        <Button
          color="error"
          onClick={handleConfirmOpen}
          disabled={!(permission && permission.channel && permission.channel.delete)}
        >
          Delete
        </Button>
        <Button className="ml-auto" component={NavLinkAdapter} to={-1}>
          Cancel
        </Button>
        <Button
          className="ml-8"
          variant="contained"
          color="secondary"
          component={NavLinkAdapter}
          to="edit"
        >
          Edit
        </Button>
      </Box>

      <Dialog
        open={removeConfirm.open}
        onClose={handleConfirmClose}
        maxWidth="sm"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Are you sure you want to delete this Channel?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {channel.data && channel.data.name ? channel.data.name : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChannelView;

/* eslint-disable import/named */
import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

import {
  Box,
  Button,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';

import { lighten } from '@mui/material/styles';

import { selectUser } from 'app/store/userSlice';
import { ContactAvatar } from 'app/shared-components/chat';
// import { selectChannels, updateTeamChannel } from '../../store/channelsSlice';
// import { selectUsers } from '../../store/usersSlice';
// import {
//   getFilterMember,
//   removeChannelMember,
//   selectFilterMember,
// } from '../../store/filterMemberSlice';
import { getMember, removeChannelMember, selectMember } from '../../store/channelMemberSlice';
import { getChannel, selectChannel } from '../../store/channelSlice';
import TeamChatAppContext from '../../TeamChatAppContext';
import LeaveChannelDialog from '../components/LeaveChannelDialog';
import ChannelDialog from '../components/ChannelDialog';
import RemoveChannelDialog from '../components/RemoveChannelDialog';

const MemberSidebar = (props) => {
  const dispatch = useDispatch();
  const { channelId } = useParams();
  const { setContactSidebarOpen, setMemberSidebarOpen } = useContext(TeamChatAppContext);

  const members = useSelector(selectMember);
  const channel = useSelector(selectChannel);
  const loginUser = useSelector(selectUser);

  const [editChannelDialogOpen, setEditChannelDialogOpen] = useState(false);
  const [editChannelData, setEditChannelData] = useState(null);
  const [leaveChannelDialogOpen, setLeaveChannelDialogOpen] = useState(false);
  const [leaveChannel, setLeaveChannel] = useState(null);
  const [removeChannelDialogOpen, setRemoveChannelDialogOpen] = useState(false);
  const [removeChannel, setRemoveChannel] = useState(null);

  useEffect(() => {
    if (channelId) {
      dispatch(getMember({ channelId }));
      dispatch(getChannel({ channelId }));
    }
  }, [channelId, dispatch]);

  if (!members) {
    return null;
  }

  return (
    <div className="flex flex-col flex-auto h-[calc(100vh-6.4rem)] justify-between">
      <Box
        className="border-b-1 min-h-64"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? lighten(theme.palette.background.default, 0.4)
              : lighten(theme.palette.background.default, 0.02),
        }}
      >
        <Toolbar className="flex items-center justify-between px-10">
          <div className="flex flex-row justify-start space-x-5 items-center">
            <Typography className="px-4 font-medium text-16" color="inherit" variant="subtitle1">
              Channel members
            </Typography>
            <Tooltip title="Edit a Channel">
              <IconButton
                onClick={() => {
                  setEditChannelDialogOpen(true);
                  setEditChannelData({
                    channelName: channel.name || '',
                    channelDescription: channel.description || '',
                    isPublic: channel.isPublic,
                    channelMembers: members,
                  });
                }}
                color="inherit"
                size="large"
                className="p-10"
              >
                <FuseSvgIcon className="text-48" size={20} color="action">
                  material-outline:edit
                </FuseSvgIcon>
              </IconButton>
            </Tooltip>
          </div>
          <IconButton
            onClick={() => {
              setContactSidebarOpen(false);
              setMemberSidebarOpen(false);
            }}
            color="inherit"
            size="large"
          >
            <FuseSvgIcon>heroicons-outline:x</FuseSvgIcon>
          </IconButton>
        </Toolbar>
      </Box>

      <div className="relative flex flex-col flex-auto items-center p-0">
        <div className="w-full max-w-3xl overflow-y-auto overscroll-contain">
          <List
            sx={{ width: '100%', bgcolor: 'background.paper' }}
            component="nav"
            className="p-0 w-full"
            aria-labelledby="nested-list-subheader"
          >
            {members?.map((member, index) => (
              <ListItemButton key={index} className="py-15 px-20 w-full">
                <ListItemIcon>
                  <ContactAvatar contact={member} />
                </ListItemIcon>
                <ListItemText primary={member.display} />
                {member.memberId !== loginUser.uuid && (
                  <Button
                    variant="text"
                    style={{ paddingRight: '10px', color: 'blue' }}
                    onClick={() => {
                      dispatch(
                        removeChannelMember({
                          id: member.id,
                          me: member.memberId === loginUser.uuid,
                        })
                      );
                    }}
                  >
                    Remove
                  </Button>
                )}
              </ListItemButton>
            ))}
          </List>
        </div>
      </div>
      <Box
        className="border-t-1 min-h-80 flex flex-row items-center justify-center sm:justify-end px-0 sm:px-20"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? lighten(theme.palette.background.default, 0.4)
              : lighten(theme.palette.background.default, 0.02),
        }}
      >
        {loginUser.uuid === channel.createdBy.id ? (
          <Button
            variant="text"
            sx={{ color: 'red' }}
            onClick={() => {
              setRemoveChannelDialogOpen(true);
              setRemoveChannel(channelId);
            }}
          >
            Remove channel
          </Button>
        ) : (
          <Button
            variant="text"
            sx={{ color: 'red' }}
            onClick={() => {
              setLeaveChannelDialogOpen(true);
              setLeaveChannel(members.find((member) => member.memberId === loginUser.uuid));
            }}
          >
            Leave channel
          </Button>
        )}
      </Box>
      <ChannelDialog
        open={editChannelDialogOpen}
        onClose={() => {
          setEditChannelDialogOpen(false);
          setEditChannelData(null);
        }}
        initialData={editChannelData}
      />
      <LeaveChannelDialog
        open={leaveChannelDialogOpen}
        onClose={() => {
          setLeaveChannelDialogOpen(false);
          setLeaveChannel(null);
        }}
        channelMember={leaveChannel}
      />
      <RemoveChannelDialog
        open={removeChannelDialogOpen}
        onClose={() => {
          setRemoveChannelDialogOpen(false);
          setRemoveChannel(null);
        }}
        channelId={removeChannel}
      />
    </div>
  );
};

export default MemberSidebar;

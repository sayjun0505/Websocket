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
import { getMember, selectMember } from '../../store/channelMemberSlice';
import TeamChatAppContext from '../../TeamChatAppContext';
import LeaveChannelDialog from '../components/LeaveChannelDialog';

const MemberSidebar = (props) => {
  const dispatch = useDispatch();
  const { channelId } = useParams();
  const { setContactSidebarOpen, setMemberSidebarOpen } = useContext(TeamChatAppContext);

  const members = useSelector(selectMember);
  // const allUsers = useSelector(selectUsers);
  const loginUser = useSelector(selectUser);

  const [editChannelDialogOpen, setEditChannelDialogOpen] = useState(false);
  const [leaveChannelDialogOpen, setLeaveChannelDialogOpen] = useState(false);
  const [leaveChannelId, setLeaveChannelId] = useState(null);

  useEffect(() => {
    if (channelId) dispatch(getMember({ channelId }));
  }, [channelId, dispatch]);

  if (!members) {
    return null;
  }

  return (
    <div className="flex flex-col flex-auto h-full justify-between">
      <Box
        className="border-b-1"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? lighten(theme.palette.background.default, 0.4)
              : lighten(theme.palette.background.default, 0.02),
        }}
      >
        <div className="flex items-center justify-between h-full">
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
          <Typography className="px-4 font-medium text-16" color="inherit" variant="subtitle1">
            Channel members
          </Typography>
        </div>
      </Box>

      <div className="relative flex flex-col flex-auto items-center p-12 pt-0 sm:p-24 sm:pt-0">
        <div className="w-full max-w-3xl">
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
                      // removeMember(one.id)
                      setLeaveChannelDialogOpen(true);
                      setLeaveChannelId(member.id);
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
        className="border-t-1 min-h-80 flex flex-row items-center justify-end"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? lighten(theme.palette.background.default, 0.4)
              : lighten(theme.palette.background.default, 0.02),
        }}
      >
        <Button
          variant="text"
          style={{ marginRight: '30px', color: 'red' }}
          onClick={() => {
            // removeMember(one.id)
            setLeaveChannelDialogOpen(true);
            setLeaveChannelId(members.find((member) => member.memberId === loginUser.uuid).id);
          }}
        >
          Leave channel
        </Button>
      </Box>
      <LeaveChannelDialog
        open={leaveChannelDialogOpen}
        onClose={() => {
          setLeaveChannelDialogOpen(false);
          setLeaveChannelId(null);
        }}
        channelMemberId={leaveChannelId}
      />
    </div>
  );
};

export default MemberSidebar;

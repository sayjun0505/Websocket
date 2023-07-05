import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

import { selectUser } from 'app/store/userSlice';
import { selectUsers } from '../../store/directMessageUsersSlice';
import { removeChannelMember } from '../../store/channelMemberSlice';

import TeamChatAppContext from '../../TeamChatAppContext';

const LeaveChannelDialog = (props) => {
  const { open, onClose, channelMember } = props;

  const { setMemberSidebarOpen } = useContext(TeamChatAppContext);
  const dispatch = useDispatch();
  const loginUser = useSelector(selectUser);
  const users = useSelector(selectUsers);

  if (!channelMember) return null;
  return (
    <Dialog open={open} onClose={onClose} className="create-channel-modal" fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography variant="h6" className="pb-10">
          Leave Channel?
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          When you leave a private channel, you'll no longer be able to see any of its messages. To
          To rejoin this channel later, you'll need to be added by channel member.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="text"
          style={{ color: 'red' }}
          // color="red"
          onClick={() => {
            dispatch(
              removeChannelMember({
                id: channelMember.id,
                me: channelMember.memberId === loginUser.uuid,
              })
            );
            setMemberSidebarOpen(!channelMember.memberId === loginUser.uuid);
            onClose();
          }}
        >
          Leave channel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeaveChannelDialog;

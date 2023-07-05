import { useDispatch } from 'react-redux';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { deleteChannel } from '../../store/channelsSlice';
import TeamChatAppContext from '../../TeamChatAppContext';

const RemoveChannelDialog = (props) => {
  const { setContactSidebarOpen, setMemberSidebarOpen } = useContext(TeamChatAppContext);
  const { open, onClose, channelId } = props;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!channelId) return null;
  return (
    <Dialog open={open} onClose={onClose} className="create-channel-modal" fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography variant="h6" className="pb-10">
          Remove Channel?
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          When you remove a private channel, you'll no longer be able to see any of its messages.
          And this channel will disapear on channelList of everybody.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="text"
          className="bg-[#FF110D] hover:bg-[#DF0B07] whitespace-nowrap px-10 text-[#ffffff]"
          onClick={() => {
            dispatch(
              deleteChannel({
                channelId,
              })
            );
            onClose();
            setContactSidebarOpen(false);
            setMemberSidebarOpen(false);
            navigate('/apps/teamchat/');
          }}
        >
          Remove
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemoveChannelDialog;

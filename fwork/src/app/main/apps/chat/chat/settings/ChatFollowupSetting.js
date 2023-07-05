import { Checkbox, FormControlLabel } from '@mui/material';

import { useDispatch, useSelector } from 'react-redux';

import { selectChat, updateChat } from '../../store/chatSlice';

const ChatFollowupSetting = (props) => {
  const dispatch = useDispatch();
  const chat = useSelector(selectChat);

  const handleFollowup = async (e) => {
    dispatch(
      updateChat({
        id: chat.id,
        followup: e.target.checked,
      })
    );
  };
  const handleSpam = async (e) => {
    dispatch(
      updateChat({
        id: chat.id,
        spam: e.target.checked,
      })
    );
  };
  const handleArchived = async (e) => {
    dispatch(
      updateChat({
        id: chat.id,
        archived: e.target.checked,
      })
    );
  };

  return (
    <div className="flex flex-col" style={{ margin: '10px' }}>
      <FormControlLabel
        control={
          <Checkbox
            disabled={chat.status && chat.status === 'resolved'}
            size="small"
            checked={chat.archived}
            onChange={handleArchived}
            inputProps={{
              'aria-label': 'primary checkbox',
            }}
          />
        }
        label="Archived Chat"
      />
      <FormControlLabel
        control={
          <Checkbox
            disabled={chat.status && chat.status === 'resolved'}
            size="small"
            checked={chat.followup}
            onChange={handleFollowup}
            inputProps={{
              'aria-label': 'primary checkbox',
            }}
          />
        }
        label="Follow-Up"
      />
      <FormControlLabel
        control={
          <Checkbox
            disabled={chat.status && chat.status === 'resolved'}
            size="small"
            checked={chat.spam}
            onChange={handleSpam}
            inputProps={{ 'aria-label': 'primary checkbox' }}
          />
        }
        label="Spam"
      />
    </div>
  );
};

export default ChatFollowupSetting;

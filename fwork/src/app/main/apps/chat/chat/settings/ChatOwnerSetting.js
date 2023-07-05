import { Button, Menu, MenuItem, Typography } from '@mui/material';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectUser } from 'app/store/userSlice';
import { selectUsers } from '../../store/usersSlice';
import { selectChat, updateChatOwner } from '../../store/chatSlice';

const ChatOwnerSetting = (props) => {
  const dispatch = useDispatch();
  const chat = useSelector(selectChat);
  const { uuid } = useSelector(selectUser);
  const userOptions = useSelector(selectUsers);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectMenuItem = (value) => {
    handleClose();
    if (value && value.id) {
      dispatch(
        updateChatOwner({
          id: chat.id,
          ownerId: value.id,
        })
      );
    }
  };

  const owner = userOptions.find((option) => option.id === chat.ownerId);

  return (
    <>
      {/* Chat Owner */}
      <Button
        id="chat-owner-button"
        aria-controls={open ? 'chat-owner-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        variant="outlined"
        color="inherit"
        size="small"
        className="rounded border-gray"
        disabled={chat.status && chat.status === 'resolved'}
      >
        <Typography className="capitalize font-medium">
          {owner && owner.display ? owner.display : 'Owner'}
        </Typography>
      </Button>
      <Menu
        id="chat-owner-menu"
        aria-labelledby="chat-owner-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {userOptions.map((value, index) => (
          <MenuItem
            key={index}
            value={value}
            disabled={chat.ownerId === value.id}
            onClick={() => {
              handleSelectMenuItem(value);
            }}
          >
            {value.display}
            {uuid && value.id === uuid && '(Me)'}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ChatOwnerSetting;

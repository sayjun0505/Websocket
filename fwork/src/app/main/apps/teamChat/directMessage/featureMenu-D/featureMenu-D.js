/* eslint-disable no-undef */
import { useContext, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useDispatch } from 'react-redux';
import { setDmPinMessage } from '../../store/directMessageSlice';
import DeleteMessageDialog from '../featureDialog-D/deleteMessageDialog-D';
import EditMessageDialog from '../featureDialog-D/editMessageDialog-D';
import TeamChatAppContext from '../../TeamChatAppContext';
import { setThreadId } from '../../store/threadSlice';

const DirectFeatureMenu = (props) => {
  const dispatch = useDispatch();
  const { item, loginUser, directMessage, contactId } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const [editMessageDialogOpen, setEditMessageDialogOpen] = useState(false);
  const [deleteMessageDialogOpen, setDeleteMessageDialogOpen] = useState(false);
  const { setThreadSidebarOpen } = useContext(TeamChatAppContext);

  return (
    <>
      <IconButton
        aria-label="more"
        size="medium"
        className="chat-feature"
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={(e) => handleClick(e)}
      >
        <FuseSvgIcon>heroicons-outline:dots-vertical</FuseSvgIcon>
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {item.isPin ? (
          <MenuItem onClick={handleClose}>Pinned</MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              dispatch(
                setDmPinMessage({
                  message: { id: item.id, isPin: true },
                  contactId: directMessage.contact.id,
                })
              );
              handleClose();
            }}
          >
            Pin
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            // dispatch(
            //   setReplyMessage({
            //     message: { id: item.id, isReply: true },
            //     contactId: directMessage.contact.id,
            //   })
            // );
            dispatch(
              setThreadId({
                messageText: item,
                threadId: item.id,
                createdBy: item.sendUser,
                createdAt: item.createdAt,
                contactId,
                type: item.type,
              })
            );
            handleClose();
            setThreadSidebarOpen(true);
          }}
        >
          Reply in thread
        </MenuItem>
        {item.sendUser.id === loginUser.uuid && (
          <MenuItem
            onClick={() => {
              setEditMessageDialogOpen(true);
              handleClose();
            }}
          >
            Edit
          </MenuItem>
        )}
        {item.sendUser.id === loginUser.uuid && (
          <MenuItem
            onClick={() => {
              setDeleteMessageDialogOpen(true);
              handleClose();
            }}
          >
            Delete
          </MenuItem>
        )}
      </Menu>
      <EditMessageDialog
        open={editMessageDialogOpen}
        onClose={() => {
          setEditMessageDialogOpen(false);
        }}
        item={item}
        directMessage={directMessage}
      />
      <DeleteMessageDialog
        open={deleteMessageDialogOpen}
        onClose={() => {
          setDeleteMessageDialogOpen(false);
        }}
        item={item}
        directMessage={directMessage}
      />
    </>
  );
};

export default DirectFeatureMenu;

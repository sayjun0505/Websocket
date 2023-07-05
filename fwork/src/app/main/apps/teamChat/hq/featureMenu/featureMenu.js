import { useContext, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useDispatch } from 'react-redux';
import { setHqPinMessage } from '../../store/hqSlice';
import DeleteMessageDialog from '../featureDialog/deleteMessageDialog';
import EditMessageDialog from '../featureDialog/editMessageDialog';
import TeamChatAppContext from '../../TeamChatAppContext';
import { setThreadId } from '../../store/threadSlice';

const FeatureMenu = (props) => {
  const dispatch = useDispatch();
  const { item, loginUser } = props;
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
                setHqPinMessage({
                  id: item.id,
                  isPin: true,
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
            //     id: item.id,
            //     isReply: true,
            //   })
            // );
            dispatch(
              setThreadId({
                messageText: item,
                createdBy: item.createdBy,
                createdAt: item.createdAt,
                threadId: item.id,
                type: item.type,
              })
            );
            handleClose();
            setThreadSidebarOpen(true);
          }}
        >
          Reply in thread
        </MenuItem>
        {item.createdBy.id === loginUser.uuid && (
          <MenuItem
            onClick={() => {
              setEditMessageDialogOpen(true);
              handleClose();
            }}
          >
            Edit
          </MenuItem>
        )}
        {item.createdBy.id === loginUser.uuid && (
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
      />
      <DeleteMessageDialog
        open={deleteMessageDialogOpen}
        onClose={() => {
          setDeleteMessageDialogOpen(false);
        }}
        item={item}
      />
    </>
  );
};

export default FeatureMenu;

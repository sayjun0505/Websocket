import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';

import { selectUser } from 'app/store/userSlice';
import { useState } from 'react';
import { setEditMessage } from '../../store/directMessageSlice';

const EditMessageDialog = (props) => {
  const { open, onClose, item, directMessage } = props;
  const messageObj = JSON.parse(item.data);
  const [editValue, setEditValue] = useState(false);
  const handleChange = (event) => {
    setEditValue(event.target.value);
  };

  const dispatch = useDispatch();
  const loginUser = useSelector(selectUser);

  if (!item) return null;
  return (
    <Dialog open={open} onClose={onClose} className="create-channel-modal" fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography className="text-20 pb-5">Edit Message</Typography>
      </DialogTitle>
      <DialogContent>
        <TextField
          defaultValue={messageObj.text}
          className="flex flex-col relative justify-center p-10 w-full rounded-12"
          required
          multiline
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions className="px-20 pb-16">
        <Button onClick={onClose}>Cancel</Button>
        {editValue ? (
          <Button
            variant="contained"
            color="secondary"
            className="whitespace-nowrap px-8"
            onClick={() => {
              dispatch(
                setEditMessage({
                  message: { id: item.id, data: { text: editValue }, isEdit: true },
                  contactId: directMessage.contact.id,
                })
              );
              onClose();
            }}
          >
            Save
          </Button>
        ) : (
          <Button
            variant="text"
            className="whitespace-nowrap px-8 bg-[#D5D7DB] text-[#ADAFB2]"
            disabled
          >
            Save
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EditMessageDialog;

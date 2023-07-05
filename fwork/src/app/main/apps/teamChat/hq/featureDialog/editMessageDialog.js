import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';

import _ from 'lodash';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';

import { setEditMessage } from '../../store/hqSlice';

const EditMessageDialog = (props) => {
  const { open, onClose, item } = props;
  const dispatch = useDispatch();
  const messageObj = JSON.parse(item.data);
  // const messages = useSelector(selectMessages);
  // const [editValue, setEditValue] = useState(false);
  // const handleChange = (event) => {
  //   setEditValue(event.target.value);
  // };

  // const loginUser = useSelector(selectUser);

  const defaultValues = {
    text: messageObj.text,
  };

  /**
   * Form Validation Schema
   */
  const schema = yup.object().shape({
    text: yup.string().required('Note required'),
  });

  const { control, reset, handleSubmit, formState } = useForm({
    mode: 'onChange',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const { isValid, dirtyFields } = formState;

  const initData = useCallback(() => {
    reset({
      ...defaultValues,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    initData();
  }, [initData]);

  /**
   * Form Submit
   */
  async function onSubmit(data) {
    dispatch(
      setEditMessage({
        id: item.id,
        data,
        isEdit: true,
      })
    ).then(() => closeDialog());
  }

  /**
   * Close Dialog
   */
  function closeDialog() {
    onClose();
  }

  if (!item) return null;
  return (
    <Dialog open={open} onClose={onClose} className="create-channel-modal" fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          <Typography className="text-20 pb-5">Edit Message</Typography>
        </DialogTitle>
        <DialogContent>
          <Controller
            name="text"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                className="flex flex-col relative justify-center p-10 w-full rounded-12"
                required
                multiline
              />
              // <TextareaAutosize
              //   {...field}
              //   className="flex flex-col relative justify-center p-10 w-full rounded-12"
              //   id="note"
              //   minRows={3}
              // />
            )}
          />
        </DialogContent>
        <DialogActions className="px-20 pb-16">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            type="submit"
            color="secondary"
            className="whitespace-nowrap px-8"
            disabled={_.isEmpty(dirtyFields) || !isValid}
          >
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditMessageDialog;

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import {
  Autocomplete,
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';

import _ from '@lodash';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';

import { selectUser } from 'app/store/userSlice';
import { selectUsers } from '../../store/directMessageUsersSlice';
import { addTeamChannel, updateTeamChannel } from '../../store/channelsSlice';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
  channelName: yup.string().required('You must enter a Channel name'),
});

const defaultValues = {
  channelName: '',
  channelDescription: '',
  isPublic: false,
  channelMembers: [],
};

const ChannelDialog = (props) => {
  const { open, initialData, onClose } = props;
  const dispatch = useDispatch();
  const { channelId } = useParams();
  const loginUser = useSelector(selectUser);
  const users = useSelector(selectUsers);

  const [memberOption, setMemberOption] = useState([]);

  // Create a Channel from
  const { control, watch, reset, handleSubmit, formState, getValues } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { isValid, dirtyFields, errors } = formState;

  const form = watch();
  const channelName = watch('channelName');
  const channelDescription = watch('channelDescription');
  const isPublic = watch('isPublic');
  const channelMembers = watch('channelMembers');

  useEffect(() => {
    if (open) {
      if (initialData) {
        // console.log('initialData', initialData);
        reset(initialData);
      } else if (users) {
        const me = users.find((user) => user.userId === loginUser.uuid);
        reset({
          ...defaultValues,
          channelMembers: [me],
        });
      }
    } else {
      reset(defaultValues);
    }
    return () => {
      reset(defaultValues);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData, reset, users]);

  useEffect(() => {
    if (users) {
      if (initialData && initialData.channelMembers && initialData.channelMembers.length > 0) {
        setMemberOption(
          users.filter(
            (user) => initialData.channelMembers.map((e) => e.memberId).indexOf(user.userId) === -1
          )
        );
      } else {
        setMemberOption(users.filter((element) => element.userId !== loginUser.uuid));
      }
    } else {
      setMemberOption([]);
    }
    return () => {
      setMemberOption([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, initialData]);

  /**
   * Form Submit
   */
  function onSubmit(data) {
    if (initialData) {
      // Edit mode
      dispatch(
        updateTeamChannel({
          channelId,
          channelName,
          channelDescription,
          isPublic,
          channelMembers,
        })
      );
      reset(defaultValues);
      onClose();
    } else {
      // Create mode
      dispatch(
        addTeamChannel({
          channelName,
          channelDescription,
          isPublic,
          channelMembers,
        })
      );
      reset(defaultValues);
      onClose();
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography variant="h6">{initialData ? 'Edit a Channel' : 'Create a Channel'}</Typography>
      </DialogTitle>
      <DialogContent>
        <List>
          <ListItem className="p-8">
            <Controller
              control={control}
              name="channelName"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Channel Name"
                  placeholder="Channel Name"
                  id="channelName"
                  error={!!errors.channelName}
                  helperText={errors?.channelName?.message}
                  variant="outlined"
                  fullWidth
                  required
                />
              )}
            />
          </ListItem>
          <ListItem className="p-8">
            <Controller
              control={control}
              name="channelDescription"
              render={({ field }) => (
                <TextField
                  multiline
                  fullWidth
                  maxRows={4}
                  {...field}
                  label="Description"
                  placeholder="Description"
                  id="channelDescription"
                  variant="outlined"
                />
              )}
            />
          </ListItem>
          <ListItem className="p-8">
            <Controller
              control={control}
              name="isPublic"
              render={({ field }) => (
                <FormControl variant="outlined" className="w-full">
                  <InputLabel id="select-public">Privacy</InputLabel>
                  <Select
                    {...field}
                    labelId="select-public"
                    id="select-public-fullwidth"
                    label="Privacy"
                    fullWidth
                  >
                    <MenuItem value>Public</MenuItem>
                    <MenuItem value={false}>Private</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </ListItem>
          <ListItem className="p-8">
            <Controller
              control={control}
              name="channelMembers"
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  multiple
                  fullWidth
                  id="channelMembers"
                  onChange={(e, value) => field.onChange(value)}
                  options={memberOption}
                  // options={users.filter((element) => element.userId !== loginUser.uuid)}
                  getOptionLabel={(option) => option.display}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                      <div className="flex" key={index}>
                        <Chip
                          label={option.display}
                          {...getTagProps({ index })}
                          avatar={<Avatar alt={option.display} src={option.picture} />}
                          disabled={
                            initialData
                              ? option.userId === initialData.memberId
                              : option.userId === loginUser.uuid
                          }
                        />
                      </div>
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Members"
                      variant="outlined"
                      placeholder="Add members"
                    />
                  )}
                />
              )}
            />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions className="px-12">
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disabled={
            _.isEmpty(dirtyFields) || !isValid || (channelMembers && channelMembers.length < 1)
          }
          onClick={handleSubmit(onSubmit)}
          // style={{ color: 'blue' }}
        >
          {initialData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChannelDialog;

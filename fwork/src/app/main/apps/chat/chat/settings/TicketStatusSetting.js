import {
  AppBar,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import _ from '@lodash';
import clsx from 'clsx';

import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { selectChat } from '../../store/chatSlice';
import { selectUsers } from '../../store/usersSlice';

const defaultValues = {
  firstname: '',
  lastname: '',
  display: '',
  email: '',
  tel: '',
  members: [],
};

/**
 * Chat Setting create ticket dialog open button
 * @param className class name for button
 * @param size MUI button size
 * @returns button component
 */
export const TicketDetailSetting = ({ className, size }) => {
  const dispatch = useDispatch();
  const chat = useSelector(selectChat);
  const users = useSelector(selectUsers);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { control, watch, reset, handleSubmit, formState, getValues } = useForm({
    mode: 'onChange',
  });
  const { isValid, dirtyFields, errors } = formState;

  const members = useMemo(() => {
    const userOptions = users.map((user) => ({
      group: 'Assign to agent',
      ...user,
    }));
    return [
      { group: '', display: 'All', id: 'all' },
      ...userOptions,
      { group: 'Forward to team', display: 'Marketing', id: 'marketing' },
      { group: 'Forward to team', display: 'Technical', id: 'technical' },
      { group: 'Forward to team', display: 'Customer Support', id: 'customer-support' },
    ];
  }, [users]);
  // console.log('🚀 ~ file: TicketStatusSetting.js:58 ~ members ~ members', members);

  useEffect(() => {
    if (dialogOpen) {
      reset({
        ...defaultValues,
      });
    }
    return () => {
      reset(defaultValues);
    };
  }, [dialogOpen, chat, reset]);

  function onSubmit(data) {
    
  }

  return (
    <>
      <Button
        id="chat-status-button"
        onClick={() => setDialogOpen(true)}
        variant="contained"
        size={size}
        color={chat.status ? 'info' : 'success'}
        className={clsx('rounded', className)}
      >
        <p className="capitalize font-medium">{chat.status ? chat.status : 'Status'} Ticket</p>
      </Button>

      {/* Ticket Detail */}
      <Dialog
        fullWidth
        maxWidth="md"
        className="m-24"
        onClose={() => {
          setDialogOpen(false);
        }}
        aria-labelledby="simple-dialog-title"
        open={dialogOpen}
      >
        <AppBar position="static" elevation={0}>
          <Toolbar className="flex w-full">
            <Typography className="capitalize font-medium">Ticket Detail</Typography>
          </Toolbar>
        </AppBar>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col md:overflow-hidden"
        >
          <DialogContent classes={{ root: 'p-24' }}>
            <div className="flex flex-col">
              <Controller
                control={control}
                name="ticketTitle"
                render={({ field }) => (
                  <TextField
                    {...field}
                    className="mb-8"
                    label="Ticket Title"
                    id="ticketTitle"
                    error={!!errors.name}
                    helperText={errors?.name?.message}
                    variant="outlined"
                    required
                    fullWidth
                  />
                )}
              />
              <Controller
                control={control}
                name="members"
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    className="mt-8 mb-16"
                    multiple
                    options={members}
                    getOptionLabel={(member) => {
                      return member.display;
                    }}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Avatar
                          className="h-28 w-28 mr-24"
                          src={option.pictureURL}
                          alt={option.display.charAt(0)}
                        >
                          {option.group === 'Assign to agent' ? (
                            (!option.pictureURL || option.pictureURL === '') &&
                            option.display.charAt(0)
                          ) : (
                            <FuseSvgIcon className="text-48" size={20}>
                              heroicons-outline:user-group
                            </FuseSvgIcon>
                          )}
                        </Avatar>
                        {option.display}
                      </Box>
                    )}
                    // value={value || []}
                    value={_.compact(value.map((id) => _.find(members, { id })))}
                    onChange={(event, newValue) => {
                      onChange(newValue.map((item) => item.id));
                    }}
                    renderTags={(tagValue, getTagProps) =>
                      tagValue.map((option, index) => {
                        return (
                          <Chip
                            label={option.display}
                            {...getTagProps({ index })}
                            className={clsx('rounded m-3', option.class)}
                            avatar={
                              <Tooltip title={option.display || ''}>
                                <Avatar src={option.pictureURL} alt={option.display.charAt(0)}>
                                  {option.group === 'Assign to agent' ? (
                                    (!option.pictureURL || option.pictureURL === '') &&
                                    option.display.charAt(0)
                                  ) : (
                                    <FuseSvgIcon className="text-48" size={18} color="white">
                                      heroicons-outline:user-group
                                    </FuseSvgIcon>
                                  )}
                                </Avatar>
                              </Tooltip>
                            }
                          />
                        );
                      })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select multiple Members"
                        label="Select Agents/Teams"
                        variant="outlined"
                        error={!!errors.name}
                        helperText={errors?.name?.message}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    )}
                    groupBy={(option) => option.group}
                    renderGroup={(params) => (
                      <li>
                        <div className="font-500 p-14">{params.group}</div>
                        <ui>{params.children}</ui>
                      </li>
                    )}
                  />
                )}
              />
              <div className="flex flex-col md:flex-row">
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      className="mb-8 mr-8"
                      label="First Name"
                      id="firstName"
                      error={!!errors.name}
                      helperText={errors?.name?.message}
                      variant="outlined"
                      required
                      fullWidth
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      className="mb-8"
                      label="Last Name"
                      id="lastName"
                      error={!!errors.name}
                      helperText={errors?.name?.message}
                      variant="outlined"
                      required
                      fullWidth
                    />
                  )}
                />
              </div>
              <Controller
                control={control}
                name="tel"
                render={({ field }) => (
                  <TextField
                    {...field}
                    className="mb-8"
                    label="Phone Number"
                    id="tel"
                    error={!!errors.name}
                    helperText={errors?.name?.message}
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <TextField
                    {...field}
                    className="mb-8"
                    label="Email"
                    id="email"
                    error={!!errors.name}
                    helperText={errors?.name?.message}
                    variant="outlined"
                    required
                    fullWidth
                  />
                )}
              />
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <TextField
                    {...field}
                    className="mb-8"
                    label="Description (optional)"
                    id="description"
                    error={!!errors.name}
                    helperText={errors?.name?.message}
                    variant="outlined"
                    multiline
                    rows={4}
                    fullWidth
                  />
                )}
              />
            </div>
          </DialogContent>

          <DialogActions className="justify-end p-4 pb-16">
            <div className="px-16">
              <Button
                variant="contained"
                size="small"
                color="secondary"
                type="submit"
                disabled={_.isEmpty(dirtyFields) || !isValid}
              >
                Open Ticket
              </Button>
            </div>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default TicketDetailSetting;

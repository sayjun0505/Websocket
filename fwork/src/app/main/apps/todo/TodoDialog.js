import { yupResolver } from '@hookform/resolvers/yup';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Controller, useForm } from 'react-hook-form';
import _ from '@lodash';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Hidden from '@mui/material/Hidden';
import Avatar from '@mui/material/Avatar';
import { amber, red } from '@mui/material/colors';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
// import SocialIcon from 'app/main/chat/SocialIcon';
import { Chip, DialogTitle } from '@mui/material';
import { selectLabels } from './store/labelsSlice';
import {
  closeCustomerSidebar,
  openCustomerSidebar,
  openMobileChatsSidebar,
} from './store/sidebarsSlice';
import {
  addTodo,
  closeEditTodoDialog,
  closeNewTodoDialog,
  removeTodo,
  updateTodo,
} from './store/todosSlice';
import TodoLabel from './TodoLabel';
import TodoChat from './TodoChat';
import CustomerSidebar from './sidebars/CustomerSidebar';

const defaultValues = {
  title: '',
  notes: '',
  startDate: new Date(),
  dueDate: new Date(),
  completed: false,
  starred: false,
  important: false,
  deleted: false,
  labels: [],
};

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
  title: yup.string().required('You must enter a title'),
});

const TodoDialog = (props) => {
  const { selectedAccount } = props;
  const dispatch = useDispatch();
  const todoDialog = useSelector(({ todoApp }) => todoApp.todos.todoDialog);
  const labels = useSelector(selectLabels);

  const [labelMenuEl, setLabelMenuEl] = useState(null);
  const { watch, handleSubmit, formState, reset, control, getValues, setValue } = useForm({
    mode: 'onChange',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const { errors, isValid, isDirty } = formState;
  const formId = watch('id');
  const formLabels = watch('labels');
  const dueDate = watch('deuDate');
  const startDate = watch('startDate');

  const selectType = useSelector(({ todoApp }) => todoApp.current.selectType);
  const selected = useSelector(({ todoApp }) => todoApp.current.selected);
  const [channelName, setChannelName] = useState('');

  const userId = useSelector(({ user }) => user.uuid);

  const customerSidebarOpen = useSelector(({ todoApp }) => todoApp.sidebars.customerSidebarOpen);

  useMemo(() => {
    if (selected && selected.channel) {
      if (selected.channel.channel === 'line' && selected.channel.line)
        setChannelName(selected.channel.line.name);
      if (selected.channel.channel === 'facebook' && selected.channel.facebook)
        setChannelName(selected.channel.facebook.name);
    }
  }, [selected]);

  const drawerWidth = 400;
  const StyledSwipeableDrawer = styled(SwipeableDrawer)(({ theme }) => ({
    '& .MuiDrawer-paper': {
      width: drawerWidth,
      maxWidth: '100%',
      overflow: 'hidden',
      // height: '100%',
      [theme.breakpoints.up('md')]: {
        position: 'relative',
      },
    },
  }));

  /**
   * Initialize Dialog with Data
   */
  const initDialog = useCallback(() => {
    /**
     * Dialog type: 'edit'
     */
    if (todoDialog.type === 'edit' && todoDialog.data) {
      reset({ ...todoDialog.data });
    }

    /**
     * Dialog type: 'new'
     */
    if (todoDialog.type === 'new') {
      reset({
        ...defaultValues,
        ...todoDialog.data,
      });
    }
  }, [todoDialog.data, todoDialog.type, reset]);

  /**
   * On Dialog Open
   */
  useEffect(() => {
    if (todoDialog.props.open) {
      initDialog();
    }
  }, [todoDialog.props.open, initDialog]);

  /**
   * Close Dialog
   */
  function closeTodoDialog() {
    return todoDialog.type === 'edit'
      ? dispatch(closeEditTodoDialog())
      : dispatch(closeNewTodoDialog());
  }

  /**
   * Form Submit
   */
  function onSubmit(data) {
    if (todoDialog.type === 'new') {
      dispatch(addTodo({ todo: { ...data, userId: selectedAccount } }));
    } else {
      dispatch(
        updateTodo({
          todo: { ...todoDialog.data, ...data, userId: selectedAccount },
        })
      );
    }
    closeTodoDialog();
  }

  /**
   * Remove Event
   */
  function handleRemove() {
    dispatch(removeTodo(formId)).then(() => {
      closeTodoDialog();
    });
  }

  return (
    <Dialog
      {...todoDialog.props}
      onClose={closeTodoDialog}
      classes={{
        paper: 'max-w-lg w-full m-24',
      }}
    >
      <>
        <DialogTitle component="div" className="p-0">
          <AppBar position="static" elevation={0}>
            <Toolbar className="flex w-full">
              <Typography variant="subtitle1" color="inherit">
                {todoDialog.type === 'new' ? 'New Todo' : 'Edit Todo'}
              </Typography>
            </Toolbar>
          </AppBar>
        </DialogTitle>
        <DialogContent className="p-16 px-0">
          {todoDialog.type !== 'new' &&
            todoDialog.data &&
            todoDialog.data.chatId.length > 0 &&
            selected && (
              <>
                <AppBar className="w-full" elevation={0} position="static">
                  <Toolbar className="px-16 m-8">
                    <IconButton
                      color="inherit"
                      aria-label="Open drawer"
                      onClick={() => dispatch(openMobileChatsSidebar())}
                      className="flex md:hidden"
                      size="large"
                    >
                      <Icon>chat</Icon>
                    </IconButton>
                    <div className="flex flex-row justify-between w-full">
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => dispatch(openCustomerSidebar())}
                        onKeyDown={() => dispatch(openCustomerSidebar())}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="relative mx-8">
                          <div className="absolute right-0 bottom-0 -m-4 z-10">
                            {/* TODO: */}
                            {/* <SocialIcon status={selected.channel.channel} /> */}
                          </div>

                          {selectType === 'chat' && (
                            <Avatar
                              sx={{ width: 60, height: 60 }}
                              src={selected.customer.pictureURL}
                              alt={selected.customer.display}
                            />
                          )}
                          {selectType === 'history' && (
                            <Avatar
                              sx={{ width: 60, height: 60 }}
                              src={selected.pictureURL}
                              alt={selected.display}
                            />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <Typography color="white" className="text-18 font-semibold px-4">
                            {selectType === 'chat' && (
                              <>
                                <Hidden mdDown>
                                  {selected.customer.firstname
                                    ? `${selected.customer.firstname.substring(0, 15)}`
                                    : `${selected.customer.display.substring(0, 15)}`}
                                </Hidden>
                                <Hidden mdUp>
                                  {selected.customer.firstname || selected.customer.lastname
                                    ? `${selected.customer.firstname} ${selected.customer.lastname}`
                                    : `${selected.customer.display}`}
                                </Hidden>
                              </>
                            )}
                            {selectType === 'history' && (
                              <>
                                <Hidden mdDown>
                                  {selected.firstname
                                    ? `${selected.firstname.substring(0, 15)}`
                                    : `${selected.display.substring(0, 15)}`}
                                </Hidden>
                                <Hidden mdUp>
                                  {selected.firstname || selected.lastname
                                    ? `${selected.firstname} ${selected.lastname}`
                                    : `${selected.display}`}
                                </Hidden>
                              </>
                            )}
                          </Typography>
                          <div className="flex flex-row space-x-8">
                            <Hidden mdDown>
                              <Chip
                                size="small"
                                variant="outlined"
                                color="secondary"
                                className="w-min m-8"
                                label={channelName}
                              />
                              {selectType === 'chat' &&
                                selected.mention.filter((el) => !el.isRead && el.user.id === userId)
                                  .length > 0 && (
                                  <Chip
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    className="w-min m-8"
                                    label={`TeamChat mention: ${
                                      selected.mention.filter(
                                        (el) => !el.isRead && el.user.id === userId
                                      ).length
                                    }`}
                                  />
                                )}
                            </Hidden>
                            <Hidden mdUp>
                              <Chip
                                size="small"
                                variant="outlined"
                                color="secondary"
                                className="w-min m-8"
                                label={`${channelName.substring(0, 15)}...`}
                              />
                              {selectType === 'chat' &&
                                selected.mention.filter((el) => !el.isRead && el.user.id === userId)
                                  .length > 0 && (
                                  <Chip
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    className="w-min m-8"
                                    label={`Mention: ${
                                      selected.mention.filter(
                                        (el) => !el.isRead && el.user.id === userId
                                      ).length
                                    }`}
                                  />
                                )}
                            </Hidden>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Toolbar>
                </AppBar>
                <div className="ChatApp-content">
                  {/* Message List */}
                  <TodoChat className="flex flex-1 z-100 max-h-288" />
                </div>
              </>
            )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent classes={{ root: 'p-0' }}>
              <div className="mb-16">
                <div className="flex items-center justify-between p-12">
                  <div className="flex">
                    <Controller
                      name="completed"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <IconButton
                          tabIndex={-1}
                          disableRipple
                          onClick={(ev) => onChange(!value)}
                          size="large"
                        >
                          {value ? (
                            <Icon color="secondary">check_circle</Icon>
                          ) : (
                            <Icon color="action">radio_button_unchecked</Icon>
                          )}
                        </IconButton>
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-start">
                    <Controller
                      name="important"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <IconButton onClick={() => onChange(!value)} size="large">
                          {value ? (
                            <Icon style={{ color: red[500] }}>error</Icon>
                          ) : (
                            <Icon>error_outline</Icon>
                          )}
                        </IconButton>
                      )}
                    />

                    <Controller
                      name="starred"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <IconButton onClick={() => onChange(!value)} size="large">
                          {value ? (
                            <Icon style={{ color: amber[500] }}>star</Icon>
                          ) : (
                            <Icon>star_outline</Icon>
                          )}
                        </IconButton>
                      )}
                    />

                    <div>
                      <IconButton
                        aria-owns={labelMenuEl ? 'label-menu' : null}
                        aria-haspopup="true"
                        onClick={(ev) => setLabelMenuEl(ev.currentTarget)}
                        size="large"
                      >
                        <Icon>label</Icon>
                      </IconButton>
                      <Controller
                        name="labels"
                        control={control}
                        render={({ field: { onChange, value: formCheckLabels } }) => (
                          <Menu
                            id="label-menu"
                            anchorEl={labelMenuEl}
                            open={Boolean(labelMenuEl)}
                            onClose={() => setLabelMenuEl(null)}
                          >
                            {labels.length > 0 &&
                              labels.map((label) => (
                                <MenuItem
                                  onClick={(ev) =>
                                    onChange(_.xorWith(formCheckLabels, [label], _.isEqual))
                                  }
                                  key={label.id}
                                >
                                  <ListItemIcon className="min-w-24">
                                    <Icon color="action">
                                      {formCheckLabels.some((element) =>
                                        element.title.includes(label.title)
                                      )
                                        ? 'check_box'
                                        : 'check_box_outline_blank'}
                                    </Icon>
                                  </ListItemIcon>
                                  <ListItemText
                                    className="mx-8"
                                    primary={label.title}
                                    disableTypography
                                  />
                                  <ListItemIcon className="min-w-24">
                                    <Icon style={{ color: label.color }} color="action">
                                      label
                                    </Icon>
                                  </ListItemIcon>
                                </MenuItem>
                              ))}
                          </Menu>
                        )}
                      />
                    </div>
                  </div>
                </div>
                <Divider className="mx-24" />
              </div>

              <div className="px-16 sm:px-24">
                <FormControl className="mt-8 mb-16" required fullWidth>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Title"
                        autoFocus
                        error={!!errors.title}
                        helperText={errors?.title?.message}
                        required
                        variant="outlined"
                      />
                    )}
                  />
                </FormControl>

                <FormControl className="mt-8 mb-16" required fullWidth>
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Notes" multiline rows="6" variant="outlined" />
                    )}
                  />
                </FormControl>

                <div className="flex flex-wrap flex-col w-full mb-16">
                  <div className="flex  items-center mt-16 mb-12">
                    <Icon className="text-20" color="inherit">
                      label
                    </Icon>
                    <Typography className="font-semibold text-16 mx-8">Labels</Typography>
                  </div>
                  <TodoLabel
                    control={control}
                    setValue={setValue}
                    labelSelect={formLabels}
                    labelOption={labels}
                  />
                </div>
                <div className="flex -mx-4">
                  <Controller
                    name="startDate"
                    control={control}
                    defaultValue=""
                    render={({ field: { onChange, value } }) => (
                      <DateTimePicker
                        value={value}
                        onChange={onChange}
                        maxDate={dueDate}
                        renderInput={(_props) => (
                          <TextField label="Start Date" className="mt-8 mb-16 mx-4" {..._props} />
                        )}
                      />
                    )}
                  />

                  <Controller
                    name="dueDate"
                    control={control}
                    defaultValue=""
                    render={({ field: { onChange, value } }) => (
                      <DateTimePicker
                        value={value}
                        onChange={onChange}
                        minDate={startDate}
                        renderInput={(_props) => (
                          <TextField label="Due Date" className="mt-8 mb-16 mx-4" {..._props} />
                        )}
                      />
                    )}
                  />
                </div>
              </div>
            </DialogContent>

            {todoDialog.type === 'new' ? (
              <DialogActions className="justify-between px-8 py-16">
                <div className="px-16">
                  <Button type="submit" variant="contained" color="secondary">
                    Add
                  </Button>
                </div>
              </DialogActions>
            ) : (
              <DialogActions className="justify-between px-8 py-16">
                <div className="px-16">
                  <Button type="submit" variant="contained" color="secondary">
                    Save
                  </Button>
                </div>
                <IconButton className="min-w-auto" onClick={handleRemove} size="large">
                  <Icon>delete</Icon>
                </IconButton>
              </DialogActions>
            )}
          </form>
        </DialogContent>
        <div>
          <StyledSwipeableDrawer
            className="h-full absolute z-30"
            variant="temporary"
            anchor="right"
            open={customerSidebarOpen}
            onOpen={(ev) => {}}
            onClose={() => dispatch(closeCustomerSidebar())}
            classes={{
              paper: 'absolute ltr:right-0 rtl:left-0',
            }}
            sx={{ '& .MuiDrawer-paper': { position: 'absolute' } }}
            ModalProps={{
              keepMounted: true,
              disablePortal: true,
              BackdropProps: {
                classes: {
                  root: 'absolute',
                },
              },
            }}
          >
            <CustomerSidebar />
          </StyledSwipeableDrawer>
        </div>
      </>
    </Dialog>
  );
};

export default TodoDialog;

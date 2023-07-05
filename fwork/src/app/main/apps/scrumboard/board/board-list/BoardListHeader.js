import { Controller, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Button, FormControl, InputLabel, Select } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import { Box } from '@mui/system';
import { darken } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { removeList, updateList } from '../../store/listsSlice';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
  title: yup.string().required('You must enter a title'),
});

const filterList = [
  { key: '', label: 'No Chat' },
  { key: 'active', label: 'Active' },
  { key: 'resolve', label: 'Resolved' },
];

const BoardListHeader = (props) => {
  const { list, cardIds } = props;
  const dispatch = useDispatch();
  // const labelOption = useSelector(selectLabels);
  const { labelOption } = useSelector(({ scrumboardApp }) => scrumboardApp.lists);

  // const role = useSelector(({ user }) => user.role);

  const [anchorEl, setAnchorEl] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  // Customer Label option
  // const [labelOption, setLabelOption] = useState([]);
  // Chat list type dynamic with User Role
  // const [filterList, setFilterList] = useState([]);

  const { control, formState, handleSubmit, reset, watch } = useForm({
    mode: 'onChange',
    defaultValues: {
      title: list.title || '',
      description: list.description || '',
      chatType: list.chatType || '',
      chatLabel: list.chatLabel || [],
    },
    resolver: yupResolver(schema),
  });

  const label = watch('chatLabel');

  const { isValid, dirtyFields, errors } = formState;

  // useEffect(() => {
  //   if (role) {
  //     if (role === 'admin' || role === 'manager') {
  //       setFilterList([
  //         { key: '', label: 'No Chat' },
  //         { key: 'all', label: 'All Chats' },
  //         { key: 'unassign', label: 'Unassigned All' },
  //         { key: 'active', label: 'All Active' },
  //         { key: 'resolve', label: 'All Resolved' },
  //         { key: 'followup', label: 'All Follow Up' },
  //         { key: 'assignee', label: 'Assigned to me' },
  //         { key: 'mention', label: '@Mentions' },
  //         { key: 'line', label: 'Channel: LINE' },
  //         { key: 'facebook', label: 'Channel: Facebook' },
  //       ]);
  //     } else {
  //       setFilterList([
  //         { key: '', label: 'No Chat' },
  //         { key: 'assignee', label: 'Assigned to me' },
  //         { key: 'mention', label: '@Mentions' },
  //       ]);
  //     }
  //   }
  // }, [role]);

  useEffect(() => {
    if (!formOpen) {
      reset({
        title: list.title,
        description: list.description,
        chatType: list.chatType,
        chatLabel: list.chatLabel,
      });
    }
  }, [formOpen, reset, list.title, list.description, list.chatType, list.chatLabel]);

  useEffect(() => {
    if (formOpen && anchorEl) {
      setAnchorEl(null);
    }
  }, [anchorEl, formOpen]);

  function handleMenuClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleMenuClose() {
    setAnchorEl(null);
  }

  function handleOpenForm(ev) {
    ev.stopPropagation();
    setFormOpen(true);
  }

  function handleCloseForm() {
    setFormOpen(false);
  }

  function onSubmit(newData) {
    dispatch(updateList({ id: list.id, newData }));
    handleCloseForm();
  }

  return (
    <div {...props.handleProps}>
      <div className="flex items-start justify-between h-min-48 sm:h-min-56 px-16 py-12">
        <div className="flex items-center min-w-0 mr-10">
          {formOpen ? (
            <ClickAwayListener onClickAway={() => {}}>
              <form className="flex flex-col w-full space-y-10" onSubmit={handleSubmit(onSubmit)}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="title"
                      label="Title"
                      variant="outlined"
                      margin="none"
                      autoFocus
                      size="small"
                      // InputProps={{
                      //   endAdornment: (
                      //     <InputAdornment position="end">
                      //       <IconButton
                      //         type="submit"
                      //         disabled={_.isEmpty(dirtyFields) || !isValid}
                      //         size="large"
                      //       >
                      //         <FuseSvgIcon>heroicons-outline:check</FuseSvgIcon>
                      //       </IconButton>
                      //     </InputAdornment>
                      //   ),
                      // }}
                    />
                  )}
                />
                <Controller
                  name="chatType"
                  control={control}
                  render={({ field }) => (
                    <FormControl>
                      <InputLabel size="small">Chat List</InputLabel>
                      <Select
                        {...field}
                        label="Chat List"
                        id="chatType"
                        size="small"
                        variant="outlined"
                        fullWidth
                        className="flex items-center"
                      >
                        {filterList.map((element, index) => (
                          <MenuItem key={index} value={element.key}>
                            {element.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
                <Controller
                  name="chatLabel"
                  control={control}
                  defaultValue={[]}
                  render={({ field: { onChange, value } }) => (
                    <Autocomplete
                      fullWidth
                      multiple
                      options={labelOption}
                      getOptionLabel={(option) => option.label}
                      value={value || []}
                      onChange={(event, newValue) => {
                        onChange(newValue);
                      }}
                      filterSelectedOptions
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Chat Label"
                          variant="outlined"
                          placeholder=""
                          multiline
                          size="small"
                          fullWidth
                        />
                      )}
                      renderTags={(tagValue, getTagProps) =>
                        tagValue.map((option, index) => (
                          <Chip label={option.label} {...getTagProps({ index })} />
                          // eslint-disable-next-line react/jsx-no-useless-fragment
                          // <>
                          //   {option.length > 0 && (
                          //     <Chip label={option} {...getTagProps({ index })} />
                          //   )}
                          // </>
                        ))
                      }
                    />
                  )}
                />
                <div className="flex justify-around items-center py-12">
                  <Button
                    variant="contained"
                    color="secondary"
                    type="submit"
                    size="small"
                    startIcon={<FuseSvgIcon>heroicons-outline:check</FuseSvgIcon>}
                  >
                    Update
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleCloseForm}
                    size="small"
                    startIcon={<FuseSvgIcon>heroicons-outline:x</FuseSvgIcon>}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </ClickAwayListener>
          ) : (
            <Typography className="text-[16px] font-600 cursor-pointer" onClick={handleOpenForm}>
              {list.title}
            </Typography>
          )}
        </div>
        <div className="flex items-center">
          <Box
            className="flex items-center justify-center min-w-24 h-24 mx-4 text-sm font-semibold leading-24 rounded-full"
            sx={{
              backgroundColor: (theme) =>
                darken(
                  theme.palette.background.default,
                  theme.palette.mode === 'light' ? 0.1 : 0.3
                ),
              color: 'text.secondary',
            }}
          >
            {cardIds.length}
          </Box>
          <IconButton
            aria-owns={anchorEl ? 'actions-menu' : null}
            aria-haspopup="true"
            onClick={handleMenuClick}
            variant="outlined"
            size="small"
          >
            <FuseSvgIcon size={20}>heroicons-outline:dots-vertical</FuseSvgIcon>
          </IconButton>
          <Menu
            id="actions-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() => {
                dispatch(removeList(list.id));
              }}
            >
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:trash</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Remove List" />
            </MenuItem>
            <MenuItem onClick={handleOpenForm}>
              <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:pencil</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Edit List" />
            </MenuItem>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default BoardListHeader;

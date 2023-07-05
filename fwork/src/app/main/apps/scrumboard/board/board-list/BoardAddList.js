import { Controller, useForm } from 'react-hook-form';

import { darken } from '@mui/material/styles';

import { yupResolver } from '@hookform/resolvers/yup';
import { Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import _ from '@lodash';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { newList } from '../../store/listsSlice';

const defaultValues = {
  title: '',
  description: '',
  chatType: '',
  chatLabel: [],
};

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

const BoardAddList = (props) => {
  const dispatch = useDispatch();

  // const role = useSelector(({ user }) => user.role);
  // Customer Label option
  // const [labelOption, setLabelOption] = useState([]);
  const { labelOption } = useSelector(({ scrumboardApp }) => scrumboardApp.lists);
  // Chat list type dynamic with User Role
  // const [filterList, setFilterList] = useState([]);

  const [formOpen, setFormOpen] = useState(false);
  const { control, formState, handleSubmit, reset } = useForm({
    mode: 'onChange',
    defaultValues,
    resolver: yupResolver(schema),
  });

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
      reset(defaultValues);
    }
  }, [formOpen, reset]);

  function handleOpenForm(ev) {
    ev.stopPropagation();
    setFormOpen(true);
  }

  function handleCloseForm() {
    setFormOpen(false);
  }

  function onSubmit(data) {
    dispatch(newList(data));
    handleCloseForm();
  }

  return (
    <div>
      <Card
        className="w-320 mx-8 sm:mx-12 rounded-xl shadow-0"
        square
        sx={{
          backgroundColor: (theme) =>
            darken(theme.palette.background.default, theme.palette.mode === 'light' ? 0.03 : 0.25),
        }}
      >
        {formOpen ? (
          <ClickAwayListener onClickAway={() => {}}>
            <form
              className="flex flex-col w-full space-y-10 p-12"
              onSubmit={handleSubmit(onSubmit)}
            >
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    fullWidth
                    variant="filled"
                    label="List title"
                    autoFocus
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleCloseForm} size="large">
                            <FuseSvgIcon size={18}>heroicons-outline:x</FuseSvgIcon>
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Controller
                name="chatType"
                control={control}
                render={({ field }) => (
                  <FormControl>
                    <InputLabel>Chat List</InputLabel>
                    <Select {...field} label="Chat List" id="chatType" variant="filled" fullWidth>
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
                        fullWidth
                        variant="filled"
                        placeholder=""
                        multiline
                        label="Chat Label"
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

              <div className="flex justify-between items-center pt-12">
                <Button
                  variant="contained"
                  color="secondary"
                  type="submit"
                  disabled={_.isEmpty(dirtyFields) || !isValid}
                  startIcon={<FuseSvgIcon>heroicons-outline:plus</FuseSvgIcon>}
                  size="small"
                >
                  Add
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleCloseForm}
                  startIcon={<FuseSvgIcon>heroicons-outline:x</FuseSvgIcon>}
                  size="small"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </ClickAwayListener>
        ) : (
          <Button
            onClick={handleOpenForm}
            classes={{
              root: 'font-medium w-full rounded-lg p-24 justify-start',
            }}
            startIcon={<FuseSvgIcon>heroicons-outline:plus-circle</FuseSvgIcon>}
            sx={{ color: 'text.secondary' }}
          >
            Add another list
          </Button>
        )}
      </Card>
    </div>
  );
};

export default BoardAddList;

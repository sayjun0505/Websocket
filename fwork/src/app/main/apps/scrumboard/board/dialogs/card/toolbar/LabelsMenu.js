import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import _ from '@lodash';

import ToolbarMenu from './ToolbarMenu';
import { newLabel, selectLabels } from '../../../../store/labelsSlice';

const defaultValues = {
  title: '',
};
const schema = yup.object().shape({
  title: yup.string().required('You must enter a title'),
});

const AddLabel = (props) => {
  const dispatch = useDispatch();

  const [formOpen, setFormOpen] = useState(false);
  const { control, formState, handleSubmit, reset } = useForm({
    mode: 'onChange',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;

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

  function onSubmit(newData) {
    dispatch(newLabel({ newData }));
    handleCloseForm();
  }

  return (
    <div className="w-full">
      {formOpen ? (
        <ClickAwayListener onClickAway={handleCloseForm}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  className="mb-16"
                  required
                  fullWidth
                  variant="filled"
                  label="Label title"
                  autoFocus
                  InputProps={{
                    ...field,
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

            <div className="flex justify-between items-center">
              <Button
                variant="contained"
                color="secondary"
                type="submit"
                disabled={_.isEmpty(dirtyFields) || !isValid}
                size="small"
              >
                Add
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
          Add another label
        </Button>
      )}
    </div>
  );
};

const LabelsMenu = (props) => {
  const labels = useSelector(selectLabels);

  const [anchorEl, setAnchorEl] = useState(null);

  function handleMenuOpen(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleMenuClose() {
    setAnchorEl(null);
  }

  return (
    <div>
      <IconButton onClick={handleMenuOpen} size="large">
        <FuseSvgIcon>heroicons-outline:tag</FuseSvgIcon>
      </IconButton>
      <ToolbarMenu state={anchorEl} onClose={handleMenuClose}>
        <div className="">
          {labels.map((label) => {
            return (
              <MenuItem
                className="px-8"
                key={label.id}
                onClick={(ev) => {
                  props.onToggleLabel(label.id);
                }}
              >
                <Checkbox checked={props.labels.includes(label.id)} />
                <ListItemText className="mx-8">{label.title}</ListItemText>
                <ListItemIcon className="min-w-24">
                  <FuseSvgIcon>heroicons-outline:tag</FuseSvgIcon>
                </ListItemIcon>
              </MenuItem>
            );
          })}
        </div>
        <div className="p-12">
          <AddLabel />
        </div>
      </ToolbarMenu>
    </div>
  );
};

export default LabelsMenu;

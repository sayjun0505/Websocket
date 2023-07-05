import Button from '@mui/material/Button';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import { useState } from 'react';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useDispatch } from 'react-redux';

const ChannelMenu = (props) => {
  const dispatch = useDispatch();
  const [menuState, setMenuState] = useState(null);

  const handleMenuClick = (event) => {
    setMenuState(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuState(null);
  };

  return (
    <>
      <Button
        className="mx-8"
        variant="contained"
        color="secondary"
        onClick={handleMenuClick}
        disabled={props.disabled}
      >
        <FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
        <span className="mx-8">Add</span>
      </Button>

      <Popover
        open={Boolean(menuState)}
        anchorEl={menuState}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        classes={{
          paper: 'py-8',
        }}
      >
        <MenuItem
          role="button"
          component={NavLinkAdapter}
          to="line/new/edit"
          onClick={() => {
            handleMenuClose();
          }}
        >
          <ListItemText primary="Add LINE Channel" />
        </MenuItem>
        <MenuItem
          role="button"
          component={NavLinkAdapter}
          to="facebook/new/edit"
          onClick={() => {
            handleMenuClose();
          }}
        >
          <ListItemText primary="Add Facebook Channel" />
        </MenuItem>
        <MenuItem
          role="button"
          component={NavLinkAdapter}
          to="instagram/new/edit"
          onClick={() => {
            handleMenuClose();
          }}
        >
          <ListItemText primary="Add Instagram Channel" />
        </MenuItem>
      </Popover>
    </>
  );
};

export default ChannelMenu;

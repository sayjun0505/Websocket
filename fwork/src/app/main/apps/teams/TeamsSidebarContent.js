import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { useDispatch } from 'react-redux';
import IconButton from '@mui/material/IconButton';
import { Outlet } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

const TeamsSidebarContent = (props) => {
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col flex-auto">
      <IconButton
        className="absolute top-0 right-0 my-16 mx-32 z-10"
        sx={{ color: 'gray' }}
        component={NavLinkAdapter}
        to="/settings/teams"
        size="large"
      >
        <FuseSvgIcon>heroicons-outline:x</FuseSvgIcon>
      </IconButton>

      <Outlet />
    </div>
  );
};

export default TeamsSidebarContent;

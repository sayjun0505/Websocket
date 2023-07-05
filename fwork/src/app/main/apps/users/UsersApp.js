import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import { useDeepCompareEffect } from '@fuse/hooks';
import { styled } from '@mui/material/styles';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import UsersSidebarContent from './UsersSidebarContent';
import UsersHeader from './UsersHeader';
import UsersList from './UsersList';
import reducer from './store';
import { getTeams } from './store/teamsSlice';
import { getUsers } from './store/usersSlice';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
  },
}));

const UsersApp = (props) => {
  const dispatch = useDispatch();
  const pageLayout = useRef(null);
  const routeParams = useParams();
  const location = useLocation();
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

  useDeepCompareEffect(() => {
    dispatch(getUsers());
    dispatch(getTeams());
  }, [dispatch]);

  useEffect(() => {
    setRightSidebarOpen(
      Boolean(routeParams.id) || location.pathname === '/settings/users/new/edit'
    );
  }, [location.pathname, routeParams]);

  return (
    <Root
      header={<UsersHeader pageLayout={pageLayout} />}
      content={<UsersList />}
      ref={pageLayout}
      rightSidebarContent={<UsersSidebarContent />}
      rightSidebarOpen={rightSidebarOpen}
      rightSidebarOnClose={() => setRightSidebarOpen(false)}
      rightSidebarWidth={640}
      scroll={isMobile ? 'normal' : 'content'}
    />
  );
};

export default withReducer('usersApp', reducer)(UsersApp);

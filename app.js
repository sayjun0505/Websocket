import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { useDispatch, useSelector } from 'react-redux';
import { useDeepCompareEffect } from '@fuse/hooks';
import { styled } from '@mui/material/styles';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { setRole } from 'app/store/userSlice';
import { updateNavigationItem } from 'app/store/fuse/navigationSlice';
import OrganizationList from './OrganizationList';
import OrganizationsHeader from './OrganizationsHeader';
import OrganizationDialog from './components/OrganizationDialog';
import reducer from './store';
import { setOrganizationforSocket } from './store/organizationsSlice';
import { setActivationsforSocket } from './store/activationsSlice';
import { setPackagesforSocket } from './store/packagesSlice';
import { useOrganization } from '../../organization/OrganizationContext';
import { useContext, useEffect} from 'react';
import {SocketContext} from '../../context/socket';
const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {},
  '& .FusePageSimple-sidebar': {},
  '& .FusePageSimple-leftSidebar': {},
  '& .FusePageSimple-content': {
    backgroundColor: theme.palette.background.default,
  },
}));

const OrganizationsApp = () => {
  const dispatch = useDispatch();
  const socket = useContext(SocketContext);
  const { setSelectOrganization } = useOrganization();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const user = useSelector(state=>{return state.user});
  useEffect(()=>{
    socket.on("getOrganizations response", res=>{
      dispatch(setOrganizationforSocket(res))
    })
    socket.on("getActivations response", res=>{
      dispatch(setActivationsforSocket(res))
    })
    socket.on("getPackages response", res=>{
      dispatch(setPackagesforSocket(res)) 
    })
  },[socket])
  useDeepCompareEffect(() => {
    socket.emit("getOrganizations",user)
    socket.emit("getActivations",user)
    socket.emit("getPackages")
    dispatch(setRole('user'));
    setSelectOrganization(null);
    dispatch(
      updateNavigationItem('directMessages', {
        children: null,
      })
    );
  }, [dispatch]);

  return (
    <Root
      header={<OrganizationsHeader />}
      content={
        <>
          <OrganizationList />
          <OrganizationDialog />
        </>
      }
      scroll={isMobile ? 'normal' : 'content'}
    />
  );
};

export default withReducer('organizationsApp', reducer)(OrganizationsApp);

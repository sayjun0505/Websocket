import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { useDispatch,useSelector } from 'react-redux';
import { useDeepCompareEffect } from '@fuse/hooks';
import { styled } from '@mui/material/styles';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { setRole } from 'app/store/userSlice';
import { updateNavigationItem } from 'app/store/fuse/navigationSlice';
import OrganizationList from './OrganizationList';
import OrganizationsHeader from './OrganizationsHeader';
import OrganizationDialog from './components/OrganizationDialog';
import reducer from './store';
import { getOrganizations,getOrganizationsforSocket } from './store/organizationsSlice';
import { getActivations,getActivationsforSocket } from './store/activationsSlice';
import { getPackages,getPackagesforSocket } from './store/packagesSlice';
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
  const { setSelectOrganization } = useOrganization();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const socket = useContext(SocketContext);
  const user = useSelector(state=>{return state.user});
  useEffect(()=>{
    socket.on("getOrganizations response", res=>{
      dispatch(getOrganizationsforSocket(res))
    })
    socket.on("getActivations response", data=>{
      dispatch(getActivationsforSocket(data))
    })
    socket.on("getPackages response", res=>{
      dispatch(getPackagesforSocket(res)) 
    })
  },[socket])
  useDeepCompareEffect(() => {
    socket.emit("getOrganizations",user.uuid)
    socket.emit("getActivations",user.uuid)    
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

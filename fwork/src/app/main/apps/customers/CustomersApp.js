import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { useEffect, useContext, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useDeepCompareEffect } from '@fuse/hooks';
import { styled } from '@mui/material/styles';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import CustomersSidebarContent from './CustomersSidebarContent';
import CustomersHeader from './CustomersHeader';
import CustomersList from './CustomersList';
import reducer from './store';
import { getCustomerLabels,getCustomerLabelsforSocket } from './store/labelsSlice';
import { getCustomers,getCustomersforSocket } from './store/customersSlice';
import { getChannels,getChannelsinCRMforSocket } from './store/channelsSlice';
import {SocketContext} from '../../../context/socket';
const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
  },
}));

const CustomersApp = (props) => {
  const socket = useContext(SocketContext);

  const dispatch = useDispatch();
  const pageLayout = useRef(null);
  const routeParams = useParams();
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const organization = window.localStorage.getItem('organization');
  useEffect(()=>{
    socket.on("getCustomers response", res=>{
      dispatch(getCustomersforSocket(res))
    })
    socket.on("getChannelsinCRM response", res=>{
      dispatch(getChannelsinCRMforSocket(res))
    })
    socket.on("getCustomerLabels response", res=>{
      dispatch(getCustomerLabelsforSocket(res))
    })
    
  },[socket])

  useDeepCompareEffect(() => {
    socket.emit("getCustomers",JSON.parse(organization).organizationId)
    socket.emit("getChannelsinCRM",JSON.parse(organization).organizationId)
    socket.emit("getCustomerLabels",JSON.parse(organization).organizationId)
  }, [dispatch]);

  useEffect(() => {
    setRightSidebarOpen(Boolean(routeParams.id));
  }, [routeParams]);

  return (
    <Root
      header={<CustomersHeader pageLayout={pageLayout} />}
      content={<CustomersList />}
      ref={pageLayout}
      rightSidebarContent={<CustomersSidebarContent />}
      rightSidebarOpen={rightSidebarOpen}
      rightSidebarOnClose={() => setRightSidebarOpen(false)}
      rightSidebarWidth={640}
      scroll={isMobile ? 'normal' : 'content'}
    />
  );
};

export default withReducer('customersApp', reducer)(CustomersApp);

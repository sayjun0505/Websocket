import AppBar from '@mui/material/AppBar';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useDispatch, useSelector } from 'react-redux';

import { useEffect, useState } from 'react';
import { closeCustomerSidebar } from '../store/sidebarsSlice';
import { getCustomer } from '../store/customerSlice';
import TeamChat from './TeamChat';

const CustomerSidebar = (props) => {
  const dispatch = useDispatch();
  const selected = useSelector(({ todoApp }) => todoApp.current.selected);
  const selectType = useSelector(({ todoApp }) => todoApp.current.selectType);
  const customer = useSelector(({ todoApp }) => todoApp.customer.customer);
  const customerSidebarOpen = useSelector(({ todoApp }) => todoApp.sidebars.customerSidebarOpen);
  const [expanded, setExpanded] = useState(false);

  const [channelName, setChannelName] = useState('');
  const [customerName, setCustomerName] = useState('');
  useEffect(() => {
    if (selected && selected.channel) {
      if (selected.channel.channel === 'line' && selected.channel.line)
        setChannelName(selected.channel.line.name);
      if (selected.channel.channel === 'facebook' && selected.channel.facebook)
        setChannelName(selected.channel.facebook.name);
    }
    if (selected && selected.customer) {
      if (customerSidebarOpen) {
        dispatch(getCustomer({ customerId: selected.customer.id }));
      } else {
        setExpanded(false);
      }
    }
  }, [dispatch, customerSidebarOpen, selected]);

  useEffect(() => {
    if (customer) {
      if (customer.firstname || customer.lastname) {
        setCustomerName(`${customer.firstname} ${customer.lastname}`);
      } else if (customer.display) {
        setCustomerName(customer.display);
      }
    }
  }, [customer]);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  if (!customer) {
    return null;
  }

  return (
    <div className="flex flex-col flex-auto h-full w-full">
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar className="flex justify-between items-center px-4">
          <Typography className="px-12" color="inherit" variant="subtitle1">
            Team Chat
          </Typography>
          <IconButton onClick={() => dispatch(closeCustomerSidebar())} color="inherit" size="large">
            <Icon>close</Icon>
          </IconButton>
        </Toolbar>
      </AppBar>

      {selectType === 'chat' && <TeamChat />}
    </div>
  );
};

export default CustomerSidebar;

import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
// import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import ContactAvatar from './ContactAvatar';
import { selectChannelById } from './store/channelsSlice';

const CustomerListItem = (props) => {
  const { customer } = props;
  const channel = useSelector((state) => selectChannelById(state, customer.channelId));

  if (!customer) return null;

  // const [channelName, setChannelName] = useState('');
  // const [customerName, setCustomerName] = useState('');

  // useMemo(() => {
  //   if (customer.channel) {
  //     if (customer.channel.channel === 'line' && customer.channel.line)
  //       setChannelName(customer.channel.line.name);
  //     if (customer.channel.channel === 'facebook' && customer.channel.facebook)
  //       setChannelName(customer.channel.facebook.name);
  //   }

  //   if (customer.firstname || customer.lastname) {
  //     setCustomerName(`${customer.firstname} ${customer.lastname}`);
  //   } else {
  //     setCustomerName(`${customer.display}`);
  //   }
  //   return () => {
  //     setChannelName('');
  //     setCustomerName('');
  //   };
  // }, [customer.channel, customer.display, customer.firstname, customer.lastname]);

  return (
    <>
      <ListItem
        className="px-32 py-16"
        sx={{ bgcolor: 'background.paper' }}
        button
        component={NavLinkAdapter}
        to={`/apps/customers/${customer.id}`}
      >
        <ListItemAvatar>
          {}
          {/* <Avatar src={customer.avatar || customer.pictureURL} alt={customer.display}>
            {customer.display.charAt(0)}
          </Avatar> */}
          <ContactAvatar contact={customer} channel={channel} />
        </ListItemAvatar>
        <ListItemText
          classes={{ root: 'm-0', primary: 'font-medium leading-5 truncate' }}
          primary={customer.display}
          secondary={
            <Typography className="inline" component="span" variant="body2" color="text.secondary">
              {channel && channel.data && channel.data.name}
            </Typography>
          }
        />
      </ListItem>
      <Divider />
    </>
  );
};

export default CustomerListItem;

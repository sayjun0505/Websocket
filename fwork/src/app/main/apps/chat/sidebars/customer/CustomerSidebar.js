import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useContext, useEffect, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import clsx from 'clsx';
import { ContactChannelAvatar } from 'app/shared-components/chat';
import { getCustomer, selectCustomer } from '../../store/customerSlice';
import { selectChannelById } from '../../store/channelsSlice';
import { selectChatById } from '../../store/chatsSlice';
import { selectChat } from '../../store/chatSlice';

import Address from './Address';
import Information from './Information';
import Label from './Label';
import Ticket from './Ticket';
// import TeamChat from './TeamChat';
import ChatAppContext from '../../ChatAppContext';

const CustomerSidebar = (props) => {
  const dispatch = useDispatch();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const { setCustomerSidebarOpen, customerSidebarOpen } = useContext(ChatAppContext);
  const routeParams = useParams();
  const { mode, id: chatId } = routeParams;
  // const customer = useSelector(({ chatApp }) => chatApp.customer.customer);
  const customer = useSelector(selectCustomer);
  const chat = useSelector(selectChat);
  const chatItem = useSelector((state) => selectChatById(state, chatId));
  const channel = useSelector((state) => selectChannelById(state, chat?.channelId));

  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (chatItem && chatItem.customerId) {
      dispatch(getCustomer({ customerId: chatItem.customerId }));
    }
  }, [chatItem, dispatch]);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  if (!chatId || !chatItem || !channel) {
    return null;
  }

  return (
    <div className={clsx('flex flex-col flex-auto h-full', isMobile ? 'w-[333px]' : 'w-full')}>
      <Accordion
        color="primary"
        expanded={expanded === 'information'}
        onChange={handleChange('information')}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          {chatItem.customer ? (
            <div className="flex flex-row space-x-12 items-center">
              <ContactChannelAvatar
                className="relative w-48 h-48"
                contact={{
                  pictureURL: chatItem.customer.pictureURL,
                  display: chatItem.customer.display,
                }}
                channel={channel}
              />
              <div className="flex flex-col space-y-4  max-w-[170px]">
                <Typography color="inherit" className="text-16 font-semibold truncate">
                  {chatItem.customer.display}
                </Typography>
                <Typography variant="subtitle2">{channel.name}</Typography>
              </div>
            </div>
          ) : (
            <Typography>Customer Information</Typography>
          )}
        </AccordionSummary>
        <AccordionDetails>
          <Information />
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expanded === 'address'} onChange={handleChange('address')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3a-content"
          id="panel3a-header"
        >
          <Typography>Address</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Address />
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expanded === 'label'} onChange={handleChange('label')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography>Label</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Label />
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expanded === 'ticket'} onChange={handleChange('ticket')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography>Ticket</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Ticket />
        </AccordionDetails>
      </Accordion>
      {/* {!mode && (
        <Accordion expanded={expanded === 'comment'} onChange={handleChange('comment')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography>Comments</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TeamChat expanded={expanded === 'comment'} />
          </AccordionDetails>
        </Accordion>
      )} */}
    </div>
  );
};

export default CustomerSidebar;

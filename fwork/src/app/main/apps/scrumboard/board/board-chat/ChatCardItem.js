import { styled } from '@mui/material/styles';
import { Box, Chip, ListItem, Popover, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import format from 'date-fns/format';
// import { formatDistance } from 'date-fns';
import { ContactChannelAvatar } from 'app/shared-components/chat';

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  '&.active': {
    backgroundColor: theme.palette.background.default,
  },
  '&.label': {
    borderRadius: 6,
  },
}));

const ChatListItem = (props) => {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const { chat } = props;
  const routeParams = useParams();

  const [lastMessageText, setLastMessageText] = useState('');

  const [channelName, setChannelName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [label, setLabel] = useState([]);
  const [moreLabel, setMoreLabel] = useState([]);

  // Convert lastMessage to Text
  useMemo(() => {
    if (props && props.chat) {
      const { lastMessage } = props.chat;
      if (lastMessage && lastMessage.data && lastMessage.type) {
        if (lastMessage.type === 'text') {
          const lastMsgObj = JSON.parse(lastMessage.data);
          const { text } = lastMsgObj;
          setLastMessageText(text);
          if (text.length > 24) {
            setLastMessageText(`${text.substring(0, 21)}...`);
          } else {
            setLastMessageText(text.substring(0, 24));
          }
        } else if (lastMessage.type === 'sticker') {
          setLastMessageText('Sticker');
        } else if (lastMessage.type === 'image') {
          setLastMessageText('Image');
        } else {
          setLastMessageText('Unknown type');
        }
      }

      if (props.chat.channel) {
        if (props.chat.channel.channel === 'line' && props.chat.channel.line)
          setChannelName(props.chat.channel.line.name);
        if (props.chat.channel.channel === 'facebook' && props.chat.channel.facebook)
          setChannelName(props.chat.channel.facebook.name);
      }
      if (props.chat.customer.firstname && props.chat.customer.lastname) {
        if (`${props.chat.customer.firstname} ${props.chat.customer.lastname}`.length > 0) {
          setCustomerName(`${`${props.chat.customer.firstname} ${props.chat.customer.lastname}`.substring(0, 7)}...`);
        } else {
          setCustomerName(`${props.chat.customer.firstname} ${props.chat.customer.lastname}`.substring(0, 10));
        }
      } else if (props.chat.customer.display.length > 10) {
        setCustomerName(`${props.chat.customer.display.substring(0, 7)}...`);
      } else {
        setCustomerName(props.chat.customer.display.substring(0, 10));
      }

      if (
        props.chat.customer &&
        props.chat.customer.customerLabel &&
        props.chat.customer.customerLabel.length > 0
      ) {
        let labelLength = 0;
        const label1 = []; // Main Label
        const label2 = []; // More Label

        props.chat.customer.customerLabel.forEach(async (element, index) => {
          labelLength += element.label.length < 10 ? element.label.length : 9;

          if (labelLength < 20 && label1.length < 2) {
            label1.push(element);
            // setLabel([...label, element]);
          } else {
            label2.push(element);
            // setMoreLabel([...label, element]);
          }
          if (index + 1 === props.chat.customer.customerLabel.length) {
            setLabel(label1);
            setMoreLabel(label2);
          }
        });
      } else {
        setLabel([]);
        setMoreLabel([]);
      }
    }
  }, [props]);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  return (
    <StyledListItem
      // button
      className="px-20 pt-12 pb-0 min-h-96 w-full"
      // active={routeParams.id === chat.id ? 1 : 0}
      // component={NavLinkAdapter}
      // to={`/apps/chat/${chat.id}`}
      // end
      // activeClassName="active"
      // onClick={() => {}}
    >
      <div className="flex items-center flex-row w-full">
        <ContactChannelAvatar contact={chat.customer} channel={chat.channel} />
        <div className="flex flex-col grow pl-10">
          <div className="flex justify-between items-center">
            <Typography
              variant="subtitle1"
              className="truncate font-medium max-w-120 text-14"
              color="text.primary"
            >
              {customerName}
            </Typography>
            <Typography
              variant="body1"
              className="whitespace-nowrap font-medium text-12"
              color="text.secondary"
            >
              {props.chat.lastMessage.createdAt &&
                format(new Date(props.chat.lastMessage.createdAt), 'dd/MM/yy')}
            </Typography>
          </div>
          <div className="flex justify-between">
            <Typography variant="body2" className="text-desc">
              {lastMessageText}
            </Typography>
            <div className="items-center flex flex-row space-x-6">
              {Boolean(props.chat.newMention) && (
                <Box
                  sx={{
                    backgroundColor: 'red',
                    color: 'secondary.contrastText',
                  }}
                  className="flex items-center justify-center min-w-[1.8rem] h-[1.8rem] rounded-full font-medium text-10 text-center"
                >
                  {props.chat.newMention && '@'}
                </Box>
              )}
              {Boolean(props.chat.unread) && (
                <Box
                  sx={{
                    backgroundColor: 'secondary.main',
                    color: 'secondary.contrastText',
                  }}
                  className="flex items-center justify-center min-w-[1.8rem] h-[1.8rem] rounded-full font-medium text-10 text-center"
                >
                  {props.chat.unread}
                </Box>
              )}
            </div>
          </div>
          {/* <div className="flex items-center flex-row w-full space-x-6">
              {channelName.length > 9 ? (
                <Tooltip title={channelName} arrow>
                  <Chip
                    size="small"
                    className="w-min my-1 rounded bg-[#6D6D6D] text-[#FFFFFF]"
                    label={`${channelName.substring(0, 9)}...`}
                  />
                </Tooltip>
              ) : (
                <Chip
                  size="small"
                  className="w-min my-1 rounded bg-[#6D6D6D] text-[#FFFFFF]"
                  label={`${channelName}`}
                />
              )}
              {Boolean(props.chat.newMention) && (
                <Box
                  sx={{
                    backgroundColor: 'red',
                    color: 'secondary.contrastText',
                  }}
                  className="flex items-center justify-center min-w-20 h-20 rounded-full font-medium text-10 text-center"
                >
                  {props.chat.newMention && '@'}
                </Box>
              )}
              {Boolean(props.chat.unread) && (
                <Box
                  sx={{
                    backgroundColor: 'secondary.main',
                    color: 'secondary.contrastText',
                  }}
                  className="flex items-center justify-center min-w-20 h-20 rounded-full font-medium text-10 text-center"
                >
                  {props.chat.unread}
                </Box>
              )}
            </div> */}
          <div className="flex items-center flex-row w-full">
            {label &&
              label.length > 0 &&
              label.map((item, index) => {
                return (
                  <Chip
                    key={index}
                    size="small"
                    variant="outlined"
                    className="w-min m-1 truncate rounded w-42 border-[#8180E7] text-[#8180E7] text-[12px]"
                    label={item.label}
                  />
                );
              })}
            {moreLabel && moreLabel.length > 0 && (
              <>
                <Chip
                  id="morechatcardlabel-button"
                  size="small"
                  className="w-min my-1 rounded text-20 text-white bg-[#8180E7]"
                  label="+"
                  aria-controls={open ? 'morechatcardlabel-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                  onMouseEnter={handlePopoverOpen}
                />
                <Popover
                  id="popover-id"
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handlePopoverClose}
                  PaperProps={{ onMouseLeave: handlePopoverClose }}
                  classes={{ paper: 'flex flex-col space-y-6 p-8' }}
                >
                  {moreLabel.map((item, index) => {
                    return (
                      <Chip
                        key={index}
                        size="small"
                        variant="outlined"
                        className="w-min truncate rounded text-[12px]"
                        label={item.label}
                        sx={{
                          borderColor: '#8180E7',
                          color: '#8180E7',
                        }}
                      />
                    );
                  })}
                </Popover>
              </>
            )}
          </div>
        </div>
      </div>
    </StyledListItem>
  );
};

export default ChatListItem;

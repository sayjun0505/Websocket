import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
// import Tooltip from '@mui/material/Tooltip';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
// import format from 'date-fns/format';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import format from 'date-fns/format';
import history from '@history';
import { styled } from '@mui/material/styles';
import NotificationAvatar from './NotificationAvatar';

const SmallIcon = styled(Avatar)(({ theme }) => ({
  width: 24,
  height: 24,
  border: `2px solid ${theme.palette.background.paper}`,
}));

const NotificationCard = (props) => {
  const { item, className } = props;
  const variant = item?.variant || '';

  const [historyPath, setHistoryPath] = useState();
  const [body, setBody] = useState('');
  const [type, setType] = useState();
  const [contact, setContact] = useState();

  const handleClose = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    if (props.onClose) {
      props.onClose(item.id);
    }
  };
  const handleRedirect = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    if (props.onRead) {
      props.onRead(item.id);
    }

    if (historyPath) {
      history.push({ pathname: historyPath });
    }
  };

  const handleDismiss = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    if (historyPath) {
      history.push({ pathname: historyPath });
    }
  };

  useMemo(() => {
    // console.log('Notification Card', item);
    if (item) {
      if (item.data) {
        // set redirect path
        if (item.data.recordType && item.data.recordId) {
          if (item.data.recordType === 'chat') {
            setHistoryPath(`/apps/chat/${item.data.recordId}`);
          } else if (item.data.recordType === 'channel') {
            setHistoryPath(`/apps/teamChat/${item.data.recordId}`);
          } else if (item.data.recordType === 'directChannel') {
            setHistoryPath(`/apps/teamChat/dm/${item.data.recordId}`);
          } else if (item.data.recordType === 'hq') {
            setHistoryPath(`/apps/teamChat/hq`);
          } else if (item.data.recordType === 'scrumboard') {
            setHistoryPath(`/apps/kanbanboard/boards/${item.data.recordId}`);
          }
        }
      }

      if (item.type === 'chat') {
        if (item.event) {
          if (item.event === 'newChat' || item.event === 'newMessage') {
            // set Avatar
            if (item.data.customer) {
              setContact(item.data.customer);
            }
            if (item.data.channel) {
              setType(item.data.channel.channel);
            }
            const messageCount = (item.data && item.data.newMessage) || 0;
            if (
              item.data &&
              item.data.customer &&
              item.data.customer.display &&
              item.data.channel &&
              item.data.channel.name
            ) {
              setBody(
                `<b>${item.data.customer.display}</b> sent ${
                  messageCount > 1 ? messageCount : ''
                } new messages to <b>${item.data.channel.name}</b>.`
              );
            } else {
              setBody(`You have a new message`);
            }
          } else if (item.event === 'newOwner') {
            // set Avatar
            if (item.data.requester) {
              setContact(item.data.requester);
            }
            setType('inboxOwner');
            if (
              item.data &&
              item.data.requester &&
              item.data.requester.display &&
              item.data.customer &&
              item.data.customer.display
            ) {
              setBody(
                `<b>${item.data.requester.display}</b> assigned you to a customer chat <b>${item.data.customer.display}</b>.`
              );
            } else {
              setBody(`You have been assigned to chat`);
            }
          } else if (item.event === 'newMention') {
            // set Avatar
            if (item.data.requester) {
              setContact(item.data.requester);
            }
            setType('inboxMention');
            if (
              item.data &&
              item.data.requester &&
              item.data.requester.display &&
              item.data.customer &&
              item.data.customer.display
            ) {
              setBody(
                `<b>${item.data.requester.display}</b> mentioned you in chat <b>${item.data.customer.display}</b>.`
              );
            } else {
              setBody(`You have a new mention in chat comment`);
            }
          }
        }
      } else if (item.type === 'teamchat') {
        // set Avatar
        if (item.data.requester) {
          setContact(item.data.requester);
        }
        if (item.event) {
          if (item.event === 'addMember') {
            setType('teamchatAddMember');
            if (
              item.data &&
              item.data.requester &&
              item.data.requester.display &&
              item.data.channel &&
              item.data.channel.name
            ) {
              setBody(
                `<b>${item.data.requester.display}</b> added you to <b>${item.data.channel.name}</b>.`
              );
            } else {
              setBody('You have been added to channel');
            }
          } else if (item.event === 'newDirectMessage') {
            setType('teamchatDirectMessage');
            const messageCount = (item.data && item.data.newMessage) || 0;
            if (item.data && item.data.requester && item.data.requester.display) {
              setBody(
                `<b>${item.data.requester.display}</b> sent you ${
                  messageCount > 1 ? `${messageCount} message.` : 'a message.'
                }`
              );
            } else {
              setBody('You have a new direct message');
            }
          } else if (item.event === 'newHQMessage') {
            setType('teamchatMessage');
            const messageCount = (item.data && item.data.newMessage) || 0;
            if (item.data && item.data.requester && item.data.requester.display) {
              setBody(
                `<b>${item.data.requester.display}</b> sent ${
                  messageCount > 1 ? messageCount : 'a'
                } message in <b>General Chat</b>.`
              );
            } else {
              setBody('You have a new message in General Chat');
            }
          } else if (item.event === 'newChannelMessage') {
            setType('teamchatMessage');
            const messageCount = (item.data && item.data.newMessage) || 0;
            if (
              item.data &&
              item.data.requester &&
              item.data.requester.display &&
              item.data.channel &&
              item.data.channel.name
            ) {
              setBody(
                `<b>${item.data.requester.display}</b> sent ${
                  messageCount > 1 ? messageCount : 'a'
                } message in <b>${item.data.channel.name}</b>.`
              );
            } else {
              setBody('You have a new message in Channel');
            }
          } else if (item.event === 'newChannelMention') {
            setType('teamchatMention');
            if (
              item.data &&
              item.data.requester &&
              item.data.requester.display &&
              item.data.channel &&
              item.data.channel.name
            ) {
              setBody(
                `<b>${item.data.requester.display}</b> mentioned you in <b>${item.data.channel.name}</b>.`
              );
            } else {
              setBody(`You have a new mention in channel`);
            }
          } else if (item.event === 'newHQMention') {
            setType('teamchatMention');

            if (item.data && item.data.requester && item.data.requester.display) {
              setBody(
                `<b>${item.data.requester.display}</b> mentioned you in <b>General Chat</b>.`
              );
            } else {
              setBody(`You have a new mention in General Chat`);
            }
          } else if (item.event === 'newThread') {
            setType('teamchatNewThread');
            const messageCount = (item.data && item.data.newMessage) || 0;
            if (item.data && item.data.requester && item.data.requester.display) {
              if (
                item.data.recordType === 'channel' &&
                item.data.channel &&
                item.data.channel.name
              ) {
                setBody(
                  `<b>${item.data.requester.display}</b> start a thread in
                     <b>${item.data.channel.name}</b>.`
                );
              } else if (
                item.data.recordType === 'directChannel' &&
                item.data.user &&
                item.data.user.display
              ) {
                setBody(
                  `<b>${item.data.requester.display}</b> start a thread with
                       <b>${item.data.user.display}</b>.`
                );
              } else if (item.data.recordType === 'hq') {
                setBody(
                  `<b>${item.data.requester.display}</b> start a thread in
                         <b>General Chat</b>.`
                );
              }
            } else {
              setBody('You have a new thread message');
            }
          } else if (item.event === 'newThreadChannelMessage') {
            setType('teamchatNewThreadMessage');
            const messageCount = (item.data && item.data.newMessage) || 0;
            if (
              item.data &&
              item.data.requester &&
              item.data.requester.display &&
              item.data.channel &&
              item.data.channel.name
            ) {
              setBody(
                `New replies in the thread ${messageCount > 1 ? `+${messageCount}` : ''} in <b>${
                  item.data.channel.name
                }</b>.`
              );
            } else {
              setBody('You have a new message in thread');
            }
          } else if (item.event === 'newThreadDirectMessage') {
            setType('teamchatNewThreadMessage');
            const messageCount = (item.data && item.data.newMessage) || 0;
            if (
              item.data &&
              item.data.requester &&
              item.data.requester.display &&
              item.data.user &&
              item.data.user.display
            ) {
              setBody(
                `New replies in the thread ${messageCount > 1 ? `+${messageCount}` : ''} with <b>${
                  item.data.user.display
                }</b>.`
              );
            } else {
              setBody('You have a new message in thread');
            }
          } else if (item.event === 'newThreadHQMessage') {
            setType('teamchatNewThreadMessage');
            const messageCount = (item.data && item.data.newMessage) || 0;
            if (
              item.data &&
              item.data.requester &&
              item.data.requester.display &&
              item.data.organization &&
              item.data.organization.name
            ) {
              setBody(
                `New replies in the thread ${messageCount > 1 ? `+${messageCount}` : ''} in <b>${
                  item.data.organization.name
                }</b>.`
              );
            } else {
              setBody('You have a new message in thread');
            }
          }
        }
      } else if (item.type === 'scrumboard' || item.type === 'kanbanboard') {
        // setTitle('Kanban Board');
        // setIcon('heroicons-outline:view-boards');
        // set Avatar
        if (item.data.requester) {
          setContact(item.data.requester);
        }
        if (item.event) {
          if (item.event === 'newCardMember') {
            setType('cardAddMember');
            if (
              item.data &&
              item.data.requester &&
              item.data.requester.display &&
              item.data.card &&
              item.data.card.name
            ) {
              setBody(
                `<b>${item.data.requester.display}</b> added you to <b>${item.data.card.name}</b>.`
              );
            } else {
              setBody('You have been added to card');
            }
          } else if (item.event === 'newCardMention') {
            setType('cardMention');
            if (
              item.data &&
              item.data.requester &&
              item.data.requester.display &&
              item.data.card &&
              item.data.card.name
            ) {
              setBody(
                `<b>${item.data.requester.display}</b> mentioned you on <b>${item.data.card.name}</b>.`
              );
            } else {
              setBody(`You have a new mention in card comment`);
            }
          } else if (item.event === 'newCardDueDate') {
            // format(new Date(chat.lastMessage.createdAt), 'PP')
            // set Avatar
            if (item.data.requester) {
              setContact(item.data.requester);
            }
            setType('cardDueDate');
            if (
              item.data &&
              item.data.requester &&
              item.data.requester.display &&
              item.data.dueDate
            ) {
              setBody(
                `<b>${item.data.requester.display}</b> set due date on <b>${item.data.card.name}</b>.`
              );
            }
          } else if (item.event === 'editCardDueDate') {
            if (item.data.requester) {
              setContact(item.data.requester);
            }
            setType('cardDueDate');
            if (
              item.data &&
              item.data.requester &&
              item.data.requester.display &&
              item.data.card &&
              item.data.card.name &&
              item.data.dueDate
            ) {
              setBody(
                `<b>${item.data.requester.display}</b> changed due date to ${format(
                  new Date(item.data.dueDate),
                  'PP'
                )}</b> on <b>${item.data.card.name}</b> `
              );
            }
          }
        }
      }
    }
  }, [item]);

  return (
    <Card
      className={clsx(
        'flex items-center relative w-full rounded-8 p-14 min-h-64 shadow space-x-8',
        variant === 'success' && 'bg-green-600 text-white',
        variant === 'info' && 'bg-blue-700 text-white',
        variant === 'error' && 'bg-red-600 text-white',
        variant === 'warning' && 'bg-orange-600 text-white',
        className,
        item.isRead ? 'text-[#6c6c6c]' : ''
      )}
      elevation={0}
      component={item.useRouter ? NavLinkAdapter : 'div'}
      role="button"
      onClick={handleRedirect}
    >
      {contact && type && <NotificationAvatar contact={contact} type={type} />}

      <div className="flex flex-col flex-auto pl-7">
        {body && <div className="line-clamp-2" dangerouslySetInnerHTML={{ __html: body }} />}
        {item.createdAt && (
          <Typography
            className={clsx(
              'whitespace-nowra font-medium text-12 mt-8 ',
              item.isRead ? 'text-[#6c6c6c]' : 'text-[#2559C7]'
            )}
          >
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: false })}
          </Typography>
        )}
      </div>

      <IconButton
        disableRipple
        className="top-0 right-0 absolute p-6"
        color="inherit"
        onClick={handleClose}
      >
        <FuseSvgIcon size={16} className="opacity-40" color="inherit">
          heroicons-solid:x
        </FuseSvgIcon>
      </IconButton>

      {!item.isRead && (
        <IconButton disableRipple className="bottom-0 right-0 absolute p-6" color="inherit">
          <FiberManualRecordIcon className=" text-16 text-[#2559C7]" />
        </IconButton>
      )}

      {item.children}
    </Card>
  );
};

export default NotificationCard;

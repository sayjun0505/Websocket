/* eslint-disable no-undef */
import _ from '@lodash';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { Draggable } from 'react-beautiful-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { useMemo, useState } from 'react';
import { Badge, Box, ListItem } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import format from 'date-fns/format';
import { ContactChannelAvatar } from 'app/shared-components/chat';
import { openCardDialog } from '../../store/cardSlice';
import { selectCardById } from '../../store/cardsSlice';
import { selectChatById } from '../../store/chatsSlice';
// import { selectMembers } from '../../store/membersSlice';
import { selectBoard } from '../../store/boardSlice';
import { selectLabels } from '../../store/labelsSlice';

const StyledCard = styled(Card)(({ theme }) => ({
  transitionProperty: 'box-shadow',
  transitionDuration: theme.transitions.duration.short,
  transitionTimingFunction: theme.transitions.easing.easeInOut,
}));

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  '&.active': {
    backgroundColor: theme.palette.background.default,
  },
  '&.label': {
    borderRadius: 6,
  },
}));

const BoardCardCompactView = (props) => {
  const { cardId, index } = props;
  // console.log('[BoardCard] card id:  ', cardId);
  const dispatch = useDispatch();
  const board = useSelector(selectBoard);
  const card = useSelector((state) => selectCardById(state, cardId));
  const chat = useSelector((state) => selectChatById(state, card?.chatId));
  const [channelName, setChannelName] = useState('');
  const [lastMessageText, setLastMessageText] = useState('');
  const [customerName, setCustomerName] = useState('');
  const labels = useSelector(selectLabels);
  // const members = useSelector(selectMembers);
  // const commentsCount = getCommentsCount(card);
  // const cardCoverImage = _.find(card.attachments, { id: card.attachmentCoverId });

  /* A placeholder for the actual comments count. */
  const [commentsCount, setCommentsCount] = useState(0);
  const [cardCoverImage, setCardCoverImage] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useMemo(() => {
    if (card) {
      setCommentsCount(getCommentsCount(card));
      setCardCoverImage(_.find(card.attachments, { id: card.attachmentCoverId }));
    }
    if (chat) {
      const { lastMessage } = chat;
      if (lastMessage && lastMessage.data && lastMessage.type) {
        if (lastMessage.type === 'text') {
          const lastMsgObj = JSON.parse(lastMessage.data);
          const { text } = lastMsgObj;
          setLastMessageText(text);
          if (text.length > 30) {
            setLastMessageText(`${text.substring(0, 30)}...`);
          } else {
            setLastMessageText(text.substring(0, 30));
          }
        } else if (lastMessage.type === 'sticker') {
          setLastMessageText('Sticker');
        } else if (lastMessage.type === 'image') {
          setLastMessageText('Image');
        } else {
          setLastMessageText('Unknown type');
        }
      }

      if (chat.channel) {
        if (chat.channel.channel === 'line' && chat.channel.line)
          setChannelName(chat.channel.line.name);
        if (chat.channel.channel === 'facebook' && chat.channel.facebook)
          setChannelName(chat.channel.facebook.name);
      }
      if (chat.customer.firstname && chat.customer.lastname) {
        if (`${chat.customer.firstname} ${chat.customer.lastname}` > 10) {
          setCustomerName(
            `${`${chat.customer.firstname} ${chat.customer.lastname}`.substring(0, 7)}...`
          );
        } else {
          setCustomerName(`${chat.customer.firstname} ${chat.customer.lastname}`.substring(0, 10));
        }
      } else if (chat.customer.display.length > 10) {
        setCustomerName(`${chat.customer.display.substring(0, 7)}...`);
      } else {
        setCustomerName(chat.customer.display.substring(0, 10));
      }
    }
  }, [card, chat]);

  function handleCardClick(ev, _card) {
    ev.preventDefault();
    dispatch(openCardDialog(_card));
  }

  function getCommentsCount(_card) {
    return _.sum(_card.activities.map((x) => (x.type === 'comment' ? 1 : 0)));
  }

  if (!card) return null;

  return (
    <Draggable draggableId={cardId} index={index} type="card">
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <StyledCard
            className={clsx(
              snapshot.isDragging ? 'shadow-lg' : 'shadow',
              'w-full mb-8 rounded-lg cursor-pointer'
            )}
            onClick={(ev) => handleCardClick(ev, card)}
          >
            {chat ? (
              <div className="flex flex-wrap -mx-4">
                <StyledListItem
                  // button
                  className="flex items-center px-20 py-5 min-h-92 w-full"
                  // active={routeParams.id === chat.id ? 1 : 0}
                  // component={NavLinkAdapter}
                  // to={`/apps/chat/${chat.id}`}
                  // end
                  // activeClassName="active"
                  // onClick={() => {}}
                >
                  <div className="flex items-center flex-col w-full">
                    <div className="flex items-center flex-row w-full space-x-10">
                      <ContactChannelAvatar contact={chat.customer} channel={chat.channel} />
                      <div className="flex flex-col grow">
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
                            {chat.lastMessage.createdAt &&
                              format(new Date(chat.lastMessage.createdAt), 'dd/MM/yy')}
                          </Typography>
                        </div>
                        <div className="flex justify-items-start">
                          <Typography variant="body2" className="text-desc">
                            {lastMessageText}
                          </Typography>
                        </div>
                        <div className="flex justify-between space-x-4">
                          <div className="flex justify-items-start">
                            {card.attachments && (
                              <span className="flex items-center space-x-2">
                                <FuseSvgIcon size={16} color="action">
                                  heroicons-outline:paper-clip
                                </FuseSvgIcon>
                                <Typography className="" color="text.secondary">
                                  {card.attachments.length}
                                </Typography>
                              </span>
                            )}
                            {commentsCount > 0 && (
                              <span className="flex items-center space-x-2">
                                <FuseSvgIcon size={16} color="action">
                                  heroicons-outline:chat
                                </FuseSvgIcon>

                                <Typography className="" color="text.secondary">
                                  {commentsCount}
                                </Typography>
                              </span>
                            )}
                          </div>
                          <div className="items-center flex flex-row space-x-6">
                            {Boolean(chat.newMention) && (
                              <Box
                                sx={{
                                  backgroundColor: 'red',
                                  color: 'secondary.contrastText',
                                }}
                                className="flex items-center justify-center min-w-18 h-18 rounded-full font-medium text-10 text-center"
                              >
                                {chat.newMention && '@'}
                              </Box>
                            )}
                            {/* {Boolean(chat.unread) && (
                              <Box
                                sx={{
                                  backgroundColor: 'secondary.main',
                                  color: 'secondary.contrastText',
                                }}
                                className="flex items-center justify-center min-w-18 h-18 rounded-full font-medium text-10 text-center"
                              >
                                {chat.unread}
                              </Box>
                            )} */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </StyledListItem>
              </div>
            ) : (
              <div className="flex flex-wrap -mx-4">
                <div className="flex items-center px-20 py-5 min-h-92 w-full">
                  <div className="flex items-center flex-col w-full">
                    <div
                      className={clsx(
                        'flex items-center flex-row w-full',
                        board.settings.cardCoverImages && cardCoverImage ? 'space-x-10' : null
                      )}
                    >
                      <Badge className="">
                        {board.settings.cardCoverImages && cardCoverImage ? (
                          <img
                            className="w-[48px] h-[48px] rounded-2"
                            src={cardCoverImage.src}
                            alt="card cover"
                          />
                        ) : null}
                      </Badge>
                      <div className="flex flex-col grow w-5/6">
                        <div className="flex justify-items-start">
                          <Typography
                            variant="subtitle1"
                            className="truncate font-600 text-16"
                            color="text.primary"
                          >
                            {card?.title}
                          </Typography>
                        </div>
                        <div className="flex justify-items-center">
                          <Typography
                            variant="body2"
                            className="truncate my-2 font-400 text-14 text-desc"
                          >
                            {card?.description}
                          </Typography>
                        </div>
                        <div className="flex justify-items-start space-x-4">
                          {card.attachments && (
                            <span className="flex items-center space-x-2">
                              <FuseSvgIcon size={16} color="action">
                                heroicons-outline:paper-clip
                              </FuseSvgIcon>
                              <Typography className="" color="text.secondary">
                                {card.attachments.length}
                              </Typography>
                            </span>
                          )}
                          {commentsCount > 0 && (
                            <span className="flex items-center space-x-2">
                              <FuseSvgIcon size={16} color="action">
                                heroicons-outline:chat
                              </FuseSvgIcon>

                              <Typography className="" color="text.secondary">
                                {commentsCount}
                              </Typography>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </StyledCard>
        </div>
      )}
    </Draggable>
  );
};

export default BoardCardCompactView;

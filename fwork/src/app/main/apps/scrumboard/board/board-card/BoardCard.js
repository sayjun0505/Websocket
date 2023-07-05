import _ from '@lodash';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { Draggable } from 'react-beautiful-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { useMemo, useState } from 'react';
import { AvatarGroup } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Chip from '@mui/material/Chip';
import Popover from '@mui/material/Popover';
import { ContactAvatar } from 'app/shared-components/chat';
import { openCardDialog } from '../../store/cardSlice';
import { selectCardById } from '../../store/cardsSlice';
import { selectChatById } from '../../store/chatsSlice';
import BoardCardLabel from './BoardCardLabel';
import { selectMembers } from '../../store/membersSlice';
import BoardCardDueDate from './BoardCardDueDate';
import BoardCardCheckItems from './BoardCardCheckItems';
import ChatCardItem from '../board-chat/ChatCardItem';
import { selectBoard } from '../../store/boardSlice';
import { selectLabels } from '../../store/labelsSlice';
import MoreLabel from './MoreLabel';

const StyledCard = styled(Card)(({ theme }) => ({
  transitionProperty: 'box-shadow',
  transitionDuration: theme.transitions.duration.short,
  transitionTimingFunction: theme.transitions.easing.easeInOut,
}));

const BoardCard = (props) => {
  const { cardId, index } = props;
  // console.log('[BoardCard] card id:  ', cardId);
  const dispatch = useDispatch();
  const board = useSelector(selectBoard);
  const card = useSelector((state) => selectCardById(state, cardId));
  const chat = useSelector((state) => selectChatById(state, card?.chatId));
  const labels = useSelector(selectLabels);
  const members = useSelector(selectMembers);
  const [commentsCount, setCommentsCount] = useState(0);
  const [cardCoverImage, setCardCoverImage] = useState(null);
  const [moreLabel, setMoreLabel] = useState([]);
  const [label, setLabel] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  useMemo(() => {
    if (card) {
      setCommentsCount(getCommentsCount(card));
      setCardCoverImage(_.find(card.attachments, { id: card.attachmentCoverId }));

      if (card.labels.length > 0) {
        const label1 = [];
        const label2 = [];
        console.log(card);
        card.labels.forEach((element, num) => {
          if (num < 3) {
            label1.push(element);
          } else {
            label2.push(element);
          }
        });
        setLabel(label1);
        setMoreLabel(label2);
      } else {
        setLabel([]);
        setMoreLabel([]);
      }
    }
  }, [card]);

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
              'w-full mb-12 rounded-lg cursor-pointer'
            )}
            onClick={(ev) => handleCardClick(ev, card)}
          >
            {board.settings.cardCoverImages && cardCoverImage && (
              <img className="block" src={cardCoverImage.src} alt="card cover" />
            )}

            {chat && (
              <div className="flex flex-wrap -mx-4">
                <ChatCardItem chat={chat} />
              </div>
            )}

            <div
              className={clsx('px-16', card.title || card.description ? 'pt-16' : 'pt-0')}
              id={card.id}
            >
              <Typography className="font-600 text-16">{card?.title}</Typography>
              <Typography className="my-2 font-400 text-14 text-desc line-clamp-2">
                {card?.description}
              </Typography>

              {(card.dueDate || card.checklists.length > 0) && (
                <div className="flex items-center -mx-4 mb-5">
                  <BoardCardDueDate dueDate={card.dueDate} />

                  <BoardCardCheckItems card={card} />
                </div>
              )}

              <div className="flex flex-wrap -mx-4">
                {label.length > 0 && label.map((id) => <BoardCardLabel id={id} key={id} />)}
                {moreLabel && moreLabel.length > 0 && (
                  <>
                    <Chip
                      id="morecardlabel-button"
                      size="small"
                      className="w-min my-1 rounded text-20 text-white bg-gray"
                      label="+"
                      aria-describedby={open ? 'morecardlabel-popover' : undefined}
                      onMouseEnter={handlePopoverOpen}
                    />
                    <Popover
                      id="morecardlabel-popover"
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
                      {moreLabel.map((id) => {
                        return <MoreLabel id={id} key={id} />;
                      })}
                    </Popover>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-between h-48 px-16">
              <div className="flex items-center space-x-4">
                {/* {card.subscribed && (
                  <FuseSvgIcon size={16} color="action">
                    heroicons-outline:eye
                  </FuseSvgIcon>
                )}

                {card.description !== '' && (
                  <FuseSvgIcon size={16} color="action">
                    heroicons-outline:document-text
                  </FuseSvgIcon>
                )} */}

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

              <div className="flex items-center justify-end space-x-12">
                {card.memberIds.length > 0 && (
                  <div className="flex justify-start">
                    <AvatarGroup max={3} classes={{ avatar: 'w-24 h-24 text-12' }}>
                      {card.memberIds.map((id) => {
                        const member = _.find(members, { id });
                        if (!member) return null;
                        return (
                          <Tooltip title={member.display} key={id}>
                            <ContactAvatar key={index} contact={member} />
                          </Tooltip>
                        );
                      })}
                    </AvatarGroup>
                  </div>
                )}
              </div>
            </div>
          </StyledCard>
        </div>
      )}
    </Draggable>
  );
};

export default BoardCard;

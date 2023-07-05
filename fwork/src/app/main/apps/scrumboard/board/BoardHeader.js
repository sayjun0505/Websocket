import { useDispatch, useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { setCompactView } from '../store/boardsSlice';
import BoardTitle from './BoardTitle';

const BoardHeader = (props) => {
  const dispatch = useDispatch();
  const { isCompactView } = useSelector(({ scrumboardApp }) => scrumboardApp.boards);
  return (
    <div className="p-24 sm:p-32 w-full border-b-1 flex flex-col sm:flex-row items-center justify-between container">
      <div className="flex items-center mb-12 sm:mb-0">
        <BoardTitle />
      </div>

      <div className="flex items-center justify-end space-x-12">
        <Button
          className="whitespace-nowrap px-10"
          onClick={() => dispatch(setCompactView(!isCompactView))}
          startIcon={
            <FuseSvgIcon className="text-48" size={20}>material-outline:view_agenda</FuseSvgIcon>
          }
        >
          View
        </Button>

        <Button
          className="whitespace-nowrap px-10"
          component={NavLinkAdapter}
          to="/apps/kanbanboard/boards/"
          startIcon={<FuseSvgIcon size={20}>heroicons-outline:view-boards</FuseSvgIcon>}
        >
          Boards
        </Button>

        <Button
          className="whitespace-nowrap"
          variant="contained"
          color="secondary"
          onClick={() => props.onSetSidebarOpen(true)}
          startIcon={<FuseSvgIcon size={20}>heroicons-outline:cog</FuseSvgIcon>}
        >
          Settings
        </Button>
      </div>
    </div>
  );
};

export default BoardHeader;

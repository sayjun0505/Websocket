import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useContext } from 'react';
import ChatAppContext from './ChatAppContext';

const ChatFirstScreen = () => {
  const { setMainSidebarOpen } = useContext(ChatAppContext);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

  return (
    <div className="flex flex-col flex-1 items-center justify-center w-full p-24">
      <FuseSvgIcon className="icon-size-128 mb-16" color="disabled">
        heroicons-outline:chat
      </FuseSvgIcon>

      {isMobile ? (
        <Button
          variant="contained"
          color="secondary"
          className="flex "
          onClick={() => setMainSidebarOpen(true)}
        >
          Select a conversation or start a new chat
        </Button>
      ) : (
        <Typography
          className="flex text-20 font-semibold tracking-tight text-secondary"
          color="text.secondary"
        >
          Select a conversation or start a new chat
        </Typography>
      )}

    </div>
  );
};

export default ChatFirstScreen;

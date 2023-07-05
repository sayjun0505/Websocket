import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useContext } from 'react';
import TeamChatAppContext from './TeamChatAppContext';

const TeamChatFirstScreen = () => {
  const { setMainSidebarOpen } = useContext(TeamChatAppContext);
  return (
    <div className="flex flex-col flex-1 items-center justify-center w-full p-24">
      <FuseSvgIcon className="icon-size-128 mb-16" color="disabled">
        heroicons-outline:chat
      </FuseSvgIcon>
      <Typography
        className="hidden lg:flex text-20 font-semibold tracking-tight text-secondary"
        color="text.secondary"
      >
        Select a channel or user
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        className="flex lg:hidden"
        onClick={() => setMainSidebarOpen(true)}
      >
        Select a channel or user
      </Button>
    </div>
  );
};

export default TeamChatFirstScreen;

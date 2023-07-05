import { useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { Box, IconButton, Toolbar, Typography } from '@mui/material';
import clsx from 'clsx';

import { lighten } from '@mui/material/styles';

import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ChatAppContext from './ChatAppContext';
import CommentSidebar from './sidebars/comment/CommentSidebar';
import CustomerSidebar from './sidebars/customer/CustomerSidebar';
const RightSidebarContent = (props) => {
  const dispatch = useDispatch();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

  const { customerSidebarOpen, commentSidebarOpen, handleRightSidebarClose } =
    useContext(ChatAppContext);

  return (
    <Box
      sx={{ bgcolor: 'background.paper' }}
      className={clsx(isMobile ? 'w-[333px] flex grow' : 'w-[399px] flex grow', 'h-full')}
    >
      <div className="flex flex-col flex-auto justify-between w-[333px]">
        <Box
          className="border-b-1"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? lighten(theme.palette.background.default, 0.4)
                : lighten(theme.palette.background.default, 0.02),
          }}
        >
          <Toolbar className="flex items-center justify-between px-10">
            <div className="flex flex-row justify-start space-x-5 items-center">
              <Typography className="px-4 font-medium text-16" color="inherit" variant="subtitle1">
                {customerSidebarOpen && <>Customer</>}
                {commentSidebarOpen && <>Comment</>}
              </Typography>
            </div>
            <IconButton color="inherit" size="large" onClick={handleRightSidebarClose}>
              <FuseSvgIcon>heroicons-outline:x</FuseSvgIcon>
            </IconButton>
          </Toolbar>
        </Box>
        {customerSidebarOpen ? <CustomerSidebar /> : null}
        {commentSidebarOpen ? <CommentSidebar /> : null}
      </div>
    </Box>
  );
};

export default RightSidebarContent;

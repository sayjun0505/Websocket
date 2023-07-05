import { useState } from 'react';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { AppBar, Box, Tab, Tabs, Typography } from '@mui/material';
import { lighten } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import clsx from 'clsx';

import SwipeableViews from 'react-swipeable-views';
import PropTypes from 'prop-types';

import TabChatList from './TabChatList';
import TabHistoryList from './TabHistoryList';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 0 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};
TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};
function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const MainSidebar = (props) => {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [tabPosition, setTabPosition] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabPosition(newValue);
  };
  const handleTabChangeIndex = (index) => {
    setTabPosition(index);
  };

  return (
    <Box sx={{ bgcolor: 'background.paper' }} className={clsx(isMobile ? 'w-[333px]' : 'w-full')}>
      <AppBar position="static">
        <Tabs
          value={tabPosition}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="chat and history tabs"
          sx={{
            padding: '0px',
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? lighten(theme.palette.background.default, 0.4)
                : lighten(theme.palette.background.default, 0.02),
          }}
        >
          <Tab
            icon={
              <FuseSvgIcon color="inherit" size={20} {...a11yProps(0)}>
                material-outline:chat
              </FuseSvgIcon>
            }
            {...a11yProps(0)}
          />
          <Tab
            icon={
              <FuseSvgIcon color="inherit" size={20} {...a11yProps(1)}>
                material-outline:history
              </FuseSvgIcon>
            }
            {...a11yProps(1)}
          />
        </Tabs>
      </AppBar>
      <SwipeableViews index={tabPosition} onChangeIndex={handleTabChangeIndex}>
        <TabPanel value={tabPosition} index={0}>
          <TabChatList />
        </TabPanel>
        <TabPanel value={tabPosition} index={1}>
          <TabHistoryList />
        </TabPanel>
      </SwipeableViews>
    </Box>
  );
};

export default MainSidebar;

import { useDispatch, useSelector } from 'react-redux';
import _ from '@lodash';
import { motion } from 'framer-motion';
import FuseLoading from '@fuse/core/FuseLoading';
import { Typography } from '@mui/material';
import withReducer from 'app/store/withReducer';
import reducer from './store';
import { getSummary, selectWidgetsEntities, getSummaryforSocket } from './store/widgetsSlice';

import WidgetPackage from './widgets/WidgetPackage';
import WidgetOpenChat from './widgets/WidgetOpenChat';
import WidgetAllChat from './widgets/WidgetAllChat';
import WidgetChatHQ from './widgets/WidgetChatHQ';
import WidgetChannels from './widgets/WidgetChannels';
import WidgetComments from './widgets/WidgetComments';
import WidgetInbox from './widgets/WidgetInbox';
import WidgetKanbanBoards from './widgets/WidgetKanbanBoards';
import WidgetTasks from './widgets/WidgetTasks';
import WidgetUsers from './widgets/WidgetUsers';
import WidgetTotalCustomer from './widgets/WidgetTotalCustomer';
import WidgetResolvedChats from './widgets/WidgetResolvedChats';
import UnifiedChatInboxWidget from './widgets/UnifiedChatInboxWidget';
import { useEffect, useContext, useState } from 'react';
import { SocketContext } from '../../../context/socket';

const AnalyticsDashboardApp = () => {
  const dispatch = useDispatch();
  const widgets = useSelector(selectWidgetsEntities);
  const [isLoading, setIsLoading] = useState(true);
  const socket = useContext(SocketContext);
  const organization = window.localStorage.getItem('organization');
  
  const user = useSelector(state => { return state.user });

  useEffect(() => {
    socket.on("getSummary response", res => {
      dispatch(getSummaryforSocket(res))
      setIsLoading(false)
    })
  }, [socket])

  useEffect(() => {
    socket.emit("getSummary", {reqid:user.uuid, orgId:JSON.parse(organization).organizationId});
  }, [dispatch]);

  if (_.isEmpty(widgets)) {
    return null;
  }

  const container = {
    show: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="flex w-full h-full items-center">
        <FuseLoading />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* <Widget1 data={widgets.widget1} /> */}
      <div className="flex flex-col items-center pt-32 justify-center ">
        <Typography className="text-32 font-700 text-gray-500 ">FoxConnect</Typography>
        <Typography className="text-18 foct-300 text-gray-500">FoxConnect Team</Typography>
      </div>
      <motion.div
        className="flex flex-col md:flex-row sm:p-8 container"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <div className="flex flex-col w-full">
          <motion.div variants={item}>
            <WidgetUsers data={widgets.users} />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-24 w-full min-w-0 p-24">
            <motion.div variants={item}>
              <WidgetChatHQ data={widgets.chatHq} />
            </motion.div>

            <motion.div variants={item}>
              <WidgetInbox />
            </motion.div>

            <motion.div variants={item}>
              <WidgetComments data={widgets.comments} />
            </motion.div>

            <motion.div variants={item}>
              <WidgetChannels data={widgets.channels} />
            </motion.div>

            <motion.div variants={item}>
              <WidgetKanbanBoards data={widgets.kanbanBoards} />
            </motion.div>

            <motion.div variants={item}>
              <WidgetTasks data={widgets.tasks} />
            </motion.div>

            {/* <motion.div variants={item} className="sm:col-span-2 md:col-span-4">
              <UnifiedChatIndoxWidget />
            </motion.div> */}

            {/* <motion.div variants={item} >
                <WidgetIncomingMessage data={widgets.messageToday} />
              </motion.div> */}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-24 w-full min-w-0 p-24">
            <motion.div variants={item} className="sm:col-span-2 md:col-span-4">
              <WidgetPackage />
            </motion.div>

            <motion.div variants={item}>
              <WidgetAllChat data={widgets.allChat} />
            </motion.div>

            <motion.div variants={item}>
              <WidgetTotalCustomer data={widgets.contacts} />
            </motion.div>

            <motion.div variants={item}>
              <WidgetOpenChat data={widgets.openChat} />
            </motion.div>

            <motion.div variants={item}>
              <WidgetResolvedChats data={widgets.resolvedChats} />
            </motion.div>

            {/* <motion.div variants={item}>
              <WidgetAllMessage data={widgets.allMessage} />
            </motion.div> */}

            <motion.div variants={item} className="sm:col-span-2 md:col-span-4">
              <UnifiedChatInboxWidget
                data={widgets.inboxSummary}
                messageToday={widgets.messageToday}
              />
            </motion.div>

            {/* <motion.div variants={item} >
                <WidgetIncomingMessage data={widgets.messageToday} />
              </motion.div> */}
          </div>
          {/* </div> */}

          {/* <div className="flex flex-1 flex-col min-w-0 pt-16"> */}
          {/* <Typography
            component={motion.div}
            variants={item}
            className="px-16 pb-8 text-18 font-medium"
            color="textSecondary"
          >
            How are your active users trending over time?
          </Typography> */}

          {/* <div className="flex flex-col sm:flex sm:flex-row pb-32">
              <motion.div variants={item} className="widget flex w-full sm:w-1/3 p-16">
                <WidgetAllChat data={widgets.allChat} />
              </motion.div>

              <motion.div variants={item} className="widget flex w-full sm:w-1/3 p-16">
                <WidgetOpenChat data={widgets.openChat} />
              </motion.div>

              <motion.div variants={item} className="widget flex w-full sm:w-1/3 p-16">
                <WidgetAllUser data={widgets.allUser} />
              </motion.div>
            </div> */}
          {/* </div> */}
        </div>

        {/* <div className="flex flex-wrap w-full md:w-320 pt-16"> */}
        {/* <div className="mb-32 w-full sm:w-1/2 md:w-full"> */}
        {/* <Typography
              component={motion.div}
              variants={item}
              className="px-16 pb-8 text-18 font-medium"
              color="textSecondary"
            >
              What are your top devices?
            </Typography>

            <motion.div variants={item} className="widget w-full p-16">
              <Widget7 data={widgets.widget7} />
            </motion.div> */}
        {/* <motion.div variants={item} className="widget flex w-full p-12">
              <WidgetNow />
            </motion.div>
          </div> */}

        {/* <div className="mb-32 w-full sm:w-1/2 md:w-full">
            <Typography
              component={motion.div}
              variants={item}
              className="px-16 pb-8 text-18 font-medium"
              color="textSecondary"
            >
              How are your sales?
            </Typography>

            <motion.div variants={item} className="widget w-full p-16">
              <Widget8 data={widgets.widget8} />
            </motion.div>
          </div>

          <div className="mb-32 w-full sm:w-1/2 md:w-full">
            <Typography
              component={motion.div}
              variants={item}
              className="px-16 pb-8 text-18 font-medium lg:pt-0"
              color="textSecondary"
            >
              What are your top campaigns?
            </Typography>
            <motion.div variants={item} className="widget w-full p-16">
              <Widget9 data={widgets.widget9} />
            </motion.div>
          </div> */}
        {/* </div> */}
      </motion.div>
    </div>
  );
};

export default withReducer('DashboardApp', reducer)(AnalyticsDashboardApp);

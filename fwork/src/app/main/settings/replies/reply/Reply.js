import FuseLoading from '@fuse/core/FuseLoading';
import FusePageCarded from '@fuse/core/FusePageCarded';
import { useDeepCompareEffect } from '@fuse/hooks';
import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import withReducer from 'app/store/withReducer';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import _ from '@lodash';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { selectPermission } from 'app/store/permissionSlice';
import { getReply, newReply, resetReply, selectReply } from '../store/replySlice';
import reducer from '../store';
import ReplyHeader from './ReplyHeader';
import InformationTab from './tabs/InformationTab';
import KeywordsTab from './tabs/KeywordsTab';
import ResponsesTab from './tabs/ResponsesTab';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
  name: yup
    .string()
    .required('You must enter a reply name')
    .min(5, 'The reply name must be at least 5 characters'),
});

function Reply(props) {
  const dispatch = useDispatch();
  const reply = useSelector(selectReply);
  const permission = useSelector(selectPermission);
  const navigate = useNavigate();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

  const routeParams = useParams();
  const [tabValue, setTabValue] = useState(0);
  const [noReply, setNoReply] = useState(false);
  const methods = useForm({
    mode: 'onChange',
    defaultValues: {},
    resolver: yupResolver(schema),
  });
  const { reset, watch, control, onChange, formState } = methods;
  const form = watch();
  // const replyType = watch('type');
  // const replyEvent = watch('event');

  useDeepCompareEffect(() => {
    function updateReplyState() {
      const { id } = routeParams;
      // console.log('[Reply] id ', id);
      if (id === 'new') {
        /**
         * Create New Reply data
         */
        dispatch(newReply());
      } else {
        /**
         * Get Reply data
         */
        dispatch(getReply(id)).then((action) => {
          /**
           * If the requested reply is not exist show message
           */
          if (!action.payload) {
            setNoReply(true);
          }
        });
      }
    }

    updateReplyState();
  }, [dispatch, routeParams]);

  useEffect(() => {
    if (!reply) {
      return;
    }
    /**
     * Reset the form on reply state changes
     */
    reset(reply);
  }, [reply, reset]);

  useEffect(() => {
    return () => {
      /**
       * Reset Reply on component unload
       */
      dispatch(resetReply());
      setNoReply(false);
    };
  }, [dispatch]);

  useEffect(() => {
    if (routeParams.id === 'new') {
      if (permission && permission.reply && !permission.reply.create) {
        navigate('/settings/replies');
      }
    } else if (permission && permission.customer && !permission.reply.update) {
      navigate(-1);
    }
  }, [permission]);

  /**
   * Tab Change
   */
  function handleTabChange(event, value) {
    setTabValue(value);
  }

  /**
   * Show Message if the requested replies is not exists
   */
  if (noReply) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <Typography color="text.secondary" variant="h5">
          There is no such reply!
        </Typography>
        <Button
          className="mt-24"
          component={Link}
          variant="outlined"
          to="/setting/replies"
          color="inherit"
        >
          Go to Replies Page
        </Button>
      </motion.div>
    );
  }

  /**
   * Wait while reply data is loading and form is setted
   */
  if (_.isEmpty(form) || (reply && routeParams.id !== reply.id && routeParams.id !== 'new')) {
    return <FuseLoading />;
  }

  return (
    <FormProvider {...methods}>
      <FusePageCarded
        header={<ReplyHeader />}
        content={
          <>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="secondary"
              textColor="secondary"
              variant="scrollable"
              scrollButtons="auto"
              classes={{ root: 'w-full h-64 border-b-1' }}
            >
              <Tab className="h-64" label="Reply Info" />
              <Tab
                className="h-64"
                label="Keywords"
                disabled={
                  form &&
                  form.type &&
                  (form.type === 'quick' || (form.type === 'auto' && form.event === 'welcome'))
                }
              />
              <Tab className="h-64" label="Responses" />
            </Tabs>
            <div className="p-16 sm:p-24 max-w-3xl">
              <div className={tabValue !== 0 ? 'hidden' : ''}>
                <InformationTab />
              </div>

              <div className={tabValue !== 1 ? 'hidden' : ''}>
                <KeywordsTab />
              </div>

              <div className={tabValue !== 2 ? 'hidden' : ''}>
                <ResponsesTab />
              </div>
            </div>
          </>
        }
        scroll={isMobile ? 'normal' : 'content'}
      />
    </FormProvider>
  );
}

export default withReducer('repliesSetting', reducer)(Reply);

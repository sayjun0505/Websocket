import FuseLoading from '@fuse/core/FuseLoading';
import FusePageCarded from '@fuse/core/FusePageCarded';
import { useDeepCompareEffect } from '@fuse/hooks';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import _ from '@lodash';
import * as yup from 'yup';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { selectPermission } from 'app/store/permissionSlice';

import {
  getAutoReply,
  newAutoReply,
  resetAutoReply,
  selectAutoReply,
} from '../../store/autoReplySlice';
import AutoReplyHeader from './AutoReplyHeader';
import AutoReplyContent from './AutoReplyContent';
// import InformationTab from '../../replies/reply/tabs/InformationTab';
// import KeywordsTab from '../../replies/reply/tabs/KeywordsTab';
// import ResponsesTab from '../../replies/reply/tabs/ResponsesTab';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
  name: yup
    .string()
    .required('You must enter a reply name')
    .min(5, 'The reply name must be at least 5 characters'),
});

const AutoReply = (props) => {
  const dispatch = useDispatch();
  const reply = useSelector(selectAutoReply);
  const permission = useSelector(selectPermission);
  const navigate = useNavigate();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {},
    resolver: yupResolver(schema),
  });

  const routeParams = useParams();
  const [noReply, setNoReply] = useState(false);

  const { watch, reset } = methods;
  const form = watch();

  useDeepCompareEffect(() => {
    function updateReplyState() {
      const { id } = routeParams;
      // console.log('🤖 Auto Reply id ', id);
      if (id === 'new') {
        dispatch(newAutoReply());
      } else {
        dispatch(getAutoReply(id)).then((action) => {
          if (!action.payload) {
            setNoReply(true);
          }
        });
      }
    }

    updateReplyState();
  }, [dispatch, routeParams]);

  useEffect(() => {
    return () => {
      dispatch(resetAutoReply());
      setNoReply(false);
    };
  }, [dispatch]);

  useEffect(() => {
    if (routeParams.id === 'new') {
      if (permission && permission.reply && !permission.reply.create) {
        navigate('/settings/auto-reply');
      }
    } else if (permission && permission.customer && !permission.reply.update) {
      navigate(-1);
    }
  }, [navigate, permission, routeParams.id]);

  useEffect(() => {
    if (reply) {
      // console.log('🤖 Auto Reply ', reply);
      reset(reply);
    }
  }, [reply, reset]);

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
          There is no such auto reply!
        </Typography>
        <Button
          className="mt-24"
          component={Link}
          variant="outlined"
          to="/setting/auto-reply"
          color="inherit"
        >
          Go to Auto Replies Page
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
        header={<AutoReplyHeader />}
        content={<AutoReplyContent />}
        scroll={isMobile ? 'normal' : 'content'}
      />
    </FormProvider>
  );
};

export default AutoReply;

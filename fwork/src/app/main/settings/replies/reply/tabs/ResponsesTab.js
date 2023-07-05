// import FuseLoading from '@fuse/core/FuseLoading';
import { motion } from 'framer-motion';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { useFieldArray, useFormContext } from 'react-hook-form';
// import { updateData } from '../../store/replySlice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import ResponseEditor from './components/ResponseEditor';

const responseLimit = 2;

const ResponsesTab = (props) => {
  const dispatch = useDispatch();
  const methods = useFormContext();
  const { control, formState } = methods;
  const { errors } = formState;
  const { fields, append, prepend, swap, remove } = useFieldArray({ name: 'response', control });
  const { watch } = methods;
  const watchResponse = watch('response');

  const userId = useSelector(({ user }) => user.uuid);
  const foxOrganization = useSelector(({ organization }) => organization.organization);

  const [responses, setResponses] = useState([]);

  useEffect(() => {
    // console.log('[watchResponse] ', watchResponse);
    // console.log('[fields] ', fields);
  }, [watchResponse]);

  function addNewResponse() {
    const order = fields.length + 1;
    append({
      data: null,
      channel: 'default',
      type: 'text',
      order,
      organization: { id: foxOrganization.id },
      createdBy: { id: userId },
    });
  }

  return (
    <div className="flex w-full flex-col mt-8 mb-16">
      {watchResponse && watchResponse.length > 0 ? (
        <>
          {watchResponse.map((el, index) => {
            if (!el) return null;
            return <ResponseEditor response={el} key={el.id} index={index} />;
          })}
          <Button
            fullWidth
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            disabled={watchResponse.length > responseLimit - 1}
            onClick={() => {
              addNewResponse();
            }}
          >
            Add
          </Button>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.1 } }}
          className="flex flex-col flex-1 items-center justify-center h-full"
        >
          <Typography color="textSecondary" variant="h5">
            There is no Response!
          </Typography>
          <Button
            className="m-12"
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            disabled={watchResponse.length > responseLimit - 1}
            onClick={() => {
              addNewResponse();
            }}
          >
            Add new Response
          </Button>
        </motion.div>
      )}
    </div>
  );
};
export default ResponsesTab;

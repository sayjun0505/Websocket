import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useDispatch, useSelector } from 'react-redux';

import { useCallback, useEffect } from 'react';
import * as yup from 'yup';
import _ from '@lodash';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
// import { closeCustomerSidebar } from '../../store/sidebarsSlice';
import { selectCustomer, updateCustomer } from '../../store/customerSlice';
import { selectChat } from '../../store/chatSlice';

const defaultValues = {
  id: null,
  firstname: '',
  lastname: '',
  display: '',
  email: '',
  tel: '',
  remarks: '',
  channel: '',
  uid: '',
  createdAt: new Date(),
  updatedAt: new Date(),
};
const schema = yup.object().shape({
  display: yup.string().required('You must enter a display name'),
  // firstname: yup.string().required('You must enter a firstname'),
  // lastname: yup.string().required('You must enter a lastname'),
  // email: yup.string().required('You must enter a Email'),
});

const Information = () => {
  const dispatch = useDispatch();
  const chat = useSelector(selectChat);
  const customer = useSelector(selectCustomer);

  const { control, watch, reset, handleSubmit, formState, getValues } = useForm({
    mode: 'onChange',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;

  /**
   * Initialize Dialog with Data
   */
  const initDialog = useCallback(() => {
    if (chat && customer) {
      reset({ ...customer });
    }
  }, [chat, customer, reset]);

  useEffect(() => {
    if (chat) {
      initDialog();
    } else {
      reset({ ...defaultValues });
    }
  }, [initDialog, chat]);

  /**
   * Form Submit
   */
  function onSubmit(data) {
    /* Updating the customer information. */
    if (customer) {
      dispatch(updateCustomer({ ...customer, ...data }));
    }
    // dispatch(closeCustomerSidebar());
  }

  return (
    <div className="flex flex-col relative w-full p-24">
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="flex">
          <Controller
            control={control}
            name="firstname"
            render={({ field }) => (
              <TextField
                {...field}
                className="mb-24"
                label="Firstname"
                id="firstName"
                variant="outlined"
                fullWidth
              />
            )}
          />
        </div>

        <div className="flex">
          <Controller
            control={control}
            name="lastname"
            render={({ field }) => (
              <TextField
                {...field}
                className="mb-24"
                label="Lastname"
                id="lastName"
                variant="outlined"
                fullWidth
              />
            )}
          />
        </div>

        <div className="flex">
          <Controller
            control={control}
            name="display"
            render={({ field }) => (
              <TextField
                {...field}
                className="mb-24"
                label="Display Name"
                id="display"
                variant="outlined"
                fullWidth
                required
              />
            )}
          />
        </div>

        <div className="flex">
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <TextField
                {...field}
                className="mb-24"
                label="Email"
                id="email"
                variant="outlined"
                fullWidth
              />
            )}
          />
        </div>

        <div className="flex">
          <Controller
            control={control}
            name="tel"
            render={({ field }) => (
              <TextField
                {...field}
                className="mb-24"
                label="Mobile"
                id="tel"
                variant="outlined"
                fullWidth
              />
            )}
          />
        </div>

        <div className="flex">
          <Controller
            control={control}
            name="remarks"
            render={({ field }) => (
              <TextField
                {...field}
                className="mb-24"
                label="Remark"
                id="remarks"
                variant="outlined"
                multiline
                rows={3}
                fullWidth
              />
            )}
          />
        </div>
        <div className="px-16 w-full">
          <Button
            className="w-full"
            variant="contained"
            color="primary"
            type="submit"
            disabled={_.isEmpty(dirtyFields) || !isValid}
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Information;

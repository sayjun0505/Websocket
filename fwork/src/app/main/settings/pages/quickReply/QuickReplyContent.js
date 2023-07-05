import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import Avatar from '@mui/material/Avatar';
import Checkbox from '@mui/material/Checkbox';
import { styled } from '@mui/material/styles';

import FormControlLabel from '@mui/material/FormControlLabel';

import { useDispatch } from 'react-redux';
import { Controller, useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { saveQuickReply, updateQuickReplyStatus } from '../../store/quickReplySlice';

import QuickReplyResponseContent from './QuickReplyResponseContent';
import QuickReplyContentPreview from './QuickReplyContentPreview';

const SmallAvatar = styled(Avatar)(({ theme }) => ({
  width: 28,
  height: 28,
  border: `2px solid ${theme.palette.background.paper}`,
}));

const QuickReplyContent = (props) => {
  const dispatch = useDispatch();
  const routeParams = useParams();
  const methods = useFormContext();
  const { control, formState, setValue, watch, getValues, reset } = methods;
  const { errors } = formState;
  const responses = watch('response');

  const { id } = routeParams;

  return (
    <Paper className="flex md:flex-row flex-col rounded-2xl shadow overflow-hidden h-full">
      <div className="relative flex flex-col flex-auto p-24 pr-12 pb-12 ">
        <Typography className="text-blue-500 font-bold">Quick Reply Title</Typography>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              className="mt-8"
              error={!!errors.name}
              required
              helperText={errors?.name?.message}
              autoFocus
              id="name"
              variant="outlined"
              fullWidth
            />
          )}
        />

        {/* <div className="flex flex-row space-x-12"> */}
        <div className="flex flex-row mt-16 items-center space-x-10">
          <Typography className="text-blue-500 font-bold ">Status</Typography>
          <Controller
            name="status"
            control={control}
            render={({ field }) => {
              return (
                <FormControlLabel
                  value=""
                  control={
                    <Switch
                      color="success"
                      checked={field.value === 'active'}
                      onChange={(event) => {
                        setValue(`status`, event.target.checked ? 'active' : 'inactive');
                        if (id !== 'new') {
                          dispatch(updateQuickReplyStatus(getValues())).then(() => {
                            reset(getValues());
                          });
                        }
                      }}
                    />
                  }
                  // label={field.value ? 'On' : 'Off'}
                  labelPlacement="end"
                />
              );
            }}
          />
        </div>
        <div className="flex flex-col space-y-8 mt-12">
          <Typography className="text-blue-500 font-bold">Channel</Typography>
          <div className="flex flex-row">
            <Controller
              name="channel.line"
              control={control}
              render={({ field }) => {
                return (
                  <FormControlLabel
                    value=""
                    control={
                      <Checkbox
                        size="small"
                        className="p-2 ml-12"
                        checked={field.value}
                        onChange={(event) => {
                          setValue(`channel.line`, event.target.checked);
                          if (id !== 'new') {
                            dispatch(saveQuickReply(getValues())).then(() => {
                              reset(getValues());
                            });
                          }
                        }}
                      />
                    }
                    label={
                      <SmallAvatar alt="line" variant="rounded" src="assets/images/logo/LINE.png" />
                    }
                    labelPlacement="end"
                  />
                );
              }}
            />
            <Controller
              name="channel.facebook"
              control={control}
              render={({ field }) => {
                return (
                  <FormControlLabel
                    value=""
                    control={
                      <Checkbox
                        className="p-2 ml-12"
                        size="small"
                        checked={field.value}
                        onChange={(event) => {
                          setValue(`channel.facebook`, event.target.checked);
                          if (id !== 'new') {
                            dispatch(saveQuickReply(getValues())).then(() => {
                              reset(getValues());
                            });
                          }
                        }}
                      />
                    }
                    label={
                      <SmallAvatar
                        alt="facebook"
                        variant="rounded"
                        src="assets/images/logo/Facebook.png"
                      />
                    }
                    labelPlacement="end"
                  />
                );
              }}
            />
            <Controller
              name="channel.instagram"
              control={control}
              render={({ field }) => {
                return (
                  <FormControlLabel
                    value=""
                    control={
                      <Checkbox
                        className="p-2 ml-12"
                        size="small"
                        checked={field.value}
                        onChange={(event) => {
                          setValue(`channel.instagram`, event.target.checked);
                          if (id !== 'new') {
                            dispatch(saveQuickReply(getValues())).then(() => {
                              reset(getValues());
                            });
                          }
                        }}
                      />
                    }
                    label={
                      <SmallAvatar
                        alt="instagram"
                        variant="rounded"
                        src="assets/images/logo/Instagram.png"
                      />
                    }
                    labelPlacement="end"
                  />
                );
              }}
            />
          </div>
        </div>
        {/* </div> */}

        <Typography className="text-blue-500 font-bold mt-16">Quick Reply Message</Typography>
        <QuickReplyResponseContent />
      </div>
      <div className="relative flex flex-col flex-auto p-24 pl-12 pb-12">
        <QuickReplyContentPreview responses={responses} />
      </div>
    </Paper>
  );
};

export default QuickReplyContent;

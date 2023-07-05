import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import Avatar from '@mui/material/Avatar';
import Checkbox from '@mui/material/Checkbox';
import { styled } from '@mui/material/styles';
import { Autocomplete } from '@mui/material';

import FormControlLabel from '@mui/material/FormControlLabel';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { saveAutoReply, updateAutoReplyStatus } from '../../store/autoReplySlice';

import AutoReplyResponseContent from './AutoReplyResponseContent';
import AutoReplyContentPreview from './AutoReplyContentPreview';

const SmallAvatar = styled(Avatar)(({ theme }) => ({
  width: 28,
  height: 28,
  border: `2px solid ${theme.palette.background.paper}`,
}));
const AutoReplyContent = (props) => {
  const dispatch = useDispatch();
  const routeParams = useParams();
  const methods = useFormContext();
  const { control, formState, setValue, watch, getValues, reset } = methods;
  const { errors } = formState;
  const responses = watch('response');
  const keyword = watch('keyword');
  const { id } = routeParams;

  const { fields, append, prepend, remove, replace } = useFieldArray({ name: 'keyword', control });

  const userId = useSelector(({ user }) => user.uuid);
  const foxOrganization = useSelector(({ organization }) => organization.organization);

  const [inputKeyword, setInputKeyword] = useState('');

  useEffect(() => {
    // console.log('🤖🤖 [AutoReplyContent] keyword', keyword);
  }, [keyword]);
  useEffect(() => {
    // console.log('🤖🤖 [AutoReplyContent] responses', responses);
  }, [responses]);

  function onInputChange(_, _value) {
    // console.log('🤖🤖 Autocomplete onInputChange ', _value);

    const newKeyword = _value.map((_newKeyword) => {
      if (typeof _newKeyword === 'object') return _newKeyword;
      return {
        keyword: _newKeyword.toLowerCase(),
        organization: { id: foxOrganization.id },
        createdBy: { id: userId },
      };
    });
    // filter duplicate keyword
    const unique = newKeyword.filter(
      (obj, index) => newKeyword.findIndex((item) => item.keyword === obj.keyword) === index
    );
    // console.log('🤖🤖 Autocomplete onInputChange unique', unique);
    // console.log('🤖🤖 Autocomplete onInputChange newKeyword', newKeyword);
    replace(unique);
  }

  // function onKeywordSubmit(ev) {
  //   console.log('🤖 kAutocomplete onKeywordSubmit ', inputKeyword);
  //   ev.preventDefault();
  //   if (inputKeyword.trim() === '') {
  //     return;
  //   }

  //   // split string with space or comma
  //   const newKeywords = inputKeyword.split(/[, ]+/).filter((element) => element);
  //   console.log('🤖New Keyword ', newKeywords);

  //   newKeywords.forEach((newKeyword) => {
  //     // filter duplicate keyword
  //     const duplicate = fields.find(
  //       (element) => element.keyword.toLowerCase() === newKeyword.toLowerCase()
  //     );
  //     if (!duplicate) {
  //       prepend({
  //         keyword: newKeyword.toLowerCase(),
  //         organization: { id: foxOrganization.id },
  //         createdBy: { id: userId },
  //       });
  //     } else {
  //       dispatch(
  //         showMessage({ message: `"${newKeyword}" is a duplicate keyword`, variant: 'error' })
  //       );
  //     }
  //   });

  //   // newReply.keyword = newReplyKeyword;
  //   // dispatch(updateData(newReply));
  //   setInputKeyword('');
  // }

  return (
    <Paper className="flex md:flex-row flex-col rounded-2xl shadow overflow-hidden h-full">
      <div className="relative flex flex-col flex-auto p-24 pr-12 pb-12 ">
        <Typography className="text-blue-500 font-bold">Auto Reply Title</Typography>
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
                          dispatch(updateAutoReplyStatus(getValues())).then(() => {
                            reset(getValues());
                          });
                        }
                        dispatch(updateAutoReplyStatus(getValues())).then(() => {
                          reset(getValues());
                        });
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
                            dispatch(saveAutoReply(getValues())).then(() => {
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
                            dispatch(saveAutoReply(getValues())).then(() => {
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
                            dispatch(saveAutoReply(getValues())).then(() => {
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
        <Typography className="text-blue-500 font-bold mt-16">Trigger Keywords</Typography>
        <Controller
          name="keyword"
          control={control}
          render={({ field: { value } }) => {
            // console.log('🤖🤖 keyword field ', value);
            return (
              <Autocomplete
                open={false}
                // options={keyword || []}
                value={value}
                // value={keyword || null}
                // defaultValue={keyword || []}
                className="mt-8"
                multiple
                freeSolo
                id="tags-outlined"
                getOptionLabel={(option) => option.keyword || 'aaaa'}
                isOptionEqualToValue={(option, _value) => option.keyword === _value.keyword}
                onChange={onInputChange}
                // onChange={(event, values) => onChange(values.keyword)}
                renderInput={(params) => {
                  // console.log('🤖 keyword renderInput ', params);
                  return (
                    <TextField
                      {...params}
                      // {...field}
                      // inputRef={ref}
                      variant="outlined"
                      placeholder="Enter keyword"
                      multiline
                    />
                  );
                }}
              />
            );
          }}
        />

        <Typography className="text-blue-500 font-bold mt-16">Auto Reply Message</Typography>
        <AutoReplyResponseContent />
      </div>
      <div className="relative flex flex-col flex-auto p-24 pl-12 pb-12">
        <AutoReplyContentPreview responses={responses} />
      </div>
    </Paper>
  );
};

export default AutoReplyContent;

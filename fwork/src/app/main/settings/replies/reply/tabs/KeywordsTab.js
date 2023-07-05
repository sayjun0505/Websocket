// import FuseLoading from '@fuse/core/FuseLoading';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFieldArray, useFormContext } from 'react-hook-form';
// import { updateData } from '../../store/replySlice';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';

const KeywordsTab = (props) => {
  const dispatch = useDispatch();
  const methods = useFormContext();
  const { control, formState } = methods;
  const { errors } = formState;
  const { fields, append, prepend, remove } = useFieldArray({ name: 'keyword', control });

  const userId = useSelector(({ user }) => user.uuid);
  const foxOrganization = useSelector(({ organization }) => organization.organization);

  const [inputKeyword, setInputKeyword] = useState('');

  function onInputChange(ev) {
    setInputKeyword(ev.target.value);
  }

  function onKeywordSubmit(ev) {
    ev.preventDefault();
    if (inputKeyword.trim() === '') {
      return;
    }

    // split string with space or comma
    const newKeywords = inputKeyword.split(/[, ]+/).filter((element) => element);
    // console.log('New Keyword ', newKeywords);

    newKeywords.forEach((newKeyword) => {
      // filter duplicate keyword
      const duplicate = fields.find(
        (element) => element.keyword.toLowerCase() === newKeyword.toLowerCase()
      );
      if (!duplicate) {
        prepend({
          keyword: newKeyword.toLowerCase(),
          organization: { id: foxOrganization.id },
          createdBy: { id: userId },
        });
      } else {
        dispatch(
          showMessage({ message: `"${newKeyword}" is a duplicate keyword`, variant: 'error' })
        );
      }
    });

    // newReply.keyword = newReplyKeyword;
    // dispatch(updateData(newReply));
    setInputKeyword('');
  }

  // function onKeywordRemove(index) {
  //   if (keyword) {
  //     if (keyword.id) {
  //       dispatch(removeKeyword(keyword.id));
  //     } else {
  //       const newReply = { ...reply };
  //       const newReplyKeyword = reply.keyword.filter((element) => element.keyword !== keyword.keyword);
  //       newReply.keyword = newReplyKeyword;
  //       dispatch(updateData(newReply));
  //     }
  //   }
  // }

  return (
    <div className="flex w-full flex-col mt-8 mb-16">
      <form onSubmit={onKeywordSubmit} className=" items-center w-full">
        <TextField
          color="primary"
          placeholder="Add Keyword"
          id="message-input"
          onChange={onInputChange}
          value={inputKeyword}
          variant="outlined"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FuseSvgIcon size={20}>material-outline:message </FuseSvgIcon>
              </InputAdornment>
            ),
          }}
        />
      </form>

      <List className="p-12 items-center w-full ">
        {fields && fields.length > 0 ? (
          fields.map((keyword, index) => {
            return (
              <ListItem
                button
                className="p-20"
                key={index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => {
                      remove(index);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <FuseSvgIcon size={20}>material-outline:message </FuseSvgIcon>
                </ListItemAvatar>
                <ListItemText className="capitalize" primary={keyword.keyword} />
              </ListItem>
            );
          })
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.1 } }}
            className="flex flex-col flex-1 items-center justify-center h-full"
          >
            <Typography color="textSecondary" variant="h5">
              There is no Keyword!
            </Typography>
          </motion.div>
        )}
      </List>
    </div>
  );
};
export default KeywordsTab;

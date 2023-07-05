import TextField from '@mui/material/TextField';
import { useDispatch, useSelector } from 'react-redux';
import { Autocomplete, Chip } from '@mui/material';
import { showMessage } from 'app/store/fuse/messageSlice';
import { createCustomerLabel, selectLabels } from '../store/labelsSlice';

const Tag = (props) => {
  const { onChange, value } = props;
  const dispatch = useDispatch();

  const tagOption = useSelector(selectLabels);

  const insertNewStringTagList = async (stringTagList) => {
    dispatch(createCustomerLabel(stringTagList))
      .unwrap()
      .then((newTaskTagList) => {
        if (newTaskTagList && newTaskTagList.length) {
          if (newTaskTagList.length + value.length > 10) {
            dispatch(
              showMessage({
                message: 'Maximum 10 tags per task.', // text or html
                autoHideDuration: 6000, // ms
                anchorOrigin: {
                  vertical: 'top', // top bottom
                  horizontal: 'right', // left center right
                },
                variant: 'error', // success error info warning null
              })
            );
          } else {
            onChange([...value, ...newTaskTagList]);
          }
        }
      });
  };

  const handleTagChange = async (event, newValue) => {
    if (newValue.length < value.length) {
      // Delete Tag
      onChange(newValue);
    } else {
      const newSelect = await newValue.filter((x) => !value.includes(x));
      newSelect.forEach(async (element) => {
        if (element && element.id) {
          const newSelectList = [...value, element];
          onChange(newSelectList);
        } else if (element.length > 0) {
          const newSelectSplit = await element.split(' ');
          const newSelectListArray = [...new Set(newSelectSplit)];
          const newSelectList = newSelectListArray.filter((x) => x.length <= 15);
          if (newSelectListArray.length !== newSelectList.length) {
            dispatch(
              showMessage({
                message: 'Maximum 15 characters per 1 tag.',
                variant: 'warning',
              })
            );
          }
          const newSelectListLowerCaseAndFindOption = newSelectList.map((tagItem) => {
            const tagLowerCase = tagItem.toLowerCase();
            const findOptionResult = tagOption.find((option) => option.tag === tagLowerCase);
            if (findOptionResult) {
              return findOptionResult;
            }
            return tagLowerCase;
          });
          if (newSelectList.length + newSelectListLowerCaseAndFindOption.length > 10) {
            dispatch(
              showMessage({
                message: 'Maximum 10 tags per task.',
                variant: 'warning',
              })
            );
            return; // End process with no change
          }

          const newObjectTag = newSelectListLowerCaseAndFindOption.filter(
            (x) => typeof x !== 'string'
          );
          if (newObjectTag && newObjectTag.length > 0) {
            const newTag = [...value, ...newObjectTag];
            onChange(newTag);
          }
          const newStringTag = newSelectListLowerCaseAndFindOption.filter(
            (x) => typeof x === 'string' && x !== ''
          );
          if (newStringTag && newStringTag.length > 0) await insertNewStringTagList(newStringTag);
        }
      });
    }
  };

  return (
    <Autocomplete
      multiple
      freeSolo
      selectOnFocus
      disableCloseOnSelect
      filterSelectedOptions
      id="customerLabel"
      className="mt-32"
      options={tagOption}
      value={value || []}
      onChange={handleTagChange}
      fullWidth
      renderInput={(params) => <TextField {...params} label="Label" placeholder="Labels" />}
      renderTags={(tagValue, getTagProps) => {
        return tagValue.map((option, index) => (
          <Chip
            label={option.label}
            {...getTagProps({ index })}
            sx={{ borderRadius: '4px' }}
            size="small"
            color="secondary"
            variant="outlined"
            className="w-min m-2 rounded"
          />
        ));
      }}
    />
  );
};

export default Tag;

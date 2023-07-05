import TextField from '@mui/material/TextField';
import { useDispatch, useSelector } from 'react-redux';

import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Autocomplete, Checkbox, Chip, IconButton } from '@mui/material';

import { showMessage } from 'app/store/fuse/messageSlice';
import { addTag, removeTag, selectTags } from '../store/tagsSlice';

const Tag = (props) => {
  const { onChange, value } = props;
  const dispatch = useDispatch();

  const tagOption = useSelector(selectTags);
  // const [tagSelect, setTagSelect] = useState([]);

  // useEffect(() => {
  //   if (tagSelect.length > 10) {
  //     tagSelect.splice(10, tagSelect.length - 10);
  //     dispatch(
  //       showMessage({
  //         message: 'Maximum 10 tags per task.',
  //         variant: 'warning',
  //       })
  //     );
  //   }
  // }, [dispatch, tagSelect]);

  const insertNewStringTagList = async (stringTagList) => {
    // console.log(
    //   '🚀 ~ file: TaskTag.js ~ line 36 ~ insertNewStringTagList ~ stringTagList',
    //   stringTagList
    // );
    // Create new tag
    // const newTaskTagList = await createTaskTagList(stringTagList);

    dispatch(addTag(stringTagList))
      .unwrap()
      .then((newTaskTagList) => {
        // console.log('newTaskTagList ', newTaskTagList);
        // Update task tag
        // updateTaskTag(newTaskTagList);
        // setTagSelect([...tagSelect, ...newTaskTagList]);
        // onChange(newTaskTagList);
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
            // const newSelectList = [...value, ...newTaskTagList];
            // setValue(newSelectList);
          }
        }
      });
  };

  const handleTagChange = async (event, newValue) => {
    // console.log('@@@ handleTagChange newValue ', newValue);
    // console.log('@@@ handleTagChange value ', value);
    if (newValue.length < value.length) {
      // Delete Tag
      onChange(newValue);
    } else {
      // Add Tag
      const newSelect = await newValue.filter((x) => !value.includes(x));
      // console.log('filter New Select only ', newSelect);
      newSelect.forEach(async (element) => {
        if (element && element.id) {
          // Select Tag from Option
          const newSelectList = [...value, element];
          onChange(newSelectList);
        } else if (element.length > 0) {
          // Add String Tag
          const newSelectSplit = await element.split(' ');
          // filtering duplicate tag
          const newSelectListArray = [...new Set(newSelectSplit)];
          const newSelectList = newSelectListArray.filter((x) => x.length <= 15);
          // Show Error Maximum 15 characters per 1 tag
          if (newSelectListArray.length !== newSelectList.length) {
            // Show Error message Some Tag is length more then 15 Char
            dispatch(
              showMessage({
                message: 'Maximum 15 characters per 1 tag.',
                variant: 'warning',
              })
            );
          }

          // Tag Convert LowerCase and find option with string
          const newSelectListLowerCaseAndFindOption = newSelectList.map((tagItem) => {
            const tagLowerCase = tagItem.toLowerCase();
            const findOptionResult = tagOption.find((option) => option.tag === tagLowerCase);
            if (findOptionResult) {
              return findOptionResult;
            }
            // return { title: tagLowerCase };
            return tagLowerCase;
          });
          // console.log('newSelectListConvert ', newSelectListLowerCaseAndFindOption);
          // Verify Maximum 10 tags per task.
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
          // console.log('newStringTag ', newStringTag);
          // console.log('newObjectTag ', newObjectTag);
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
      id="tags"
      className="mt-32"
      options={tagOption}
      getOptionLabel={(option) => option.title}
      // ListboxComponent={(listboxProps) => (
      //   <div {...listboxProps} className="p-0">
      //     {listboxProps.children}
      //   </div>
      // )}
      // renderOption={(_props, option, { selected }) => (
      //   <li {..._props} className="flex items-center justify-between">
      //     {/* <Checkbox style={{ marginRight: 8 }} checked={selected} /> */}
      //     {option.title}
      //     <IconButton
      //       className=""
      //       size=""
      //       onClick={(e) => {
      //         e.preventDefault();
      //         dispatch(removeTag(option.id));
      //       }}
      //     >
      //       <FuseSvgIcon>heroicons-outline:x</FuseSvgIcon>
      //     </IconButton>
      //   </li>
      // )}
      value={value || []}
      onChange={handleTagChange}
      fullWidth
      renderInput={(params) => <TextField {...params} label="Tags" placeholder="Tags" />}
      renderTags={(tagValue, getTagProps) => {
        // console.log('tagValue ', tagValue);
        return tagValue.map((option, index) => (
          <Chip
            label={option.title}
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
    // <Autocomplete
    //   multiple
    //   freeSolo
    //   filterSelectedOptions
    //   renderInput={(params) => (
    //     <TextField {...params} variant="outlined" placeholder="Task Tag" />
    //   )}
    //   renderTags={(value, getTagProps) =>
    //     value.map(
    //       (option, index) => (
    //         <Chip
    //           avatar={
    //             <Avatar classes={{ colorDefault: 'bg-transparent' }}>
    //               <Icon className="text-20" style={{ color: option.color }}>
    //                 tag
    //               </Icon>
    //             </Avatar>
    //           }
    //           tag={option.title}
    //           {...getTagProps({ index })}
    //           // onDelete={(ev) =>
    //           //   setValue(
    //           //     'tags',
    //           //     // tag
    //           //     formTags.filter((_id) => option !== _id)
    //           //   )
    //           // }
    //           className="mx-4 my-4"
    //           classes={{ tag: 'px-8' }}
    //           // key={option.id}
    //         />
    //       )
    //       // <Chip tag={option.title} {...getTagProps({ index })} />
    //     )
    //   }
    // />
  );
};

export default Tag;

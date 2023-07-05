import TextField from '@mui/material/TextField';
import { useDispatch } from 'react-redux';

// import { makeStyles } from '@mui/material/styles';

import { useEffect } from 'react';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Icon from '@mui/material/Icon';

import { showMessage } from 'app/store/fuse/messageSlice';
import { addLabel } from './store/labelsSlice';

const Label = (props) => {
  const { control, setValue, labelSelect, labelOption } = props;
  const dispatch = useDispatch();

  // const labelOption = useSelector(selectLabels);
  // const [labelOption, setLabelOption] = useState([]);
  // const [labelSelect, setLabelSelect] = useState([]);

  // const [todo, setTodo] = React.useState();

  useEffect(() => {
    if (labelSelect.length > 10) {
      labelSelect.splice(10, labelSelect.length - 10);
      dispatch(
        showMessage({
          message: 'Maximum 10 labels per todo.',
          variant: 'warning',
        })
      );
    }
  }, [dispatch, labelSelect]);

  const insertNewStringLabelList = async (stringLabelList) => {
    // Create new label
    // const newTodoLabelList = await createTodoLabelList(stringLabelList);

    dispatch(addLabel(stringLabelList)).unwap.then((newTodoLabelList) => {
      // console.log('newTodoLabelList ', newTodoLabelList);
      // Update todo label
      // updateTodoLabel(newTodoLabelList);
      // setLabelSelect([...labelSelect, ...newTodoLabelList]);
      // setValue(newTodoLabelList);
      if (newTodoLabelList && newTodoLabelList.length) {
        if (newTodoLabelList.length + labelSelect.length > 10) {
          dispatch(
            showMessage({
              message: 'Maximum 10 labels per todo.', // text or html
              autoHideDuration: 6000, // ms
              anchorOrigin: {
                vertical: 'top', // top bottom
                horizontal: 'right', // left center right
              },
              variant: 'error', // success error info warning null
            })
          );
        } else {
          setValue('labels', [...labelSelect, ...newTodoLabelList]);
          // const newSelectList = [...labelSelect, ...newTodoLabelList];
          // setLabelSelect(newSelectList);
        }
      }
    });
  };

  const handleLabelChange = async (_, value) => {
    // console.log('@@@ handleLabelChange value ', value);
    // console.log('@@@ handleLabelChange labelSelect ', labelSelect);
    if (value.length < labelSelect.length) {
      // Delete Label
      setValue('labels', value);
    } else {
      // Add Label
      const newSelect = await value.filter((x) => !labelSelect.includes(x));
      // console.log('filter New Select only ', newSelect);
      newSelect.forEach(async (element) => {
        if (element && element.id) {
          // Select Label from Option
          const newSelectList = [...labelSelect, element];
          setValue('labels', newSelectList);
        } else if (element.length > 0) {
          // Add String Label
          const newSelectSplit = await element.split(' ');
          // filtering duplicate label
          const newSelectListArray = [...new Set(newSelectSplit)];
          const newSelectList = await newSelectListArray.filter((x) => x.length <= 15);
          // Show Error Maximum 15 characters per 1 label
          if (newSelectListArray.length !== newSelectList.length) {
            // Show Error message Some Label is length more then 15 Char
            dispatch(
              showMessage({
                message: 'Maximum 15 characters per 1 label.',
                variant: 'warning',
              })
            );
          }

          // Label Convert LowerCase and find option with string
          const newSelectListLowerCaseAndFindOption = await newSelectList.map((labelItem) => {
            const labelLowerCase = labelItem.toLowerCase();
            const findOptionResult = labelOption.find((option) => option.label === labelLowerCase);
            if (findOptionResult) {
              return findOptionResult;
            }
            return { title: labelLowerCase };
          });
          // console.log(
          //   'newSelectListConvert ',
          //   newSelectListLowerCaseAndFindOption
          // );
          // Verify Maximum 10 labels per todo.
          if (newSelectList.length + newSelectListLowerCaseAndFindOption.length > 10) {
            dispatch(
              showMessage({
                message: 'Maximum 10 labels per todo.',
                variant: 'warning',
              })
            );
            return; // End process with no change
          }

          const newObjectLabel = await newSelectListLowerCaseAndFindOption.filter(
            (x) => typeof x !== 'string'
          );
          if (newObjectLabel && newObjectLabel.length > 0) {
            const newLabel = [...labelSelect, ...newObjectLabel];
            setValue('labels', newLabel);
          }
          const newStringLabel = await newSelectListLowerCaseAndFindOption.filter(
            (x) => typeof x === 'string' && x !== ''
          );
          // console.log('newStringLabel ', newStringLabel);
          // console.log('newObjectLabel ', newObjectLabel);
          if (newStringLabel && newStringLabel.length > 0) insertNewStringLabelList(newStringLabel);
        }
      });
    }
  };

  return (
    <Autocomplete
      multiple
      freeSolo
      id="tags-outlined"
      options={labelOption}
      getOptionLabel={(option) => option.title}
      value={labelSelect}
      onChange={handleLabelChange}
      filterSelectedOptions
      renderInput={(params) => (
        <TextField {...params} variant="outlined" placeholder="Todo Label" />
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map(
          (option, index) => (
            <Chip
              avatar={
                <Avatar classes={{ colorDefault: 'bg-transparent' }}>
                  <Icon className="text-20" style={{ color: option.color }}>
                    label
                  </Icon>
                </Avatar>
              }
              label={option.title}
              {...getTagProps({ index })}
              // onDelete={(ev) =>
              //   setValue(
              //     'labels',
              //     // label
              //     formLabels.filter((_id) => option !== _id)
              //   )
              // }
              className="mx-4 my-4"
              classes={{ label: 'px-8' }}
              // key={option.id}
            />
          )
          // <Chip label={option.title} {...getTagProps({ index })} />
        )
      }
    />
  );
};

export default Label;

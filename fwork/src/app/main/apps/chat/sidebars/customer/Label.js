import TextField from '@mui/material/TextField';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Autocomplete, Chip } from '@mui/material';
import { showMessage } from 'app/store/fuse/messageSlice';
import { getChats } from '../../store/chatsSlice';
import {
  createCustomerLabel,
  getCustomerLabelOption,
  selectCustomer,
  updateCustomer,
} from '../../store/customerSlice';
import { selectLabels } from '../../store/labelsSlice';
import { selectChat } from '../../store/chatSlice';

const Label = (props) => {
  const dispatch = useDispatch();

  const [labelSelect, setLabelSelect] = useState([]);

  const chat = useSelector(selectChat);
  const customer = useSelector(selectCustomer);
  const labelOptions = useSelector(selectLabels);
  useEffect(() => {
    dispatch(getCustomerLabelOption());
  }, [dispatch]);

  useEffect(() => {
    if (customer && customer.customerLabel) {
      const newLabelSelected = customer.customerLabel?.map((element, index) => ({
        ...element,
        key: index,
      }));

      const uniqueLabelSelected = Array.from(new Set(newLabelSelected.map((a) => a.id))).map(
        (id) => {
          return newLabelSelected.find((a) => a.id === id);
        }
      );
      setLabelSelect(uniqueLabelSelected);
    }
    const tags = labelSelect;
    const labelOptionId = [];
    // labelOption.map((label) => labelOptionId.push(label.id));
    // const tag = tags.filter((element) => labelOptionId.indexOf(element.id) > -1);
  }, [customer, labelOptions]);

  useEffect(() => {
    dispatch(getChats());
    if (labelSelect.length > 10) {
      labelSelect.splice(10, labelSelect.length - 10);
      dispatch(
        showMessage({
          message: 'Maximum 10 labels per customer.',
          variant: 'warning',
        })
      );
    }
  }, [dispatch, labelSelect]);

  const createCustomerLabelList = async (labelList) => {
    if (labelList) {
      dispatch(createCustomerLabel(labelList));
    }
  };

  const insertNewStringLabelList = async (stringLabelList) => {
    // Create new label
    const newCustomerLabelList = await createCustomerLabelList(stringLabelList);

    if (newCustomerLabelList && newCustomerLabelList.length) {
      if (newCustomerLabelList.length + labelSelect.length > 10) {
        dispatch(
          showMessage({
            message: 'Maximum 10 labels per customer.', // text or html
            autoHideDuration: 6000, // ms
            anchorOrigin: {
              vertical: 'top', // top bottom
              horizontal: 'right', // left center right
            },
            variant: 'error', // success error info warning null
          })
        );
      } else {
        const newSelectList = await [...labelSelect, ...newCustomerLabelList];
        dispatch(updateCustomer({ ...customer, customerLabel: newSelectList }));
        // setLabelSelect(newSelectList);
      }
    }
  };

  const handleLabelChange = async (_, value) => {
    if (value.length < labelSelect.length) {
      // Delete Label
      dispatch(updateCustomer({ ...customer, customerLabel: value }));
    } else {
      // Add Label
      const newSelect = await value.filter((x) => !labelSelect.includes(x));
      newSelect.forEach(async (element) => {
        if (element && element.id) {
          // Select Label from Option
          const newSelectList = await [...labelSelect, element];
          dispatch(updateCustomer({ ...customer, customerLabel: newSelectList }));
        } else {
          // Add String Label
          const newSelectSplit = await element.split(' ');
          let newSelectList = await newSelectSplit.filter((x) => x.length <= 15);
          newSelectList = await newSelectList.filter((e) => String(e).trim());
          // Show Error Maximum 15 characters per 1 label
          if (newSelectSplit.length !== newSelectList.length) {
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
            const findOptionResult = labelOptions.find((option) => option.label === labelLowerCase);
            if (findOptionResult) {
              return findOptionResult;
            }
            return { label: labelLowerCase };
          });
          // Verify Maximum 10 labels per customer.
          if (newSelectList.length + newSelectListLowerCaseAndFindOption.length > 10) {
            dispatch(
              showMessage({
                message: 'Maximum 10 labels per customer.',
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
            // setLabelSelect(newLabel);
            dispatch(updateCustomer({ ...customer, customerLabel: newLabel }));
          }
          const newStringLabel = await newSelectListLowerCaseAndFindOption.filter(
            (x) => typeof x === 'string' && x !== ''
          );
          if (newStringLabel && newStringLabel.length > 0) insertNewStringLabelList(newStringLabel);
        }
      });
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* <div className='m-8'>
        {
          labelOption.map((label, i) => {
            if(label && i%5==0) return(<span className='text-red-700 inline-block mr-[1rem]'><Button onClick={()=>handleButton({label})} variant="outlined" className='text-red-700 !px-8 !min-h-[30px] m-2 !rounded h-4' >{label.label}</Button> <DeleteIcon onClick={()=>deletelabel(label)} /></span>)
            if(label && i%5==1) return(<span className='text-green-700 mr-[1rem] inline-block'><Button onClick={()=>handleButton({label})} variant="outlined" className='text-green-700 !px-8 !min-h-[30px] m-2 !rounded h-4' >{label.label}</Button> <DeleteIcon onClick={()=>deletelabel(label)} /></span>)
            if(label && i%5==2) return(<span className='text-[#708cb3] mr-[1rem] inline-block' ><Button onClick={()=>handleButton({label})} variant="outlined" className='text-[#708cb3] !px-8 !min-h-[30px] m-2 !rounded h-4'>{label.label}</Button> <DeleteIcon onClick={()=>deletelabel(label)} /></span>)
            if(label && i%5==3) return(<span className='text-[#b35deb] mr-[1rem] inline-block'><Button onClick={()=>handleButton({label})} variant="outlined" className='text-[#b35deb] !px-8 !min-h-[30px] m-2 !rounded h-4'>{label.label}</Button> <DeleteIcon onClick={()=>deletelabel(label)} /></span>)
            if(label && i%5==4) return(<span className='text-[#ffa24d] mr-[1rem] inline-block'><Button onClick={()=>handleButton({label})} variant="outlined" className='text-[#ffa24d] !px-8 !min-h-[30px] m-2 !rounded h-4'>{label.label}</Button> <DeleteIcon onClick={()=>deletelabel(label)} /></span>)
          })
        }
      </div> */}
      <Autocomplete
        multiple
        freeSolo
        id="tags-outlined"
        options={labelOptions}
        getOptionLabel={(option) => option.label}
        value={labelSelect}
        onChange={handleLabelChange}
        filterSelectedOptions
        renderInput={(params) => (
          <TextField {...params} variant="outlined" placeholder="Customer Label" multiline />
        )}
        renderTags={(tagValue, getTagProps) => (
          <div className="w-full">
            {tagValue.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                label={option.label}
                color="secondary"
                variant="outlined"
                className="w-min m-2 rounded"
                sx={{
                  borderColor: '#8180E7',
                  color: '#8180E7',
                }}
              />
            ))}
          </div>
        )}
      />
    </div>
  );
};

export default Label;

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import TextareaAutosize from '@mui/material/TextareaAutosize';

import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { selectResponse } from '../../../store/replySlice';

// import { editResponse, changeResponseOrder, removeResponse, removeResponseOrder } from '../../store/responseSlice';
import TextEditor from './editor/TextEditor';
import ImageEditor from './editor/ImageEditor';
import ButtonsEditor from './editor/ButtonsEditor';
import CarouselEditor from './editor/CarouselEditor';
import ConfirmEditor from './editor/ConfirmEditor';
import FlexEditor from './editor/FlexEditor';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};
function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const tabMenu = [
  { key: 1, label: 'Text', type: 'text' },
  { key: 2, label: 'Image', type: 'image' },
  { key: 3, label: 'Buttons', type: 'buttons' },
  { key: 4, label: 'Confirm', type: 'confirm' },
  { key: 5, label: 'Carousel', type: 'carousel' },
  { key: 6, label: 'Flex Message', type: 'flex' },
];

function ResponseEditor(props) {
  const dispatch = useDispatch();
  const responses = useSelector(selectResponse);
  const { response, index } = props;
  const methods = useFormContext();
  const { control, formState } = methods;
  const { errors } = formState;
  const { fields, append, prepend, swap, remove, update } = useFieldArray({
    name: 'response',
    control,
  });
  const { watch } = methods;
  const watchResponse = watch('response');

  useEffect(() => {
    // console.log('[ResponseEditor] ', response);
    // console.log('[ResponseEditor] ', JSON.parse(response.data));
  }, [response]);

  const [tabPosition, setTabPosition] = useState(0);

  useEffect(() => {
    if (response && response.type) {
      setTabPosition(tabMenu.find((menu) => menu.type === response.type).key);
    }
  }, [response]);

  if (!response) return null;

  function handleSelectChange(event) {
    const key = event.target.value;
    const { type } = tabMenu.find((element) => element.key === key);
    const currentResponse = responses.find((o) => o.id === response.id);
    // console.log('currentResponse ', currentResponse);
    // console.log('type ', type);
    if (currentResponse && currentResponse.type === type) {
      update(index, { ...currentResponse });
    } else {
      update(index, { ...response, type, data: null });
    }

    setTabPosition(key);
  }

  function handleOrderChange(change) {
    if (change < 0 && index === 0) return;
    if (change > 0 && index === watchResponse.length - 1) return;
    swap(index, index + change);
  }

  return (
    <Paper variant="outlined" elevation={3} className="w-full mb-12 p-12">
      <Box sx={{ width: '100%' }}>
        <div className="flex flex-row justify-between w-full space-x-1">
          <div className="flex flex-col min-w-200 pl-16">
            <FormControl variant="standard" sx={{ m: 1, minWidth: 250 }}>
              <InputLabel id="demo-simple-select-label">Response Type</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={tabPosition}
                label="Response Type"
                onChange={handleSelectChange}
              >
                {tabMenu.map((element) => (
                  <MenuItem value={element.key}>{element.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className="flex flex-row">
            <div className="flex flex-col sm:flex-row">
              <IconButton
                aria-label="Up"
                onClick={() => {
                  handleOrderChange(-1);
                }}
                size="large"
                disabled={index === 0}
              >
                <KeyboardArrowUpIcon />
              </IconButton>
              <IconButton
                aria-label="Down"
                onClick={() => {
                  handleOrderChange(1);
                }}
                size="large"
                disabled={index === watchResponse.length - 1}
              >
                <KeyboardArrowDownIcon />
              </IconButton>
            </div>
            <IconButton
              aria-label="close"
              onClick={() => {
                remove(index);
              }}
              size="large"
              disabled={watchResponse.length <= 1}
            >
              <CloseIcon />
            </IconButton>
          </div>
        </div>
      </Box>
      <TabPanel value={tabPosition} index={1}>
        <TextEditor index={index} response={response} />
      </TabPanel>
      <TabPanel value={tabPosition} index={2}>
        <ImageEditor index={index} response={response} />
      </TabPanel>
      <TabPanel value={tabPosition} index={3}>
        <ButtonsEditor index={index} response={response} />
      </TabPanel>
      <TabPanel value={tabPosition} index={4}>
        <ConfirmEditor index={index} response={response} />
      </TabPanel>
      <TabPanel value={tabPosition} index={5}>
        <CarouselEditor index={index} response={response} />
      </TabPanel>
      <TabPanel value={tabPosition} index={6}>
        <FlexEditor index={index} response={response} />
      </TabPanel>
    </Paper>
  );
}

export default ResponseEditor;

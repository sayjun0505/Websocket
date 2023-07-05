import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { lighten } from '@mui/material/styles';
// import TextareaAutosize from '@mui/material/TextareaAutosize';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';

// import Toolbar from '@mui/material/Toolbar';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import DataObjectIcon from '@mui/icons-material/DataObject';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';

import { useFieldArray, useFormContext } from 'react-hook-form';

import TextEditor from './editor/TextEditor';
import ImageEditor from './editor/ImageEditor';
import ButtonsEditor from './editor/ButtonsEditor';
import CarouselEditor from './editor/CarouselEditor';
import ConfirmEditor from './editor/ConfirmEditor';
import FlexEditor from './editor/FlexEditor';

// import { editResponse, changeResponseOrder, removeResponse, removeResponseOrder } from '../../store/responseSlice';

const TabPanel = (props) => {
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
};
TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const tabMenu = [
  { key: 1, label: 'Text', type: 'text' },
  { key: 2, label: 'Image', type: 'image' },
  { key: 3, label: 'Buttons', type: 'buttons' },
  { key: 4, label: 'Confirm', type: 'confirm' },
  { key: 5, label: 'Carousel', type: 'carousel' },
  { key: 6, label: 'Flex Message', type: 'flex' },
];

const ResponseEditor = (props) => {
  const dispatch = useDispatch();
  // const responses = useSelector(selectResponse);
  const { response, index } = props;
  const methods = useFormContext();
  const { control, formState } = methods;
  const { errors } = formState;
  const { fields, append, prepend, swap, remove, update } = useFieldArray({
    name: 'response',
    control,
  });
  const { watch } = methods;
  const watchChannel = watch('channel');
  const watchResponse = watch('response');

  const [tabPosition, setTabPosition] = useState(0);

  useEffect(() => {
    // console.log('🤖 ResponseEditor ', index);
  }, [index]);
  useEffect(() => {
    if (response && response.type) {
      setTabPosition(tabMenu.find((menu) => menu.type === response.type).key);
    }
    // console.log('🤖 response ', response);
  }, [response]);

  function handleTypeChange(type) {
    const menu = tabMenu.find((element) => element.type === type);
    // console.log('🤖 handleTypeChange ', menu);
    update(index, { ...response, type, data: null });
    setTabPosition(menu.key);
  }

  function handleOrderChange(change) {
    if (change < 0 && index === 0) return;
    if (change > 0 && index === watchResponse.length - 1) return;
    swap(index, index + change);
  }

  return (
    <Paper variant="outlined" elevation={3} className="w-full mb-12 rounded">
      <Box
        sx={{
          width: '100%',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? lighten(theme.palette.background.default, 0.4)
              : lighten(theme.palette.background.default, 0.02),
        }}
        className="rounded"
      >
        <div className="flex flex-row justify-between w-full space-x-1 p-4">
          <div className="flex flex-row min-w-200 ml-8">
            <Tooltip title="Text" placement="top" arrow>
              <IconButton
                disabled={!watchChannel.line && !watchChannel.facebook && !watchChannel.instagram}
                aria-label="text"
                color={response && response.type === 'text' ? 'secondary' : 'default'}
                onClick={() => {
                  handleTypeChange('text');
                }}
              >
                <FuseSvgIcon size={20}>material-outline:chat</FuseSvgIcon>
              </IconButton>
            </Tooltip>
            <Tooltip title="Image" placement="top" arrow>
              <IconButton
                disabled={!watchChannel.line && !watchChannel.facebook && !watchChannel.instagram}
                aria-label="image"
                color={response && response.type === 'image' ? 'secondary' : 'default'}
                onClick={() => {
                  handleTypeChange('image');
                }}
              >
                <FuseSvgIcon size={20}>material-outline:image</FuseSvgIcon>
              </IconButton>
            </Tooltip>
            <Tooltip title="Button" placement="top" arrow>
              <IconButton
                disabled={!(watchChannel.line || watchChannel.facebook) || watchChannel.instagram}
                aria-label="buttons"
                color={response && response.type === 'buttons' ? 'secondary' : 'default'}
                onClick={() => {
                  handleTypeChange('buttons');
                }}
              >
                <FuseSvgIcon size={20}>material-outline:smart_button</FuseSvgIcon>
              </IconButton>
            </Tooltip>
            <Tooltip title="Confirm" placement="top" arrow>
              <IconButton
                disabled={!watchChannel.line || watchChannel.facebook || watchChannel.instagram}
                aria-label="confirm"
                color={response && response.type === 'confirm' ? 'secondary' : 'default'}
                onClick={() => {
                  handleTypeChange('confirm');
                }}
              >
                <FuseSvgIcon size={20}>material-outline:check_circle</FuseSvgIcon>
              </IconButton>
            </Tooltip>
            <Tooltip title="Carousel" placement="top" arrow>
              <IconButton
                disabled={!watchChannel.line || watchChannel.facebook || watchChannel.instagram}
                aria-label="carousel"
                color={response && response.type === 'carousel' ? 'secondary' : 'default'}
                onClick={() => {
                  handleTypeChange('carousel');
                }}
              >
                <FuseSvgIcon size={20}>material-outline:filter_none</FuseSvgIcon>
              </IconButton>
            </Tooltip>
            <Tooltip title="Flex message" placement="top" arrow>
              <IconButton
                disabled={!watchChannel.line || watchChannel.facebook || watchChannel.instagram}
                aria-label="flex"
                color={response && response.type === 'flex' ? 'secondary' : 'default'}
                onClick={() => {
                  handleTypeChange('flex');
                }}
              >
                <DataObjectIcon />
              </IconButton>
            </Tooltip>
          </div>
          <div className="flex flex-row">
            <div className="flex flex-col sm:flex-row">
              <IconButton
                aria-label="Up"
                onClick={() => {
                  handleOrderChange(-1);
                }}
                // size="large"
                disabled={index === 0}
              >
                <KeyboardArrowUpIcon />
              </IconButton>
              <IconButton
                aria-label="Down"
                onClick={() => {
                  handleOrderChange(1);
                }}
                // size="large"
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
              // size="large"
              disabled={watchResponse.length <= 1}
            >
              <CloseIcon />
            </IconButton>
          </div>
        </div>
      </Box>

      <Divider light />
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
};

export default ResponseEditor;

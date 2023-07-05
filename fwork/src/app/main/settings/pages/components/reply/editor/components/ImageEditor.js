import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  // AddPhotoAlternate,
  // InputAdornment,
  // IconButton,
  // Input,
} from '@mui/material';
// import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { HexColorPicker } from 'react-colorful';
import { uploadImage } from '../../../../../store/responseSlice';

export const ImageStyleEditor = (props) => {
  // const dispatch = useDispatch();
  const { onDataChange, data } = props;

  const [style, setStyle] = useState('default');

  useEffect(() => {
    if (data && data.imageAspectRatio) {
      setStyle(data.imageAspectRatio);
    } else {
      setStyle('default');
    }
  }, [data]);

  return (
    <div className="flex flex-col w-full space-y-1 ">
      <div className="flex flex-col w-full space-y-16 ">
        <div className="flex">
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Image style</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="type"
              value={style || 'default'}
              label="Image style"
              onChange={(event) =>
                onDataChange({ target: { id: 'imageAspectRatio', value: event.target.value } })
              }
              // onChange={onImageStyleChange}
            >
              <MenuItem value="default">Default</MenuItem>
              <MenuItem value="rectangle">Rectangle</MenuItem>
              <MenuItem value="square">Square</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>
    </div>
  );
};

export const ImageSizeEditor = (props) => {
  // const dispatch = useDispatch();
  const { onDataChange, data } = props;

  const [size, setSize] = useState('default');

  useEffect(() => {
    if (data && data.imageSize) {
      setSize(data.imageSize);
    } else {
      setSize('default');
    }
  }, [data]);

  return (
    <div className="flex flex-col w-full space-y-1 ">
      <div className="flex flex-col w-full space-y-16 ">
        <div className="flex">
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Image size</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="type"
              value={size || 'default'}
              label="Image size"
              onChange={(event) =>
                onDataChange({ target: { id: 'imageSize', value: event.target.value } })
              }
              // onChange={onImageStyleChange}
            >
              <MenuItem value="default">Default</MenuItem>
              <MenuItem value="cover">Cover</MenuItem>
              <MenuItem value="contain">Contain</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>
    </div>
  );
};

export const BackgroundColorEditor = (props) => {
  // const dispatch = useDispatch();
  const { onDataChange, data } = props;

  const [color, setColor] = useState(data.imageBackgroundColor);
  const [colorSelector, setColorSelector] = useState(false);

  // useEffect(() => {
  //   if (data && data.imageBackgroundColor) {
  //     setColor(data.imageBackgroundColor);
  //   } else {
  //     setColor();
  //   }
  // }, [data]);

  useEffect(() => {
    if (color) {
      onDataChange({ target: { id: 'imageBackgroundColor', value: color } });
    }
  }, [color]);

  const handleClick = () => {
    setColorSelector(!colorSelector);
  };

  const handleClose = () => {
    setColorSelector(false);
  };

  return (
    <div className="flex flex-col w-full space-y-1 ">
      <div className="flex flex-col w-full space-y-16 ">
        <div className="flex">
          {/* <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Image size</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="type"
              value={style || 'default'}
              label="Image size"
              onChange={(event) => onDataChange({ target: { id: 'imageSize', value: event.target.value } })}
              // onChange={onImageStyleChange}
            >
              <MenuItem value="default">Default</MenuItem>
              <MenuItem value="cover">Cover</MenuItem>
              <MenuItem value="contain">Contain</MenuItem>
            </Select>
          </FormControl> */}
          <div
            style={{
              padding: '5px',
              background: '#fff',
              borderRadius: '1px',
              boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
              display: 'inline-block',
              cursor: 'pointer',
              marginRight: '10px',
            }}
            aria-hidden="true"
            // onClick={(event) => {handleClick()}}
            onClick={handleClick}
          >
            <div
              style={{
                backgroundColor: color,
                width: '40px',
                height: '40px',
                borderRadius: '2px',
              }}
            />
          </div>
          {colorSelector ? (
            <div
              style={{
                position: 'absolute',
                zIndex: '2',
              }}
            >
              {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
              <div
                style={{
                  position: 'fixed',
                  top: '0px',
                  right: '0px',
                  bottom: '0px',
                  left: '0px',
                }}
                aria-hidden="true"
                onClick={handleClose}
              />
              <HexColorPicker color={color || '#ffffff'} onChange={setColor} />
            </div>
          ) : null}
          <TextField
            label="Background Color"
            id="color"
            disabled
            variant="outlined"
            value={color}
            fullWidth
            onChange={setColor}
          />
        </div>
      </div>
    </div>
  );
};

export const ImageEditor = (props) => {
  const dispatch = useDispatch();
  const { onDataChange, data, index } = props;

  const [filename, setFilename] = useState('');
  const [url, setURL] = useState();
  const [type, setType] = useState('noimage');

  const [fileLoading, setFileLoading] = useState(false);

  useEffect(() => {
    // console.log('DATA ', data);
    if (data && data.thumbnailImageUrl) {
      // console.log('DATA URL ', data.thumbnailImageUrl);
      setURL(data.thumbnailImageUrl);
      setType('upload');
    } else {
      setURL();
    }
  }, [data]);

  const handleFileInput = (event) => {
    setFileLoading(true);
    const formData = new FormData();
    formData.append('file', event.target.files[0]);

    dispatch(uploadImage({ formData })).then((result) => {
      setFileLoading(false);
      setTimeout(async () => {
        // setType('url');
        setURL(result.payload.url);
        onDataChange({ target: { id: 'thumbnailImageUrl', value: result.payload.url } });
      }, 3000);
    });
  };

  const handleRemoveImage = () => {
    setFileLoading(true);
    onDataChange({ target: { id: 'thumbnailImageUrl', value: undefined } });
    setURL(null);
    setType('noimage');
    setFileLoading(false);
  };

  return (
    <div className="flex flex-col w-full space-y-1 ">
      <Typography color="textSecondary" variant="button" className="py-16">
        Original Image URL
      </Typography>
      <div className="flex flex-col w-full space-y-16 ">
        <div className="flex">
          <div className="min-w-48 pt-20">
            <Typography color="textSecondary" variant="button" className="capitalize">
              Type
            </Typography>
          </div>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Type</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="type"
              value={type || 'noimage'}
              label="Type"
              onChange={(event) => {
                setType(event.target.value);
                if (event.target.value === 'noimage') {
                  setURL(null);
                  onDataChange({ target: { id: 'thumbnailImageUrl', value: undefined } });
                }
              }}
            >
              <MenuItem value="noimage">No Image</MenuItem>
              <MenuItem value="upload">Upload</MenuItem>
            </Select>
          </FormControl>
        </div>

        {type === 'upload' && (
          <div className="flex">
            <div className="min-w-48 pt-20">
              <Typography color="textSecondary" variant="button" className="capitalize">
                File
              </Typography>
            </div>
            <input
              accept="image/gif, image/png, image/jpeg, video/mp4"
              onChange={handleFileInput}
              className="hidden"
              id={`buttonImage${index}`}
              type="file"
            />
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor={`buttonImage${index}`}>
              <Button variant="contained" component="span">
                {url ? 'Edit' : 'Upload'}
              </Button>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

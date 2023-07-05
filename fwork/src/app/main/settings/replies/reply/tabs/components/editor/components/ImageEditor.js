import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
  Typography,
  Button,
  // AddPhotoAlternate,
  // InputAdornment,
  // IconButton,
  // Input,
} from '@mui/material';
// import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { HexColorPicker } from 'react-colorful';
import { uploadImage } from '../../../../../store/responseSlice';

export function ImageStyleEditor(props) {
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
}

export function ImageSizeEditor(props) {
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
}

export function BackgroundColorEditor(props) {
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
}

export function ImageEditor(props) {
  const dispatch = useDispatch();
  const { onDataChange, data } = props;

  const [filename, setFilename] = useState('');
  const [url, setURL] = useState('');
  const [type, setType] = useState('noimage');

  const [fileLoading, setFileLoading] = useState(false);

  // useEffect(() => {
  //   if (url) {
  //     setFilename(url.substring(url.lastIndexOf('/') + 1));
  //   } else {
  //     setFilename('');
  //   }
  // }, [url]);

  useEffect(() => {
    // console.log('DATA ', data);
    if (data && data.thumbnailImageUrl) {
      // console.log('DATA URL ', data.thumbnailImageUrl);
      setURL(data.thumbnailImageUrl);
      setType('url');
    } else {
      setURL('');
    }
  }, [data]);

  // useEffect(() => {
  //   setURL('');
  //   setFilename('');
  // }, [type]);

  // useEffect(() => {
  //   if (uploadResult) {
  //     console.log('UPLOAD ', uploadResult.url);
  //     setTimeout(async () => {
  //       setType('url');
  //       setURL(uploadResult.url);
  //       onDataChange({ target: { id: 'thumbnailImageUrl', value: uploadResult.url } });
  //     }, 3000);
  //   }
  // }, [uploadResult]);

  const handleFileInput = (event) => {
    setFileLoading(true);
    const formData = new FormData();
    formData.append('file', event.target.files[0]);

    dispatch(uploadImage({ formData })).then((result) => {
      setFileLoading(false);
      setTimeout(async () => {
        setType('url');
        setURL(result.payload.url);
        onDataChange({ target: { id: 'thumbnailImageUrl', value: result.payload.url } });
      }, 3000);
    });
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
                // onActionChange({ target: { id: 'type', value: event.target.value } }, actionIndex);
              }}
            >
              <MenuItem value="noimage">No Image</MenuItem>
              <MenuItem value="url">URL</MenuItem>
              <MenuItem value="upload">Upload</MenuItem>
            </Select>
          </FormControl>
        </div>

        {type === 'url' && (
          <div className="flex">
            <div className="min-w-48 pt-20">
              <Typography color="textSecondary" variant="button" className="capitalize">
                URL
              </Typography>
            </div>
            <TextField
              label="URL"
              id="url"
              variant="outlined"
              required
              fullWidth
              value={url}
              onChange={(event) => {
                setURL(event.target.value);
                // onDataChange({ target: { id: 'thumbnailImageUrl', value: event.target.value } });
              }}
            />
          </div>
        )}
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
              id="icon-button-file"
              type="file"
            />
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="icon-button-file">
              {/* <IconButton
                className="absolute ltr:left-48 rtl:right-48 top-0"
                aria-label="upload picture"
                component="span"
                size="large"
              >
                {fileLoading ? <CircularProgress size={24} /> : <AddPhotoAlternate />}
              </IconButton> */}
              <Button variant="contained" component="span">
                Upload
              </Button>
            </label>
            {/* <TextField
              label="Upload"
              id="upload"
              variant="outlined"
              fullWidth
              value={filename}
              onChange={(event) => {
                // setURI(event.target.value);
                // onActionChange(event, actionIndex);
              }}
              endAdornment={
                <InputAdornment position="end">
                  <Input accept="image/*" id="icon-button-file" type="file" />
                  <IconButton
                    aria-label="toggle password visibility"
                    // onClick={handleClickShowPassword}
                    // onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            {/* <label htmlFor="icon-button-file">
                      <IconButton color="primary" aria-label="upload picture" component="span">
                        <PhotoCamera />
                      </IconButton>
                    </label>
                    <PhotoCamera />
                  </IconButton>
                </InputAdornment>
              }
            /> */}
          </div>
        )}
      </div>
    </div>
  );
}

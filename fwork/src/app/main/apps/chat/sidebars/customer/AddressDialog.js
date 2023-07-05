import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  searchAddressByAmphoe,
  searchAddressByDistrict,
  searchAddressByProvince,
  searchAddressByZipcode,
} from 'thai-address-database';

import {
  addAddress,
  closeEditAddressDialog,
  closeNewAddressDialog,
  updateAddress,
} from '../../store/addressSlice';

const AddressDialog = (props) => {
  const dispatch = useDispatch();
  const addressDialog = useSelector(({ chatApp }) => chatApp.address.addressDialog);
  const customer = useSelector(({ chatApp }) => chatApp.customer);

  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState({});
  const [subdistrict, setSubDistrict] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('');
  const [zipcode, setZipcode] = useState('');

  const [inputName, setInputName] = useState('');
  const [inputTel, setInputTel] = useState('');
  const [inputAddress1, setInputAddress1] = useState('');
  const [inputAddress2, setInputAddress2] = useState('');
  const [inputSubdistrict, setInputSubDistrict] = useState('');
  const [inputDistrict, setInputDistrict] = useState('');
  const [inputProvince, setInputProvince] = useState('');
  const [inputZipcode, setInputZipcode] = useState('');

  /**
   * On Dialog Open
   */
  useEffect(() => {
    if (addressDialog.props.open && addressDialog.type === 'edit') {
      // init data
      if (addressDialog.data) {
        setInputName(addressDialog.data.name || '');
        setInputTel(addressDialog.data.tel || '');
        setInputAddress1(addressDialog.data.address1 || '');
        setInputAddress2(addressDialog.data.address2 || '');
        setInputSubDistrict(addressDialog.data.subDistrict || '');
        setInputDistrict(addressDialog.data.district || '');
        setInputProvince(addressDialog.data.province || '');
        setInputZipcode(String(addressDialog.data.zipCode) || '');
      }
    }
  }, [addressDialog.props.open, addressDialog]);

  useEffect(() => {
    if (!addressDialog.props.open) {
      setInputName('');
      setInputTel('');
      setInputAddress1('');
      setInputAddress2('');
      setInputSubDistrict('');
      setInputDistrict('');
      setInputProvince('');
      setInputZipcode('');
    }
  }, [addressDialog.props.open]);

  /**
   * Close Dialog
   */
  function closeComposeDialog() {
    return addressDialog.type === 'edit'
      ? dispatch(closeEditAddressDialog())
      : dispatch(closeNewAddressDialog());
  }

  /**
   * Form Submit
   */
  function onSubmit(ev) {
    ev.preventDefault();
    const address = {
      ...addressDialog.data,
      name: inputName,
      tel: inputTel,
      address1: inputAddress1,
      address2: inputAddress2,
      subDistrict: inputSubdistrict,
      district: inputDistrict,
      province: inputProvince,
      zipCode: inputZipcode,
    };
    if (addressDialog.type === 'new') {
      dispatch(addAddress({ ...address }));
    } else {
      dispatch(updateAddress({ ...addressDialog.data, ...address }));
    }
    closeComposeDialog();
  }

  const onTextChange = (type) => (ev) => {
    switch (type) {
      case 'name':
        setInputName(ev.target.value);
        break;
      case 'tel':
        setInputTel(ev.target.value);
        break;
      case 'address1':
        setInputAddress1(ev.target.value);
        break;
      case 'address2':
        setInputAddress2(ev.target.value);
        break;

      default:
        break;
    }
  };

  const convertOptions = (rawOptions) => {
    const convertResult = rawOptions.map((item, key) => {
      const delimiter = ',';
      return {
        key,
        label: `${item.district}${delimiter}${item.amphoe}${delimiter}${item.province}${delimiter}${item.zipcode}`,
        ...item,
      };
    });
    if (convertResult.length > 0) setOptions(convertResult);
  };

  return (
    <Dialog
      classes={{
        paper: 'm-24',
      }}
      {...addressDialog.props}
      onClose={closeComposeDialog}
      fullWidth
      maxWidth="sm"
    >
      <AppBar position="static" elevation={0}>
        <Toolbar className="flex flex-col justify-center items-center p-12">
          <Typography variant="subtitle1" color="inherit">
            {addressDialog.type === 'new' ? 'New Address' : 'Edit Address'}
          </Typography>
        </Toolbar>
      </AppBar>

      <form onSubmit={onSubmit} className="flex flex-col md:overflow-hidden">
        <DialogContent classes={{ root: 'p-24' }}>
          <TextField
            onChange={onTextChange('name')}
            value={inputName}
            className="mb-24"
            label="Name"
            id="name"
            variant="outlined"
            required
            fullWidth
          />
          <TextField
            onChange={onTextChange('tel')}
            value={inputTel}
            className="mb-24"
            label="Phone number"
            id="tel"
            variant="outlined"
            required
            fullWidth
          />
          <TextField
            onChange={onTextChange('address1')}
            value={inputAddress1}
            className="mb-24"
            label="Address 1"
            id="address1"
            variant="outlined"
            required
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            onChange={onTextChange('address2')}
            value={inputAddress2}
            className="mb-24"
            label="Address 2"
            id="address2"
            variant="outlined"
            multiline
            rows={3}
            fullWidth
          />
          <Autocomplete
            freeSolo
            value={subdistrict}
            onChange={(event, newValue) => {
              setSelected(newValue);
              if (newValue && newValue.district) setInputSubDistrict(newValue.district);
              if (newValue && newValue.amphoe) setInputDistrict(newValue.amphoe);
              if (newValue && newValue.province) setInputProvince(newValue.province);
              if (newValue && newValue.zipcode) setInputZipcode(String(newValue.zipcode));
            }}
            getOptionLabel={(option) => option.label || inputSubdistrict || ''}
            inputValue={inputSubdistrict}
            onInputChange={(event, newInputValue) => {
              setInputSubDistrict(newInputValue);
              if (newInputValue !== '') {
                convertOptions(searchAddressByDistrict(newInputValue).slice(0, 10));
              }
            }}
            id="auto-subdistrict"
            options={options}
            sx={{ width: 300 }}
            renderInput={(params) => (
              <TextField
                {...params}
                className="mb-24"
                label="Subdistrict"
                id="subdistrict"
                variant="outlined"
                required
              />
            )}
          />
          <Autocomplete
            freeSolo
            value={district}
            onChange={(event, newValue) => {
              if (newValue && newValue.district) setInputSubDistrict(newValue.district);
              if (newValue && newValue.amphoe) setInputDistrict(newValue.amphoe);
              if (newValue && newValue.province) setInputProvince(newValue.province);
              if (newValue && newValue.zipcode) setInputZipcode(newValue.zipcode);
            }}
            getOptionLabel={(option) => option.label || inputDistrict || ''}
            inputValue={inputDistrict}
            onInputChange={(event, newInputValue) => {
              setInputDistrict(newInputValue);
              if (newInputValue !== '') {
                convertOptions(searchAddressByAmphoe(newInputValue).slice(0, 10));
              }
            }}
            id="auto-district"
            options={options}
            sx={{ width: 300 }}
            renderInput={(params) => (
              <TextField
                {...params}
                className="mb-24"
                label="District"
                id="district"
                variant="outlined"
                required
              />
            )}
          />
          <Autocomplete
            freeSolo
            value={province}
            onChange={(event, newValue) => {
              if (newValue && newValue.district) setInputSubDistrict(newValue.district);
              if (newValue && newValue.amphoe) setInputDistrict(newValue.amphoe);
              if (newValue && newValue.province) setInputProvince(newValue.province);
              if (newValue && newValue.zipcode) setInputZipcode(newValue.zipcode);
            }}
            getOptionLabel={(option) => option.label || inputProvince || ''}
            inputValue={inputProvince}
            onInputChange={(event, newInputValue) => {
              setInputProvince(newInputValue);
              if (newInputValue !== '') {
                convertOptions(searchAddressByProvince(newInputValue).slice(0, 10));
              }
            }}
            id="auto-province"
            options={options}
            sx={{ width: 300 }}
            renderInput={(params) => (
              <TextField
                {...params}
                className="mb-24"
                label="Province"
                id="province"
                variant="outlined"
                required
              />
            )}
          />
          <Autocomplete
            freeSolo
            value={zipcode}
            onChange={(event, newValue) => {
              if (newValue && newValue.district) setInputSubDistrict(newValue.district);
              if (newValue && newValue.amphoe) setInputDistrict(newValue.amphoe);
              if (newValue && newValue.province) setInputProvince(newValue.province);
              if (newValue && newValue.zipcode) setInputZipcode(newValue.zipcode);
            }}
            getOptionLabel={(option) => option.label || inputZipcode || ''}
            inputValue={inputZipcode}
            onInputChange={(event, newInputValue) => {
              setInputZipcode(newInputValue);
              if (newInputValue !== '') {
                convertOptions(searchAddressByZipcode(newInputValue).slice(0, 10));
              }
            }}
            id="auto-zipcode"
            options={options}
            sx={{ width: 300 }}
            renderInput={(params) => (
              <TextField
                {...params}
                className="mb-24"
                label="zipcode"
                id="zipcode"
                variant="outlined"
                required
              />
            )}
          />
        </DialogContent>

        {addressDialog.type === 'new' ? (
          <DialogActions className="justify-between p-4 pb-16">
            <div className="px-16">
              <Button variant="contained" color="secondary" type="submit">
                Add
              </Button>
            </div>
          </DialogActions>
        ) : (
          <DialogActions className="justify-between p-4 pb-16">
            <div className="px-16">
              <Button variant="contained" color="secondary" type="submit">
                Save
              </Button>
            </div>
          </DialogActions>
        )}
      </form>
    </Dialog>
  );
};

export default AddressDialog;

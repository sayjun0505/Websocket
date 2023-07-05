import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import FuseLoading from '@fuse/core/FuseLoading';
// import clsx from 'clsx';
// import { darken } from '@mui/material/styles';
// import { motion } from 'framer-motion';
import _ from '@lodash';
import * as yup from 'yup';
// import { useForm } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
// import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
// import TextField from '@mui/material/TextField';
// import InputAdornment from '@mui/material/InputAdornment';

// import InputLabel from '@mui/material/InputLabel';
// import MenuItem from '@mui/material/MenuItem';
// import FormControl from '@mui/material/FormControl';
// import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Cards from 'react-credit-cards';
import axios from 'axios';
import { Buffer } from 'buffer';
import 'react-credit-cards/es/styles-compiled.css';

import { addCreditCard } from '../../store/creditCardSlice';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
  number: yup.string().required('You must enter a card number'),
  name: yup.string().required('You must enter a name on your card'),
  expiryMM: yup.string().required('You must enter aa expiry month'),
  expiryYY: yup.string().required('You must enter an expiry year'),
  cvc: yup.string().required('You must enter a cvc'),
});

const CreditCard = (props) => {
  const { activation } = props;
  const dispatch = useDispatch();

  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [focused, setFocused] = useState('name');
  const [cardToken, setCardToken] = useState(null);
  const [auth, setAuth] = useState(null);

  const { control, watch, reset, handleSubmit, formState, getValues } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      number: '',
      name: '',
      expiryMM: '',
      expiryYY: '',
      cvc: '',
    },
  });

  const { isValid, dirtyFields, errors } = formState;

  const form = watch();
  const number = watch('number');
  const name = watch('name');
  const expiryMM = watch('expiryMM');
  const expiryYY = watch('expiryYY');
  const cvc = watch('cvc');

  useEffect(() => {
    if (!process.env.REACT_APP_GBPAY_PUBLIC_KEY || !process.env.REACT_APP_GBPAY_URL) {
      // console.error('[ENV] need to setup GBPAY ENV');
    }
  }, []);

  useEffect(() => {
    if (cardToken) {
      // console.error('[CardToken] ', cardToken);
      dispatch(
        addCreditCard({
          activationId: activation.id,
          card: {
            name,
            number,
            expirationMonth: expiryMM,
            expirationYear: expiryYY,
            token: cardToken,
          },
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardToken]);

  const getCardToken = () => {
    setLoading(true);
    const url = process.env.REACT_APP_GBPAY_URL;
    const publicKey = process.env.REACT_APP_GBPAY_PUBLIC_KEY;
    // console.log('referenceNo ', `${Date.now()}`);

    if (publicKey && url) {
      const referenceNo = `${Date.now()}`;
      const amount =
        period === 'month' ? activation.package.monthlyPrice : activation.package.yearlyPrice;
      const basicAuth = Buffer.from(`${publicKey}:`).toString('base64');
      // console.log('[GBPAY] CreditCard auth ', basicAuth);
      axios
        .post(
          `${url}/v2/tokens`,
          {
            rememberCard: true,
            card: {
              number,
              expirationMonth: expiryMM,
              expirationYear: expiryYY,
              securityCode: cvc,
              name,
            },
          },
          {
            headers: {
              Authorization: `Basic ${basicAuth}`,
            },
          }
        )
        .then((result) => {
          // console.log('[GBPAY] CreditCard ', result.data);
          if (result && result.data && result.data.resultCode === '00') {
            setCardToken(result.data.card.token);
          }
          setLoading(false);
        })
        .catch((error) => {
          // console.log('[GBPAY] CreditCard ', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  const handleInputFocus = ({ target }) => {
    setFocused(target.name);
  };

  /**
   * Form Submit
   */
  const onSubmit = (data) => {
    // console.log('[PAY] Submit Credit ', data);
    getCardToken();
  };

  if (_.isEmpty(form)) {
    return <FuseLoading />;
  }

  return (
    <div className="flex flex-col items-center pt-16 space-y-8">
      <Cards
        number={number}
        name={name}
        expiry={expiryMM && expiryYY ? `${expiryMM}${expiryYY}` : ''}
        cvc={cvc}
        focused={focused}
      />

      <div className="flex flex-col w-full px-64">
        <Controller
          control={control}
          name="number"
          render={({ field }) => (
            <TextField
              className="mt-16"
              type="text"
              {...field}
              label="Card Number"
              placeholder="Card Number"
              id="number"
              error={!!errors.number}
              helperText={errors?.number?.message}
              variant="outlined"
              fullWidth
              required
              onFocus={handleInputFocus}
              inputProps={{ maxLength: 16 }}
            />
          )}
        />

        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <TextField
              className="mt-16"
              {...field}
              label="Name"
              placeholder="Name"
              id="name"
              error={!!errors.name}
              helperText={errors?.name?.message}
              variant="outlined"
              fullWidth
              required
              onFocus={handleInputFocus}
              inputProps={{ maxLength: 250 }}
            />
          )}
        />

        <div className="flex flex-row w-full space-x-8">
          <div className="flex flex-row w-full space-x-8">
            <Controller
              control={control}
              name="expiryMM"
              render={({ field }) => (
                <TextField
                  className="mt-16"
                  {...field}
                  label="Month"
                  placeholder="Month"
                  id="expiryMM"
                  error={!!errors.expiryMM}
                  helperText={errors?.expiryMM?.message}
                  variant="outlined"
                  fullWidth
                  required
                  inputProps={{ maxLength: 2 }}
                />
              )}
            />
            <Controller
              control={control}
              name="expiryYY"
              render={({ field }) => (
                <TextField
                  className="mt-16"
                  {...field}
                  label="Year"
                  placeholder="Year"
                  id="expiryYY"
                  error={!!errors.expiryYY}
                  helperText={errors?.expiryYY?.message}
                  variant="outlined"
                  fullWidth
                  required
                  inputProps={{ maxLength: 2 }}
                />
              )}
            />
          </div>

          <Controller
            control={control}
            name="cvc"
            render={({ field }) => (
              <TextField
                className="mt-16"
                {...field}
                label="CVC"
                placeholder="CVC"
                id="cvc"
                error={!!errors.cvc}
                helperText={errors?.cvc?.message}
                variant="outlined"
                fullWidth
                required
                onFocus={handleInputFocus}
                // eslint-disable-next-line
                inputProps={{ maxLength: 3 }}
              />
            )}
          />
        </div>
        <Button
          className="flex w-full mt-32"
          variant="contained"
          color="secondary"
          disabled={_.isEmpty(dirtyFields) || !isValid}
          onClick={handleSubmit(onSubmit)}
        >
          Pay
        </Button>
      </div>
    </div>
  );
};

export default CreditCard;

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import FuseLoading from '@fuse/core/FuseLoading';
import axios from 'axios';
import { Button } from '@mui/material';

const PromptPay = (props) => {
  const { activation } = props;
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [QRCodeImage, setQRCodeImage] = useState(null);

  useEffect(() => {
    if (!process.env.REACT_APP_GBPAY_TOKEN || !process.env.REACT_APP_GBPAY_URL) {
      // console.error('[ENV] need to setup GBPAY ENV');
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getQRCode = () => {
    setLoading(true);
    const url = process.env.REACT_APP_GBPAY_URL;
    const token = process.env.REACT_APP_GBPAY_TOKEN;
    const backgroundUrl = `${process.env.REACT_APP_BACKEND_URL}/api/webhook/gbpay`;

    // console.log('[QRCODE] url:', url);
    // console.log('[QRCODE] token:', token);
    // console.log('[QRCODE] backgroundUrl:', backgroundUrl);
    // console.log('[QRCODE] referenceNo:', activation.referenceNo);
    if (token && url) {
      const bodyFormData = new FormData();
      bodyFormData.append('token', token);
      bodyFormData.append('amount', `${activation.price}.00`);
      bodyFormData.append('referenceNo', activation.referenceNo);
      bodyFormData.append('backgroundUrl', backgroundUrl);
      bodyFormData.append('merchantDefined1', activation.paymentOption);
      axios
        .post(`${url}/v3/qrcode`, bodyFormData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          responseType: 'blob',
        })
        .then((result) => {
          const imageObjectURL = URL.createObjectURL(result.data);
          setQRCodeImage(imageObjectURL);
          // console.log('[GBPAY] ', imageObjectURL);
          setLoading(false);
        })
        .catch((error) => {
          // console.log('[GBPAY] ', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activation && activation.price) {
      getQRCode();
    }
  }, [activation]);

  return (
    <div className="flex flex-col items-center">
      {loading && <FuseLoading />}
      {!loading && QRCodeImage && (
        <Button
          variant="contained"
          color="secondary"
          className="m-16"
          onClick={() => {
            // window.location.href = QRCodeImage;
            window.open(QRCodeImage, '_blank');
          }}
        >
          <span className="mx-8">Download</span>
        </Button>
      )}
      {!loading && QRCodeImage && <img alt="QRCode" src={QRCodeImage} />}
    </div>
  );
};

export default PromptPay;

/* eslint-disable consistent-return */
import { useEffect } from 'react';
import { Paper } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import PreviewText from '../components/reply/previews/PreviewText';
import PreviewImage from '../components/reply/previews/PreviewImage';
import PreviewButtons from '../components/reply/previews/PreviewButtons';
import PreviewConfirm from '../components/reply/previews/PreviewConfirm';
import PreviewCarousel from '../components/reply/previews/PreviewCarousel';

const AutoReplyContentPreview = (props) => {
  const { responses } = props;
  const methods = useFormContext();
  const { watch } = methods;
  const watchChannel = watch('channel');

  useEffect(() => {
    if (responses) {
      // console.log('🤖 [AutoReplyContentPreview] ', responses);
    }
  }, [responses]);

  return (
    <Paper variant="outlined" className="flex m-12 p-12 h-full rounded flex-col space-y-16">
      {responses && responses.length > 0 ? (
        <>
          {responses.map((response, i) => {
            if (!response.data) {
              return;
            }
            if (
              (response.type === 'text' || response.type === 'image') &&
              !watchChannel.line &&
              !watchChannel.facebook &&
              !watchChannel.instagram
            ) {
              return;
            }
            if (
              response.type === 'buttons' &&
              (!(watchChannel.line || watchChannel.facebook) || watchChannel.instagram)
            ) {
              return;
            }
            if (
              (response.type === 'confirm' ||
                response.type === 'carousel' ||
                response.type === 'flex') &&
              (!watchChannel.line || watchChannel.facebook || watchChannel.instagram)
            ) {
              return;
            }

            const data = JSON.parse(response.data);
            if (response.type === 'text' && data.text) {
              return <PreviewText template={data.text} />;
            }
            if (response.type === 'image' && data.image) {
              return <PreviewImage template={data.image} />;
            }
            if (response.type === 'buttons' && data.buttons) {
              return <PreviewButtons template={data.buttons} />;
            }
            if (response.type === 'confirm' && data.confirm) {
              return <PreviewConfirm template={data.confirm} />;
            }
            if (response.type === 'carousel' && data.carousel) {
              return <PreviewCarousel template={data.carousel} />;
            }
            return null;
          })}
        </>
      ) : null}
    </Paper>
  );
};

export default AutoReplyContentPreview;

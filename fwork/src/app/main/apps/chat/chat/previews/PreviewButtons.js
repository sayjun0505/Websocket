import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

const PreviewButtons = (props) => {
  const { template } = props;
  const [color, setColor] = useState('#FFFFFF');
  const [objectFit, setObjectFit] = useState('cover');

  useEffect(() => {
    if (template && template.imageBackgroundColor) {
      setColor(template.imageBackgroundColor);
    } else {
      setColor('#FFFFFF');
    }
    if (template && template.imageSize) {
      setObjectFit(template.imageSize);
    } else {
      setObjectFit('cover');
    }
  }, [template]);

  if (!template) return null;
  return (
    <div className="flex flex-col w-full items-start">
      <div style={{ width: '250px', backgroundColor: '#f2f2f2' }} className="rounded-xl">
        <div className="flex flex-col w-full">
          {template.thumbnailImageUrl && (
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <>
              {template.imageAspectRatio && template.imageAspectRatio === 'square' ? (
                <img
                  className="rounded-t-xl"
                  src={template.thumbnailImageUrl}
                  alt="response"
                  style={{
                    objectFit,
                    maxWidth: '250px',
                    backgroundColor: color,
                    height: '250px',
                  }}
                />
              ) : (
                <img
                  className="rounded-t-xl"
                  src={template.thumbnailImageUrl}
                  alt="response"
                  style={{
                    objectFit,
                    maxWidth: '250px',
                    backgroundColor: color,
                    height: '166px',
                  }}
                />
              )}
            </>
          )}

          <div className="flex flex-col space-y-10 p-16">
            <Typography className="font-semibold" component="div" color="primary">
              {template.title}
            </Typography>
            <Typography className="" component="div" color="primary">
              {template.text}
            </Typography>
          </div>
          <Divider />
          <div className="flex flex-col w-full space-y-16 p-16">
            {template.actions &&
              template.actions.map((action) => (
                <Typography component="button" align="center" color="primary">
                  {action.label}
                </Typography>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewButtons;

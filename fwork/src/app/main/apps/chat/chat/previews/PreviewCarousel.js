import { Divider, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

const PreviewCarousel = (props) => {
  const { template } = props;

  if (!template) return null;
  return (
    <div className="flex flex-row w-fit space-x-12 overflow-x-scroll">
      {template.columns.map((column) => (
        <Columns column={column} template={template} />
      ))}
    </div>
  );
};

const Columns = (props) => {
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

  return (
    <div className="flex flex-col w-full items-start">
      <div style={{ width: '250px', backgroundColor: '#f2f2f2' }} className="rounded-xl">
        <div className="flex flex-col w-full">
          {props.column.thumbnailImageUrl && (
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <>
              {template.imageAspectRatio && template.imageAspectRatio === 'square' ? (
                <img
                  className="rounded-t-xl"
                  src={props.column.thumbnailImageUrl}
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
                  src={props.column.thumbnailImageUrl}
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
              {props.column.title}
            </Typography>
            <Typography className="" component="div" color="primary">
              {props.column.text}
            </Typography>
          </div>
          <Divider />
          <div className="flex flex-col w-full space-y-16 p-16">
            {props.column.actions &&
              props.column.actions.map((action) => (
                <Typography className="" component="button" align="center" color="primary">
                  {action.label}
                </Typography>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewCarousel;

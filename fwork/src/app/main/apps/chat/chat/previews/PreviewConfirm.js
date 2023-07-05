import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

const PreviewConfirm = (props) => {
  const { template } = props;
  if (!template) return null;
  return (
    <div className="flex flex-col w-full items-start">
      <div style={{ width: '250px', backgroundColor: '#f2f2f2' }} className="rounded-xl">
        <div className="flex flex-col w-full ">
          <Typography className="p-16" component="div" color="primary">
            {template.text}
          </Typography>
          <Divider />
          <div className="flex flex-row w-full justify-around my-12">
            <Typography color="primary">{template.actions[0].label}</Typography>
            <Typography color="primary">{template.actions[1].label}</Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewConfirm;

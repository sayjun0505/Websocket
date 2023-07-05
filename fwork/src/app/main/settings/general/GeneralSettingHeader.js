import Hidden from '@mui/material/Hidden';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
// import { useDispatch } from 'react-redux';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

const GeneralSettingHeader = (props) => {
  // const dispatch = useDispatch();

  return (
    <div className="flex flex-col sm:flex-row flex-1 items-center justify-between p-8 sm:p-24 sm:px-32 relative">
      <div className="flex shrink items-center sm:w-224">
        <Hidden lgUp>
          <IconButton
            onClick={(ev) => props.leftSidebarToggle()}
            aria-label="open left sidebar"
            size="large"
          >
            <FuseSvgIcon>heroicons-outline:menu</FuseSvgIcon>
          </IconButton>
        </Hidden>

        <div className="flex items-center">
          {/* <FuseSvgIcon className="text-48" size={32}>
            material-outline:settings
          </FuseSvgIcon> */}
          <Typography
            component={motion.span}
            initial={{ x: -20 }}
            animate={{ x: 0, transition: { delay: 0.2 } }}
            delay={300}
            className="text-24 md:text-32 font-extrabold tracking-tight leading-none"
          >
            Settings
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettingHeader;

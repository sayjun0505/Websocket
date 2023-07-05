import FuseLoading from '@fuse/core/FuseLoading';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { lighten } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { selectPermission } from 'app/store/permissionSlice';

// import { updateOrganization } from '../store/generalSlice';
import {
  getWorkingHours,
  selectOrganization,
  updateOrganization,
} from '../store/organizationSlice';
import TimeRange from './TimeRange';

const container = {
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};
const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

function WorkingHoursSetting() {
  const dispatch = useDispatch();
  const organization = useSelector(selectOrganization);
  const permission = useSelector(selectPermission);

  const label = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const [value, setValue] = useState();
  const [message, setMessage] = useState('');
  const [updatable, setUpdatable] = useState(false);

  useEffect(() => {
    dispatch(getWorkingHours());
  }, [dispatch]);

  useEffect(() => {
    if (permission && permission.organization && permission.organization.update) {
      setUpdatable(!permission.organization.update);
    } else {
      setUpdatable(false);
    }
  }, [permission]);

  useEffect(() => {
    // console.log('[WorkingHoursSetting] ', organization);
    if (organization && organization.organization) {
      setValue([
        organization.organization.sunday,
        organization.organization.monday,
        organization.organization.tuesday,
        organization.organization.wednesday,
        organization.organization.thursday,
        organization.organization.friday,
        organization.organization.saturday,
      ]);
      // console.log('### organization ', organization.organization);
      setMessage(organization.organization.workingHoursMessage);
    }
  }, [organization]);

  useEffect(() => {
    if (value) {
      // console.log('value ', value);
    }
  }, [value]);
  /**
   * Form Submit
   */
  function onSubmit() {
    // console.log('submit value ', value);
    // console.log('submit message ', message);
    // console.log('submit organization ', organization);
    if (value && value.length === 7 && organization && organization.organization) {
      // const newOrganization = {
      //   ...organization.organization,
      //   sunday: value[0],
      //   monday: value[1],
      //   tuesday: value[2],
      //   wednesday: value[3],
      //   thursday: value[4],
      //   friday: value[5],
      //   saturday: value[6],
      //   workingHoursMessage: message,
      // };
      dispatch(
        updateOrganization({
          ...organization.organization,
          sunday: value[0],
          monday: value[1],
          tuesday: value[2],
          wednesday: value[3],
          thursday: value[4],
          friday: value[5],
          saturday: value[6],
          workingHoursMessage: message,
        })
      );
      // console.log('submit ', {
      //   ...organization,
      //   organization: {
      //     ...organization.organization,
      //     sunday: value[0],
      //     monday: value[1],
      //     tuesday: value[2],
      //     wednesday: value[3],
      //     thursday: value[4],
      //     friday: value[5],
      //     saturday: value[6],
      //   },
      // });
    }
  }

  function onTimeRangeChange(data, index) {
    // console.log('Change data: ', data);
    // console.log('Change index: ', index);
    const newValue = [...value];
    newValue[index] = data;
    setValue(newValue);
    // console.log('submit ', { ...organization, organization: { ...data } });
    // dispatch(updateOrganization({ ...organization, organization: { ...data } }));
    // dispatch(updateOrganization({ ...data }));
  }

  if (!organization || !value) {
    return <FuseLoading />;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className="md:flex m-1 md:m-24">
        <div className="flex flex-col flex-1">
          <Card component={motion.div} variants={item} className="mb-32">
            <CardHeader
              className="px-32 pt-24"
              title={
                <span className="flex items-center space-x-8">
                  <Typography className="text-2xl font-semibold leading-tight">
                    Working Hours
                  </Typography>
                </span>
              }
            />

            <CardContent className="px-32">
              {value.map((element, index) => {
                return (
                  <>
                    <TimeRange
                      disabled={!updatable}
                      className="mb-24"
                      onChange={onTimeRangeChange}
                      label={label[index]}
                      id={index}
                      key={index}
                      value={element}
                    />
                    {/* {index < value.length - 1 && <Divider />} */}
                    <Divider />
                  </>
                );
              })}

              <TextField
                id="whMessage"
                disabled={!updatable}
                label="Working Hour Message"
                variant="outlined"
                value={message}
                multiline
                rows={3}
                onChange={(ev) => {
                  setMessage(ev.target.value);
                }}
                className="w-full mt-12"
              />
            </CardContent>

            <Box
              className="card-footer flex flex-col px-32 py-24 border-t-1"
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? lighten(theme.palette.background.default, 0.4)
                    : lighten(theme.palette.background.default, 0.02),
              }}
            >
              <div className="flex flex-auto -mx-4">
                <div className="flex flex-col flex-1 mx-4 items-end">
                  <div>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      onClick={onSubmit}
                      disabled={!updatable}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </Box>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

export default WorkingHoursSetting;

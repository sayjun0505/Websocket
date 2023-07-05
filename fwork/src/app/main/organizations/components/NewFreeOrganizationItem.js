// import { Box } from '@mui/system';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
// import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
// import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
// import { AvatarGroup } from '@mui/material';
// import Avatar from '@mui/material/Avatar';
// import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { selectPackages } from '../store/packagesSlice';
import { openOrganizationDialog } from '../store/organizationsSlice';

const NewFreeOrganizationItem = () => {
  const dispatch = useDispatch();
  const packages = useSelector(selectPackages);
  const pkg = packages.find((element) => element.name === 'Free');
  const freePackage = pkg || {
    name: 'Free Package',
    organizationLimit: 1,
    userLimit: 3,
    messageLimit: 1000,
    channelLimit: 3,
  };

  return (
    <Card
      onClick={() => dispatch(openOrganizationDialog('free'))}
      role="button"
      className="flex flex-col relative items-start w-full h-full p-24 rounded-lg shadow border-inherit hover:shadow-xl transition-shadow duration-150 ease-in-out overflow-visible"
    >
      <div className="flex flex-col flex-auto justify-start items-start w-full  ">
        <Typography className="mt-10 text-3xl font-medium leading-5 capitalize">
          {freePackage.name}
        </Typography>

        <Divider className="w-96 mt-24 h-2" />
      </div>

      <div className="flex flex-col flex-auto justify-end w-full">
        <div className="flex flex-col mt-8">
          <Typography className="font-semibold">{`${freePackage.name} package features, including:`}</Typography>
          <div className="mt-16 space-y-8">
            {freePackage.organizationLimit && (
              <div className="flex">
                <FuseSvgIcon className="text-green-600" size={20}>
                  heroicons-solid:check
                </FuseSvgIcon>
                <Typography className="ml-2 leading-5">
                  <b>
                    {freePackage.organizationLimit === 0
                      ? 'Unlimited'
                      : freePackage.organizationLimit}
                  </b>{' '}
                  {freePackage.organizationLimit === 1 ? 'organization' : 'organizations'}
                </Typography>
              </div>
            )}
            {freePackage.userLimit && (
              <div className="flex">
                <FuseSvgIcon className="text-green-600" size={20}>
                  heroicons-solid:check
                </FuseSvgIcon>
                <Typography className="ml-2 leading-5">
                  <b>{freePackage.userLimit === 0 ? 'Unlimited' : freePackage.userLimit}</b>{' '}
                  {freePackage.userLimit === 1 ? 'user' : 'users'}
                </Typography>
              </div>
            )}
            {freePackage.messageLimit && (
              <div className="flex">
                <FuseSvgIcon className="text-green-600" size={20}>
                  heroicons-solid:check
                </FuseSvgIcon>
                <Typography className="ml-2 leading-5">
                  <b>{freePackage.messageLimit === 0 ? 'Unlimited' : freePackage.messageLimit}</b>{' '}
                  {freePackage.messageLimit === 1 ? 'message' : 'messages'}
                </Typography>
              </div>
            )}
            {freePackage.channelLimit && (
              <div className="flex">
                <FuseSvgIcon className="text-green-600" size={20}>
                  heroicons-solid:check
                </FuseSvgIcon>
                <Typography className="ml-2 leading-5">
                  <b>{freePackage.channelLimit === 0 ? 'Unlimited' : freePackage.channelLimit}</b>{' '}
                  {freePackage.channelLimit === 1 ? 'channel' : 'channels'}
                </Typography>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center mt-16">
          <Button
            variant="contained"
            color="secondary"
            className="w-full"
            onClick={() => dispatch(openOrganizationDialog('new'))}
          >
            Try for free
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default NewFreeOrganizationItem;

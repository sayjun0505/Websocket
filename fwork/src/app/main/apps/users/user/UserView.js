import Button from '@mui/material/Button';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FuseLoading from '@fuse/core/FuseLoading';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { selectPermission } from 'app/store/permissionSlice';
import { getUser, selectUser } from '../store/userSlice';
import { selectTeams } from '../store/teamsSlice';

const UserView = () => {
  const user = useSelector(selectUser);
  const permission = useSelector(selectPermission);
  const teams = useSelector(selectTeams);
  const routeParams = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUser(routeParams.id));
  }, [dispatch, routeParams]);

  if (!user) {
    return <FuseLoading />;
  }

  return (
    <>
      <div className="relative flex flex-col flex-auto items-center p-24 pt-96 sm:p-48 sm:pt-96 mt-48">
        <div className="w-full max-w-3xl">
          <div className="flex flex-auto items-end -mt-64">
            <Avatar
              sx={{
                borderWidth: 4,
                borderStyle: 'solid',
                borderColor: 'background.paper',
                backgroundColor: 'background.default',
                color: 'text.secondary',
              }}
              className="w-128 h-128 text-64 font-bold"
              src={user.user.avatar || user.user.pictureURL || user.user.picture}
              alt={user.user.display}
            >
              {user.user.display.charAt(0)}
            </Avatar>
            <div className="flex items-center ml-auto mb-4">
              <Button
                variant="contained"
                color="secondary"
                component={NavLinkAdapter}
                to="edit"
                disabled={!(permission && permission.user && permission.user.update)}
              >
                <FuseSvgIcon size={20}>heroicons-outline:pencil-alt</FuseSvgIcon>
                <span className="mx-8">Edit</span>
              </Button>
            </div>
          </div>

          <Typography className="max-w-xs mt-12 text-4xl font-bold truncate">
            {user.user.display}
          </Typography>

          <div className="flex flex-wrap items-center mt-8">
            {user.team && (
              <Chip
                key={user.team.id}
                label={user.team.name}
                // label={_.find(tags, { id }).title}
                className="mr-12 mb-12"
                size="small"
              />
            )}
          </div>

          <Divider className="mt-16 mb-24" />

          <div className="flex flex-col space-y-32">
            {user.user && user.user.firstname && user.user.lastname && (
              <div className="flex items-center">
                <FuseSvgIcon>heroicons-outline:user</FuseSvgIcon>
                <div className="ml-24 leading-6">{`${user.user.firstname} ${user.user.lastname}`}</div>
              </div>
            )}

            {user.user && user.user.display && (
              <div className="flex items-center">
                <FuseSvgIcon>heroicons-outline:identification</FuseSvgIcon>
                <div className="ml-24 leading-6">{user.user.display}</div>
              </div>
            )}

            {user.user && user.user.mobile && (
              <div className="flex items-center">
                <FuseSvgIcon>heroicons-outline:phone</FuseSvgIcon>
                <div className="ml-24 leading-6">{user.user.mobile}</div>
              </div>
            )}

            {user.user && user.user.email && (
              <div className="flex items-center">
                <FuseSvgIcon>heroicons-outline:mail</FuseSvgIcon>
                <div className="ml-24 leading-6">{user.user.email}</div>
              </div>
            )}

            {user.user && user.user.address && (
              <div className="flex">
                <FuseSvgIcon>heroicons-outline:location-marker</FuseSvgIcon>
                <div
                  className="max-w-none ml-24 prose dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: user.user.address }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserView;

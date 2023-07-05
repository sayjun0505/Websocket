import Button from '@mui/material/Button';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FuseLoading from '@fuse/core/FuseLoading';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import format from 'date-fns/format';
import { selectPermission } from 'app/store/permissionSlice';
import { getTeam, selectTeam } from '../store/teamSlice';

const TeamView = () => {
  const team = useSelector(selectTeam);
  const permission = useSelector(selectPermission);
  const routeParams = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getTeam(routeParams.id));
  }, [dispatch, routeParams]);

  if (!team) {
    return <FuseLoading />;
  }

  return (
    <>
      <div className="relative flex flex-col flex-auto items-center p-24 pt-96 sm:p-48 sm:pt-96 mt-48">
        <div className="w-full max-w-3xl">
          <div className="flex flex-auto items-end -mt-64">
            <div className="flex items-center ml-auto mb-4">
              <Button
                variant="contained"
                color="secondary"
                component={NavLinkAdapter}
                to="edit"
                disabled={!(permission && permission.team && permission.team.update)}
              >
                <FuseSvgIcon size={20}>heroicons-outline:pencil-alt</FuseSvgIcon>
                <span className="mx-8">Edit</span>
              </Button>
            </div>
          </div>

          <Typography className="max-w-xs mt-12 text-4xl font-bold truncate">
            {team.name}
          </Typography>

          <Divider className="mt-16 mb-24" />

          <div className="flex flex-col space-y-32">
            {team.createdAt && (
              <div className="flex items-center">
                <FuseSvgIcon>heroicons-outline:calendar</FuseSvgIcon>
                <div className="ml-24 leading-6">
                  Created at {format(new Date(team.createdAt), 'PP')}
                </div>
              </div>
            )}

            {/* {team.updatedAt && (
              <div className="flex items-center">
                <FuseSvgIcon>heroicons-outline:calendar</FuseSvgIcon>
                <div className="ml-24 leading-6">
                  Last update{format(new Date(team.updatedAt), 'PP')}
                </div>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamView;

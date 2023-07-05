import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
// import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
// import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
// import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSelector } from 'react-redux';
import { selectProfile } from '../store/profileSlice';
import { selectOrganization } from '../store/organizationsSlice';

function AboutTab() {
  // const [data, setData] = useState(null);
  const profile = useSelector(selectProfile);
  const organizations = useSelector(selectOrganization);
  // const test = (x) => x + 1;

  // useEffect(() => {
  //   axios.get('/api/profile/about').then((res) => {
  //     setData(res.data);
  //   });
  // }, []);

  if (!profile || !organizations) {
    return null;
  }

  // const { general, work, contact, groups, friends } = data;

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

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="w-full">
      <div className="md:flex">
        <div className="flex flex-col flex-1 md:ltr:pr-32 md:rtl:pl-32">
          <Card component={motion.div} variants={item} className="w-full mb-32">
            <div className="px-32 pt-24">
              <Typography className="text-2xl font-semibold leading-tight">
                General Information
              </Typography>
            </div>

            <CardContent className="px-32 py-24">
              {profile.firstname && profile.lastname && (
                <div className="mb-24">
                  <Typography className="font-semibold mb-4 text-15">Name</Typography>
                  <Typography>{`${profile.firstname} ${profile.lastname}`}</Typography>
                </div>
              )}

              {profile.display && (
                <div className="mb-24">
                  <Typography className="font-semibold mb-4 text-15">Display name</Typography>
                  <Typography>{profile.display}</Typography>
                </div>
              )}

              {profile.gender && (
                <div className="mb-24">
                  <Typography className="font-semibold mb-4 text-15">Gender</Typography>
                  <Typography>{profile.gender}</Typography>
                </div>
              )}

              {profile.mobile && (
                <div className="mb-24">
                  <Typography className="font-semibold mb-4 text-15">Mobile</Typography>
                  <Typography>{profile.mobile}</Typography>
                </div>
              )}

              {profile.address && (
                <div className="mb-24">
                  <Typography className="font-semibold mb-4 text-15">Address</Typography>
                  <Typography>{profile.address}</Typography>
                </div>
              )}

              {profile.createdAt && (
                <div className="mb-24">
                  <Typography className="font-semibold mb-4 text-15">Created Date</Typography>
                  <Typography>{profile.createdAt}</Typography>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:w-320">
          <Card component={motion.div} variants={item} className="w-full mb-32 rounded-16 shadow">
            <div className="px-32 pt-24 flex items-center">
              <Typography className="flex flex-1 text-2xl font-semibold leading-tight">
                Organizations
              </Typography>
            </div>
            <CardContent className="px-32">
              <List className="p-0">
                {organizations.map((organization, index) => (
                  <ListItem key={index} className="px-0 space-x-8">
                    <ListItemText
                      primary={
                        <div className="flex">
                          <Typography
                            className="font-medium capitalize"
                            // color="secondary.main"
                            paragraph={false}
                          >
                            {organization.organization.name}
                          </Typography>
                        </div>
                      }
                      secondary={
                        <Typography
                          className="font-normal text-gray-500 capitalize"
                          paragraph={false}
                        >
                          {organization.role}
                        </Typography>
                      }
                    />
                    {/* <ListItemSecondaryAction>
                      <IconButton size="large">
                        <FuseSvgIcon>heroicons-outline:dots-vertical</FuseSvgIcon>
                      </IconButton>
                    </ListItemSecondaryAction> */}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

export default AboutTab;

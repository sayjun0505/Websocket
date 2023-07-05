import FuseUtils from '@fuse/utils';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Typography from '@mui/material/Typography';
import AddInviteCodeItem from './components/AddInviteCodeItem';
import NewFreeOrganizationItem from './components/NewFreeOrganizationItem';
import NewOrganizationItem from './components/NewOrganizationItem';
import OrganizationItem from './components/OrganizationItem';

import { selectOrganizations } from './store/organizationsSlice';
import { selectFreeActiveActivations, selectOrganizationsFreeSlot } from './store/activationsSlice';

const OrganizationList = () => {
  // const organizations = null;
  const organizations = useSelector(selectOrganizations);
  const freeActivation = useSelector(selectFreeActiveActivations);
  const organizationsFreeSlot = useSelector(selectOrganizationsFreeSlot);
  const searchText = useSelector(
    ({ organizationsApp }) => organizationsApp.organizations.searchText
  );

  const container = {
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const [filteredData, setFilteredData] = useState(null);
  const [freeOrganization, setFreeOrganization] = useState(true);

  useEffect(() => {
    if (!organizations || organizations.length === 0) {
      setFreeOrganization(true);
    } else {
      setFreeOrganization(false);
    }
  }, [organizations]);

  useEffect(() => {
    function getFilteredArray(entities, _searchText) {
      if (_searchText.length === 0) {
        return organizations;
      }
      return FuseUtils.filterArrayByString(organizations, _searchText);
    }

    if (organizations) {
      setFilteredData(getFilteredArray(organizations, searchText));
    }
  }, [organizations, searchText]);
  if ((!filteredData || filteredData.length === 0) && organizations && organizations.length > 0) {
    return (
      <div className="flex flex-1 items-center justify-center h-full">
        <Typography color="text.secondary" variant="h5">
          There are no organizations!
        </Typography>
      </div>
    );
  }
  return (
    <div className="flex grow shrink-0 flex-col items-center container p-24">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-16  w-full"
      >
        {freeActivation && (!organizations || organizations.length === 0) && (
          <motion.div variants={item} className="min-w-full sm:min-w-224 min-h-360">
            <NewFreeOrganizationItem />
          </motion.div>
        )}
        <motion.div variants={item} className="min-w-full sm:min-w-224 min-h-360">
          <AddInviteCodeItem />
        </motion.div>
        {filteredData &&
          filteredData.length > 0 &&
          filteredData.map((organization) => (
            <motion.div
              variants={item}
              className="min-w-full sm:min-w-224 min-h-360"
              key={organization.id}
            >
              <OrganizationItem organization={organization} key={organization.id} />
            </motion.div>
          ))}
        {organizationsFreeSlot > 0 && (
          <motion.div variants={item} className="min-w-full sm:min-w-224 min-h-360">
            <NewOrganizationItem slot={organizationsFreeSlot} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default OrganizationList;

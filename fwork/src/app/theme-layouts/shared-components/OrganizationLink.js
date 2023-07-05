import Button from '@mui/material/Button';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectOrganization } from 'app/store/organizationSlice';

const OrganizationLink = (props) => {
  const organizations = useSelector(selectOrganization);

  return (
    <Button
      component={Link}
      variant="text"
      className="m-8 "
      size="medium"
      to="/organizations"
      onClick={props.onClose}
    >
      {organizations && organizations.organization && organizations.organization.name}
    </Button>
  );
};

export default OrganizationLink;

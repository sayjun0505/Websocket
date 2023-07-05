import _ from '@lodash';

const OrganizationModel = (data) =>
  _.defaults(data || {}, {
    organization: {
      name: '',
      description: null,
      createdBy: null,
      activation: null,
    },
  });

export default OrganizationModel;

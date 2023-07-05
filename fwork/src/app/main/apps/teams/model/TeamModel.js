import _ from '@lodash';

const TeamModel = (data) =>
  _.defaults(data || {}, {
    name: '',
  });

export default TeamModel;

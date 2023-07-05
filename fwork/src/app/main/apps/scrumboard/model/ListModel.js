import _ from '@lodash';

function ListModel(data) {
  data = data || {};

  return _.defaults(data, {
    title: '',
    chatType: '',
    chatLabel: [],
  });
}

export default ListModel;

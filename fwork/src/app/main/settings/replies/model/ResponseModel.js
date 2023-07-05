import _ from '@lodash';

const ResponseModel = (data) =>
  _.defaults(data || {}, {
    data: JSON.stringify({ text: '' }),
    channel: 'default',
    type: 'text',
    order: 1,
  });

export default ResponseModel;

import _ from '@lodash';

const LineChannelModel = (data) =>
  _.defaults(data || {}, {
    id: null,
    channel: 'line',
    status: 'active',
    role: '',
    data: {
      id: null,
      name: '',
      lineId: '',
      accessToken: '',
      channelSecret: '',
      createdAt: null,
      updatedAt: null,
    },
    createdAt: null,
    updatedAt: null,
  });

export default LineChannelModel;

import _ from '@lodash';

const ActivationModel = (data) =>
  _.defaults(data || {}, {
    referenceNo: '',
    description: '',
    payment: null,
    paymentType: 'PromptPay',
    paymentOption: 'yearly',
    package: null,
    organization: 0,
    status: null,
    createdBy: null,
    packageId: null,
  });

export default ActivationModel;

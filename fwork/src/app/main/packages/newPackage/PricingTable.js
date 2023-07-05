import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

import { useSelector } from 'react-redux';
import { selectSortPackage } from '../store/packagesSlice';

import PricingTableHead from './PricingTableHead';

// const tableData = [
//   {
//     title: 'Personal',
//     monthlyPrice: '$9',
//     yearlyPrice: '$6',
//     buttonTitle: 'Buy Personal',
//     isPopular: false,
//     features: {
//       unlimitedProjects: true,
//       unlimitedStorage: true,
//       customDomainSupport: false,
//       dedicatedHardware: false,
//     },
//     payments: {
//       fraudAnalysis: true,
//       rateForInHouse: '2.9% + 30¢',
//       rateForOther: '4.9% + 30¢',
//       additionalFees: '2%',
//     },
//   },
//   {
//     title: 'Premium',
//     monthlyPrice: '$15',
//     yearlyPrice: '$12',
//     buttonTitle: 'Buy Premium',
//     isPopular: true,
//     features: {
//       unlimitedProjects: true,
//       unlimitedStorage: true,
//       customDomainSupport: true,
//       dedicatedHardware: false,
//     },
//     payments: {
//       fraudAnalysis: true,
//       rateForInHouse: '2.9% + 30¢',
//       rateForOther: '4.9% + 30¢',
//       additionalFees: '1%',
//     },
//   },
//   {
//     title: 'Enterprise',
//     monthlyPrice: '$69',
//     yearlyPrice: '$49',
//     buttonTitle: 'Buy Enterprise',
//     isPopular: false,
//     features: {
//       unlimitedProjects: true,
//       unlimitedStorage: true,
//       customDomainSupport: true,
//       dedicatedHardware: true,
//     },
//     payments: {
//       fraudAnalysis: true,
//       rateForInHouse: '2.4% + 30¢',
//       rateForOther: '4.4% + 30¢',
//       additionalFees: '0.5%',
//     },
//   },
//   {
//     title: 'Enterprise',
//     monthlyPrice: '$69',
//     yearlyPrice: '$49',
//     buttonTitle: 'Buy Enterprise',
//     isPopular: false,
//     features: {
//       unlimitedProjects: true,
//       unlimitedStorage: true,
//       customDomainSupport: true,
//       dedicatedHardware: true,
//     },
//     payments: {
//       fraudAnalysis: true,
//       rateForInHouse: '2.4% + 30¢',
//       rateForOther: '4.4% + 30¢',
//       additionalFees: '0.5%',
//     },
//   },
// ];

const TablePricingTable = (props) => {
  const { period } = props;
  const packages = useSelector(selectSortPackage);

  if (!packages || !packages.length > 0) return null;

  return (
    <div className="flex justify-center mt-40 sm:mt-80">
      <Paper className="flex-col lg:flex-row w-full lg:max-w-7xl overflow-x-auto overflow-y-hidden">
        <div className="grid grid-flow-col lg:grid-flow-row min-w-max lg:min-w-0 divide-x lg:divide-x-0 lg:divide-y">
          <div className="sticky left-0 grid grid-flow-row auto-rows-fr lg:grid-flow-col lg:auto-cols-fr lg:max-w-none divide-y lg:divide-y-0 lg:divide-x shadow-lg lg:shadow-none border-r lg:border-r-0 rounded-l lg:rounded-l-none overflow-hidden">
            <Box
              className="py-32 px-16 overflow-hidden"
              sx={{ backgroundColor: 'background.paper' }}
            />
            {packages.map((item, index) => (
              <PricingTableHead key={index} data={item} period={period} />
            ))}
          </div>

          <Box
            sx={{ backgroundColor: 'background.default' }}
            className="hidden lg:block p-16 col-span-full"
          >
            <Typography className="text-md font-semibold">FEATURES</Typography>
          </Box>

          <div className="grid grid-flow-row auto-rows-fr lg:grid-flow-col lg:auto-cols-fr divide-y lg:divide-y-0 lg:divide-x">
            <Typography className="flex items-center lg:items-start max-w-128 lg:max-w-none p-16 font-medium lg:font-normal text-center lg:text-left">
              Organizations
            </Typography>

            {packages
              .map((item) => item.organizationLimit)
              .map((val, index) => (
                <TableCell value={val} key={index} />
              ))}
          </div>

          <div className="grid grid-flow-row auto-rows-fr lg:grid-flow-col lg:auto-cols-fr divide-y lg:divide-y-0 lg:divide-x">
            <Typography className="flex items-center lg:items-start max-w-128 lg:max-w-none p-16 font-medium lg:font-normal text-center lg:text-left">
              User / Organization
            </Typography>

            {packages
              .map((item) => item.userLimit)
              .map((val, index) => (
                <TableCell value={val} key={index} />
              ))}
          </div>

          <div className="grid grid-flow-row auto-rows-fr lg:grid-flow-col lg:auto-cols-fr divide-y lg:divide-y-0 lg:divide-x">
            <Typography className="flex items-center lg:items-start max-w-128 lg:max-w-none p-16 font-medium lg:font-normal text-center lg:text-left">
              Message / Organization
            </Typography>

            {packages
              .map((item) => item.messageLimit)
              .map((val, index) => (
                <TableCell value={val} key={index} />
              ))}
          </div>

          <div className="grid grid-flow-row auto-rows-fr lg:grid-flow-col lg:auto-cols-fr divide-y lg:divide-y-0 lg:divide-x">
            <Typography className="flex items-center lg:items-start max-w-128 lg:max-w-none p-16 font-medium lg:font-normal text-center lg:text-left">
              Channel / Organization
            </Typography>

            {packages
              .map((item) => item.channelLimit)
              .map((val, index) => (
                <TableCell value={val} key={index} />
              ))}
          </div>
        </div>
      </Paper>
    </div>
  );
};

const TableCell = ({ value }) => {
  if (typeof value === 'string' || typeof value === 'number') {
    return (
      <div className="flex items-center justify-center lg:justify-start p-16">
        <Typography>{value}</Typography>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center lg:justify-start p-16">
      {value ? (
        <FuseSvgIcon size={20} className="text-green-600">
          heroicons-solid:check
        </FuseSvgIcon>
      ) : (
        <FuseSvgIcon size={20}>heroicons-solid:minus</FuseSvgIcon>
      )}
    </div>
  );
};

export default TablePricingTable;

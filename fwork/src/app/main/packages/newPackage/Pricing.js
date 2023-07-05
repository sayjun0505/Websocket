import { useState } from 'react';
import Typography from '@mui/material/Typography';
import { darken } from '@mui/material/styles';
import Box from '@mui/material/Box';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectSortPackage } from '../store/packagesSlice';

import PricingTable from './PricingTable';

const Pricing = (props) => {
  const packages = useSelector(selectSortPackage);
  const [period, setPeriod] = useState('yearly');

  if (!packages) {
    return null;
  }

  if (packages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center h-full">
        <Typography color="text.secondary" variant="h5">
          There are no pricing detail!
        </Typography>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col flex-auto min-w-0 overflow-hidden">
      <div className="relative pt-32 pb-48 sm:pt-80 sm:pb-96 px-24 sm:px-64 overflow-hidden">
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          >
            <div className="mt-4 text-4xl sm:text-7xl font-extrabold tracking-tight leading-tight text-center">
              Choose Package
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }}>
            <Box
              className="flex items-center mt-32 sm:mt-64 p-2 rounded-full overflow-hidden"
              sx={{ backgroundColor: (theme) => darken(theme.palette.background.default, 0.05) }}
            >
              {/* <Box
                component="button"
                className={clsx(
                  'h-40 items-center px-16 cursor-pointer rounded-full font-medium',
                  period === 'monthly' && 'shadow'
                )}
                onClick={() => setPeriod('monthly')}
                sx={{ backgroundColor: period === 'monthly' ? 'background.paper' : '' }}
                type="button"
              >
                Monthly billing
              </Box> */}

              {/* <Box
                component="button"
                className={clsx(
                  'h-40 items-center px-16 cursor-pointer rounded-full font-medium',
                  period === 'quarterly' && 'shadow'
                )}
                onClick={() => setPeriod('quarterly')}
                sx={{ backgroundColor: period === 'quarterly' ? 'background.paper' : '' }}
                type="button"
              >
                Quarterly billing
              </Box> */}

              <Box
                component="button"
                className={clsx(
                  'h-40 items-center px-16 cursor-pointer rounded-full font-medium',
                  period === 'halfYearly' && 'shadow'
                )}
                onClick={() => setPeriod('halfYearly')}
                sx={{ backgroundColor: period === 'halfYearly' ? 'background.paper' : '' }}
                type="button"
              >
                Half-Yearly billing
              </Box>

              <Box
                component="button"
                className={clsx(
                  'h-40 items-center px-16 cursor-pointer rounded-full font-medium',
                  period === 'yearly' && 'shadow'
                )}
                onClick={() => setPeriod('yearly')}
                sx={{ backgroundColor: period === 'yearly' ? 'background.paper' : '' }}
                type="button"
              >
                Yearly billing
              </Box>
            </Box>
          </motion.div>
        </div>

        <PricingTable period={period} />
      </div>
    </div>
  );
};

export default Pricing;

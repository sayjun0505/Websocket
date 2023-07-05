import { useEffect } from 'react';
import { selectUser } from 'app/store/userSlice';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const StripePricing = (props) => {
  const user = useSelector(selectUser);

  useEffect(() => {
    if (!process.env.REACT_APP_STRIPE_PRICING_TABLE || !process.env.REACT_APP_STRIPE_PUBLIC_KEY) {
      // console.error('[ENV] need to setup STRIPE ENV');
    }
  }, []);

  return (
    <div className="relative flex flex-col flex-auto min-w-0 overflow-hidden">
      <div className="relative pt-24 pb-48 sm:pt-40 sm:pb-48 px-24 sm:px-64 overflow-hidden">
        <div className="flex flex-col items-center pb-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          >
            <div className="mt-4 text-4xl sm:text-7xl font-extrabold tracking-tight leading-tight text-center">
              Choose Package
            </div>
          </motion.div>
        </div>
        <stripe-pricing-table
          className="w-full"
          pricing-table-id={process.env.REACT_APP_STRIPE_PRICING_TABLE}
          publishable-key={process.env.REACT_APP_STRIPE_PUBLIC_KEY}
          customer-email={user.data.email}
        />
      </div>
    </div>
  );
};

export default StripePricing;

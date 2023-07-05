import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

const PricingTableHead = (props) => {
  const { period, data } = props;
  const { name, yearlyPrice, quarterlyPrice, monthlyPrice, halfYearlyPrice } = data;

  return (
    <Box className="flex flex-col" sx={{ backgroundColor: 'background.paper' }}>
      <div className="flex flex-col justify-center p-16 pt-12 lg:py-32">
        <div className="flex items-center">
          <div className="text-xl lg:text-2xl font-medium">{name}</div>
        </div>

        <div className="flex items-baseline lg:mt-16 whitespace-nowrap">
          <Typography className="text-lg" color="text.secondary">
            THB
          </Typography>
          <Typography className="mx-8 text-2xl lg:text-4xl font-bold tracking-tight">
            {/* {period === 'monthly' && monthlyPrice}
            {period === 'quarterly' && quarterlyPrice} */}
            {period === 'halfYearly' && halfYearlyPrice}
            {period === 'yearly' && yearlyPrice}
          </Typography>
          <Typography className="text-2xl" color="text.secondary">
            {/* {period === 'monthly' && `/ month`}
            {period === 'quarterly' && `/ quarter`} */}
            {period === 'halfYearly' && `/ half year`}
            {period === 'yearly' && `/ year`}
          </Typography>
        </div>

        {!data.isFree && (
          <Button
            className="w-full min-h-32 h-32 lg:min-h-40 lg:h-40 mt-12 lg:mt-24"
            variant="contained"
            color="secondary"
            component={NavLinkAdapter}
            // to={`new/${data.id}`}
            to={`new/${period}/${data.id}`}
            // disabled={data.isFree}
          >
            Choose
          </Button>
        )}
      </div>
    </Box>
  );
};

PricingTableHead.defaultProps = {
  className: '',
  period: 'monthly',
  data: {},
};

export default PricingTableHead;

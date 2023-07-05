import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import TableHead from '@mui/material/TableHead';
import { lighten } from '@mui/material/styles';

const rows = [
  {
    id: 'gbpReferenceNo',
    align: 'left',
    disablePadding: false,
    label: 'Reference',
    sort: true,
  },
  {
    id: 'amount',
    align: 'right',
    disablePadding: false,
    label: 'Total',
    sort: true,
  },
  {
    id: 'paymentType',
    align: 'center',
    disablePadding: false,
    label: 'Payment',
    sort: true,
  },
  {
    id: 'resultCode',
    align: 'center',
    disablePadding: false,
    label: 'Status',
    sort: true,
  },
  {
    id: 'paymentAt',
    align: 'left',
    disablePadding: false,
    label: 'Data',
    sort: true,
  },
];

function PaymentsTableHead(props) {
  const [selectedProductsMenu, setSelectedProductsMenu] = useState(null);

  const dispatch = useDispatch();

  const createSortHandler = (property) => (event) => {
    props.onRequestSort(event, property);
  };

  function openSelectedProductsMenu(event) {
    setSelectedProductsMenu(event.currentTarget);
  }

  function closeSelectedProductsMenu() {
    setSelectedProductsMenu(null);
  }

  return (
    <TableHead>
      <TableRow className="h-48 sm:h-64">
        {rows.map((row) => {
          return (
            <TableCell
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? lighten(theme.palette.background.default, 0.4)
                    : lighten(theme.palette.background.default, 0.02),
              }}
              className="p-4 md:p-16"
              key={row.id}
              align={row.align}
              padding={row.disablePadding ? 'none' : 'normal'}
              sortDirection={props.order.id === row.id ? props.order.direction : false}
            >
              {row.sort && (
                <Tooltip
                  title="Sort"
                  placement={row.align === 'right' ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={props.order.id === row.id}
                    direction={props.order.direction}
                    onClick={createSortHandler(row.id)}
                    className="font-semibold"
                  >
                    {row.label}
                  </TableSortLabel>
                </Tooltip>
              )}
            </TableCell>
          );
        }, this)}
      </TableRow>
    </TableHead>
  );
}

export default PaymentsTableHead;

import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FuseUtils from '@fuse/utils';
import _ from '@lodash';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import format from 'date-fns/format';
import { useEffect, useState } from 'react';

import { useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import withRouter from '@fuse/core/withRouter';
import FuseLoading from '@fuse/core/FuseLoading';
import { getPayments, selectPayments, selectSearchText } from '../store/paymentsSlice';
import ProductsTableHead from './PaymentsTableHead';

function PaymentsTable(props) {
  const dispatch = useDispatch();
  const payments = useSelector(selectPayments);
  const searchText = useSelector(selectSearchText);
  const routeParams = useParams();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState({
    direction: 'asc',
    id: null,
  });
  // console.log('[Location] ', location.pathname);

  useEffect(() => {
    dispatch(getPayments(routeParams.id)).then(() => setLoading(false));
  }, [dispatch, routeParams]);

  useEffect(() => {
    if (payments && payments.length > 0) {
      setData(payments);
    }
  }, [payments]);

  useEffect(() => {
    if (searchText.length !== 0) {
      setData(FuseUtils.filterArrayByString(payments, searchText));
      setPage(0);
    } else {
      setData(payments);
    }
  }, [payments, searchText]);

  function handleRequestSort(event, property) {
    const id = property;
    let direction = 'desc';

    if (order.id === property && order.direction === 'desc') {
      direction = 'asc';
    }

    setOrder({
      direction,
      id,
    });
  }

  function handleClick(item) {
    props.navigate(`${location.pathname}/${item.id}`);
  }

  function handleChangePage(event, value) {
    setPage(value);
  }

  function handleChangeRowsPerPage(event) {
    setRowsPerPage(event.target.value);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <FuseLoading />
      </div>
    );
  }

  if (data && data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-1 items-center justify-center h-full"
      >
        <Typography color="text.secondary" variant="h5">
          There are no payments!
        </Typography>
      </motion.div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-full">
      <FuseScrollbars className="grow overflow-x-auto">
        <Table stickyHeader className="min-w-xl" aria-labelledby="tableTitle">
          <ProductsTableHead
            order={order}
            onRequestSort={handleRequestSort}
            rowCount={data.length}
          />

          <TableBody>
            {_.orderBy(
              data,
              [
                (o) => {
                  switch (order.id) {
                    default: {
                      return o[order.id];
                    }
                  }
                },
              ],
              [order.direction]
            )
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item) => {
                return (
                  <TableRow
                    className="h-72 cursor-pointer"
                    hover
                    role="button"
                    tabIndex={-1}
                    key={item.id}
                    onClick={(event) => handleClick(item)}
                  >
                    <TableCell className="p-4 md:p-16" component="th" scope="row">
                      {item.gbpReferenceNo}
                    </TableCell>

                    <TableCell className="p-4 md:p-16" component="th" scope="row" align="right">
                      {item.amount}
                      <span>฿</span>
                    </TableCell>

                    <TableCell className="p-4 md:p-16" component="th" scope="row" align="center">
                      {item.paymentType}
                      {/* <i
                        className={clsx(
                          'inline-block w-8 h-8 rounded mx-8',
                          n.quantity <= 5 && 'bg-red',
                          n.quantity > 5 && n.quantity <= 25 && 'bg-orange',
                          n.quantity > 25 && 'bg-green'
                        )}
                      /> */}
                    </TableCell>

                    <TableCell className="p-4 md:p-16" component="th" scope="row" align="center">
                      {item.resultCode}
                    </TableCell>

                    <TableCell className="p-4 md:p-16" component="th" scope="row" align="left">
                      {format(new Date(item.paymentAt), 'PP')}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </FuseScrollbars>

      <TablePagination
        className="shrink-0 border-t-1"
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        backIconButtonProps={{
          'aria-label': 'Previous Page',
        }}
        nextIconButtonProps={{
          'aria-label': 'Next Page',
        }}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
}

export default withRouter(PaymentsTable);

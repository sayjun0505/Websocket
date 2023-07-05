import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { memo, useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import Box from '@mui/material/Box';
import { useDispatch } from 'react-redux';

const UnifiedChatInboxWidget = (props) => {
  const dispatch = useDispatch();

  const theme = useTheme();

  const [awaitRender, setAwaitRender] = useState(true);

  const [overview, setOverview] = useState();
  const [series, setSeries] = useState();
  const [ranges, setRanges] = useState();
  const [currentRange, setCurrentRanges] = useState();

  const [tabValue, setTabValue] = useState(0);
  
  const chartOptions = {
    chart: {
      fontFamily: 'inherit',
      foreColor: 'inherit',
      height: '100%',
      type: 'line',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    colors: [theme.palette.primary.main, theme.palette.secondary.main],
    dataLabels: {
      enabled: true,
      enabledOnSeries: [0],
      background: {
        borderWidth: 0,
      },
    },
    grid: {
      borderColor: theme.palette.divider,
    },
    legend: {
      show: false,
    },
    plotOptions: {
      bar: {
        columnWidth: '50%',
      },
    },
    states: {
      hover: {
        filter: {
          type: 'darken',
          value: 0.75,
        },
      },
    },
    stroke: {
      width: [3, 0],
    },
    tooltip: {
      followCursor: true,
      theme: theme.palette.mode,
    },
    xaxis: {
      type: 'datetime',
      min: Date.now() - 6 * 86400000, // Where the 6 is the number of days
      max: Date.now(), // Today
      axisBorder: {
        show: false,
      },
      axisTicks: {
        color: theme.palette.divider,
      },
      labels: {
        format: 'ddd',
        style: {
          colors: theme.palette.text.secondary,
        },
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      labels: {
        offsetX: -16,
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },
  };

  useEffect(() => {
    setAwaitRender(false);
  }, []);

  useEffect(() => {
    if (props.data) {
      if (props.data.overview) {
        setOverview(props.data.overview);
      }
      if (props.data.series) {
        setSeries(props.data.series);
      }
      if (props.data.ranges) {
        setRanges(props.data.ranges);
        setCurrentRanges(Object.keys(ranges)[tabValue]);
      }
    }
  }, [props.data]);

  if (awaitRender) {
    return null;
  }

  return (
    <Paper className="flex flex-col flex-auto p-24 shadow rounded-xl overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start justify-between">
        <Typography className="text-lg font-medium tracking-tight leading-6 truncate">
          Unified Chat Inbox Summary
        </Typography>
        <div className="mt-12 sm:mt-0 sm:ml-8">
          <Tabs
            value={tabValue}
            onChange={(ev, value) => setTabValue(value)}
            indicatorColor="secondary"
            textColor="inherit"
            variant="scrollable"
            scrollButtons={false}
            className="-mx-4 min-h-40"
            classes={{ indicator: 'flex justify-center bg-transparent w-full h-full' }}
            TabIndicatorProps={{
              children: (
                <Box
                  sx={{ bgcolor: 'text.disabled' }}
                  className="w-full h-full rounded-full opacity-20"
                />
              ),
            }}
          >
            {ranges &&
              Object.entries(ranges).map(([key, label]) => (
                <Tab
                  className="text-14 font-semibold min-h-40 min-w-64 mx-4 px-12"
                  disableRipple
                  key={key}
                  label={label}
                />
              ))}
          </Tabs>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 grid-flow-row gap-24 w-full mt-32 sm:mt-16">
        <div className="flex flex-col flex-auto">
          <Typography className="font-medium" color="text.secondary">
            Inbox
          </Typography>
          <div className="flex flex-col flex-auto">
            {series && currentRange && (
              <ReactApexChart
                className="flex-auto w-full"
                options={chartOptions}
                series={series[currentRange]}
                height={320}
              />
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <Typography className="font-medium" color="text.secondary">
            Overview
          </Typography>
          <div className="flex-auto grid grid-cols-2 gap-16 mt-24">
            <div className="flex flex-col items-center justify-center py-32 px-4 rounded-2xl bg-indigo-50">
              <Typography className="text-5xl sm:text-7xl font-semibold leading-none tracking-tight text-indigo">
                {(overview && currentRange && overview.length && overview[currentRange]) || 0}
              </Typography>
              <Typography className="mt-4 text-sm sm:text-lg font-medium text-indigo-800">
                Total Message
              </Typography>
            </div>
            <div className="flex flex-col items-center justify-center py-32 px-4 rounded-2xl bg-green-50">
              <Typography className="text-5xl sm:text-7xl font-semibold leading-none tracking-tight text-green">
                {(props.messageToday && props.messageToday.count) || 0}
              </Typography>
              <Typography className="mt-4 text-sm sm:text-lg font-medium text-green-800">
                {props.messageToday && props.messageToday.title}
              </Typography>
            </div>
            {/* <WidgetIncomingMessage data={widgets.messageToday} /> */}
          </div>
        </div>
      </div>
    </Paper>
  );
};

export default memo(UnifiedChatInboxWidget);

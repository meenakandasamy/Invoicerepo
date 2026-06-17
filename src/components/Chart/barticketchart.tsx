import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

interface TicketMetrics {
  finishedTicket: number;
  assignedTicket: number;
  unfinishedTicket: number;
  inProgressTicketCount: number;
  createdTicket: number;
}

interface AdvancedTicketChartProps {
  chartData: {
    ticketStateTypes: Record<string, TicketMetrics>;
  };
}

export default function AdvancedTicketChart({
  chartData,
}: AdvancedTicketChartProps) {
  console.log(chartData);
  
  const formattedData = useMemo(() => {
    if (!chartData?.ticketStateTypes) return [];

    const order = [ 'Open','Hold','Close'];

    return Object.entries(chartData.ticketStateTypes)
      .map(([statusName, values]) => ({
        statusName,
        ...values,
      }))
      .sort((a, b) => {
        const aIndex = order.indexOf(a.statusName);
        const bIndex = order.indexOf(b.statusName);

        return (
          (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
          (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex)
        );
      });
  }, [chartData]);

  const categories = formattedData.map(
    (item) => item.statusName
  );

  const series = [
    {
      name: 'Created',
      data: formattedData.map(
        (item) => item.createdTicket
      ),
    },
    {
      name: 'Assigned',
      data: formattedData.map(
        (item) => item.assignedTicket
      ),
    },
    {
      name: 'In Progress',
      data: formattedData.map(
        (item) => item.inProgressTicketCount
      ),
    },
    {
      name: 'Unfinished',
      data: formattedData.map(
        (item) => item.unfinishedTicket
      ),
    },
    {
      name: 'Finished',
      data: formattedData.map(
        (item) => item.finishedTicket
      ),
    },
  ];

  const maxValue = Math.max(
    ...series.flatMap((item) => item.data),
    0
  );

  const yAxisMax = Math.ceil(maxValue / 10) * 10 || 10;

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: {
        show: true,
      },
      //  fontFamily: 'Inter, sans-serif',
   
      animations: {
        enabled: true,
      },
    },

    colors: [
      '#F97316',
      '#38BDF8',
      '#5B4DD8',
      '#E5E7EB',
      '#22C55E',
    ],

    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
        borderRadius: 8,
        borderRadiusApplication: 'end',
        distributed: false,
      },
    },

    fill: {
      type: 'pattern',
      opacity: 1,
      pattern: {
        style: 'horizontalLines',
        width: 15,
        height: 15,
        strokeWidth: 20,
      },
    },

    stroke: {
      show: true,
      width: 2,
      colors: ['#FFFFFF'],
    },

    dataLabels: {
      enabled: false,
    },

    xaxis: {
      categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
         colors: '#334155',
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 600,
        },
      },
    },

    yaxis: {
      min: 0,
      max: yAxisMax,
      tickAmount: 4,
      labels: {
        style: {
          colors: ['#94A3B8'],
          fontSize: '12px',
        },
      },
    },

    grid: {
      borderColor: '#E2E8F0',
      strokeDashArray: 4,
      padding: {
        left: 10,
        right: 10,
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },

    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '12px',
      itemMargin: {
        horizontal: 16,
      },
      markers: {
        width: 10,
        height: 10,
        radius: 999,
      },
    },

    tooltip: {
      shared: true,
      intersect: false,
      theme: 'light',
    },

    states: {
      hover: {
        filter: {
          type: 'none',
        },
      },
    },
  };

  if (!formattedData.length) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
        No chart data available
      </div>
    );
  }

  return (
    <div className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Status Specific Chart
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Ticket status overview
          </p>
        </div>

        <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
          ⋮
        </button>
      </div>

      <Chart
        options={options}
        series={series}
        type="bar"
        height={300}
      />
    </div>
  );
}
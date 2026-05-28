import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

/* ---------------------------------------
   TYPES
---------------------------------------- */
interface TicketMetrics {
  finishedTicket: number;
  AssignedTicket: number;
  unfinishedTicket: number;
  inProgressTicketCount: number;
  createdTicket: number;
}

interface ChartDataItem extends TicketMetrics {
  statusName: string;
}

interface AdvancedTicketChartProps {
  chartData: {
    ticketTypes: Record<string, TicketMetrics>;
  };
}

/* ---------------------------------------
   CUSTOM TOOLTIP
---------------------------------------- */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0];

    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-2xl">
        {/* Title */}
        <p className="mb-2 text-sm font-semibold text-slate-800">
          {label}
        </p>

        {/* Tooltip Content */}
        <div className="flex items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor: item.color,
              }}
            />

            <span className="text-xs font-medium text-slate-600">
              {item.name}
            </span>
          </div>

          <span className="text-xs font-bold text-slate-900">
            {item.value}
          </span>
        </div>
      </div>
    );
  }

  return null;
};

/* ---------------------------------------
   MAIN COMPONENT
---------------------------------------- */
export default function AdvancedTicketChart({
  chartData,
}: AdvancedTicketChartProps) {
  /* ---------------------------------------
     FORMAT DATA
  ---------------------------------------- */
  const formattedData: ChartDataItem[] = useMemo(() => {
    if (!chartData?.ticketTypes) return [];

    return Object.entries(chartData.ticketTypes).map(
      ([statusName, values]) => ({
        statusName,
        ...values,
      })
    );
  }, [chartData]);

  /* ---------------------------------------
     EMPTY STATE
  ---------------------------------------- */
  if (formattedData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500 shadow-sm">
        No chart data available.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Status Specific Chart
        </h2>
      </div>

      {/* Chart */}
      <div className="h-[320px] w-full [&_*:focus]:outline-none [&_*:focus]:ring-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            margin={{
              top: 20,
              right: 10,
              left: -10,
              bottom: 0,
            }}
            barGap={8}
            barCategoryGap="20%"
          >
            {/* Grid */}
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E2E8F0"
            />

            {/* X Axis */}
            <XAxis
              dataKey="statusName"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: '#475569',
                fontSize: 14,
                fontWeight: 500,
              }}
            />

            {/* Y Axis */}
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: '#94A3B8',
                fontSize: 12,
              }}
            />

            {/* Tooltip */}
            <Tooltip
              shared={false}
              offset={15}
              wrapperStyle={{
                outline: 'none',
              }}
              cursor={{
                fill: 'rgba(148,163,184,0.08)',
              }}
              content={<CustomTooltip />}
            />

            {/* Legend */}
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              iconSize={10}
              wrapperStyle={{
                paddingTop: 25,
                fontSize: '13px',
                fontWeight: 500,
              }}
            />

            {/* Finished */}
            <Bar
              dataKey="finishedTicket"
              name="Finished"
              fill="#38BDF8"
              radius={[8, 8, 0, 0]}
              maxBarSize={40}
            />

            {/* Assigned */}
            <Bar
              dataKey="AssignedTicket"
              name="Assigned"
              fill="#6366F1"
              radius={[8, 8, 0, 0]}
              maxBarSize={40}
            />

            {/* Unfinished */}
            <Bar
              dataKey="unfinishedTicket"
              name="Unfinished"
              fill="#22C55E"
              radius={[8, 8, 0, 0]}
              maxBarSize={40}
            />

            {/* Created */}
            <Bar
              dataKey="createdTicket"
              name="Created"
              fill="#F97316"
              radius={[8, 8, 0, 0]}
              maxBarSize={40}
            />

            {/* In Progress */}
            <Bar
              dataKey="inProgressTicketCount"
              name="In Progress"
              fill="#8B5CF6"
              radius={[8, 8, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
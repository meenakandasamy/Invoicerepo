import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
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
   MAIN COMPONENT
---------------------------------------- */
export default function AdvancedTicketChart({
  chartData,
}: AdvancedTicketChartProps) {
  /* ---------------------------------------
     CONVERT OBJECT -> ARRAY
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

  console.log(formattedData);

  /* ---------------------------------------
     EMPTY STATE
  ---------------------------------------- */
  if (formattedData.length === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center text-sm text-neutral-500">
        No chart data available.
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base font-bold text-neutral-800 dark:text-white">
          Ticket Status Metrics
        </h2>
      </div>

      {/* Chart */}
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
            barSize={40}
          >
            {/* Gradients */}
            <defs>
              <linearGradient
                id="assignedGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>

              <linearGradient
                id="createdGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#FB923C" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>

              <linearGradient
                id="finishedGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#4ADE80" />
                <stop offset="100%" stopColor="#16A34A" />
              </linearGradient>

              <linearGradient
                id="progressGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#7E22CE" />
              </linearGradient>

              <linearGradient
                id="unfinishedGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#F87171" />
                <stop offset="100%" stopColor="#DC2626" />
              </linearGradient>
            </defs>

            {/* Grid */}
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />

            {/* X Axis */}
            <XAxis
              dataKey="statusName"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: '#6B7280',
                fontSize: 12,
                fontWeight: 500,
              }}
            />

            {/* Y Axis */}
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: '#9CA3AF',
                fontSize: 11,
              }}
            />

            {/* Legend */}
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                paddingTop: 10,
                fontSize: '11px',
                fontWeight: 500,
              }}
            />

            {/* Bars */}
            <Bar
              dataKey="AssignedTicket"
              name="Assigned"
              stackId="tickets"
              fill="url(#assignedGradient)"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="createdTicket"
              name="Created"
              stackId="tickets"
              fill="url(#createdGradient)"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="finishedTicket"
              name="Finished"
              stackId="tickets"
              fill="url(#finishedGradient)"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="inProgressTicketCount"
              name="In Progress"
              stackId="tickets"
              fill="url(#progressGradient)"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="unfinishedTicket"
              name="Unfinished"
              stackId="tickets"
              fill="url(#unfinishedGradient)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
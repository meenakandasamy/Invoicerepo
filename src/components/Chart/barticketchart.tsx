import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

type RawApiResponse = Record<string, TicketMetrics>;

/* ---------------------------------------
   API MOCK
---------------------------------------- */
const fetchStatusData = async (): Promise<RawApiResponse> => {
  return {
    Close: {
      finishedTicket: 196,
      AssignedTicket: 0,
      unfinishedTicket: 0,
      inProgressTicketCount: 0,
      createdTicket: 0,
    },
    Hold: {
      finishedTicket: 0,
      AssignedTicket: 0,
      unfinishedTicket: 0,
      inProgressTicketCount: 0,
      createdTicket: 0,
    },
    Open: {
      finishedTicket: 22,
      AssignedTicket: 84,
      unfinishedTicket: 0,
      inProgressTicketCount: 10,
      createdTicket: 0,
    },
  };
};

/* ---------------------------------------
   CUSTOM TOOLTIP
---------------------------------------- */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce(
      (acc: number, item: any) => acc + item.value,
      0
    );

    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
        <p className="mb-2 text-xs font-bold text-neutral-800 dark:text-neutral-100">
          {label} ({total})
        </p>

        <div className="space-y-1">
          {payload.map((item: any) => {
            if (item.value === 0) return null;

            return (
              <div
                key={item.name}
                className="flex items-center justify-between gap-6 text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: item.color,
                    }}
                  />

                  <span className="text-neutral-500 dark:text-neutral-400">
                    {item.name}
                  </span>
                </div>

                <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};

/* ---------------------------------------
   MAIN COMPONENT
---------------------------------------- */
export default function AdvancedTicketChart() {
  const {
    data: rawData,
    isLoading,
    isError,
  } = useQuery<RawApiResponse>({
    queryKey: ['ticketStatusMetrics'],
    queryFn: fetchStatusData,
  });

  /* ---------------------------------------
     TRANSFORM DATA
  ---------------------------------------- */
  const chartData = useMemo(() => {
    if (!rawData) return [];

    return Object.entries(rawData).map(([status, metrics]) => ({
      statusName: status,
      ...metrics,
    }));
  }, [rawData]);

  /* ---------------------------------------
     LOADING
  ---------------------------------------- */
  if (isLoading) {
    return (
      <div className="flex h-[250px] items-center justify-center text-sm text-neutral-500">
        Loading metrics...
      </div>
    );
  }

  /* ---------------------------------------
     ERROR
  ---------------------------------------- */
  if (isError || !rawData) {
    return (
      <div className="flex h-[250px] items-center justify-center text-sm text-red-500">
        Failed to load chart metrics.
      </div>
    );
  }

  /* ---------------------------------------
     UI
  ---------------------------------------- */
  return (
    <div className="w-full rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base font-bold text-neutral-800 dark:text-white">
          Ticket Status Metrics
        </h2>

     
      </div>

      {/* Chart */}
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
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

            {/* Tooltip */}
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                fill: 'rgba(0,0,0,0.02)',
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
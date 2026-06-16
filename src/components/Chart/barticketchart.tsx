import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

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
    ticketStateTypes: Record<string, TicketMetrics>;
  };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
      <p className="mb-2 text-sm font-semibold text-slate-700">
        {label}
      </p>

      {payload.map((item: any) => (
        <div
          key={item.dataKey}
          className="flex items-center justify-between gap-4 py-1"
        >
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: item.color }}
            />
            <span className="text-xs text-slate-600">
              {item.name}
            </span>
          </div>

          <span className="text-xs font-semibold text-slate-800">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function AdvancedTicketChart({
  chartData,
}: AdvancedTicketChartProps) {
  const formattedData: ChartDataItem[] = useMemo(() => {
    if (!chartData?.ticketStateTypes) return [];

    return Object.entries(chartData.ticketStateTypes).map(
      ([statusName, values]) => ({
        statusName,
        ...values,
      })
    );
  }, [chartData]);

  if (!formattedData.length) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-2xl border ">
        No chart data available
      </div>
    );
  }

  return (
    <div className="w-full rounded-3xl border ">
      <h2 className="mb-5 text-lg font-semibold text-slate-800">
        Status Specific Chart
      </h2>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
            barCategoryGap="45%"
          >
            <CartesianGrid
              vertical={false}
              stroke="#E5E7EB"
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="statusName"
              axisLine={false}
              tickLine={false}
              padding={{
                left: 30,
                right: 30,
              }}
              tick={{
                fill: '#475569',
                fontSize: 13,
                fontWeight: 500,
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: '#94A3B8',
                fontSize: 12,
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{
                paddingTop: '15px',
              }}
            />

            {/* Bottom */}
            <Bar
              dataKey="createdTicket"
              name="Created"
              stackId="tickets"
              fill="#FB8C00"
              barSize={50}
              radius={[0, 0, 12, 12]}
              stroke="#fff"
              strokeWidth={3}
            />

            {/* Middle */}
            <Bar
              dataKey="AssignedTicket"
              name="Open"
              stackId="tickets"
              fill="#2196F3"
              stroke="#fff"
              strokeWidth={3}
            />

            <Bar
              dataKey="inProgressTicketCount"
              name="In Progress"
              stackId="tickets"
              fill="#7C4DFF"
              stroke="#fff"
              strokeWidth={3}
            />

            <Bar
              dataKey="unfinishedTicket"
              name="Unfinished"
              stackId="tickets"
              fill="#EF4444"
              stroke="#fff"
              strokeWidth={3}
            />

            {/* Top */}
            <Bar
              dataKey="finishedTicket"
              name="Finished"
              stackId="tickets"
              fill="#22C55E"
              stroke="#fff"
              strokeWidth={3}
            >
              {formattedData.map((_, index) => (
                <Cell
                  key={index}
                  radius={[12, 12, 0, 0]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
import {
  Ticket,
  UserCheck,
  BellRing,
  Clock3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface TicketSummaryProps {
  ticketcard: any;
}

export default function TicketStatuscard({
  ticketcard,
}: TicketSummaryProps) {
  const data = ticketcard?.totalTickets || {};

  const total =
    (data?.assignedTicketCount || 0) +
    (data?.holdTicketCount || 0) +
    (data?.inProgressTicketCount || 0) +
    (data?.closeTicketCount || 0);

  const stats = [
    {
      title: "Total Tickets",
      value: total,
      subtitle: "All Tickets",
      icon: Ticket,
      bg: "bg-purple-50",
      iconBg: "bg-purple-100",
      text: "text-purple-600",
    },
    {
      title: "Assigned Tickets",
      value: data?.assignedTicketCount || 0,
      subtitle: "Assigned to users",
      icon: UserCheck,
      bg: "bg-cyan-50",
      iconBg: "bg-cyan-100",
      text: "text-cyan-600",
    },
    {
      title: "In Progress",
      value: data?.inProgressTicketCount || 0,
      subtitle: "Work in progress",
      icon: Clock3,
      bg: "bg-orange-50",
      iconBg: "bg-orange-100",
      text: "text-orange-500",
    },
    {
      title: "Hold Tickets",
      value: data?.holdTicketCount || 0,
      subtitle: "Waiting for action",
      icon: BellRing,
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      text: "text-blue-600",
    },
    {
      title: "Finished",
      value: data?.closeTicketCount || 0,
      subtitle: "Successfully completed",
      icon: CheckCircle2,
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      text: "text-green-600",
    },
    {
      title: "Unfinished",
      value:
        total -
        (data?.closeTicketCount || 0),
      subtitle: "Pending completion",
      icon: AlertCircle,
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      text: "text-red-600",
    },
  ];

  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className={`${item.bg} rounded-xl p-4 transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${item.text}`}>
                    {item.title}
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-gray-900">
                    {item.value.toLocaleString()}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    {item.subtitle}
                  </p>
                </div>

                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full ${item.iconBg}`}
                >
                  <Icon className={`h-7 w-7 ${item.text}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
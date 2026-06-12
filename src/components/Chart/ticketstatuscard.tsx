import {
  Ticket,
  BellRing,
  Clock3,
  CheckCircle2,
} from "lucide-react";

interface TicketSummaryProps {
  ticketcard: 

}

export default function TicketStatuscard({
  ticketcard,
 
}: TicketSummaryProps) {
    console.log(ticketcard);
    
  const stats = [
    {
      title: "Total Tickets",
      value: totalTickets,
      subtitle: "All time",
      icon: Ticket,
      bg: "bg-purple-50",
      iconBg: "bg-purple-100",
      text: "text-purple-600",
    },
    {
      title: "Open Tickets",
      value: openTickets,
      subtitle: "Currently open",
      icon: BellRing,
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      text: "text-blue-600",
    },
    {
      title: "In Progress",
      value: inProgressTickets,
      subtitle: "Actively in progress",
      icon: Clock3,
      bg: "bg-orange-50",
      iconBg: "bg-orange-100",
      text: "text-orange-500",
    },
    {
      title: "Completed",
      value: completedTickets,
      subtitle: "Successfully completed",
      icon: CheckCircle2,
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      text: "text-green-600",
    },
  ];

  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className={`${item.bg} rounded-xl p-5 flex items-center justify-between`}
            >
              <div>
                <h4 className={`text-sm font-semibold ${item.text}`}>
                  {item.title}
                </h4>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {item.value.toLocaleString()}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  {item.subtitle}
                </p>
              </div>

              <div
                className={`h-14 w-14 rounded-full ${item.iconBg} flex items-center justify-center`}
              >
                <Icon className={`h-7 w-7 ${item.text}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
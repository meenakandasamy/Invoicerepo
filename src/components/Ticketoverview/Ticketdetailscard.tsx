import {
  CalendarDays,
  ClipboardList,
  FileText,
  Flag,
  Hash,
  LayoutGrid,
  MapPin,
  Tag,
  User,
  Wrench,
} from 'lucide-react';

type TicketDetailsCardProps = {
  ticketdetails: any;
};

function TicketDetailsCard({
  ticketdetails,
}: TicketDetailsCardProps) {
  const formatDate = (date: number) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('en-GB');
  };

  const getPriority = (priority: number) => {
    switch (priority) {
      case 1:
        return 'Low';
      case 2:
        return 'Medium';
      case 3:
        return 'High';
      default:
        return '-';
    }
  };

  const carddata = [
    {
      label: 'Ticket No',
      key: 'ticketCode',
      icon: Hash,
      iconBg: 'bg-[#EEF2FF]',
      iconColor: 'text-[#6D5DF6]',
    },
    {
      label: 'Site Name',
      key: 'siteName',
      icon: MapPin,
      iconBg: 'bg-[#EEF2FF]',
      iconColor: 'text-[#6D5DF6]',
    },
    {
      label: 'Type',
      key: 'ticketTypeName',
      icon: LayoutGrid,
      iconBg: 'bg-[#EEF2FF]',
      iconColor: 'text-[#6D5DF6]',
    },
    {
      label: 'Category',
      key: 'categoryName',
      icon: Tag,
      iconBg: 'bg-[#F3E8FF]',
      iconColor: 'text-[#8B5CF6]',
    },

    {
      label: 'Equipment Name',
      key: 'displayName',
      icon: Wrench,
      iconBg: 'bg-[#E6FFFB]',
      iconColor: 'text-[#14B8A6]',
    },
    {
      label: 'Priority',
      key: 'priority',
      icon: Flag,
      iconBg: 'bg-[#FFF7ED]',
      iconColor: 'text-[#F97316]',
    },
    {
      label: 'Assigned To',
      key: 'assignedBy',
      icon: User,
      iconBg: 'bg-[#EFF6FF]',
      iconColor: 'text-[#3B82F6]',
    },
    {
      label: 'Subject',
      key: 'subject',
      icon: ClipboardList,
      iconBg: 'bg-[#F5F3FF]',
      iconColor: 'text-[#8B5CF6]',
    },

    {
      label: 'Schedule On',
      key: 'scheduleOn',
      icon: CalendarDays,
      iconBg: 'bg-[#EEF2FF]',
      iconColor: 'text-[#6366F1]',
    },
    {
      label: 'Created Date',
      key: 'createdDate',
      icon: CalendarDays,
      iconBg: 'bg-[#ECFDF5]',
      iconColor: 'text-[#22C55E]',
    },
    {
      label: 'Created By',
      key: 'userName',
      icon: User,
      iconBg: 'bg-[#FFF7ED]',
      iconColor: 'text-[#F59E0B]',
    },
  ];

  const getValue = (key: string) => {
    const value = ticketdetails?.[key];

    if (key === 'priority') {
      return getPriority(value);
    }

    if (key === 'createdDate' || key === 'scheduleOn') {
      return formatDate(value);
    }

    return value || '-';
  };
const getStatusStyles = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'assigned':
      return {
        bg: 'bg-indigo-100',
        text: 'text-indigo-500',
        dot: 'bg-indigo-500',
      };

    case 'created':
      return {
        bg: 'bg-orange-100',
        text: 'text-orange-500',
        dot: 'bg-orange-500',
      };

    case 'finished':
      return {
        bg: 'bg-cyan-100',
        text: 'text-cyan-500',
        dot: 'bg-cyan-500',
      };

    case 'in progress':
    case 'inprogress':
      return {
        bg: 'bg-violet-100',
        text: 'text-violet-500',
        dot: 'bg-violet-500',
      };

    case 'unfinished':
      return {
        bg: 'bg-green-100',
        text: 'text-green-500',
        dot: 'bg-green-500',
      };

    default:
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-500',
        dot: 'bg-slate-500',
      };
  }
};const statusStyle = getStatusStyles(
  ticketdetails?.statusName,
);
  return (
    <div className="rounded-xl  bg-white shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 ">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
            <FileText className="w-6 h-6 text-[#6D5DF6]" />
          </div>

          <h2 className="text-[20px] font-semibold text-slate-700">
            Ticket Details
          </h2>
        </div>

        {/* status */}
   <div
  className={`
    flex items-center gap-2 px-2 py-1 rounded-full text-sm font-medium
    ${statusStyle.bg}
    ${statusStyle.text}
  `}
>
  <span
    className={`w-2 h-2 rounded-full ${statusStyle.dot}`}
  />

  {ticketdetails?.statusName || '-'}
</div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        {carddata.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={item.key}
              className={`
                flex items-start gap-3 p-4
           
              `}
            >
              {/* icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.iconBg}`}
              >
                <Icon
                  className={`w-6 h-6 ${item.iconColor}`}
                />
              </div>

              {/* text */}
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500">
                  {item.label}
                </p>

                <div className="flex items-center  flex-wrap">
                  <p className="text-sm font-semibold text-slate-700 break-words">
                    {getValue(item.key)}
                  </p>

                  {/* priority badge */}
                  {/* {item.key === 'priority' && (
                    <span className="px-2 py-[2px] rounded bg-[#FEE2E2] text-[#EF4444] text-[10px] font-semibold">
                      {getValue(item.key)}
                    </span>
                  )} */}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TicketDetailsCard;
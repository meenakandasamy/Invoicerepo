import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useMemo, useState } from 'react';
import { TicketconfigServices } from '@/integrations/Services/TicketconfigServices';
import { useMutationFn } from '@/utils/common/queryUtils';

interface CalendarViewProps {
  selectedSite: string;
  selectedSiteId: number;
}

export const CalendarView = ({
  selectedSiteId,
}: CalendarViewProps) => {
  const [ticketDataState, setTicketDataState] = useState<any>([]);
const [openPopup, setOpenPopup] = useState(false);
const [selectedDate, setSelectedDate] = useState('');
const [selectedTickets, setSelectedTickets] = useState<any>([]);
  const postTicketlistMutation = useMutationFn(
    TicketconfigServices.TicketFilterlist,
    null,
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Finished':
        return {
          backgroundColor: '#dff5e6',
          textColor: '#14532d',
        };

      case 'Assigned':
        return {
          backgroundColor: '#fff4c4',
          textColor: '#854d0e',
        };

      case 'Inprogress':
        return {
          backgroundColor: '#fde2e2',
          textColor: '#991b1b',
        };

      case 'Offline':
        return {
          backgroundColor: '#fff4c4',
          textColor: '#854d0e',
        };

      default:
        return {
          backgroundColor: '#f1f5f9',
          textColor: '#334155',
        };
    }
  };

  const calendarEvents = useMemo(() => {
    return ticketDataState.map((item: any) => {
      const styles = getStatusStyle(item.statusName);

      return {
        id: String(item.ticketId),
        title: item.ticketCode,
        date: formatDate(item.scheduleOn),

        backgroundColor: styles.backgroundColor,
        borderColor: styles.backgroundColor,
        textColor: styles.textColor,

        extendedProps: {
          ticketCode: item.ticketCode,
          categoryName: item.categoryName,
          statusName: item.statusName,
        },
      };
    });
  }, [ticketDataState]);

  const handleDateChange = (arg: any) => {
    const currentTitle = arg.view.title;

    const [monthName, year] = currentTitle.split(' ');

    const month = new Date(
      `${monthName} 1, ${year}`,
    ).getMonth();

    const startDate = new Date(
      Number(year),
      month,
      1,
    );

    const endDate = new Date(
      Number(year),
      month + 1,
      0,
    );

    const data = {
      fromDate: formatDate(startDate.getTime()),
      toDate: formatDate(endDate.getTime()),
      filterType: 'scheduleOn',
      siteId: [selectedSiteId],
    };

    postTicketlistMutation.mutate(data, {
      onSuccess: (response: any) => {
        setTicketDataState(response || []);
      },
    });
  };
const handleTicketClick = (ticket: any) => {
  console.log('Ticket Id:', ticket.ticketId);

  // Your function here
  // navigate(`/ticket/${ticket.ticketId}`);
};
  return (
    <div className="calendar-wrapper">
    <FullCalendar
  plugins={[
    dayGridPlugin,
    interactionPlugin,
  ]}
  initialView="dayGridMonth"
  events={calendarEvents}
  datesSet={handleDateChange}
  dayMaxEvents={3}
  fixedWeekCount={false}
  eventDisplay="block"
  height="auto"
  headerToolbar={{
    left: 'prev,next',
    center: 'title',
    right: '',
  }}
  moreLinkClick={(info) => {
    const clickedDate = formatDate(
      info.date.getTime(),
    );

    const ticketsForDate =
      ticketDataState.filter(
        (ticket) =>
          formatDate(
            ticket.scheduleOn,
          ) === clickedDate,
      );

    setSelectedDate(
      info.date.toDateString(),
    );
    setSelectedTickets(
      ticketsForDate,
    );
    setOpenPopup(true);

    return false;
  }}
  eventContent={(arg) => {
    const {
      ticketCode,
      categoryName,
      statusName,
    } = arg.event.extendedProps;

    return (
      <div
        style={{
          padding: '2px 6px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {ticketCode} - {categoryName} -{' '}
        {statusName}
      </div>
    );
  }}
/>
{openPopup && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background:
        'rgba(0,0,0,0.4)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}
  >
    <div
      style={{
        width: '900px',
        maxHeight: '80vh',
        overflowY: 'auto',
        background: '#fff',
        borderRadius: '10px',
        padding: '20px',
        boxShadow:
          '0 4px 20px rgba(0,0,0,0.2)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h3>{selectedDate}</h3>

        <button
          onClick={() =>
            setOpenPopup(false)
          }
          style={{
            border: 'none',
            background: 'none',
            fontSize: '20px',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>

      {selectedTickets.map(
        (ticket:any) => (
          <div
            key={ticket.ticketId}
            style={{
              background:
                '#dff5e6',
              border:
                '1px solid #cce8d5',
              borderRadius:
                '8px',
              padding: '12px',
              marginBottom:
                '10px',
            }}
          >
            <div
              onClick={() =>
                handleTicketClick(
                  ticket,
                )
              }
              style={{
                cursor:
                  'pointer',
                color:
                  '#2563eb',
                fontWeight:
                  'bold',
                marginBottom:
                  '6px',
              }}
            >
              {ticket.ticketCode} -  {ticket.categoryName} - {ticket.statusName}
            </div>

            
          </div>
        ),
      )}
    </div>
  </div>
)}
    </div>
  );
};
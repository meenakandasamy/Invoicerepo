import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useMemo, useState } from 'react';
import { TicketconfigServices } from '@/integrations/Services/TicketconfigServices';
import { useMutationFn } from '@/utils/common/queryUtils';

// import './calendar.css';

interface CalendarViewProps {
  selectedSite: string;
  selectedSiteId: number;
}

export const CalendarView = ({
  selectedSiteId,
}: CalendarViewProps) => {
  const [ticketDataState, setTicketDataState] =
    useState<any[]>([]);

  const postTicketlistMutation = useMutationFn(
    TicketconfigServices.TicketFilterlist,
    null,
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1,
    ).padStart(2, '0');
    const day = String(
      date.getDate(),
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const getStatusStyle = (
    status: string,
  ) => {
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
    return ticketDataState.map(
      (item: any) => {
        const styles = getStatusStyle(
          item.statusName,
        );

        return {
          id: String(item.ticketId),
          title: item.ticketCode,
          date: formatDate(item.scheduleOn),

          backgroundColor:
            styles.backgroundColor,
          borderColor:
            styles.backgroundColor,
          textColor: styles.textColor,

          extendedProps: {
            ticketCode: item.ticketCode,
            categoryName:
              item.categoryName,
            statusName:
              item.statusName,
          },
        };
      },
    );
  }, [ticketDataState]);

  const handleDateChange = (
    arg: any,
  ) => {
    const currentTitle =
      arg.view.title;

    const [monthName, year] =
      currentTitle.split(' ');

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
      fromDate: formatDate(
        startDate.getTime(),
      ),
      toDate: formatDate(
        endDate.getTime(),
      ),
      filterType: 'scheduleOn',
      siteId: [selectedSiteId],
    };

    postTicketlistMutation.mutate(
      data,
      {
        onSuccess: (
          response: any,
        ) => {
          setTicketDataState(
            response || [],
          );
        },
      },
    );
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
        moreLinkClick="popover"
        fixedWeekCount={false}
        eventDisplay="block"
        height="auto"
        headerToolbar={{
          left: 'prev,next',
          center: 'title',
          right: '',
        }}
        eventContent={(arg) => {
          const {
            ticketCode,
            categoryName,
            statusName,
          } =
            arg.event.extendedProps;

          return (
            <div className="ticket-event">
              <div className="ticket-code">
                {ticketCode}-   {categoryName}-
                {statusName}
              </div>

              <div className="ticket-status">
             
              </div>
            </div>
          );
        }}
        eventClick={(info) => {
          console.log(
            'Ticket Id:',
            info.event.id,
          );
        }}
      />
    </div>
  );
};
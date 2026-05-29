import { useState } from 'react';

import {
  createFileRoute,
  useRouteContext,
  useSearch,
} from '@tanstack/react-router';
import { useQueriesFn } from '@/utils/common/queryUtils';
import {
  TicketconfigQueries,
  TicketconfigServices,
} from '@/integrations/Services/TicketconfigServices';
import TicketDetailsCard from '@/components/Ticketoverview/Ticketdetailscard'
import { Decrypt } from '@/utils/auth/encryptor';
import TicketActivityTable from '@/components/Ticketoverview/Tickettable'

export const Route = createFileRoute(
  '/ticket_expenditure/_wrapper/ticket_overview',
)({
  component: RouteComponent,
});

function RouteComponent() {
  const search = useSearch({
    from: '/ticket_expenditure/_wrapper/ticket_overview',
  });

  const { hasCreateAccess, hasUpdateAccess, session } = useRouteContext({
    from: '/ticket_expenditure/_wrapper/ticket_overview',
  });

  const decryptedUrl = Decrypt({
    encryptedString: search.ticketKey,
    key: import.meta.env.VITE_AES_SECRET_KEY,
    iv: import.meta.env.VITE_AES_IV,
  });
  const urlResponse = JSON.parse(decryptedUrl);

  const [ticketHistory, setTickethistory] = useState<Array<any>>([]);
  const [ticketdetails, setTicketdetails] = useState<Array<any>>([]);
  console.log(ticketdetails);
  
  const queries = [
    {
    queryKey: TicketconfigQueries.GET_TICKET_DETAILS,
      api: TicketconfigServices.fetchgetallTicketdetails,
      setState: setTicketdetails,
      id: urlResponse?.ticketId,
    },
    {
     
            queryKey: TicketconfigQueries.GET_TICKET_HISTORY,
      api: TicketconfigServices.fetchgetallTicketHistory,
      setState: setTickethistory,
      id: urlResponse?.ticketId,
    },
  ];
  const {
    data: [dependentResponse],
    status,
  } = useQueriesFn(queries);

  return  (<div className="p-4">
      <TicketDetailsCard
        ticketdetails={ticketdetails}
      />
            <TicketActivityTable
        ticketHistory={ticketHistory}
      />
    </div>)
}

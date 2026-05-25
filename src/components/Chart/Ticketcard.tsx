import React from 'react';
import {
  ClipboardList,
  X,
  ShieldCheck,
  Users,
} from 'lucide-react';

interface TicketSummaryProps {
  data: {
    waitingForApprovalCount: number;
    pendingCount: number;
    rejectedCount: number;
    closeTicketCount: number;
    approvedCount: number;
  };
}

const TicketSummaryCards: React.FC<TicketSummaryProps> = ({ data }) => {
  const cards = [
    {
      title: 'Total Tickets',
      value: data.waitingForApprovalCount,
      icon: <ClipboardList size={42} />,
      bg: '#EEF2FF',
    },
    {
      title: 'Closed Tickets',
      value: data.closeTicketCount,
      icon: <X size={42} color="orangered" />,
      bg: '#FFF1EB',
    },
    {
      title: '1st Approval',
      value: data.pendingCount,
      icon: <ShieldCheck size={42} color="crimson" />,
      bg: '#EDFDF5',
    },
    {
      title: '2nd Approval',
      value: data.approvedCount,
      icon: <ShieldCheck size={42} color="crimson" />,
      bg: '#F3E8FF',
    },
    {
      title: 'Reassign Count',
      value: data.rejectedCount,
      icon: <Users size={42} />,
      bg: '#EEF4FF',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '20px',
        width: '100%',
      }}
    >
      {cards.map((card, index) => (
        <div
          key={index}
          style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '28px 20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            textAlign: 'center',
            border: '1px solid #E5E7EB',
          }}
        >
          <div
            style={{
              width: '90px',
              height: '90px',
              margin: '0 auto 20px',
              borderRadius: '22px',
              background: card.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {card.icon}
          </div>

          <h3
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#334155',
              marginBottom: '18px',
            }}
          >
            {card.title}
          </h3>

          <h1
            style={{
              fontSize: '45px',
              fontWeight: 600,
              color: '#0F172A',
              lineHeight: 1,
            }}
          >
            {card.value}
          </h1>
        </div>
      ))}
    </div>
  );
};

export default TicketSummaryCards;
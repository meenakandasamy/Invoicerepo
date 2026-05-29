import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_wrapper/ticket_overview')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>hi</div>;
}
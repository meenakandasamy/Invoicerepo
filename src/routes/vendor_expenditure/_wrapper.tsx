import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/vendor_expenditure/_wrapper')({
  beforeLoad: async () => {},
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full">
      <Outlet />
    </div>
  );
}

import * as React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useRouterState } from '@tanstack/react-router';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function CustomBreadcrumbs() {
  const { location } = useRouterState();
  const pathname = location.pathname;

  const rawSegments = pathname.split('/').filter(Boolean);

  // Detect root mode
  const modeSegment = rawSegments.find((seg) =>
    ['ticket', 'admin'].includes(seg),
  );

  // Remove unnecessary segments
  const segments = rawSegments.filter(
    (seg) => !['ticket', 'admin'].includes(seg),
  );

  const segmentTitleMap: Record<string, string> = {
    sop: 'Sop',
    Approval: 'Ticket Approval',
    config: 'Ticket Configuration',
  
  };

  const basePath = modeSegment ? `/${modeSegment}` : '';

  const formatLabel = (segment: string) => {
    return (
      segmentTitleMap[segment] ||
      decodeURIComponent(segment)
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
    );
  };

  return (
   <div className="inline-flex items-center px-2 py-1">
      <Breadcrumb>
        <BreadcrumbList className="flex items-center gap-1">
          {/* Home */}
          <BreadcrumbItem>
           
              <Home
                size={16}
                className="transition-transform color-slate-600 group-hover:scale-110"
              />
              {/* <span>Home</span> */}
        
          </BreadcrumbItem>

          {segments.length > 0 && (
            <BreadcrumbSeparator>
              <ChevronRight
                size={16}
                className="text-muted-foreground/50 color-slate-600"
              />
            </BreadcrumbSeparator>
          )}

          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1;

            const href = `${basePath}/${segments
              .slice(0, index + 1)
              .join('/')}`;

            const label = formatLabel(segment);

            return (
              <React.Fragment key={href}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="rounded-xl bg-violet-100 px-3 py-2 text-sm font-semibold text-violet-700">
                      {label}
                    </BreadcrumbPage>
                  ) : (
                    <Link
                      to={href}
                      className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-primary"
                    >
                      {label}
                    </Link>
                  )}
                </BreadcrumbItem>

                {!isLast && (
                  <BreadcrumbSeparator>
                    <ChevronRight
                      size={16}
                      className="text-muted-foreground/50"
                    />
                  </BreadcrumbSeparator>
                )}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
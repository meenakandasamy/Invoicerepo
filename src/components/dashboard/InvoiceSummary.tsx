import type { ReactNode } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Type for a single field
export interface FieldConfig {
  label: string;
  key: keyof InvoiceData;
  icon?: ReactNode;
}

// Base data shape
export interface InvoiceData {
  totalInvoiceValue: number;
  amountPaid: number;
  balancePayable: number;
  povalueExcludeGst: number;
  gstValue: number;
  tdsValue: number;
  totalPos?: number;
  noOfInstallments?: number;
}

// Component props
interface InvoiceStatsCardProps {
  data?: InvoiceData;
  loading?: boolean;
  fields?: Array<FieldConfig>;
  title?: string;
  className?: string;
  direction?: 'vertical' | 'horizontal';
  width?: string;
  height?: string;
  locale?: string;
  currency?: string;
  gap?: string;
}

export const InvoiceStatsCard: React.FC<InvoiceStatsCardProps> = ({
  data,
  loading = false,
  fields = [
    { label: 'Total Invoice Value', key: 'totalInvoiceValue' },
    { label: 'Amount Paid', key: 'amountPaid' },
    { label: 'Balance Payable', key: 'balancePayable' },
    { label: 'PO Value (Excl. GST)', key: 'povalueExcludeGst' },
    { label: 'GST Value', key: 'gstValue' },
    { label: 'TDS Value', key: 'tdsValue' },
  ],
  title = 'Invoice Summary',
  className = '',
  direction = 'vertical',
  width,
  height,
  gap = 'gap-4',
  locale = 'en-IN',
  currency = 'INR',
}) => {
  const formatCurrency = (val: number | string | undefined) => {
    if (!val && val !== 0) return '';
    return Number(val).toLocaleString(locale, {
      style: 'currency',
      currency,
    });
  };

  const excludeKeys = ['totalPos', 'noOfInstallments'];

  const chunkFields = (arr: typeof fields, size: number) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const fieldPairs = loading
    ? Array.from({ length: Math.ceil(fields.length / 2) })
    : chunkFields(fields, 2);

  return (
    <section
      className={cn('flex flex-col w-full h-auto', width, height, className)}
      aria-label={title}
    >
      {/* Title */}
      <h2 className="text-xl 2xl:text-2xl lg:text-[18px] font-bold mb-2 text-center">
        {title}
      </h2>

      {/* Cards container */}
      <div
        className={cn(
          'flex flex-wrap',
          direction === 'vertical' ? 'flex-col' : 'flex-row',
          gap,
        )}
      >
        {fieldPairs.map((pair: any, i) => (
          <Card
            key={i}
            className="flex-grow basis-auto bg-white shadow-sm border border-gray-200 rounded-md"
          >
            <CardHeader className="p-4">
              {loading ? (
                <>
                  <div className="mb-2">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-20 h-5 mt-1" />
                  </div>
                  <div>
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-20 h-5 mt-1" />
                  </div>
                </>
              ) : (
                pair.map((field: FieldConfig) => (
                  <div key={field.key} className="mb-2 last:mb-0">
                    <div className="flex items-center gap-2 mb-1 text-sm 2xl:text-xl lg:text-xs xl:text-base font-medium text-gray-700">
                      {field.icon && (
                        <span className="text-primary">{field.icon}</span>
                      )}
                      {field.label}
                    </div>
                    <div className="text-indigo-700 font-bold text-sm 2xl:text-2xl lg:text-xs xl:text-base ">
                      {excludeKeys.includes(field.key)
                        ? (data?.[field.key] ?? 0)
                        : formatCurrency(data?.[field.key])}
                    </div>
                  </div>
                ))
              )}
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
};

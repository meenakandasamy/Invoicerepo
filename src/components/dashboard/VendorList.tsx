import { Card, CardHeader } from '@/components/ui/card';

export type Vendor = {
  id: number;
  name: string;
  code: string;
  pendingPO: number;
  unpaidAmount: number;
};

type ListProps = {
  vendorList: Array<Vendor>;
  locale?: string;
};

export function VendorScrollList(props: ListProps) {

  const { vendorList, locale = 'en-IN' } = props;

  return (
    <section className="flex flex-col w-full h-full max-h-full">
      <h2 className="text-xl 2xl:text-2xl lg:text-[18px] font-bold mb-0 text-center">
        Vendor Backlog
      </h2>

      <div className="overflow-y-auto flex flex-col gap-4 h-full w-full p-4">
        {vendorList.map((vendor) => (
          <Card
            key={vendor.id}
            className="bg-white shadow-sm border border-gray-200 rounded-md"
          >
            <CardHeader className="p-4">
              <div className="text-sm 2xl:text-xl lg:text-xs xl:text-base font-semibold text-gray-900 mb-2">
                {vendor.code} - <span className="font-normal">{vendor.name}</span>
              </div>
              <div className="flex justify-between text-sm 2xl:text-xl lg:text-xs xl:text-base text-gray-700">
                <div>
                  <span className="font-medium">Pending PO:</span>{' '}
                  {vendor.pendingPO}
                </div>
                <div>
                  <span className="font-medium">Unpaid:</span>{' '}
                  <span className="text-red-500 font-bold">
                    {new Intl.NumberFormat(locale, {
                      style: 'currency',
                      currency: 'INR', // This can be adjusted too if needed
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(vendor.unpaidAmount)}
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}

import type { RentRecurrsionType } from '@/utils/Validators/schema/RentSchema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function RentApprovalCard({ data }: { data: RentRecurrsionType }) {
  return (
    <Card className="w-full p-3">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {`${data.paymentFor} Request Approval`}
          </CardTitle>

          <Badge
            className={`${
              data.approverStatusName === 'Approved'
                ? 'bg-green-600'
                : data.approverStatusName === 'Rejected'
                  ? 'bg-red-600'
                  : 'bg-yellow-600'
            }`}
            text={data.approverStatusName!}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-sm p-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground">Request Code</p>
            <p className="font-medium">{data.rentRequestCode}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Payment For</p>
            <p className="font-medium">{data.paymentFor}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Amount To Pay</p>
            <p className="font-medium">
              ₹{data.amountToPay?.toLocaleString() || 0}
            </p>
          </div>

          <div>
            <p className="text-muted-foreground">Vendor Rent ID</p>
            <p className="font-medium">{data.vendorRentId}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Approval Level</p>
            <p className="font-medium">Level {data.levelId}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Created Date</p>
            <p className="font-medium">
              {new Date(data.createdDate).toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

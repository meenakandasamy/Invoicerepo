import type { VendorAdvanceType } from "@/utils/Validators/schema/VendorAdvanceSchema";
import { Card } from "@/components/ui/card";
import { INTL_UTILS } from "@/utils/common/IntlUtils";

const AdvanceSplitTable = ({ advance }: { advance: VendorAdvanceType }) => {
    const {
        totalAmountNoGst,
        gstPercentage,
        gstAmount,
        amountApproved,
        advanceConsumed,
        advanceLeft,
        amountPayable,
    } = advance;

    const formatMoney = (v: number) => INTL_UTILS.formatCurrency({ value: v || 0 });

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                Vendor Advance Summary
            </h3>

            <div className="space-y-3 text-sm">

                <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Total Amount (Excl. GST)</span>
                    <span className="font-medium">{formatMoney(totalAmountNoGst)}</span>
                </div>

                <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">
                        GST <span className="text-xs text-gray-400">({gstPercentage}%)</span>
                    </span>
                    <span className="font-medium text-green-600">
                        + {formatMoney(gstAmount || 0)}
                    </span>
                </div>

                <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Amount Approved(Excl GST)</span>
                    <span className="font-medium">{formatMoney(amountApproved)}</span>
                </div>

                <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Advance Consumed</span>
                    <span className="font-medium text-red-600">
                        - {formatMoney(advanceConsumed || 0)}
                    </span>
                </div>

                <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Advance Left</span>
                    <span className="font-medium">{formatMoney(advanceLeft || 0)}</span>
                </div>
            </div>

            {/* Final Payable */}
            <div className="mt-2 pt-2 flex justify-between items-center">
                <span className="text-base font-semibold">Amount Payable</span>
                <span className="text-xl font-bold text-blue-600">
                    {formatMoney(amountPayable || 0)}
                </span>
            </div>
        </Card>
    );
};

export default AdvanceSplitTable;

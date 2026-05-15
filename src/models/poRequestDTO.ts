export interface PORequestDTO {
  requestId: number;
  requestorName: string;
  deliveryAddress: string;
  deliveryTime: string;
  description: string;
  approveStatusId: number;
  approveLevelId: number;
  approve1Timestamp: string;
  approve1Comments: string;
  siteId: number;
  vendorId: number;
  approve2Timestamp: string;
  approve2Comments: string;
  approve3Timestamp: string;
  approve3Comments: string;
  paymentTermsId: number;
  taxableValue: number;
  purchaseId: Array<number>;
}

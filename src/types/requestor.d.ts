export interface RequestData {
  advApprovalId?: string;
  userId: number;
  approverStatusId: any;
  requestId: number;
  requestorName: string;
  deliveryAddress: string;
  deliveryTime: string;
  description: string;
  approveStatusId: number;
  levelId: number;
  approverName: string;
  approve1Timestamp: string | null;
  approve1Comments: string | null;
  approve2Timestamp: string | null;
  approve2Comments: string | null;
  approve3Timestamp: string | null;
  approve3Comments: string | null;
  siteId: number;
  vendorId: number;
  vendorName: string;
  paymentTermsId: number;
  paymentTermsName: string;
  costing: number;
  taxableValue: number;
  purchaseId: Array<number>;
  createdBy: number;
  lastUpdatedBy: number;
  status: number;
  relationId: number;
  userType: 'OEM' | 'Admin' | string; // adjust if userType is enum or fixed set
}

interface paymentDropdownType {
  paymentTermsId: number;
  paymentTermsName: string;
}

interface vendorDropdownType {
  vendorId: number;
  vendorName: string;
  vendorCode: string;
  gstNo: string;
  emailId: string;
  approverStatusId: number;
  vendorType: Array<string>;
}

interface productDropdownType {
  productId: number;
  productName: string;
  productCategory: string;
}

interface defaultPurchaseListTypes {
  purchaseId: number;
  productId: number;
  productName: string;
  requestorId: number;
  requestorName: string;
  poId: number | null;
  quantityCount: number;
  createdBy: number | null;
  lastUpdatedBy: number | null;
  status: number;
}

interface requestDefaultValueTypes {
  requestorName: string;
  siteName: string;
  vendorName: string;
  gstNo: string;
  taxableValue: string;
  paymentTermsName: string;
  deliveryAddress: string;
  deliveryTime: string;
  description: string;
  status: string;
  quotationFilePath: any;
  purchaseList: Array<defaultPurchaseListTypes> | [];
}

interface optionsTypes {
  status: Array<string>;
  paymentTermsName: Array<string>;
  vendorName: Array<string>;
  siteName: Array<string>;
  purchaseList: Array<string>;
  [key: string]: Array<string | number>;
}

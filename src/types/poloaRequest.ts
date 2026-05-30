interface costCentreDropdownTypes {
  costCentreId: number;
  costCentreName: string;
}

interface poloaFieldType {
  selectedVendorName: string;
    vendorName: string;
    poNumber: string;
 
    uploadType: string;
    castHeader: string;
    castCenter: string;
}
interface ticketFiledType {
  siteName: string;
    displayName: string;
    ticketTypeName: string;
 
    categoryName: string;
    ticketTypeId:number;
    subject: string;
    priority: string;
        description: string;
    equipmentId: Array<number>;
    ticketCategory:number,
    cycle:number,createdBy:number
}
interface viewticketFiledType {
  timeslot: string;
    remarks: string;
    assigned: string;
 
    date: string;


}
interface approveFieldType {
  approvedBy:number;
    lastUpdatedBy:number;
    remarks: string;
 assignedTo:number;
assignedBy:string;
    ticketStatusId:number;
    ticketId:number;

}
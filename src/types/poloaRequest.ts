


interface ticketFiledType {
  siteName: string;
    displayName: string;
    ticketTypeName: string;
    categoryName: string;
    ticketTypeId:number;
    ticketType:string;
    subject: string;
    priority: string;
        description: string;
    equipmentId: Array<number>;
    ticketCategory:number,
    cycle:number,createdBy:number
    timeslot:string
}
interface viewticketFiledType {
  timeslot: string;
    remarks: string;
    assigned: string;
 ticketId:number;
    date: string;


}


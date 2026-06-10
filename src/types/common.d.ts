export type Approvalist = {
  siteId:number;
  approverLevel:number;

};
export type Templatemappingdropdownlist = {
  sopTemplateId:number;
templateName:string;

};
export interface BaseProps {
  hasCreateAccess: boolean;
  hasUpdateAccess: boolean;
  session: Session;
}
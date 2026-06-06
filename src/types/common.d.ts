export type Approvalist = {
  siteId:number;
  approverLevel:number;

};
export type Sitelist = {
  siteId:number;
siteName:string;

};
export interface BaseProps {
  hasCreateAccess: boolean;
  hasUpdateAccess: boolean;
  session: Session;
}
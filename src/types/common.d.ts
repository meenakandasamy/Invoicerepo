export type Approvalist = {
  siteId:number;
  approverLevel:number;

};
export interface BaseProps {
  hasCreateAccess: boolean;
  hasUpdateAccess: boolean;
  session: Session;
}
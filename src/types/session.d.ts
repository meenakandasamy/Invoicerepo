interface UserRoleMapDetail {
  view: number;
  edit: number;
  activityName: string;
  create: number;
  status: number;
}

interface PoRoleMapDetail {
  approverId: number;
  userMapDetails: Array<UserRoleMapDetail>;
}

interface Session {
  roleName: string;
  dashboardFlag: boolean;
  accessType: number;
  ticketCount: boolean;
  alertCount: boolean;
  customerName: string;
  customerLogopath: string;
  accesstoken: string;
  userMapDetails: Array<UserRoleMapDetail>;
  poMapDetails: PoRoleMapDetail;
  companyLogopath: string;
  userName: string;
  subscriptionId: number;
  subscriptionName: string;
  login_Attempt: number | null;
  first_Login: boolean;
  userTypeId: number;
  customerId: number;
  userTypeName: string;
  companyName: string;
  emailId: string;
  userId: number;
  roleId: number;
  isNewUser: boolean;
  companyId: number;
  organizationId: number;
}

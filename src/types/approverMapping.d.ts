interface approverGetallType {
  approverLevelId: string;
  siteId: string;
  createdBy: number;
  lastUpdatedBy: number;
  approverName: string;
}

interface approverDropdownType {
  approverLevelId: number;
  approverName: string;
  emailId: string;
  status: number;
  levelId: number;
  userId: number;
  companyId: number;
  customerId: number;
  createdBy: number;
  lastUpdatedBy: number;
  createdDate: string;
  lastUpdatedDate: string;
  costCentreIds?: Array<number>;
  costHeaderIds?: Array<number>;
  categoryId?: number | Array<number>;
  organizationId?: number;
}

interface approverFieldType {
  approverName: string;
  siteName: Array<string>;
}

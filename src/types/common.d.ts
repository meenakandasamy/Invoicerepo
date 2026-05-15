export interface BaseProps {
  hasCreateAccess: boolean;
  hasUpdateAccess: boolean;
  session: Session;
}
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string | JSX.Element;
  confirmButtonText?: string;
  confirmButtonColor?: string;
  cancelButtonText?: string;
  cancelButtonColor?: string;
  disableConfirmButton?: boolean;
  disableCancelButton?: boolean;
}

interface userDropdownType {
  userId: number;
  userName: string;
  userEmailId: string;
  firstName: string;
}

interface countryDropdownType {
  countryId: number;
  countryName: string;
}
interface stateDropdownType {
  stateId: number;
  stateName: string;
}

export interface costCentreDropdownType {
  costCentreId: number;
  costCentreName: string;
}

export interface costHeaderDropdownType {
  costHeaderId: number;
  costHeaderName: string;
}

export interface ApproverStatus {
  approverStatusId: number;
  approveStatusName: string;
}


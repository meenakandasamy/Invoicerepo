/* eslint-disable @typescript-eslint/no-unnecessary-condition */
type AccessPermissions = {
  view: boolean;
  create: boolean;
  edit: boolean;
};

export function getAccessPermissions(
  session: Session,
  activityName: string,
): AccessPermissions {
  console.log(session.userMapDetails);
  
  const matchedItem = session.userMapDetails?.find(
    (item: UserRoleMapDetail) => item.activityName === activityName,
  );

  return {
    view: !!matchedItem?.view,
    create: !!matchedItem?.create,
    edit: !!matchedItem?.edit,
  };
}
console.log(getAccessPermissions);


/**
 * Primary validator to check if category matches with stored values.
 * Stored values are read from session storage.
 * If stored values are not found, return false.
 * Normalize strings: remove spaces + lowercase.
 * Return true if levelId is 0 and normalized category matches with stored category.
 */
export function isPrimaryValidator(category: string) {
  const levelCentreRaw = sessionStorage.getItem('levelCentreHeaderMap');

  if (!levelCentreRaw) return false;

  const levelMap = Object.fromEntries(
    Object.entries(JSON.parse(levelCentreRaw)).map(([key, value]) => [
      key,
      parseInt(Object.keys(value as object)[0]),
    ]),
  );

  const normalize = (str: string) => str.replace(/\s+/g, '').toLowerCase();

  const categoryKey = Object.keys(levelMap).find(
    (key) => normalize(key) === normalize(category),
  );

  const currentCategoryLevel =
    categoryKey !== undefined ? levelMap[categoryKey] : null;

  return currentCategoryLevel === 0;
}

export enum APPROVER_CATEGORY {
  VENDOR_EXPENSES = 'Vendor Expenses',
  VENDOR_ADVANCE = 'Vendor Advance',
  VENDOR_RENT = 'Vendor Rent',
  VENDOR_PRODUCT = 'Vendor Product',
  VENDOR_SERVICE = 'Vendor Service',
  VENDOR_REGISTRATION = 'Vendor Registration',
  EMP_REIMBURSEMENT = 'Employee Reimbursement',
  CONSULTANT_SALARY = 'Consultant Salary',
}

/**
 * Validate if the given categoryName, levelId, and inputData match
 * the stored categoryName → level → centre/header map.
 *
 * @param {string} categoryName - Category to validate (string)
 * @param {number} levelId - Level inside the category
 * @param {object} inputData - Contains costCentreIds & costHeaderIds
 * @returns {boolean} True only if BOTH centre & header have at least one overlap.
 */
export function levelValidator(
  categoryName: string,
  levelId: number,
  inputData: {
    costCentreIds: Array<number>;
    costHeaderIds: Array<number>;
  },
) {
  // console.log('=== levelValidator called ===');
  // console.log('Input → categoryName:', categoryName);
  // console.log('Input → levelId:', levelId);
  // console.log('Input → costCentreIds:', inputData.costCentreIds);
  // console.log('Input → costHeaderIds:', inputData.costHeaderIds);

  const mapString = sessionStorage.getItem('levelCentreHeaderMap');

  if (!mapString) {
    console.warn('No levelCentreHeaderMap found in sessionStorage.');
    return false;
  }

  const categoryMap = JSON.parse(mapString);
  // console.log('Loaded map:', categoryMap);

  // --- Normalize function (same as isPrimaryValidator) ---
  const normalize = (str: string) => str.replace(/\s+/g, '').toLowerCase();

  // Find matching category key from stored map
  const storedCategoryKey = Object.keys(categoryMap).find(
    (key) =>
      normalize(key) === normalize(categoryName) ||
      normalize(key) === normalize('Default Approver'),
  );

  if (!storedCategoryKey) {
    console.warn(
      `Category '${categoryName}' not found in stored map (after normalization).`,
    );
    return false;
  }

  // console.log(`✔ Category found → '${storedCategoryKey}'`);

  const levelMap = categoryMap[storedCategoryKey];

  // Validate level inside the matched category
  if (!levelMap[levelId]) {
    console.warn(
      `LevelId ${levelId} not found under category '${storedCategoryKey}'.`,
    );
    return false;
  }

  // console.log(`✔ Level ${levelId} found in category '${storedCategoryKey}'.`);

  const stored = levelMap[levelId];

  // console.log('Stored → costCentreIds:', stored.costCentreIds);
  // console.log('Stored → costHeaderIds:', stored.costHeaderIds);

  // Overlap helper
  const hasOverlap = (arr1: Array<number>, arr2: Array<number>) => {
    const result = arr1.some((v) => arr2.includes(v));
    // console.log('Checking overlap:', arr1, 'vs', arr2, '| result:', result);
    return result;
  };

  const centreMatch = hasOverlap(stored.costCentreIds, inputData.costCentreIds);
  const headerMatch = hasOverlap(stored.costHeaderIds, inputData.costHeaderIds);

  // console.log('Centre match:', centreMatch);
  // console.log('Header match:', headerMatch);

  const finalResult = centreMatch && headerMatch;

  // console.log(
  //   `=== FINAL RESULT: ${finalResult ? '✔ VALID' : 'INVALID'} ===`,
  // );

  return finalResult;
}

type GetDisableApprovalFlowParams = {
  selectedRow: any;
  isAccounts: boolean;
  toBackend: boolean;
  toRejectionBackend: boolean;
  toApprovalBackend: boolean;
  approverCategory: string;
};

enum ApproverStatus {
  Pending = 1,
  InProgress = 2,
  Approved = 3,
  Rejected = 4,
  Paid = 5,
  Overdue = 6,
  Hold = 7,
  PartiallyApproved = 8,
}

/**
 * Returns true if the approval flow should be disabled.
 * This function will be true if the selected row is not a valid
 * vendor advance (based on levelValidator), if the status is
 * not pending in accounts, or if any of the backend flags are
 * true.
 * @param {GetDisableApprovalFlowParams} params - Object containing
 *   selectedRow, isAccounts, toBackend, toRejectionBackend, and
 *   toApprovalBackend.
 * @returns {boolean} True if the approval flow should be disabled.
 */
export function getDisableApprovalFlow({
  selectedRow,
  isAccounts,
  toBackend,
  toRejectionBackend,
  toApprovalBackend,
  approverCategory,
}: GetDisableApprovalFlowParams): boolean {
  const isNonAccounts = !isAccounts;

  const levelMismatch = !(
    selectedRow &&
    selectedRow.levelId &&
    levelValidator(approverCategory, +selectedRow.levelId - 1, {
      costCentreIds: selectedRow.costCentreIds || [],
      costHeaderIds: selectedRow.costHeaderIds || [],
    })
  );

  const isPending = selectedRow?.approverStatusId === +ApproverStatus.Pending;

  const shouldBeTrue =
    (isNonAccounts && levelMismatch) || (isAccounts && !isPending);

  const statusId = +(selectedRow?.approverStatusId ?? -1);

  return (
    [
      ApproverStatus.Approved,
      ApproverStatus.Rejected,
      ApproverStatus.PartiallyApproved,
    ].includes(statusId) ||
    shouldBeTrue ||
    toBackend ||
    toRejectionBackend ||
    toApprovalBackend
  );
}

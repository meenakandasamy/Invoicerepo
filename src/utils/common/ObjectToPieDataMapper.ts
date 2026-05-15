/**
 * Converts an object of key-value pairs to array format suitable for PieChart.
 * Always includes zero values.
 * Automatically maps keys like "requestorCount" to human-readable labels like "Requestor".
 * Returns an empty array if all values are zero or input is empty/null.
 */
export const formatObjectToPieData = (
  rawData: Record<string, number> | null,
  options?: {
    labelMap?: Record<string, string>; // optional override
  },
): Array<[string, number]> => {
  const defaultLabelMap: Record<string, string> = {
    requestorCount: 'Requestor',
    approvedCount: 'Approved',
    rejectedCount: 'Rejected',
    pendingCount: 'Pending',
    inprogressCount: 'In Progress',
  };

  const labelMap = {
    ...defaultLabelMap,
    ...(options?.labelMap || {}),
  };

  // Return empty array if rawData is null/empty or all values are 0
  if (
    !rawData ||
    Object.keys(rawData).length === 0 ||
    Object.values(rawData).every((value) => value === 0)
  ) {
    return [];
  }

  return Object.entries(rawData).map(([key, value]) => [
    labelMap[key] || key,
    value,
  ]);
};

export function formatDate(dateString: string, format: string): string {
  const dateObject = new Date(dateString);
  const day = String(dateObject.getDate()).padStart(2, '0');
  const month = String(dateObject.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = dateObject.getFullYear();

  switch (format) {
    case 'dd-mm-yyyy':
      return `${day}-${month}-${year}`;
    case 'mm/dd/yyyy':
      return `${month}/${day}/${year}`;
    case 'yyyy-mm-dd':
      return `${year}-${month}-${day}`;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

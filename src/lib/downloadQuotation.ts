export const downloadQuotationExcel = async (url: string) => {
  const fileName = url.split('/').pop() || 'quotation.csv';

  // Open file directly if download doesn't work
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  link.setAttribute('target', '_blank'); // Optional: open in new tab
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadQuotationPdf = async (url: string): Promise<void> => {
  const fileName = url.split('/').pop() || 'quotation.pdf';

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  link.setAttribute('target', '_blank'); // Optional: opens in new tab if download fails

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return Promise.resolve();
};

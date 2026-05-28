// common function
export const downloadFile = (
  data: BlobPart,
  fileName: string,
  type: string = 'application/pdf'
) => {
  const blob = new Blob([data], { type });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
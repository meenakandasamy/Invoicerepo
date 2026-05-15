import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportToExcel = async (data: Array<any>, fileName = 'data') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  if (data.length > 0) {
    worksheet.columns = Object.keys(data[0]).map((key) => ({
      header: key,
      key: key,
      width: 20,
    }));

    data.forEach((item) => {
      worksheet.addRow(item);
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  saveAs(blob, `${fileName}.xlsx`);
};

export const exportToCSV = async (data: Array<any>, fileName = 'data') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  if (data.length > 0) {
    worksheet.columns = Object.keys(data[0]).map((key) => ({
      header: key,
      key: key,
      width: 20,
    }));

    data.forEach((item) => {
      worksheet.addRow(item);
    });
  }

  const buffer = await workbook.csv.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'text/csv;charset=utf-8;',
  });

  saveAs(blob, `${fileName}.csv`);
};

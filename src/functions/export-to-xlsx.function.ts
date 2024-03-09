import * as XLSX from "xlsx";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- unknown type
export async function exportToXlsx(data: Record<string, any>[]) {
  if (!data || data.length === 0) return;
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Define the width of each column by the max cell content in each column
  const columns = Object.keys(data[0]);
  const columnWidths = columns.map((column) => {
    let max = 10;
    data.forEach((obj) => {
      if (max < obj[column]?.length) {
        max = obj[column].length;
      }
    });
    return { wch: max };
  });
  worksheet["!cols"] = columnWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, "רשימת מוזמנים.xlsx");
}

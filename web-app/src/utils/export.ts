import type { Transaction } from '../types';
import { formatDate } from './date';

interface ExportTransaction {
  date: string;
  time: string;
  category: string;
  description: string;
  location: string;
  amount: string;
  currency: string;
}

/**
 * Convert transactions to export format
 */
export const prepareTransactionsForExport = (
  transactions: Transaction[],
  getCategoryName: (categoryId: string) => string
): ExportTransaction[] => {
  return transactions.map((t) => ({
    date: formatDate(new Date(t.date), 'yyyy-MM-dd'),
    time: t.time,
    category: getCategoryName(t.categoryId),
    description: t.description,
    location: t.location || '',
    amount: t.amount.toFixed(2),
    currency: t.currency,
  }));
};

/**
 * Convert array of objects to CSV string
 */
export const convertToCSV = (data: ExportTransaction[]): string => {
  if (data.length === 0) return '';

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV header row
  const headerRow = headers.join(',');

  // Create CSV data rows
  const dataRows = data.map((row) => {
    return headers
      .map((header) => {
        const value = row[header as keyof ExportTransaction];
        // Escape values that contain commas or quotes
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(',');
  });

  return [headerRow, ...dataRows].join('\n');
};

/**
 * Download CSV file
 */
export const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * Export transactions to CSV
 */
export const exportTransactionsToCSV = (
  transactions: Transaction[],
  getCategoryName: (categoryId: string) => string,
  filename?: string
) => {
  const exportData = prepareTransactionsForExport(transactions, getCategoryName);
  const csvContent = convertToCSV(exportData);
  const defaultFilename = `transactions_${formatDate(new Date(), 'yyyy-MM-dd')}.csv`;
  downloadCSV(csvContent, filename || defaultFilename);
};

/**
 * Convert array of objects to Excel-compatible HTML table
 */
export const convertToExcelHTML = (data: ExportTransaction[]): string => {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);

  // Create table header
  const headerRow = `<tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>`;

  // Create table rows
  const dataRows = data
    .map((row) => {
      const cells = headers
        .map((header) => {
          const value = row[header as keyof ExportTransaction];
          return `<td>${value}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta charset="UTF-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <thead>${headerRow}</thead>
          <tbody>${dataRows}</tbody>
        </table>
      </body>
    </html>
  `;
};

/**
 * Download Excel file
 */
export const downloadExcel = (htmlContent: string, filename: string) => {
  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * Export transactions to Excel
 */
export const exportTransactionsToExcel = (
  transactions: Transaction[],
  getCategoryName: (categoryId: string) => string,
  filename?: string
) => {
  const exportData = prepareTransactionsForExport(transactions, getCategoryName);
  const htmlContent = convertToExcelHTML(exportData);
  const defaultFilename = `transactions_${formatDate(new Date(), 'yyyy-MM-dd')}.xls`;
  downloadExcel(htmlContent, filename || defaultFilename);
};

/**
 * Generate transaction summary
 */
export const generateTransactionSummary = (
  transactions: Transaction[],
  getCategoryName: (categoryId: string) => string
): string => {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const count = transactions.length;
  const average = count > 0 ? total / count : 0;

  // Group by category
  const byCategory = transactions.reduce((acc, t) => {
    const categoryName = getCategoryName(t.categoryId);
    if (!acc[categoryName]) {
      acc[categoryName] = { count: 0, total: 0 };
    }
    acc[categoryName].count += 1;
    acc[categoryName].total += t.amount;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  // Build summary text
  let summary = `Transaction Summary\n`;
  summary += `==================\n\n`;
  summary += `Total Transactions: ${count}\n`;
  summary += `Total Amount: ${total.toFixed(2)}\n`;
  summary += `Average Amount: ${average.toFixed(2)}\n\n`;
  summary += `By Category:\n`;
  summary += `------------\n`;

  Object.entries(byCategory)
    .sort((a, b) => b[1].total - a[1].total)
    .forEach(([category, data]) => {
      summary += `${category}: ${data.count} transactions, ${data.total.toFixed(2)}\n`;
    });

  return summary;
};

/**
 * Export analytics data to CSV
 */
export const exportAnalyticsToCSV = (data: any[], filename: string) => {
  const csvContent = convertToCSV(data);
  downloadCSV(csvContent, `${filename}.csv`);
};

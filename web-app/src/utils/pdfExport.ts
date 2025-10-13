import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './currency';
import { formatDate } from './date';
import type { Currency } from '../types';

interface AnalyticsData {
  monthlyData: Array<{
    month: string;
    total: number;
    transactions: any[];
  }>;
  categoryData: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
  }>;
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
}

/**
 * Export analytics data to PDF
 */
export const exportAnalyticsToPDF = (
  data: AnalyticsData,
  dateRange: { start: Date; end: Date },
  currency: Currency,
  t: (key: string) => string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(t('analytics.title') || 'Analytics Report', pageWidth / 2, yPos, { align: 'center' });

  yPos += 10;

  // Date Range
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${formatDate(dateRange.start, 'MMM dd, yyyy')} - ${formatDate(dateRange.end, 'MMM dd, yyyy')}`,
    pageWidth / 2,
    yPos,
    { align: 'center' }
  );

  yPos += 15;

  // Summary Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(t('analytics.summary') || 'Summary', 14, yPos);

  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t('analytics.total_spent') || 'Total Spent'}: ${formatCurrency(data.totalSpent, currency)}`, 14, yPos);
  yPos += 6;
  doc.text(`${t('analytics.transactions') || 'Transactions'}: ${data.transactionCount}`, 14, yPos);
  yPos += 6;
  doc.text(`${t('analytics.average') || 'Average'}: ${formatCurrency(data.averageTransaction, currency)}`, 14, yPos);
  yPos += 6;
  doc.text(`${t('analytics.months') || 'Months'}: ${data.monthlyData.length}`, 14, yPos);

  yPos += 15;

  // Monthly Breakdown Table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(t('analytics.monthly_breakdown') || 'Monthly Breakdown', 14, yPos);

  yPos += 5;

  const monthlyTableData = data.monthlyData.map(m => {
    const [year, month] = m.month.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthLabel = `${monthNames[parseInt(month) - 1]} ${year}`;

    return [
      monthLabel,
      formatCurrency(m.total, currency),
      m.transactions.length.toString(),
      formatCurrency(m.total / m.transactions.length, currency),
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [[
      t('analytics.month') || 'Month',
      t('analytics.total') || 'Total',
      t('analytics.transactions') || 'Transactions',
      t('analytics.average') || 'Average',
    ]],
    body: monthlyTableData,
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66] },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Category Breakdown Table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(t('analytics.category_breakdown') || 'Category Breakdown', 14, yPos);

  yPos += 5;

  const categoryTableData = data.categoryData.map(c => [
    c.categoryName,
    formatCurrency(c.amount, currency),
    `${c.percentage.toFixed(1)}%`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [[
      t('transaction.category') || 'Category',
      t('analytics.amount') || 'Amount',
      t('analytics.percentage') || 'Percentage',
    ]],
    body: categoryTableData,
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66] },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `${t('common.page') || 'Page'} ${i} ${t('common.of') || 'of'} ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      `${t('common.generated') || 'Generated'}: ${formatDate(new Date(), 'MMM dd, yyyy HH:mm')}`,
      14,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  // Save PDF
  const filename = `analytics_${formatDate(dateRange.start, 'yyyy-MM-dd')}_to_${formatDate(dateRange.end, 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
};

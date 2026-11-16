import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type ReportResponse } from '../reportsApi';
import { type ReportColumnKey } from './exportReportToExcel';

const formatFileTimestamp = (date: Date): string => {
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(
    date.getHours(),
  )}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
};

let cachedFontBase64: string | null = null;

const loadLocalCyrillicFont = async (doc: jsPDF): Promise<void> => {
  if (!cachedFontBase64) {
    const response = await fetch('/fonts/DejaVuSans.ttf');
    if (!response.ok) {
      throw new Error(
        'Не найден файл шрифта /fonts/DejaVuSans.ttf в папке public/fonts/',
      );
    }

    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Проверяем, что файл действительно TTF, а не index.html
    const b0 = bytes.at(0);
    const b1 = bytes.at(1);
    if (b0 !== 0x00 || b1 !== 0x01) {
      throw new Error(
        'Файл /fonts/DejaVuSans.ttf не является корректным TrueType-шрифтом',
      );
    }

    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    cachedFontBase64 = btoa(binary);
  }

  doc.addFileToVFS('DejaVuSans.ttf', cachedFontBase64);
  doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
  doc.setFont('DejaVuSans');
};

export const exportReportToPdf = async (
  rows: ReportResponse['content'],
  visibleColumns: Record<ReportColumnKey, boolean>,
): Promise<void> => {
  if (!rows || rows.length === 0) return;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  await loadLocalCyrillicFont(doc);

  // Шапка документа
  doc.setFont('DejaVuSans', 'normal');
  doc.setFontSize(14);
  doc.setTextColor('#1E1E1E');
  doc.text('Отчет по выполненным задачам', 14, 15);

  doc.setFontSize(9);
  doc.setTextColor('#666666');
  doc.text(
    `Сформирован: ${new Date().toLocaleString('ru-RU')} | Всего записей: ${rows.length}`,
    14,
    21,
  );

  // Формируем заголовки и строки только по видимым колонкам
  const headers: string[] = [];
  if (visibleColumns.period) headers.push('Период');
  if (visibleColumns.task) {
    headers.push('Задача');
    headers.push('Описание задачи');
  }
  if (visibleColumns.service) headers.push('Услуга');
  if (visibleColumns.component) headers.push('Компонент');
  if (visibleColumns.profile) headers.push('Исполнитель');

  const body = rows.map((row) => {
    const rowData: string[] = [];
    if (visibleColumns.period) {
      rowData.push(`${row.year}.${String(row.month).padStart(2, '0')}`);
    }
    if (visibleColumns.task) {
      rowData.push(row.title || '');
      rowData.push(row.description || '');
    }
    if (visibleColumns.service) {
      rowData.push(row.service?.name || '—');
    }
    if (visibleColumns.component) {
      rowData.push(row.component?.name || '—');
    }
    if (visibleColumns.profile) {
      rowData.push(`${row.profile.lastName} ${row.profile.firstName}`.trim());
    }
    return rowData;
  });

  autoTable(doc, {
    startY: 25,
    head: [headers],
    body,
    styles: {
      font: 'DejaVuSans',
      fontSize: 8.5,
      cellPadding: 2.5,
      textColor: '#1E1E1E',
      lineColor: '#CCCCCC',
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: '#FFCC00',
      textColor: '#1E1E1E',
      fontStyle: 'normal',
      lineColor: '#997A00',
      lineWidth: 0.3,
    },
    alternateRowStyles: {
      fillColor: '#F8F8F8',
    },
    margin: { left: 14, right: 14 },
  });

  const timestamp = formatFileTimestamp(new Date());
  doc.save(`Отчет_${timestamp}.pdf`);
};

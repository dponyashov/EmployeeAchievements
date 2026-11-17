import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type ReportResponse } from '../reportsApi';
import {
  formatQueriesText,
  trimTrailingDots,
  type ReportColumnKey,
} from './exportReportToExcel';

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

// Жёстко фиксированный порядок колонок для PDF (Запросы — строго в самом конце)
const ORDERED_PDF_COLUMNS: ReportColumnKey[] = [
  'period',
  'task',
  'service',
  'component',
  'profile',
  'queries',
];

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

  // Формируем заголовки строго по порядку ORDERED_PDF_COLUMNS
  const headers: string[] = [];
  for (const key of ORDERED_PDF_COLUMNS) {
    if (!visibleColumns[key]) continue;
    if (key === 'period') headers.push('Период');
    if (key === 'task') {
      headers.push('Задача');
      headers.push('Описание задачи');
    }
    if (key === 'service') headers.push('Услуга');
    if (key === 'component') headers.push('Компонент');
    if (key === 'profile') headers.push('Исполнитель');
    if (key === 'queries') headers.push('Запросы к задаче');
  }

  // Формируем строки таблицы в том же порядке
  const body = rows.map((row) => {
    const rowData: string[] = [];
    for (const key of ORDERED_PDF_COLUMNS) {
      if (!visibleColumns[key]) continue;
      if (key === 'period') {
        rowData.push(`${row.year}.${String(row.month).padStart(2, '0')}`);
      }
      if (key === 'task') {
        rowData.push(row.title || '');
        rowData.push(row.description || '');
      }
      if (key === 'service') {
        rowData.push(trimTrailingDots(row.service?.name) || '—');
      }
      if (key === 'component') {
        rowData.push(trimTrailingDots(row.component?.name) || '—');
      }
      if (key === 'profile') {
        rowData.push(
          trimTrailingDots(`${row.profile.lastName} ${row.profile.firstName}`),
        );
      }
      if (key === 'queries') {
        rowData.push(formatQueriesText(row.queries));
      }
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

import * as XLSX from 'xlsx';
import { type ReportResponse } from '../reportsApi';

export type ReportColumnKey =
  'period' | 'task' | 'service' | 'component' | 'profile' | 'queries';

const formatFileTimestamp = (date: Date): string => {
  const pad = (num: number) => String(num).padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
};

export const trimTrailingDots = (value?: string | null): string =>
  value ? value.replace(/\.+$/, '').trim() : '';

export const formatQueriesText = (queries?: { id: number; name: string }[]): string => {
  if (!queries || queries.length === 0) return '—';
  return queries.map((q) => trimTrailingDots(q.name)).join('; ');
};

export const exportReportToExcel = (
  rows: ReportResponse['content'],
  visibleColumns: Record<ReportColumnKey, boolean>,
): void => {
  if (!rows || rows.length === 0) return;

  const rowsForExcel = rows.map((row) => {
    const item: Record<string, string> = {};

    if (visibleColumns.period) {
      item['Период'] = `${row.year}.${String(row.month).padStart(2, '0')}`;
    }
    if (visibleColumns.task) {
      item['Задача'] = row.title;
      item['Описание задачи'] = row.description || '';
    }
    if (visibleColumns.service) {
      item['Услуга'] = trimTrailingDots(row.service?.name) || '—';
    }
    if (visibleColumns.component) {
      item['Компонент'] = trimTrailingDots(row.component?.name) || '—';
    }
    if (visibleColumns.profile) {
      item['Исполнитель'] = trimTrailingDots(
        `${row.profile.lastName} ${row.profile.firstName}`,
      );
    }
    if (visibleColumns.queries) {
      item['Запросы к задаче'] = formatQueriesText(row.queries);
    }

    return item;
  });

  const worksheet = XLSX.utils.json_to_sheet(rowsForExcel);

  const colWidths: { wch: number }[] = [];
  if (visibleColumns.period) colWidths.push({ wch: 12 });
  if (visibleColumns.task) {
    colWidths.push({ wch: 35 });
    colWidths.push({ wch: 45 });
  }
  if (visibleColumns.service) colWidths.push({ wch: 28 });
  if (visibleColumns.component) colWidths.push({ wch: 28 });
  if (visibleColumns.profile) colWidths.push({ wch: 25 });
  if (visibleColumns.queries) colWidths.push({ wch: 35 });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Отчет');

  const timestamp = formatFileTimestamp(new Date());
  XLSX.writeFile(workbook, `Отчет_${timestamp}.xlsx`);
};

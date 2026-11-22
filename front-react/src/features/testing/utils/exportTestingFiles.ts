import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AttemptProtocol } from '../testingApi';

const formatDateTime = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('ru-RU');
};

const statusLabel = (status: string) => {
  if (status === 'COMPLETED') return 'Завершён';
  if (status === 'EXPIRED') return 'Время истекло';
  return 'В процессе';
};

/**
 * 1. Выгрузка детального протокола выбранной попытки в Excel (.xlsx)
 */
export const exportAttemptProtocolToExcel = (protocol: AttemptProtocol) => {
  const headerRows = [
    ['ПРОТОКОЛ ПРОХОЖДЕНИЯ ТЕСТИРОВАНИЯ'],
    ['Сотрудник:', protocol.employeeFullName],
    ['Подразделение:', protocol.departmentName],
    ['Должность:', protocol.positionName],
    ['Раздел тестирования:', protocol.sectionTitle],
    ['Тест:', protocol.testTitle],
    ['Попытка №:', protocol.attemptNumber],
    ['Статус:', statusLabel(protocol.status)],
    ['Начало:', formatDateTime(protocol.startedAt)],
    ['Завершение:', formatDateTime(protocol.finishedAt)],
    [
      'Результат:',
      `${protocol.correctAnswers} из ${protocol.totalQuestions} (${protocol.scorePercent}%)`,
    ],
    [],
    [
      '№',
      'Вопрос',
      'Коды ответов пользователя',
      'Эталонные коды',
      'Результат',
      'Дата и время ответа',
    ],
  ];

  const answerRows = protocol.answers.map((ans) => [
    ans.questionOrder,
    ans.questionText,
    ans.isAnswered ? ans.selectedCodes : 'Нет ответа',
    ans.correctCodes,
    !ans.isAnswered ? 'Не отвечен' : ans.isCorrect ? 'Верно' : 'Неверно',
    formatDateTime(ans.answeredAt),
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([...headerRows, ...answerRows]);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 55 },
    { wch: 26 },
    { wch: 18 },
    { wch: 14 },
    { wch: 22 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Протокол');

  const safeName = protocol.employeeFullName.replace(/\s+/g, '_');
  XLSX.writeFile(workbook, `Протокол_${safeName}_попытка_${protocol.attemptNumber}.xlsx`);
};

/**
 * 2. Формирование официальной справки о прохождении тестирования в PDF
 */
export const exportAttemptCertificateToPdf = async (protocol: AttemptProtocol) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Подгружаем кириллический шрифт из public/fonts/DejaVuSans.ttf
  const fontResponse = await fetch('/fonts/DejaVuSans.ttf');
  const fontBuffer = await fontResponse.arrayBuffer();
  const fontBytes = new Uint8Array(fontBuffer);
  let binary = '';
  for (let i = 0; i < fontBytes.byteLength; i++) {
    binary += String.fromCharCode(fontBytes[i]);
  }
  const base64Font = window.btoa(binary);

  doc.addFileToVFS('DejaVuSans.ttf', base64Font);
  doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
  doc.setFont('DejaVuSans');

  // Шапка документа
  doc.setFontSize(14);
  doc.text('СПРАВКА О ПРОХОЖДЕНИИ ТЕСТИРОВАНИЯ', 105, 25, {
    align: 'center',
  });

  doc.setFontSize(10);
  doc.text(
    `Дата формирования документа: ${new Date().toLocaleDateString('ru-RU')}`,
    105,
    33,
    { align: 'center' },
  );

  autoTable(doc, {
    startY: 42,
    theme: 'grid',
    styles: {
      font: 'DejaVuSans',
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 65, fontStyle: 'normal', fillColor: [245, 245, 245] },
      1: { cellWidth: 115 },
    },
    body: [
      ['Сотрудник (ФИО)', protocol.employeeFullName],
      ['Подразделение / Отдел', protocol.departmentName],
      ['Должность', protocol.positionName],
      ['Раздел тестирования', protocol.sectionTitle],
      ['Наименование теста', protocol.testTitle],
      ['Номер попытки', `Попытка №${protocol.attemptNumber}`],
      [
        'Дата и время прохождения',
        formatDateTime(protocol.finishedAt || protocol.startedAt),
      ],
      ['Статус попытки', statusLabel(protocol.status)],
      [
        'Количество правильных ответов',
        `${protocol.correctAnswers} из ${protocol.totalQuestions} заданных вопросов`,
      ],
      ['Итоговый результат (%)', `${protocol.scorePercent}%`],
    ],
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 150;
  doc.setFontSize(10);
  doc.text(
    'Ответственный за контроль тестирования: _____________________ / _______________ /',
    14,
    finalY + 22,
  );
  doc.text('М.П.', 14, finalY + 34);

  const safeName = protocol.employeeFullName.replace(/\s+/g, '_');
  doc.save(`Справка_тестирование_${safeName}_попытка_${protocol.attemptNumber}.pdf`);
};

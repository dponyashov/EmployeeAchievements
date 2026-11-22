import * as XLSX from 'xlsx';
import type { TestQuestionUpsert } from '../testingApi';

const DEFAULT_CODES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

const isTruthyCell = (val: unknown): boolean => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val === 1;
  const str = String(val ?? '')
    .trim()
    .toLowerCase();
  return ['1', 'да', 'yes', 'true', '+', 'x', 'х', 'верный', 'верно'].includes(str);
};

/**
 * 1. Скачать готовый Excel-шаблон для заполнения вопросов и ответов
 */
export const downloadQuestionsTemplateExcel = () => {
  const rows = [
    ['Текст вопроса', 'Код ответа', 'Текст ответа', 'Верный (да/нет)'],
    [
      'Какой документ регулирует порядок проведения вводного инструктажа?',
      'a',
      'Постановление Правительства РФ № 2464',
      'да',
    ],
    ['', 'b', 'Устав предприятия', 'нет'],
    ['', 'c', 'Приказ о приёме на работу', 'нет'],
    [
      'Выберите средства индивидуальной защиты при работе на высоте:',
      'a',
      'Страховочная привязь',
      'да',
    ],
    ['', 'b', 'Защитная каска с подбородочным ремнём', 'да'],
    ['', 'c', 'Офисные туфли', 'нет'],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet['!cols'] = [{ wch: 52 }, { wch: 14 }, { wch: 44 }, { wch: 18 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Вопросы');
  XLSX.writeFile(workbook, 'Шаблон_вопросов_теста.xlsx');
};

/**
 * 2. Парсинг вопросов и ответов из загруженного файла (.xlsx, .xls, .csv)
 */
export const parseQuestionsFromFile = async (
  file: File,
  startOrder = 1,
): Promise<TestQuestionUpsert[]> => {
  const buffer = await file.arrayBuffer();
  const isCsv = file.name.toLowerCase().endsWith('.csv');

  let workbook: XLSX.WorkBook;
  if (isCsv) {
    let text = new TextDecoder('utf-8').decode(buffer);
    // Если файл сохранён в Windows-1251 (появились символы замены \uFFFD), перечитываем в windows-1251
    if (text.includes('\uFFFD')) {
      text = new TextDecoder('windows-1251').decode(buffer);
    }
    workbook = XLSX.read(text, { type: 'string' });
  } else {
    workbook = XLSX.read(buffer, { type: 'array' });
  }

  const sheet = Object.values(workbook.Sheets).at(0);
  if (!sheet) {
    throw new Error('Файл не содержит листов с данными.');
  }

  const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
  });

  if (rawRows.length < 2) {
    throw new Error('Файл пуст или содержит только строку заголовков.');
  }

  // Пропускаем первую строку, если она похожа на шапку
  const firstRowText = String(rawRows.at(0)?.at(0) ?? '').toLowerCase();
  const dataRows =
    firstRowText.includes('вопрос') || firstRowText.includes('question')
      ? rawRows.slice(1)
      : rawRows;

  const parsedQuestions: TestQuestionUpsert[] = [];
  let currentQuestion: TestQuestionUpsert | null = null;

  for (const row of dataRows) {
    if (!Array.isArray(row)) continue;
    const qText = String(row.at(0) ?? '').trim();
    const rawCode = String(row.at(1) ?? '')
      .trim()
      .toLowerCase();
    const optText = String(row.at(2) ?? '').trim();
    const isCorrect = isTruthyCell(row.at(3));

    // Пропускаем полностью пустые строки
    if (!qText && !optText) continue;

    // Если указан новый текст вопроса (отличный от текущего), начинаем новый вопрос
    if (qText && (!currentQuestion || currentQuestion.questionText !== qText)) {
      currentQuestion = {
        questionText: qText,
        sortOrder: startOrder + parsedQuestions.length,
        options: [],
      };
      parsedQuestions.push(currentQuestion);
    }

    if (!currentQuestion) {
      throw new Error(
        `Обнаружен вариант ответа "${optText}" без указания текста вопроса выше.`,
      );
    }

    if (optText) {
      const code =
        rawCode ||
        DEFAULT_CODES[currentQuestion.options.length] ||
        String.fromCharCode(97 + currentQuestion.options.length);

      currentQuestion.options.push({
        code,
        optionText: optText,
        isCorrect,
      });
    }
  }

  if (parsedQuestions.length === 0) {
    throw new Error('В файле не найдено ни одного вопроса.');
  }

  // Проверяем корректность каждого загруженного вопроса
  parsedQuestions.forEach((q, idx) => {
    if (q.options.length < 2) {
      throw new Error(
        `Вопрос №${idx + 1} («${q.questionText.slice(0, 40)}...»): должно быть минимум 2 варианта ответа.`,
      );
    }
    if (!q.options.some((o) => o.isCorrect)) {
      throw new Error(
        `Вопрос №${idx + 1} («${q.questionText.slice(0, 40)}...»): не отмечен ни один правильный ответ.`,
      );
    }
  });

  return parsedQuestions;
};

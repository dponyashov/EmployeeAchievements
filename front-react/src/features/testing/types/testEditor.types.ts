import type { TestQuestionUpsert, TestOptionUpsert } from '../testingApi';

export type EditorMode = 'list' | 'create' | 'edit';

export interface TestFormSettings {
  title: string;
  description: string;
  questionsLimit: number;
  hasTimeLimit: boolean;
  timeLimitMinutes: number;
  isHidden: boolean;
  allowTraining: boolean;
  passScorePercent: number;
}

export interface TestEditorTabProps {
  sectionId: number;
}

export interface TestSettingsFormProps {
  settings: TestFormSettings;
  onChange: <K extends keyof TestFormSettings>(
    field: K,
    value: TestFormSettings[K],
  ) => void;
}

export interface TestQuestionCardProps {
  question: TestQuestionUpsert;
  index: number;
  canRemoveQuestion: boolean;
  onChangeText: (index: number, text: string) => void;
  onRemoveQuestion: (index: number) => void;
  onAddOption: (qIndex: number) => void;
  onChangeOption: <K extends keyof TestOptionUpsert>(
    qIndex: number,
    oIndex: number,
    field: K,
    value: TestOptionUpsert[K],
  ) => void;
  onRemoveOption: (qIndex: number, oIndex: number) => void;
}

export const DEFAULT_OPTION_CODES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export const INITIAL_TEST_SETTINGS: TestFormSettings = {
  title: '',
  description: '',
  questionsLimit: 10,
  hasTimeLimit: false,
  timeLimitMinutes: 15,
  isHidden: false,
  allowTraining: false,
  passScorePercent: 80,
};

export const createEmptyOption = (index: number): TestOptionUpsert => ({
  code: DEFAULT_OPTION_CODES.at(index) ?? String.fromCharCode(97 + index),
  optionText: '',
  isCorrect: index === 0,
});

export const createEmptyQuestion = (sortOrder: number): TestQuestionUpsert => ({
  questionText: '',
  sortOrder,
  options: [createEmptyOption(0), createEmptyOption(1)],
});

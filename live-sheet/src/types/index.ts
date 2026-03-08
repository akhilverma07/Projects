// ── Cell & Format Types ──

export type NumberFormatType = 'text' | 'number' | 'currency' | 'percent' | 'date';

export interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;
  bgColor?: string;
  numberFormat?: NumberFormatType;
}

export interface CellData {
  v: string;       // raw value or formula string
  f?: string;      // formula (if cell has one, v holds the display value)
  s?: CellFormat;  // style/format
}

export type CellMap = Record<string, CellData>;

// ── Selection ──

export interface SelectionRange {
  start: string; // e.g. "A1"
  end: string;   // e.g. "C5"
}

export interface SelectionState {
  cell: string;
  col: number;
  row: number;
}

// ── Clipboard ──

export interface ClipboardBuffer {
  range: SelectionRange;
  cells: CellMap;
  isCut: boolean;
}

// ── Comments ──

export interface CellComment {
  text: string;
  author: string;
  createdAt: number;
}

// ── Conditional Formatting ──

export type ConditionalOperator = 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between' | 'contains';

export interface ConditionalFormatRule {
  id: string;
  range: SelectionRange;
  operator: ConditionalOperator;
  value1: string;
  value2?: string;
  style: {
    textColor?: string;
    bgColor?: string;
  };
}

// ── Data Validation ──

export type ValidationType = 'dropdown' | 'number' | 'date';

export interface DataValidationRule {
  cellId: string;
  type: ValidationType;
  options?: string[];
  min?: number;
  max?: number;
}

// ── Charts ──

export type ChartType = 'bar' | 'pie' | 'line';

export interface ChartConfig {
  id: string;
  type: ChartType;
  dataRange: SelectionRange;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// ── Context Menu ──

export interface ContextMenuItem {
  label: string;
  icon?: string;
  action: () => void;
  divider?: boolean;
  disabled?: boolean;
}

// ── Document ──

export interface SpreadsheetDocument {
  id: string;
  title: string;
  createdBy: string;
  createdByName: string;
  createdAt: number;
  updatedAt: number;
}

// ── User ──

export interface UserIdentity {
  uid: string;
  displayName: string;
  color: string;
  photoURL?: string;
  isAnonymous: boolean;
}

export interface UserPresence {
  uid: string;
  displayName: string;
  color: string;
  photoURL?: string;
  selectedCell?: string;
  lastActive: number;
}

export type WriteStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface ColumnConfig {
  width: number;
  order: number;
}

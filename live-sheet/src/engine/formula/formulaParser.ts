import type { CellMap } from '@/types';
import { getColumnIndex, getColumnLabel } from '@/constants/grid';

export type CellValue = string | number | boolean;

type Token =
    | { type: 'NUMBER'; value: number }
    | { type: 'STRING'; value: string }
    | { type: 'BOOLEAN'; value: boolean }
    | { type: 'CELL_REF'; value: string }
    | { type: 'FUNCTION'; value: string }
    | { type: 'OP'; value: string }
    | { type: 'COMPARE'; value: string }
    | { type: 'LPAREN' }
    | { type: 'RPAREN' }
    | { type: 'COLON' }
    | { type: 'COMMA' };

function tokenize(formula: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < formula.length) {
        const ch = formula[i];

        if (ch === ' ' || ch === '\t') {
            i++;
            continue;
        }

        if (ch === '"') {
            let str = '';
            i++;
            while (i < formula.length && formula[i] !== '"') {
                str += formula[i];
                i++;
            }
            if (i < formula.length && formula[i] === '"') i++;
            tokens.push({ type: 'STRING', value: str });
            continue;
        }

        if ((ch >= '0' && ch <= '9') || ch === '.') {
            let num = '';
            while (i < formula.length && ((formula[i] >= '0' && formula[i] <= '9') || formula[i] === '.')) {
                num += formula[i];
                i++;
            }
            tokens.push({ type: 'NUMBER', value: parseFloat(num) });
            continue;
        }

        const upperCh = ch.toUpperCase();
        if (upperCh >= 'A' && upperCh <= 'Z') {
            let ident = '';
            while (i < formula.length && formula[i].toUpperCase() >= 'A' && formula[i].toUpperCase() <= 'Z') {
                ident += formula[i].toUpperCase();
                i++;
            }

            if (ident === 'TRUE') {
                tokens.push({ type: 'BOOLEAN', value: true });
                continue;
            }
            if (ident === 'FALSE') {
                tokens.push({ type: 'BOOLEAN', value: false });
                continue;
            }

            if (i < formula.length && formula[i] >= '0' && formula[i] <= '9') {
                let row = '';
                while (i < formula.length && formula[i] >= '0' && formula[i] <= '9') {
                    row += formula[i];
                    i++;
                }
                tokens.push({ type: 'CELL_REF', value: ident + row });
            } else if (['SUM', 'AVG', 'AVERAGE', 'MIN', 'MAX', 'COUNT', 'IF'].includes(ident)) {
                tokens.push({ type: 'FUNCTION', value: ident === 'AVERAGE' ? 'AVG' : ident });
            } else {
                throw new Error(`Unknown identifier: ${ident}`);
            }
            continue;
        }

        if (ch === '(') { tokens.push({ type: 'LPAREN' }); i++; continue; }
        if (ch === ')') { tokens.push({ type: 'RPAREN' }); i++; continue; }
        if (ch === ':') { tokens.push({ type: 'COLON' }); i++; continue; }
        if (ch === ',') { tokens.push({ type: 'COMMA' }); i++; continue; }

        if (ch === '<' && formula[i + 1] === '>') { tokens.push({ type: 'COMPARE', value: '<>' }); i += 2; continue; }
        if (ch === '<' && formula[i + 1] === '=') { tokens.push({ type: 'COMPARE', value: '<=' }); i += 2; continue; }
        if (ch === '>' && formula[i + 1] === '=') { tokens.push({ type: 'COMPARE', value: '>=' }); i += 2; continue; }
        if (ch === '<') { tokens.push({ type: 'COMPARE', value: '<' }); i++; continue; }
        if (ch === '>') { tokens.push({ type: 'COMPARE', value: '>' }); i++; continue; }
        if (ch === '=') { tokens.push({ type: 'COMPARE', value: '=' }); i++; continue; }

        if (['+', '-', '*', '/'].includes(ch)) {
            tokens.push({ type: 'OP', value: ch });
            i++;
            continue;
        }

        throw new Error(`Unexpected character: ${ch}`);
    }

    return tokens;
}

class Parser {
    private tokens: Token[];
    private pos: number;
    private getCellValue: (cellId: string) => CellValue;

    constructor(tokens: Token[], getCellValue: (cellId: string) => CellValue) {
        this.tokens = tokens;
        this.pos = 0;
        this.getCellValue = getCellValue;
    }

    private peek(): Token | undefined {
        return this.tokens[this.pos];
    }

    private consume(): Token {
        return this.tokens[this.pos++];
    }

    private expect(type: string): Token {
        const t = this.consume();
        if (!t || t.type !== type) {
            throw new Error(`Expected ${type} but got ${t?.type || 'end of input'}`);
        }
        return t;
    }

    parse(): CellValue {
        const result = this.comparison();
        if (this.pos < this.tokens.length) {
            throw new Error('Unexpected tokens after expression');
        }
        return result;
    }

    private comparison(): CellValue {
        let left = this.expression();

        while (this.peek()?.type === 'COMPARE') {
            const op = this.consume() as { type: 'COMPARE'; value: string };
            const right = this.expression();
            if (op.value === '=') left = left === right;
            else if (op.value === '<>') left = left !== right;
            else if (op.value === '<') left = left < right;
            else if (op.value === '<=') left = left <= right;
            else if (op.value === '>') left = left > right;
            else if (op.value === '>=') left = left >= right;
        }

        return left;
    }

    private expression(): CellValue {
        let left = this.term();

        while (this.peek()?.type === 'OP' && ((this.peek() as { type: 'OP'; value: string }).value === '+' || (this.peek() as { type: 'OP'; value: string }).value === '-')) {
            const op = this.consume() as { type: 'OP'; value: string };
            const right = this.term();
            if (typeof left === 'number' && typeof right === 'number') {
                left = op.value === '+' ? left + right : left - right;
            } else if (op.value === '+' && (typeof left === 'string' || typeof right === 'string')) {
                left = String(left) + String(right);
            } else {
                throw new Error('Invalid operands for operator');
            }
        }

        return left;
    }

    private term(): CellValue {
        let left = this.factor();

        while (this.peek()?.type === 'OP' && ((this.peek() as { type: 'OP'; value: string }).value === '*' || (this.peek() as { type: 'OP'; value: string }).value === '/')) {
            const op = this.consume() as { type: 'OP'; value: string };
            const right = this.factor();
            if (typeof left === 'number' && typeof right === 'number') {
                if (op.value === '*') left *= right;
                else {
                    if (right === 0) throw new Error('Division by zero');
                    left /= right;
                }
            } else {
                throw new Error('Multiplication/Division requires numbers');
            }
        }

        return left;
    }

    private skipExpression(): void {
        let parenDepth = 0;
        while (this.pos < this.tokens.length) {
            const t = this.peek()!;
            if (t.type === 'LPAREN') parenDepth++;
            else if (t.type === 'RPAREN') {
                if (parenDepth === 0) break;
                parenDepth--;
            } else if (t.type === 'COMMA' && parenDepth === 0) {
                break;
            }
            this.consume();
        }
    }

    private factor(): CellValue {
        const t = this.peek();
        if (!t) throw new Error('Unexpected end of expression');

        if (t.type === 'OP' && (t.value === '-' || t.value === '+')) {
            this.consume();
            const val = this.factor();
            if (typeof val !== 'number') throw new Error('Unary operator requires number');
            return t.value === '-' ? -val : val;
        }

        if (t.type === 'NUMBER' || t.type === 'STRING' || t.type === 'BOOLEAN') {
            this.consume();
            return t.value;
        }

        if (t.type === 'CELL_REF') {
            this.consume();
            return this.getCellValue(t.value);
        }

        if (t.type === 'FUNCTION') {
            return this.parseFunction();
        }

        if (t.type === 'LPAREN') {
            this.consume();
            const val = this.comparison();
            this.expect('RPAREN');
            return val;
        }

        throw new Error(`Unexpected token: ${t.type}`);
    }

    private parseFunction(): CellValue {
        const funcToken = this.consume() as { type: 'FUNCTION'; value: string };
        const funcName = funcToken.value;

        this.expect('LPAREN');

        if (funcName === 'IF') {
            const condition = this.comparison();
            this.expect('COMMA');

            let trueVal: CellValue = false;
            let falseVal: CellValue = false;

            if (condition) {
                trueVal = this.comparison();
                if (this.peek()?.type === 'COMMA') {
                    this.consume();
                    this.skipExpression();
                }
            } else {
                this.skipExpression();
                if (this.peek()?.type === 'COMMA') {
                    this.consume();
                    falseVal = this.comparison();
                }
            }

            this.expect('RPAREN');
            return condition ? trueVal : falseVal;
        }

        const values = this.parseArgList();
        this.expect('RPAREN');

        const numValues = values.filter((v): v is number => typeof v === 'number');

        switch (funcName) {
            case 'SUM':
                return numValues.reduce((a, b) => a + b, 0);
            case 'AVG':
                return numValues.length > 0 ? numValues.reduce((a, b) => a + b, 0) / numValues.length : 0;
            case 'MIN':
                return numValues.length > 0 ? Math.min(...numValues) : 0;
            case 'MAX':
                return numValues.length > 0 ? Math.max(...numValues) : 0;
            case 'COUNT':
                return numValues.length;
            default:
                throw new Error(`Unknown function: ${funcName}`);
        }
    }

    private parseArgList(): CellValue[] {
        if (this.peek()?.type === 'RPAREN') return [];
        const values: CellValue[] = [];

        const firstValues = this.parseRangeOrValue();
        values.push(...firstValues);

        while (this.peek()?.type === 'COMMA') {
            this.consume();
            const nextValues = this.parseRangeOrValue();
            values.push(...nextValues);
        }

        return values;
    }

    private parseRangeOrValue(): CellValue[] {
        const t = this.peek();

        if (t?.type === 'CELL_REF') {
            const startRef = this.consume() as { type: 'CELL_REF'; value: string };

            if (this.peek()?.type === 'COLON') {
                this.consume();
                const endRef = this.expect('CELL_REF') as unknown as { type: 'CELL_REF'; value: string };
                return this.expandRange(startRef.value, endRef.value);
            }

            return [this.getCellValue(startRef.value)];
        }

        return [this.comparison()];
    }

    private expandRange(start: string, end: string): CellValue[] {
        const startMatch = start.match(/^([A-Z]+)(\d+)$/);
        const endMatch = end.match(/^([A-Z]+)(\d+)$/);

        if (!startMatch || !endMatch) throw new Error(`Invalid range: ${start}:${end}`);

        const startCol = getColumnIndex(startMatch[1]);
        const endCol = getColumnIndex(endMatch[1]);
        const startRow = parseInt(startMatch[2], 10);
        const endRow = parseInt(endMatch[2], 10);

        const values: CellValue[] = [];

        for (let c = Math.min(startCol, endCol); c <= Math.max(startCol, endCol); c++) {
            for (let r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); r++) {
                const cellId = `${getColumnLabel(c)}${r}`;
                values.push(this.getCellValue(cellId));
            }
        }

        return values;
    }
}

// --- Dependency Graph ---
export class DependencyGraph {
    private dependencies: Map<string, Set<string>> = new Map();
    private dependents: Map<string, Set<string>> = new Map();

    updateDependencies(cellId: string, formula: string): void {
        const oldDeps = this.dependencies.get(cellId);
        if (oldDeps) {
            for (const dep of oldDeps) {
                this.dependents.get(dep)?.delete(cellId);
            }
        }

        if (!formula.startsWith('=')) {
            this.dependencies.delete(cellId);
            return;
        }

        const refs = new Set<string>();
        const refPattern = /[A-Z]+\d+/g;
        let match: RegExpExecArray | null;
        const upper = formula.toUpperCase();

        while ((match = refPattern.exec(upper)) !== null) {
            refs.add(match[0]);
        }

        this.dependencies.set(cellId, refs);

        for (const ref of refs) {
            if (!this.dependents.has(ref)) {
                this.dependents.set(ref, new Set());
            }
            this.dependents.get(ref)!.add(cellId);
        }
    }

    getDependents(cellId: string): string[] {
        const result: string[] = [];
        const visited = new Set<string>();

        const dfs = (id: string) => {
            const deps = this.dependents.get(id);
            if (!deps) return;
            for (const dep of deps) {
                if (!visited.has(dep)) {
                    visited.add(dep);
                    result.push(dep);
                    dfs(dep);
                }
            }
        };

        dfs(cellId);
        return result;
    }

    hasCircularDependency(cellId: string, formula: string): boolean {
        if (!formula.startsWith('=')) return false;

        const refs = new Set<string>();
        const refPattern = /[A-Z]+\d+/g;
        let match: RegExpExecArray | null;
        const upper = formula.toUpperCase();

        while ((match = refPattern.exec(upper)) !== null) {
            refs.add(match[0]);
        }

        const visited = new Set<string>();
        const stack = [...refs];

        while (stack.length > 0) {
            const current = stack.pop()!;
            if (current === cellId) return true;
            if (visited.has(current)) continue;
            visited.add(current);

            const deps = this.dependencies.get(current);
            if (deps) {
                for (const dep of deps) {
                    stack.push(dep);
                }
            }
        }

        return false;
    }
}

// --- Main evaluation function ---
export function evaluateCell(
    cellId: string,
    cells: CellMap,
    visited: Set<string> = new Set()
): string {
    const cell = cells[cellId];
    if (!cell) return '';

    const raw = cell.v;
    if (!raw || !raw.startsWith('=')) return raw || '';

    if (visited.has(cellId)) return '#CIRCULAR!';
    visited.add(cellId);

    try {
        const getCellValue = (refId: string): CellValue => {
            const refCell = cells[refId];
            if (!refCell) return '';

            const refRaw = refCell.v;
            if (!refRaw) return '';

            if (refRaw.startsWith('=')) {
                const evaluated = evaluateCell(refId, cells, new Set(visited));
                if (evaluated === 'TRUE') return true;
                if (evaluated === 'FALSE') return false;
                const num = parseFloat(evaluated);
                return isNaN(num) ? evaluated : num;
            }

            if (refRaw.toUpperCase() === 'TRUE') return true;
            if (refRaw.toUpperCase() === 'FALSE') return false;

            const num = parseFloat(refRaw);
            return isNaN(num) ? refRaw : num;
        };

        const tokens = tokenize(raw.slice(1));
        const parser = new Parser(tokens, getCellValue);
        const result = parser.parse();

        if (typeof result === 'boolean') return result ? 'TRUE' : 'FALSE';
        if (typeof result === 'string') return result;
        if (typeof result === 'number') {
            if (isNaN(result)) return '#ERROR!';
            return Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(10)).toString();
        }
        return '';
    } catch {
        return '#ERROR!';
    }
}

export function isFormula(value: string): boolean {
    return value.startsWith('=');
}

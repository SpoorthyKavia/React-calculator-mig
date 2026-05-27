import React from 'react';
import {initTheme, toggleTheme} from './theme.js';

/**
 * PUBLIC_INTERFACE
 * Main application component.
 * Provides:
 * - theme toggle (persisted)
 * - a simple calculator flow with an Edit button that lets the user correct their last entry
 * @return {JSX.Element}
 */
export default function App() {
    const [theme, setTheme] = React.useState('light');

    // Calculator state
    const [display, setDisplay] = React.useState('0');
    const [acc, setAcc] = React.useState(null); // accumulated value
    const [pendingOp, setPendingOp] = React.useState(null); // '+', '-', '*', '/'
    const [isEntering, setIsEntering] = React.useState(false); // user is currently typing a number
    const [hasError, setHasError] = React.useState(false);

    // Edit state: when true, backspace edits the last entry rather than being a no-op between steps.
    const [isEditing, setIsEditing] = React.useState(false);

    React.useEffect(() => {
        // Initialize theme exactly once on app load.
        setTheme(initTheme());
    }, []);

    /**
     * Apply a binary operation. Returns null on invalid operations (e.g. divide by zero).
     * @param {number} a
     * @param {string} op
     * @param {number} b
     * @return {number|null}
     */
    function applyOp(a, op, b) {
        switch (op) {
            case '+':
                return a + b;
            case '-':
                return a - b;
            case '*':
                return a * b;
            case '/':
                if (b === 0) {
                    return null;
                }
                return a / b;
            default:
                return b;
        }
    }

    /**
     * Formats a number for display, trimming floating noise.
     * @param {number} n
     * @return {string}
     */
    function formatNumber(n) {
        if (!Number.isFinite(n)) {
            return 'Error';
        }
        // Limit precision but avoid unnecessary trailing zeros.
        const s = n.toFixed(10);
        return s.replace(/\.?0+$/, '');
    }

    function onToggleTheme() {
        setTheme((prev) => toggleTheme(prev));
    }

    /**
     * Append a digit or dot to the current entry.
     * @param {string} ch
     */
    function inputChar(ch) {
        if (hasError) {
            // Start fresh after an error.
            setHasError(false);
            setAcc(null);
            setPendingOp(null);
            setDisplay(ch === '.' ? '0.' : ch);
            setIsEntering(true);
            setIsEditing(false);
            return;
        }

        setDisplay((prev) => {
            const next = (() => {
                if (!isEntering) {
                    // Starting a new entry (after op selection, or initial state)
                    if (ch === '.') {
                        return '0.';
                    }
                    return ch;
                }

                // Already entering; append.
                if (ch === '.') {
                    if (prev.includes('.')) {
                        return prev;
                    }
                    return `${prev}.`;
                }

                // Avoid leading zero growth.
                if (prev === '0') {
                    return ch;
                }
                return `${prev}${ch}`;
            })();

            return next;
        });

        setIsEntering(true);
        // Any new typing exits edit mode (since the user is now making their correction).
        setIsEditing(false);
    }

    /**
     * Handles operator selection.
     * @param {'+'|'-'|'*'|'/'} op
     */
    function chooseOp(op) {
        if (hasError) {
            return;
        }

        const current = Number(display);

        if (acc === null) {
            setAcc(current);
            setPendingOp(op);
            setIsEntering(false);
            setIsEditing(false);
            return;
        }

        if (pendingOp && isEntering) {
            const result = applyOp(acc, pendingOp, current);
            if (result === null) {
                setHasError(true);
                setDisplay('Error');
                setAcc(null);
                setPendingOp(null);
                setIsEntering(false);
                setIsEditing(false);
                return;
            }

            setAcc(result);
            setDisplay(formatNumber(result));
            setPendingOp(op);
            setIsEntering(false);
            setIsEditing(false);
            return;
        }

        // If user is not entering a number, just change the pending operator.
        setPendingOp(op);
        setIsEditing(false);
    }

    function onEquals() {
        if (hasError) {
            return;
        }
        if (acc === null || !pendingOp) {
            return;
        }

        const current = Number(display);
        const result = applyOp(acc, pendingOp, current);
        if (result === null) {
            setHasError(true);
            setDisplay('Error');
            setAcc(null);
            setPendingOp(null);
            setIsEntering(false);
            setIsEditing(false);
            return;
        }

        setDisplay(formatNumber(result));
        setAcc(null);
        setPendingOp(null);
        setIsEntering(false);
        setIsEditing(false);
    }

    function onClear() {
        setDisplay('0');
        setAcc(null);
        setPendingOp(null);
        setIsEntering(false);
        setHasError(false);
        setIsEditing(false);
    }

    /**
     * Edit behavior:
     * - If user is currently typing a number: backspace that number.
     * - If user is between steps (operator selected, not typing): enter edit mode and edit the
     *   last visible number (display) so the user can correct it.
     * - If display becomes empty: reset to 0.
     */
    function onEdit() {
        if (hasError) {
            // Editing an error state should just clear.
            onClear();
            return;
        }

        // If we're not entering, this toggles "edit mode" to allow backspacing the current display.
        if (!isEntering) {
            setIsEntering(true);
            setIsEditing(true);
        } else {
            setIsEditing(true);
        }

        setDisplay((prev) => {
            if (prev.length <= 1) {
                return '0';
            }
            const next = prev.slice(0, -1);
            // Handle a trailing minus sign or just "-" after slicing
            if (next === '-' || next === '') {
                return '0';
            }
            return next;
        });
    }

    /**
     * Creates a calculator button.
     * @param {string} label
     * @param {() => void} onClick
     * @param {{variant?: 'primary'|'op'|'danger', wide?: boolean}} [opts]
     * @return {JSX.Element}
     */
    function CalcButton(label, onClick, opts = {}) {
        const {variant = 'primary', wide = false} = opts;
        const className = [
            'calcBtn',
            `calcBtn--${variant}`,
            wide ? 'calcBtn--wide' : '',
        ]
            .filter(Boolean)
            .join(' ');

        return (
            <button type="button" className={className} onClick={onClick}>
                {label}
            </button>
        );
    }

    return (
        <div className="appShell">
            <header className="topBar">
                <div className="brand">
                    <div className="brandTitle">React Calculator</div>
                    <div className="brandSub">Demo app with Dark Mode Toggle</div>
                </div>

                <div className="topBarActions">
                    <button
                        type="button"
                        className="actionToggle"
                        onClick={onEdit}
                        aria-label="Edit last entry"
                        title="Edit last entry"
                    >
                        <span className="actionToggleLabel">Edit</span>
                        <span className="actionToggleValue">
                            {isEditing ? 'On' : 'Off'}
                        </span>
                    </button>

                    <button
                        type="button"
                        className="themeToggle"
                        onClick={onToggleTheme}
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        <span className="themeToggleLabel">Theme</span>
                        <span className="themeToggleValue">{theme === 'dark' ? 'Dark' : 'Light'}</span>
                    </button>
                </div>
            </header>

            <main className="content">
                <section className="card">
                    <div className="calc">
                        <div className="calcHeader">
                            <div className="calcTitle">Calculator</div>
                            <div className="calcMeta">
                                {pendingOp ? (
                                    <span className="chip">Op: {pendingOp}</span>
                                ) : (
                                    <span className="chip chip--muted">No pending op</span>
                                )}
                                {isEditing ? (
                                    <span className="chip">Editing</span>
                                ) : (
                                    <span className="chip chip--muted">Not editing</span>
                                )}
                            </div>
                        </div>

                        <div className="calcDisplay" aria-live="polite" aria-label="Calculator display">
                            {display}
                        </div>

                        <div className="calcGrid" role="group" aria-label="Calculator keypad">
                            {CalcButton('C', onClear, {variant: 'danger'})}
                            {CalcButton('⌫', onEdit, {variant: 'op'})}
                            {CalcButton('÷', () => chooseOp('/'), {variant: 'op'})}
                            {CalcButton('×', () => chooseOp('*'), {variant: 'op'})}

                            {CalcButton('7', () => inputChar('7'))}
                            {CalcButton('8', () => inputChar('8'))}
                            {CalcButton('9', () => inputChar('9'))}
                            {CalcButton('−', () => chooseOp('-'), {variant: 'op'})}

                            {CalcButton('4', () => inputChar('4'))}
                            {CalcButton('5', () => inputChar('5'))}
                            {CalcButton('6', () => inputChar('6'))}
                            {CalcButton('+', () => chooseOp('+'), {variant: 'op'})}

                            {CalcButton('1', () => inputChar('1'))}
                            {CalcButton('2', () => inputChar('2'))}
                            {CalcButton('3', () => inputChar('3'))}
                            {CalcButton('=', onEquals, {variant: 'op'})}

                            {CalcButton('0', () => inputChar('0'), {wide: true})}
                            {CalcButton('.', () => inputChar('.'))}
                        </div>

                        <p className="calcHelp">
                            Tip: Use <strong>Edit</strong> (top bar or ⌫) to correct the last number you entered.
                            If you already picked an operator, Edit lets you backspace the current display to fix
                            the next operand before pressing <strong>=</strong>.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}

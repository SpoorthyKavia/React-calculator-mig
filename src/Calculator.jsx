import React, { useMemo, useState } from "react";
import Display from "./components/Display.jsx";
import Keypad from "./components/Keypad.jsx";
import "./calculator.css";

function isOperationKey(key) {
  return key === "+" || key === "-" || key === "*" || key === "/";
}

function formatOperationForHistory(op) {
  if (op === "*") return "×";
  if (op === "/") return "÷";
  return op;
}

function safeParseFloat(value) {
  if (value === "" || value === "-" || value === "." || value === "-.") return null;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

function compute(prev, next, op) {
  if (op === "+") return prev + next;
  if (op === "-") return prev - next;
  if (op === "*") return prev * next;
  if (op === "/") return prev / next;
  return next;
}

// PUBLIC_INTERFACE
export default function Calculator() {
  /** Top-level calculator component controlling state, behavior, and layout. */
  const [currentInput, setCurrentInput] = useState("0");
  const [previousValue, setPreviousValue] = useState(null); // number | null
  const [operation, setOperation] = useState(null); // "+"|"-"|"*"|"/"|null
  const [history, setHistory] = useState([]); // string[]
  const [error, setError] = useState(null); // string|null

  const displayValue = useMemo(() => {
    if (error) return "Error";
    return currentInput;
  }, [currentInput, error]);

  function appendHistory(entry) {
    setHistory((h) => [entry, ...h].slice(0, 10));
  }

  function clearAll() {
    setCurrentInput("0");
    setPreviousValue(null);
    setOperation(null);
    setError(null);
  }

  function clearEntry() {
    setCurrentInput("0");
    setError(null);
  }

  function handleDigit(digit) {
    setError(null);
    setCurrentInput((prev) => {
      // If previous value is shown after equals, digits should start fresh
      if (prev === "0") return digit;
      if (prev === "-0") return "-" + digit;
      return prev + digit;
    });
  }

  function handleDecimal() {
    setError(null);
    setCurrentInput((prev) => {
      if (prev.includes(".")) return prev;
      if (prev === "" || prev === "0") return "0.";
      if (prev === "-") return "-0.";
      return prev + ".";
    });
  }

  function handleDelete() {
    setError(null);
    setCurrentInput((prev) => {
      if (prev.length <= 1) return "0";
      if (prev.length === 2 && prev.startsWith("-")) return "0";
      const next = prev.slice(0, -1);
      if (next === "-" || next === "" || next === "-0") return "0";
      return next;
    });
  }

  function handleToggleSign() {
    setError(null);
    setCurrentInput((prev) => {
      if (prev === "0") return "-0";
      if (prev === "-0") return "0";
      if (prev.startsWith("-")) return prev.slice(1);
      return "-" + prev;
    });
  }

  function handleOperation(nextOp) {
    setError(null);

    // Allow changing operation when user hasn't entered a new number
    const curr = safeParseFloat(currentInput);
    if (curr === null) {
      // If current input isn't a number yet (e.g., "-"), ignore operation changes.
      return;
    }

    if (previousValue === null) {
      setPreviousValue(curr);
      setOperation(nextOp);
      setCurrentInput("0");
      return;
    }

    if (operation === null) {
      // We had a stored previous value but no operation: just set operation.
      setOperation(nextOp);
      setCurrentInput("0");
      return;
    }

    // Chain: compute pending operation first, then set new operation.
    if (operation === "/" && curr === 0) {
      setError("Division by zero");
      return;
    }

    const result = compute(previousValue, curr, operation);
    setPreviousValue(result);
    setOperation(nextOp);
    setCurrentInput("0");
  }

  function handleEquals() {
    setError(null);

    const curr = safeParseFloat(currentInput);
    if (curr === null) return;

    if (previousValue === null || operation === null) {
      // Nothing to compute; keep current input.
      return;
    }

    if (operation === "/" && curr === 0) {
      setError("Division by zero");
      return;
    }

    const result = compute(previousValue, curr, operation);

    appendHistory(
      `${previousValue} ${formatOperationForHistory(operation)} ${curr} = ${result}`
    );

    setCurrentInput(String(result));
    setPreviousValue(null);
    setOperation(null);
  }

  function handleKeyPress(key) {
    if (key === "AC") return clearAll();
    if (key === "C") return clearEntry();
    if (key === "⌫") return handleDelete();
    if (key === "±") return handleToggleSign();
    if (key === ".") return handleDecimal();
    if (key === "=") return handleEquals();

    if (isOperationKey(key)) return handleOperation(key);

    // Digits
    if (/^\d$/.test(key)) return handleDigit(key);
  }

  const pendingInfo = useMemo(() => {
    if (error) return error;
    if (previousValue !== null && operation) {
      return `${previousValue} ${formatOperationForHistory(operation)}`;
    }
    return "";
  }, [previousValue, operation, error]);

  return (
    <div className="page">
      <main className="calculator" aria-label="Calculator">
        <Display value={displayValue} pending={pendingInfo} history={history} />
        <Keypad onKeyPress={handleKeyPress} />
      </main>
    </div>
  );
}

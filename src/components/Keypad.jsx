import React from "react";
import "./keypad.css";

function KeyButton({ label, onPress, variant = "default", span = 1 }) {
  return (
    <button
      type="button"
      className={`key key--${variant} ${span === 2 ? "key--span2" : ""}`}
      onClick={() => onPress(label)}
    >
      {label}
    </button>
  );
}

// PUBLIC_INTERFACE
export default function Keypad({ onKeyPress }) {
  /** Keypad grid for calculator input. */
  const onPress = (label) => {
    if (typeof onKeyPress === "function") onKeyPress(label);
  };

  return (
    <section className="keypad" aria-label="Keypad">
      <KeyButton label="AC" variant="utility" onPress={onPress} />
      <KeyButton label="C" variant="utility" onPress={onPress} />
      <KeyButton label="⌫" variant="utility" onPress={onPress} />
      <KeyButton label="÷" variant="op" onPress={() => onPress("/")} />

      <KeyButton label="7" onPress={onPress} />
      <KeyButton label="8" onPress={onPress} />
      <KeyButton label="9" onPress={onPress} />
      <KeyButton label="×" variant="op" onPress={() => onPress("*")} />

      <KeyButton label="4" onPress={onPress} />
      <KeyButton label="5" onPress={onPress} />
      <KeyButton label="6" onPress={onPress} />
      <KeyButton label="-" variant="op" onPress={onPress} />

      <KeyButton label="1" onPress={onPress} />
      <KeyButton label="2" onPress={onPress} />
      <KeyButton label="3" onPress={onPress} />
      <KeyButton label="+" variant="op" onPress={onPress} />

      <KeyButton label="±" variant="utility" onPress={onPress} />
      <KeyButton label="0" onPress={onPress} />
      <KeyButton label="." onPress={onPress} />
      <KeyButton label="=" variant="equals" onPress={onPress} />
    </section>
  );
}

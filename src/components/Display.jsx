import React from "react";
import "./display.css";

// PUBLIC_INTERFACE
export default function Display({ value, pending, history }) {
  /** Calculator display area: pending operation, main value, and optional history log. */
  return (
    <section className="display" aria-label="Display">
      <div className="displayPending" aria-label="Pending operation">
        {pending || "\u00A0"}
      </div>

      <div className="displayValue" aria-label="Current value" role="status" aria-live="polite">
        {value}
      </div>

      {Array.isArray(history) && history.length > 0 && (
        <div className="displayHistory" aria-label="History">
          <div className="displayHistoryTitle">History</div>
          <ul className="displayHistoryList">
            {history.slice(0, 5).map((h, idx) => (
              <li key={`${h}-${idx}`}>{h}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

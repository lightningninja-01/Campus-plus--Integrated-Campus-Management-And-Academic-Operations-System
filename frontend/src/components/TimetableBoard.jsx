import React from "react";

const formatGeneratedAt = (value) => {
  if (!value) return null;
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
};

export default function TimetableBoard({
  title = "Timetable",
  subtitle,
  entries = [],
  settings,
  generatedAt,
  emptyMessage = "No timetable available yet.",
  compact = false,
}) {
  const days = settings?.days || [];
  const periodsPerDay = settings?.periodsPerDay || 0;
  const generatedLabel = formatGeneratedAt(generatedAt);

  const grouped = new Map();
  entries.forEach((entry) => {
    grouped.set(`${entry.day}-${entry.period}`, entry);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: "'Syne',sans-serif", fontSize: compact ? 22 : 24, color: "#fff" }}>{title}</h2>
          {subtitle && <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.45)", fontSize: 13 }}>{subtitle}</p>}
        </div>
        {generatedLabel && (
          <span style={{ padding: "6px 12px", borderRadius: 20, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#a5b4fc", fontSize: 12 }}>
            Updated {generatedLabel}
          </span>
        )}
      </div>

      {!entries.length || !days.length || !periodsPerDay ? (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "36px 24px", textAlign: "center", color: "rgba(255,255,255,0.45)", fontSize: 14 }}>
          {emptyMessage}
        </div>
      ) : (
        <div style={{ overflowX: "auto", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
            <thead>
              <tr>
                <th style={TH}>Day</th>
                {Array.from({ length: periodsPerDay }, (_, index) => (
                  <th key={index + 1} style={TH}>Period {index + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day}>
                  <td style={DAY_TD}>{day}</td>
                  {Array.from({ length: periodsPerDay }, (_, index) => {
                    const period = index + 1;
                    const entry = grouped.get(`${day}-${period}`);
                    return (
                      <td key={`${day}-${period}`} style={CELL_TD}>
                        {entry ? (
                          <div style={CELL_CARD}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{entry.courseCode}</p>
                            <p style={{ margin: "3px 0 0", fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{entry.courseName}</p>
                            <p style={{ margin: "8px 0 0", fontSize: 11, color: "#a5b4fc" }}>{entry.startTime} - {entry.endTime}</p>
                            <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{entry.room}</p>
                          </div>
                        ) : (
                          <div style={EMPTY_SLOT}>Free</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const TH = {
  textAlign: "left",
  fontSize: 11,
  fontWeight: 700,
  color: "rgba(255,255,255,0.35)",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  padding: "14px 16px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const DAY_TD = {
  padding: "16px",
  color: "#e2e8f0",
  fontSize: 13,
  fontWeight: 700,
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  whiteSpace: "nowrap",
};

const CELL_TD = {
  padding: "12px",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  borderLeft: "1px solid rgba(255,255,255,0.04)",
  verticalAlign: "top",
};

const CELL_CARD = {
  background: "rgba(99,102,241,0.08)",
  border: "1px solid rgba(99,102,241,0.18)",
  borderRadius: 12,
  padding: "12px 12px 10px",
  minHeight: 92,
};

const EMPTY_SLOT = {
  minHeight: 92,
  borderRadius: 12,
  border: "1px dashed rgba(255,255,255,0.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "rgba(255,255,255,0.22)",
  fontSize: 12,
};

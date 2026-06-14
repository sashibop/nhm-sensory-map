// AnalyticsSidePanel.jsx
// Drop-in replacement for IconAnalytics.
// – Slides in from the right when the user clicks the chart icon
// – Three stacked LineCharts: Crowd · Noise · Brightness
// – Default view = museum-wide overview (all rooms aggregated)
// – Multi-select: clicking an exhibition icon on the map adds / removes it;
//   each selected room gets its own coloured line
// – Cross-highlight: hovering a chart line ↔ hovering the map icon

import { useCallback, useRef, useState, useEffect, Fragment } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import useAppStore from "../../store/useAppStore";
import {
  getRoomCrowdHourlyData,
  getRoomNoiseHourlyData,
  getRoomBrightnessHourlyData,
  getMuseumOverviewData,
  getMuseumCrowdOverviewData,
  getMuseumNoiseOverviewData,
  getMuseumBrightnessOverviewData,
  HOURS,
} from "../../data/roomAnalytics";
import styles from "./styles/AnalyticsSidePanel.module.css";

// ─── colour palette for multi-room lines ────────────────────────────────────
const ROOM_COLORS = {
  natureRoleModel: "#6C8EFF", // blue-violet
  vivarium: "#4DD9AC", // mint
  fossils: "#F7C948", // amber
  prehistoricTimes: "#FF8C6B", // coral
  minerals: "#C084FC", // purple
  geology: "#34D1BF", // teal
  diorama: "#F97316", // orange
  specialExhibition: "#E879F9", // pink
  atrium: "#A3E635", // lime
  nativeNature: "#38BDF8", // sky
  africanNature: "#FB923C", // warm orange
  insects: "#4ADE80", // green
  rotary: "#FACC15", // yellow
  specialExhibitionBig: "#F43F5E", // rose
  Museum: "var(--color-primary)",
}


// ─── label maps ──────────────────────────────────────────────────────────────
const ROOM_LABELS = {
  vivarium: "Climates and habitats - Vivarium",
  africanNature: "African habitats",
  atrium: "Atrium",
  diorama: "Dioramas",
  fossils: "Fossils found in southern Baden",
  geology: "Geology on the Upper Rhine",
  insects: "The world of insects",
  minerals: "The realm of minerals",
  nativeNature: "Native flora and fauna",
  natureRoleModel: "Form and function - inspired by nature",
  prehistoricTimes: "Life in prehistoric times",
  rotary: "Rotary Room of Nature",
  specialExhibition: "Special exhibition (small)",
  specialExhibitionBig: "Special exhibition (big)",
  default: "Exhibition",
};

// ─── chart config ─────────────────────────────────────────────────────────────
const CHARTS = [
  {
    key: "crowd",
    label: "Crowd Density",
    unit: "visitors",
    dataFn: getRoomCrowdHourlyData,
    overviewFn: getMuseumCrowdOverviewData,
  },
  {
    key: "noise",
    label: "Noise Level",
    unit: "dB",
    dataFn: getRoomNoiseHourlyData,
    overviewFn: getMuseumNoiseOverviewData,
  },
  {
    key: "brightness",
    label: "Brightness",
    unit: "lux",
    dataFn: getRoomBrightnessHourlyData,
    overviewFn: getMuseumBrightnessOverviewData,
  },
];

// ─── custom tooltip ──────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <span className={styles.tooltipHour}>{label}:00</span>
      {payload.map((p) => (
        <div key={p.dataKey} className={styles.tooltipRow}>
          <span
            className={styles.tooltipDot}
            style={{ background: p.color }}
          />
          <span className={styles.tooltipName}>{p.name}</span>
          <span className={styles.tooltipValue}>
            {p.value} {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── single stacked chart ────────────────────────────────────────────────────
function AnalyticsChart({
  chartCfg,
  selectedRooms,
  dayOfWeek,
  activeFloor,
  hoveredRoom,
  onHoverRoom,
}) {
  const isOverview = selectedRooms.length === 0;
  // build merged dataset [{hour, roomA, roomB, …}] or [{hour, Museum}]
  let data;
  if (isOverview) {
    const raw = chartCfg.overviewFn
      ? chartCfg.overviewFn(dayOfWeek)
      : getMuseumOverviewData(chartCfg.dataFn, dayOfWeek);
    data = raw.map((d) => ({ hour: d.hour, Museum: d.value }));
  } else {
    data = HOURS.map(h => ({ hour: h }));
    selectedRooms.forEach((room) => {
      const raw = chartCfg.dataFn(room, dayOfWeek);
      raw.forEach((d) => {
        const entry = data.find(entry => entry.hour === d.hour)
        if (entry) entry[room] = d.value
      });
    });
  }

  const lineKeys = isOverview ? ["Museum"] : selectedRooms;

  return (
    <div className={styles.chartBlock}>
      <div className={styles.chartLabel}>{chartCfg.label}</div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.08)"
            vertical={false}
          />
          <XAxis
            dataKey="hour"
            tickFormatter={(h) => `${h}h`}
            tick={{ fill: "var(--text-muted)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={42}
            label={{
              value: chartCfg.unit,
              angle: -90,
              position: "insideLeft",
              offset: 10,
              style: { fill: "var(--text-muted)", fontSize: 10 }
            }}
          />
          <Tooltip
            content={<CustomTooltip unit={chartCfg.unit} />}
            cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }}
            position={{ y: 0 }}
          />
          {/* {lineKeys.length > 1 && (
            <Legend
              iconType="circle"
              iconSize={7}
              wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
              formatter={(v) => ROOM_LABELS[v] ?? v}
            />
          )} */}
          {lineKeys.map((room, idx) => {
            const color = ROOM_COLORS[room] ?? "var(--color-primary)";
            const isHovered = hoveredRoom === room;
            const anyHovered = hoveredRoom !== null;
            return (
              <Fragment key={room}>
                {/* visible line */}
                <Line
                  type="monotone"
                  dataKey={room}
                  name={ROOM_LABELS[room] ?? room}
                  stroke={color}
                  strokeWidth={isHovered ? 2.5 : anyHovered ? 1 : 1.8}
                  dot={false}
                  activeDot={{ r: 4, fill: color, stroke: "var(--bg-base)", strokeWidth: 1.5 }}
                  opacity={anyHovered && !isHovered ? 0.3 : 1}
                  style={{ transition: "opacity 0.2s, stroke-width 0.2s" }}
                />
                {/* invisible hover zone */}
                <Line
                  type="monotone"
                  dataKey={`__hover_${room}`}
                  stroke="transparent"
                  strokeWidth={12}
                  dot={false}
                  activeDot={false}
                  legendType="none"
                  tooltipType="none"
                  onMouseEnter={() => onHoverRoom(room)}
                  onMouseLeave={() => onHoverRoom(null)}
                />
              </Fragment>
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── main panel ──────────────────────────────────────────────────────────────
export default function AnalyticsSidePanel() {
  const isOpen = useAppStore((s) => s.isPanelOpen);
  const setIsPanelOpen = useAppStore((s) => s.setIsPanelOpen);
  const [hoveredRoom, setHoveredRoom] = useState(null);

  //store: selectedRooms = Set<string>; setHoveredMapIcon = fn
  const selectedRooms = useAppStore((s) => s.selectedRooms ?? []);
  const selectedDate = useAppStore((s) => s.selectedDate);
  const activeFloor = useAppStore((s) => s.activeFloor);
  const setHoveredMapIcon = useAppStore(
    (s) => s.setHoveredMapIcon ?? (() => { })
  );
  const hoveredMapIcon = useAppStore((s) => s.hoveredMapIcon)
  const effectiveHoveredRoom = hoveredRoom ?? hoveredMapIcon


  const dayOfWeek = selectedDate?.getDay() ?? 1;
  const roomList = Array.from(selectedRooms); // supports both Set and Array

  const handleHoverRoom = useCallback(
    (room) => {
      setHoveredRoom(room);
      setHoveredMapIcon(room); // notifies map layer
    },
    [setHoveredMapIcon]
  );

  return (
    <>
      {/* ── toggle button ── */}
      <button
        className={`${styles.toggleBtn} ${isOpen ? styles.toggleBtnOpen : ""}`}
        onClick={() => setIsPanelOpen(!isOpen)}
        aria-label={isOpen ? "Close analytics" : "Open analytics"}
        title="Analytics"
      >
        {/* simple bar-chart icon */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="11" width="3" height="7" rx="1" fill="currentColor" opacity={isOpen ? 1 : 0.5} />
          <rect x="8.5" y="6" width="3" height="12" rx="1" fill="currentColor" opacity={isOpen ? 1 : 0.65} />
          <rect x="15" y="2" width="3" height="16" rx="1" fill="currentColor" />
        </svg>
      </button>

      {/* ── panel ── */}
      <aside
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}
        aria-hidden={!isOpen}
      >
        {/* header */}
        <div className={styles.panelHeader}>
          <div>
            <div className={styles.panelTitle}>
              {roomList.length === 0
                ? "Museum Overview"
                : roomList.length === 1
                  ? (ROOM_LABELS[roomList[0]] ?? "Exhibition")
                  : `${roomList.length} Exhibitions`}
            </div>
            <div className={styles.panelSub}>
              {roomList.length === 0
                ? "All areas · today"
                : roomList
                  .map((r) => ROOM_LABELS[r] ?? r)
                  .join(", ")}
            </div>
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => setIsPanelOpen(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* stacked charts */}
        <div className={styles.chartsWrapper}>
          {CHARTS.map((cfg) => (
            <AnalyticsChart
              key={cfg.key}
              chartCfg={cfg}
              selectedRooms={roomList}
              dayOfWeek={dayOfWeek}
              activeFloor={activeFloor}
              hoveredRoom={effectiveHoveredRoom}
              onHoverRoom={handleHoverRoom}
            />
          ))}
        </div>

        {roomList.length > 0 && (
          <div className={styles.legend}>
            {roomList.map((room) => (
              <span
                key={room}
                className={styles.legendItem}
                style={{ "--dot-color": ROOM_COLORS[room] ?? "var(--color-primary)" }}
                onMouseEnter={() => handleHoverRoom(room)}
                onMouseLeave={() => handleHoverRoom(null)}
              >
                <span className={styles.legendDot} />
                {ROOM_LABELS[room] ?? room}
              </span>
            ))}
          </div>
        )}
      </aside>
    </>
  );
}


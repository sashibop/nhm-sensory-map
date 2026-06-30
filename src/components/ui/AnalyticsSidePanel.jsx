import { useCallback, useRef, useState, useEffect, Fragment, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
  ReferenceLine, ReferenceDot,
} from "recharts";
import { useTranslation } from "react-i18next";
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

// ─── colour palette (statisch – kein t nötig) ────────────────────────────────
const ROOM_COLORS = {
  natureRoleModel:    "#6C8EFF",
  vivarium:           "#4DD9AC",
  fossils:            "#F7C948",
  prehistoricTimes:   "#FF8C6B",
  minerals:           "#C084FC",
  geology:            "#34D1BF",
  diorama:            "#F97316",
  specialExhibition:  "#E879F9",
  atrium:             "#A3E635",
  nativeNature:       "#38BDF8",
  africanNature:      "#FB923C",
  insects:            "#4ADE80",
  rotary:             "#FACC15",
  specialExhibitionBig: "#F43F5E",
  Museum:             "var(--color-primary)",
};

// ─── Factory: gibt ROOM_LABELS-Objekt zurück (einmalig pro Sprache) ──────────
function makeRoomLabels(t) {
  return {
    vivarium:            t("analytics.rooms.vivarium"),
    africanNature:       t("analytics.rooms.africanNature"),
    atrium:              t("analytics.rooms.atrium"),
    diorama:             t("analytics.rooms.diorama"),
    fossils:             t("analytics.rooms.fossils"),
    geology:             t("analytics.rooms.geology"),
    insects:             t("analytics.rooms.insects"),
    minerals:            t("analytics.rooms.minerals"),
    nativeNature:        t("analytics.rooms.nativeNature"),
    natureRoleModel:     t("analytics.rooms.natureRoleModel"),
    prehistoricTimes:    t("analytics.rooms.prehistoricTimes"),
    rotary:              t("analytics.rooms.rotary"),
    specialExhibition:   t("analytics.rooms.specialExhibition"),
    specialExhibitionBig:t("analytics.rooms.specialExhibitionBig"),
    default:             t("analytics.rooms.default"),
  };
}

// ─── Factory: gibt CHARTS-Array zurück ───────────────────────────────────────
function makeCharts(t) {
  return [
    {
      key: "crowd",
      label:    t("analytics.charts.crowd"),
      unit:     t("analytics.units.visitors"),
      dataFn:   getRoomCrowdHourlyData,
      overviewFn: getMuseumCrowdOverviewData,
    },
    {
      key: "noise",
      label:    t("analytics.charts.noise"),
      unit:     t("analytics.units.db"),
      dataFn:   getRoomNoiseHourlyData,
      overviewFn: getMuseumNoiseOverviewData,
    },
    {
      key: "brightness",
      label:    t("analytics.charts.brightness"),
      unit:     t("analytics.units.lux"),
      dataFn:   getRoomBrightnessHourlyData,
      overviewFn: getMuseumBrightnessOverviewData,
    },
  ];
}

// ─── custom tooltip ──────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <span className={styles.tooltipHour}>{label}:00</span>
      {payload.map((p) => (
        <div key={p.dataKey} className={styles.tooltipRow}>
          <span className={styles.tooltipDot} style={{ background: p.color }} />
          <span className={styles.tooltipName}>{p.name}</span>
          <span className={styles.tooltipValue}>{p.value} {unit}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Timeline-Dot ────────────────────────────────────────────────────────────
function TimelineDot({ data, room, color }) {
  const timeOfDay = useAppStore((s) => Math.floor(s.timeOfDay));
  const currentEntry = data.find((d) => d.hour === timeOfDay);
  const currentValue = currentEntry?.[room];
  if (currentValue === undefined) return null;
  return (
    <ReferenceDot
      x={timeOfDay}
      y={currentValue}
      r={4}
      fill={color}
      stroke="var(--bg-base)"
      strokeWidth={1.5}
    />
  );
}

// ─── einzelnes Chart ─────────────────────────────────────────────────────────
function AnalyticsChart({
  chartCfg, selectedRooms, dayOfWeek,
  activeFloor, hoveredRoom, onHoverRoom, roomLabels,
}) {
  const isOverview = selectedRooms.length === 0;

  let data;
  if (isOverview) {
    const raw = chartCfg.overviewFn
      ? chartCfg.overviewFn(dayOfWeek)
      : getMuseumOverviewData(chartCfg.dataFn, dayOfWeek);
    data = raw.map((d) => ({ hour: d.hour, Museum: d.value }));
  } else {
    data = HOURS.map((h) => ({ hour: h }));
    selectedRooms.forEach((room) => {
      const raw = chartCfg.dataFn(room, dayOfWeek);
      raw.forEach((d) => {
        const entry = data.find((e) => e.hour === d.hour);
        if (entry) entry[room] = d.value;
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
            tick={{ fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis
            tick={{ fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
            width={42}
            label={{
              value: chartCfg.unit,
              angle: -90,
              position: "insideLeft",
              offset: 10,
              style: { fill: "var(--text-muted)" },
            }}
          />
          <Tooltip
            content={<CustomTooltip unit={chartCfg.unit} />}
            cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }}
            position={{ y: 0 }}
          />
          {lineKeys.map((room) => {
            const color     = ROOM_COLORS[room] ?? "var(--color-primary)";
            const isHovered = hoveredRoom === room;
            const anyHovered = hoveredRoom !== null;
            return (
              <Fragment key={room}>
                <Line
                  type="monotone"
                  dataKey={room}
                  name={roomLabels[room] ?? room}
                  stroke={color}
                  strokeWidth={isHovered ? 2.5 : anyHovered ? 1 : 1.8}
                  dot={false}
                  activeDot={{ r: 4, fill: color, stroke: "var(--bg-base)", strokeWidth: 1.5 }}
                  opacity={anyHovered && !isHovered ? 0.3 : 1}
                  style={{ transition: "opacity 0.2s, stroke-width 0.2s" }}
                />
                <TimelineDot data={data} room={room} color={color} />
              </Fragment>
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Haupt-Panel ─────────────────────────────────────────────────────────────
export default function AnalyticsSidePanel() {
  const { t } = useTranslation();

  const roomLabels = useMemo(() => makeRoomLabels(t), [t]);
  const charts     = useMemo(() => makeCharts(t),     [t]);

  const isOpen         = useAppStore((s) => s.isPanelOpen);
  const setIsPanelOpen = useAppStore((s) => s.setIsPanelOpen);
  const [hoveredRoom, setHoveredRoom] = useState(null);

  const selectedRooms  = useAppStore((s) => s.selectedRooms ?? []);
  const selectedDate   = useAppStore((s) => s.selectedDate);
  const activeFloor    = useAppStore((s) => s.activeFloor);
  const setHoveredMapIcon = useAppStore((s) => s.setHoveredMapIcon ?? (() => {}));
  const hoveredMapIcon    = useAppStore((s) => s.hoveredMapIcon);
  const effectiveHoveredRoom = hoveredRoom ?? hoveredMapIcon;

  const dayOfWeek = selectedDate?.getDay() ?? 1;
  const roomList  = Array.from(selectedRooms);

  const handleHoverRoom = useCallback(
    (room) => {
      setHoveredRoom(room);
      setHoveredMapIcon(room);
    },
    [setHoveredMapIcon]
  );

  return (
    <>
      <button
        className={`${styles.toggleBtn} ${isOpen ? styles.toggleBtnOpen : ""}`}
        onClick={() => setIsPanelOpen(!isOpen)}
        aria-label={isOpen ? t("analytics.closePanel") : t("analytics.openPanel")}
        title="Analytics"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2"    y="11" width="3" height="7"  rx="1" fill="currentColor" opacity={isOpen ? 1 : 0.5}  />
          <rect x="8.5"  y="6"  width="3" height="12" rx="1" fill="currentColor" opacity={isOpen ? 1 : 0.65} />
          <rect x="15"   y="2"  width="3" height="16" rx="1" fill="currentColor" />
        </svg>
      </button>

      <aside
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}
        aria-hidden={!isOpen}
        inert={!isOpen ? true : undefined}
      >
        <div className={styles.panelHeader}>
          <div>
            <div className={styles.panelTitle}>
              {roomList.length === 0
                ? t("analytics.museumOverview")
                : roomList.length === 1
                  ? (roomLabels[roomList[0]] ?? t("analytics.rooms.default"))
                  : t("analytics.exhibitions", { count: roomList.length })}
            </div>
            <div className={styles.panelSub}>
              {roomList.length === 0
                ? t("analytics.allAreas")
                : roomList.map((r) => roomLabels[r] ?? r).join(", ")}
            </div>
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => setIsPanelOpen(false)}
            aria-label={t("analytics.close")}
          >
            ×
          </button>
        </div>

        <div className={styles.chartsWrapper}>
          {charts.map((cfg) => (
            <AnalyticsChart
              key={cfg.key}
              chartCfg={cfg}
              selectedRooms={roomList}
              dayOfWeek={dayOfWeek}
              activeFloor={activeFloor}
              hoveredRoom={effectiveHoveredRoom}
              onHoverRoom={handleHoverRoom}
              roomLabels={roomLabels}
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
                {roomLabels[room] ?? room}
              </span>
            ))}
          </div>
        )}
      </aside>
    </>
  );
}
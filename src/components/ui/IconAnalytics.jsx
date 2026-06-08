import { getRoomCrowdHourlyData, getRoomNoiseHourlyData } from "../../data/roomAnalytics";
import useAppStore from "../../store/useAppStore";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

import styles from "./styles/IconAnalytics.module.css";

export default function IconAnalytics() {
  const selectedIcon = useAppStore((s) => s.selectedIcon);
  const selectedDate = useAppStore((s) => s.selectedDate);
  const activeFloor = useAppStore((s) => s.activeFloor);
  const clear = useAppStore((s) => s.clearSelectedIcon);

  if (!selectedIcon) return null;

  const dayOfWeek = selectedDate.getDay();

  // DATA
  const crowdData = getRoomCrowdHourlyData(selectedIcon, dayOfWeek, activeFloor);
  const noiseData = getRoomNoiseHourlyData(selectedIcon, dayOfWeek, activeFloor);
  

  const titleMap = {
    shark: {
      title: "Vivarium Exhibition",
      crowdTitle: "Crowdedness",
      noiseTitle: "Noise Level"
    },
    default: {
      title: "Exhibition",
      crowdTitle: "Crowdedness",
      noiseTitle: "Noise Level"
    }
  };

  const meta = titleMap[selectedIcon] || titleMap.default;

  return (
    <div className={styles.modalOverlay} onClick={clear}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* MAIN TITLE */}
        <h2 className={styles.modalTitle}>
          {meta.title}
        </h2>

        {/* CROWD */}
        <h3 className={styles.modalSubTitle}>
          {meta.crowdTitle}
        </h3>

        <div className={styles.chartWrapper}>
          <BarChart width={600} height={220} data={crowdData}>
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="var(--color-primary)" />
          </BarChart>
        </div>

        {/* NOISE */}
        <h3 className={styles.modalSubTitle} style={{ marginTop: 20 }}>
          {meta.noiseTitle}
        </h3>

        <div className={styles.chartWrapper}>
          <BarChart width={600} height={220} data={noiseData}>
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="var(--text-main)" />
          </BarChart>
        </div>

      </div>
    </div>
  );
}
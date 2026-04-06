"use client";

import { useState } from "react";
import { Clock, ChevronDown, Zap, CheckCircle, Users } from "lucide-react";
import { formatDuration, formatPrice } from "@/lib/utils";
import BarberAvatar from "@/components/ui/BarberAvatar";
import styles from "./QueueRow.module.css";

export interface QueueStaff {
  staffId:       string;
  staffName:     string;
  staffInitials: string;
  waitMins:      number;
  queueCount:    number;
  rating?:       number;
  isFastest?:    boolean;
}

export interface QueueRowProps {
  serviceId:      string;
  serviceName:    string;
  duration:       number;
  price:          number;
  originalPrice?: number;
  description?:   string;
  waitMins:       number;
  queueCount:     number;
  staff:          QueueStaff[];
  expanded?:      boolean;
  onToggle?:      () => void;
  onJoin?:        (staffId: string, people: number) => void;
}

export default function QueueRow({
  serviceName,
  duration,
  price,
  originalPrice,
  description,
  waitMins,
  queueCount,
  staff,
  expanded: externalExpanded,
  onToggle,
  onJoin,
}: QueueRowProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [selectedStaffId, setSelectedStaffId]   = useState<string>("fastest");
  const [people, setPeople]                      = useState(1);

  const expanded     = externalExpanded !== undefined ? externalExpanded : internalExpanded;
  const handleToggle = onToggle ?? (() => setInternalExpanded(p => !p));

  const selectedStaff = staff.find(s => s.staffId === selectedStaffId) ?? staff[0];
  const selectedName  = selectedStaffId === "fastest" ? "Anyone Available" : selectedStaff?.staffName ?? "Anyone Available";
  const selectedWait  = selectedStaff?.waitMins ?? waitMins;

  return (
    <div className={styles.row}>

      {/* ── Badge ─────────────────────────────────────────────────────── */}
      <div className={styles.badge}>
        <span className={styles.badgeDot} />
        JOIN QUEUE 
      </div>

      {/* ── Main clickable row ────────────────────────────────────────── */}
      <div className={styles.main} onClick={handleToggle}>
        <div className="flex-1 min-w-0 pr-3">
          <span className={styles.name}>{serviceName}</span>
          <div className={styles.duration}>
            <Clock />
            {formatDuration(duration)}
          </div>
          <p className={styles.queueMeta}>
            ~{waitMins} min wait&nbsp;•&nbsp;{queueCount} in queue
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {originalPrice && (
            <span className="text-[11px] text-[#b0a090] line-through leading-none">
              {formatPrice(originalPrice)}
            </span>
          )}
          <span className={styles.price}>{formatPrice(price)}</span>
          <span className={`${styles.chevron}${expanded ? ` ${styles.chevronOpen}` : ""}`}>
            <ChevronDown />
          </span>
        </div>
      </div>

      {/* ── Expandable panel ──────────────────────────────────────────── */}
      <div className={`${styles.panelWrapper}${expanded ? ` ${styles.panelWrapperOpen}` : ""}`}>
        <div className={styles.panelInner}>
          <div className={styles.panelContent}>

            {description && (
              <p className={styles.description}>{description}</p>
            )}

            <p className={styles.chooseLabel}>
              <span className={styles.chooseDot} />
              Choose your barber
            </p>

            {/* Staff list */}
            <div className={styles.staffList}>

              {/* FASTEST */}
              <button
                className={`${styles.staffCard} ${selectedStaffId === "fastest" ? styles.staffCardSelected : ""}`}
                onClick={() => setSelectedStaffId("fastest")}
              >
                <div className={styles.fastestIcon}>
                  <Zap className="w-4 h-4"  width={"20px"} height={"20px"}/>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center" style={{gap:"0.5rem"}}>
                    <span className={styles.fastestLabel}>FASTEST</span>
                    <span className={styles.staffWait}>
                      <Clock className={`w-1 h-1 ${styles.staffWaitIcon}`} />
                      ~{Math.min(...staff.map(s => s.waitMins))} min
                    </span>
                  </div>
                  {staff[0]?.rating && (
                    <div className={styles.staffMeta}>
                      <span className={styles.star}>★</span>
                      {staff[0].rating}&nbsp;•&nbsp;
                      {staff.filter(s => s.staffId !== "fastest").reduce((a, s) => a + s.queueCount, 0)} waiting
                    </div>
                  )}
                </div>
                {selectedStaffId === "fastest" && (
                  <CheckCircle className={styles.checkIcon} />
                )}
              </button>

              {/* Individual staff */}
              {staff.filter(s => s.staffId !== "fastest").map(s => (
                <button
                  key={s.staffId}
                  className={`${styles.staffCard} ${selectedStaffId === s.staffId ? styles.staffCardSelected : ""}`}
                  onClick={() => setSelectedStaffId(s.staffId)}
                >
                  <BarberAvatar initials={s.staffInitials} size="sm" />
                  <div className="flex-1 min-w-0 text-left" style={{gap:"0.5rem"}}>
                    <p className={styles.staffName}>{s.staffName}</p>
                    <div className={styles.staffMeta}>
                      <Clock className={`w-3 h-3 ${styles.staffWaitIcon}`} />
                      ~{s.waitMins} min&nbsp;&nbsp;{s.queueCount} waiting
                    </div>
                  </div>
                  {selectedStaffId === s.staffId && (
                    <CheckCircle className={styles.checkIcon} />
                  )}
                </button>
              ))}
            </div>

            {/* Selection summary */}
            <div className={styles.summary}>
              <div className={styles.summaryTop}>
                <div>
                  <p className={styles.summaryLabel}>SELECTED</p>
                  <p className={styles.summaryName}>{selectedName}</p>
                </div>
                <div className="text-right">
                  <p className={styles.summaryLabel}>EST. WAIT</p>
                  <p className={styles.summaryWait}>~{selectedWait} min</p>
                </div>
              </div>
              <div className={styles.summaryPeople}>
                <div className="flex items-center gap-2 text-[13px] text-[#888]" style={{gap:"0.5rem"}}>
                  <Users className={"w-2 h-2"} style={{width:"16px", height:"16px"}} />
                  <span>People</span>
                </div>
                <div className={styles.counter}>
                  <button
                    className={styles.counterBtn}
                    onClick={() => setPeople(p => Math.max(1, p - 1))}
                  >−</button>
                  <span className={styles.counterVal}>{people}</span>
                  <button
                    className={styles.counterBtn}
                    onClick={() => setPeople(p => Math.min(5, p + 1))}
                  >+</button>
                </div>
              </div>
            </div>

            {/* Join Queue button */}
            <button
              className={styles.joinBtn}
              onClick={() => onJoin?.(selectedStaffId, people)}
            >
              Join Queue {people > 1 ? ` (${people} people)` : ""}
            </button>
            <p className={styles.joinNote}>
              Pay on-site after your service&nbsp;•&nbsp;Cash or Card accepted
            </p>

          </div>
        </div>
      </div>

    </div>
  );
}

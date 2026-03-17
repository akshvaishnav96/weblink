"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./BookingCalendar.module.css";

interface BookingCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getDaysInMonth(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = (firstDay + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function BookingCalendar({ selectedDate, onDateSelect }: BookingCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const days = getDaysInMonth(viewYear, viewMonth);
  const monthName = new Date(viewYear, viewMonth).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const isSelected = (day: number) =>
    !!selectedDate &&
    day === selectedDate.getDate() &&
    viewMonth === selectedDate.getMonth() &&
    viewYear === selectedDate.getFullYear();

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    return d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  return (
    <div className={styles.calendar}>
      <h2 className={styles.calendarTitle}>Book Appointment</h2>

      <div className={styles.nav}>
        <button className={styles.navPrev} onClick={prevMonth}>
          <ChevronLeft />
        </button>
        <span className={styles.navMonth}>{monthName}</span>
        <button className={styles.navNext} onClick={nextMonth}>
          <ChevronRight />
        </button>
      </div>

      <div className={styles.weekdays}>
        {DAYS.map((d) => (
          <div key={d} className={styles.weekday}>{d}</div>
        ))}
      </div>

      <div className={styles.grid}>
        {days.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className={styles.cell} />;

          const past     = isPast(day);
          const selected = isSelected(day);
          const todayDay = isToday(day);

          const dayCls = [
            styles.day,
            past     ? styles.dayPast     : "",
            todayDay ? styles.dayToday    : "",
            selected ? styles.daySelected : "",
          ].filter(Boolean).join(" ");

          return (
            <div key={`d-${day}`} className={styles.cell}>
              <button
                disabled={past}
                onClick={() => onDateSelect(new Date(viewYear, viewMonth, day))}
                className={dayCls}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

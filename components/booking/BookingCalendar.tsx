"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./BookingCalendar.module.css";

interface BookingCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Returns today's { year, month (0-indexed), date } in the configured app timezone. */
function getTodayInTZ(): { year: number; month: number; date: number } {
  const tz = process.env.NEXT_PUBLIC_TIMEZONE ?? "Australia/Sydney";
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: tz,
    year:     "numeric",
    month:    "2-digit",
    day:      "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => parseInt(parts.find(p => p.type === type)!.value);
  return { year: get("year"), month: get("month") - 1, date: get("day") };
}

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
  const tzToday = getTodayInTZ();
  const [viewYear, setViewYear]   = useState(tzToday.year);
  const [viewMonth, setViewMonth] = useState(tzToday.month);

  const days = getDaysInMonth(viewYear, viewMonth);

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString("default", { month: "long" });
  const monthName  = `${monthLabel}, ${viewYear}`;

  const todayWeekdayIndex = (new Date(tzToday.year, tzToday.month, tzToday.date).getDay() + 6) % 7;
  const isCurrentViewMonth =
    viewMonth === tzToday.month && viewYear === tzToday.year;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isToday = (day: number) =>
    day === tzToday.date && viewMonth === tzToday.month && viewYear === tzToday.year;

  const isSelected = (day: number) =>
    !!selectedDate &&
    day === selectedDate.getDate() &&
    viewMonth === selectedDate.getMonth() &&
    viewYear === selectedDate.getFullYear();

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    return d < new Date(tzToday.year, tzToday.month, tzToday.date);
  };

  return (
    <div className="pt-6 px-4 pb-5 border-b border-[#F0EFED] bg-white md:pt-7 md:px-8 md:pb-6 lg:pt-8 lg:px-10 lg:pb-7">
      {/* calendarTitle: uses --font-heading custom font var — kept in CSS module */}
      <h2 className={styles.calendarTitle}>Book Appointment</h2>

      <div className="flex items-center justify-between mb-5 px-1 md:mb-[22px]">
        {/* navBtn: :hover + svg child selector — kept in CSS module */}
        <button className={styles.navBtn} onClick={prevMonth} aria-label="Previous month">
          <ChevronLeft />
        </button>
        <span style={{fontWeight:"bold"}} className="text-[15px] font-black text-[#1a1a1a] tracking-[0.01em] md:text-[16px]">{monthName}</span>
        <button className={styles.navBtn} onClick={nextMonth} aria-label="Next month">
          <ChevronRight />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d, i) => (
          <div
            key={d}
            style={{fontWeight:"bolder"}}
            className={`text-center text-[11px] font-bold py-[6px] tracking-[0.02em] md:text-[12px] lg:text-[13px] lg:py-2 ${isCurrentViewMonth && i === todayWeekdayIndex ? "text-[#B8860B]" : "text-[#aaa]"}`}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="flex items-center justify-center py-[6px]" />;

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
            <div key={`d-${day}`} className="flex items-center justify-center py-[6px]">
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

/**
 * Utility functions for weekly vote calculations (Monday to Sunday)
 */

export interface WeekDetails {
  weekKey: string;      // e.g. "2026-W45"
  prevWeekKey: string;  // e.g. "2026-W44"
  weekNumber: number;
  prevWeekNumber: number;
  year: number;
  startDateStr: string; // e.g. "03/11"
  endDateStr: string;   // e.g. "09/11"
  daysRemaining: number;
  hoursRemaining: number;
  isEndOfWeekSoon: boolean;
}

export function getCurrentWeekDetails(inputDate: Date = new Date()): WeekDetails {
  const d = new Date(inputDate);
  // Get day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const day = d.getDay();
  // In Vietnam & standard ISO: Monday is the start of the week
  const diffToMonday = day === 0 ? -6 : 1 - day;
  
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Calculate ISO week number
  const thursday = new Date(monday);
  thursday.setDate(monday.getDate() + 3);
  const firstJan = new Date(thursday.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((thursday.getTime() - firstJan.getTime()) / 86400000) + 1;
  const weekNumber = Math.ceil(dayOfYear / 7);
  const year = thursday.getFullYear();
  const weekKey = `${year}-W${String(weekNumber).padStart(2, "0")}`;

  // Previous week calculation
  const prevMonday = new Date(monday);
  prevMonday.setDate(monday.getDate() - 7);
  const prevThursday = new Date(prevMonday);
  prevThursday.setDate(prevMonday.getDate() + 3);
  const prevFirstJan = new Date(prevThursday.getFullYear(), 0, 1);
  const prevDayOfYear = Math.floor((prevThursday.getTime() - prevFirstJan.getTime()) / 86400000) + 1;
  const prevWeekNumber = Math.ceil(prevDayOfYear / 7);
  const prevYear = prevThursday.getFullYear();
  const prevWeekKey = `${prevYear}-W${String(prevWeekNumber).padStart(2, "0")}`;

  const formatShort = (dt: Date) => `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}`;

  const msRemaining = Math.max(0, sunday.getTime() - d.getTime());
  const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60));
  const daysRemaining = Math.ceil(hoursRemaining / 24);

  return {
    weekKey,
    prevWeekKey,
    weekNumber,
    prevWeekNumber,
    year,
    startDateStr: formatShort(monday),
    endDateStr: formatShort(sunday),
    daysRemaining,
    hoursRemaining,
    isEndOfWeekSoon: hoursRemaining <= 48
  };
}

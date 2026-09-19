"use client";

import React, { useMemo } from "react";
import { getMaxDaysInMonth, validateDMY } from "@/lib/validation";
import { Calendar, AlertCircle, ChevronDown } from "lucide-react";

interface DateOfBirthSelectProps {
  day: string | number;
  month: string | number;
  year: string | number;
  onChange: (d: string, m: string, y: string, formattedStr: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
}

export const DateOfBirthSelect: React.FC<DateOfBirthSelectProps> = ({
  day,
  month,
  year,
  onChange,
  error,
  label = "Ngày sinh (Ngày / Tháng / Năm)",
  required = false,
}) => {
  const currentYear = new Date().getFullYear();

  // Generate Year options: from currentYear down to currentYear - 100
  const yearOptions = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear; y >= currentYear - 100; y--) {
      list.push(y);
    }
    return list;
  }, [currentYear]);

  // Max days in the currently selected month and year
  const maxDays = useMemo(() => {
    const m = month ? parseInt(String(month), 10) : 1;
    const y = year ? parseInt(String(year), 10) : currentYear;
    return getMaxDaysInMonth(m, y);
  }, [month, year, currentYear]);

  // Generate Day options: from 1 to maxDays
  const dayOptions = useMemo(() => {
    const list: number[] = [];
    for (let d = 1; d <= maxDays; d++) {
      list.push(d);
    }
    return list;
  }, [maxDays]);

  // Calculate live age if full date is selected
  const validationResult = useMemo(() => {
    if (day && month && year) {
      return validateDMY(day, month, year);
    }
    return null;
  }, [day, month, year]);

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDay = e.target.value;
    const formatted = newDay && month && year
      ? `${String(newDay).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`
      : "";
    onChange(newDay, String(month || ""), String(year || ""), formatted);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = e.target.value;
    let adjustedDay = String(day || "");
    if (newMonth && day) {
      const maxD = getMaxDaysInMonth(parseInt(newMonth, 10), parseInt(String(year || currentYear), 10));
      if (parseInt(adjustedDay, 10) > maxD) {
        adjustedDay = String(maxD);
      }
    }
    const formatted = adjustedDay && newMonth && year
      ? `${String(adjustedDay).padStart(2, "0")}/${String(newMonth).padStart(2, "0")}/${year}`
      : "";
    onChange(adjustedDay, newMonth, String(year || ""), formatted);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = e.target.value;
    let adjustedDay = String(day || "");
    if (newYear && month && day) {
      const maxD = getMaxDaysInMonth(parseInt(String(month), 10), parseInt(newYear, 10));
      if (parseInt(adjustedDay, 10) > maxD) {
        adjustedDay = String(maxD);
      }
    }
    const formatted = adjustedDay && month && newYear
      ? `${String(adjustedDay).padStart(2, "0")}/${String(month).padStart(2, "0")}/${newYear}`
      : "";
    onChange(adjustedDay, String(month || ""), newYear, formatted);
  };

  const selectClasses = (hasVal: boolean) =>
    `w-full appearance-none rounded-2xl border ${
      error
        ? "border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 text-gray-900 dark:text-white"
        : "border-gray-200 dark:border-[#2d2f40] focus:border-[#0052cc] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-900/40"
    } bg-white dark:bg-[#181C31] pl-3 sm:pl-3.5 pr-8 sm:pr-9 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold outline-hidden transition cursor-pointer ${
      hasVal ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-400 font-normal"
    }`;

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] sm:text-xs font-semibold text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {validationResult?.isValid && validationResult.age !== undefined && (
          <span className="text-[10px] sm:text-[11px] font-bold text-[#0052cc] dark:text-blue-400 bg-blue-50 dark:bg-[#252A42] px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-[#2d2f40] animate-in fade-in">
            🎂 {validationResult.age} tuổi
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {/* Day Select */}
        <div className="relative">
          <select
            value={day || ""}
            onChange={handleDayChange}
            className={selectClasses(Boolean(day))}
          >
            <option value="" disabled className="text-gray-400 bg-white dark:bg-[#1c2136]">
              Ngày
            </option>
            {dayOptions.map((d) => (
              <option key={d} value={d} className="text-gray-900 dark:text-white bg-white dark:bg-[#1c2136]">
                {d < 10 ? `0${d}` : d}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 sm:pr-3 text-gray-400 dark:text-gray-500">
            <ChevronDown size={14} className="stroke-[2.25]" />
          </div>
        </div>

        {/* Month Select */}
        <div className="relative">
          <select
            value={month || ""}
            onChange={handleMonthChange}
            className={selectClasses(Boolean(month))}
          >
            <option value="" disabled className="text-gray-400 bg-white dark:bg-[#1c2136]">
              Tháng
            </option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m} className="text-gray-900 dark:text-white bg-white dark:bg-[#1c2136]">
                Tháng {m < 10 ? `0${m}` : m}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 sm:pr-3 text-gray-400 dark:text-gray-500">
            <ChevronDown size={14} className="stroke-[2.25]" />
          </div>
        </div>

        {/* Year Select */}
        <div className="relative">
          <select
            value={year || ""}
            onChange={handleYearChange}
            className={selectClasses(Boolean(year))}
          >
            <option value="" disabled className="text-gray-400 bg-white dark:bg-[#1c2136]">
              Năm
            </option>
            {yearOptions.map((y) => (
              <option key={y} value={y} className="text-gray-900 dark:text-white bg-white dark:bg-[#1c2136]">
                {y}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 sm:pr-3 text-gray-400 dark:text-gray-500">
            <ChevronDown size={14} className="stroke-[2.25]" />
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium animate-in fade-in duration-150">
          <AlertCircle size={12} className="shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

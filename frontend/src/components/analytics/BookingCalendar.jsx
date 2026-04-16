import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthMeta(currentMonth) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthStart = new Date(year, month, 1);
  const monthDays = new Date(year, month + 1, 0).getDate();
  const mondayStartOffset = (monthStart.getDay() + 6) % 7;

  return { year, month, monthDays, mondayStartOffset };
}

function countBookingsByDate(bookings) {
  return bookings.reduce((acc, booking) => {
    if (!booking.startTime) {
      return acc;
    }

    const startDate = new Date(booking.startTime);
    if (Number.isNaN(startDate.getTime())) {
      return acc;
    }

    const key = toDateKey(startDate);
    const current = acc[key] || {
      total: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
    };

    current.total += 1;
    if (booking.status === "APPROVED") {
      current.approved += 1;
    }
    if (booking.status === "REJECTED") {
      current.rejected += 1;
    }
    if (booking.status === "CANCELLED") {
      current.cancelled += 1;
    }

    acc[key] = current;
    return acc;
  }, {});
}

export default function BookingCalendar({ bookings = [] }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const bookingsByDate = useMemo(
    () => countBookingsByDate(bookings),
    [bookings],
  );

  const { year, month, monthDays, mondayStartOffset } = useMemo(
    () => getMonthMeta(currentMonth),
    [currentMonth],
  );

  const calendarCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < 42; i += 1) {
      const day = i - mondayStartOffset + 1;
      if (day < 1 || day > monthDays) {
        cells.push(null);
        continue;
      }

      const cellDate = new Date(year, month, day);
      const key = toDateKey(cellDate);
      cells.push({
        day,
        bookingStats: bookingsByDate[key] || null,
      });
    }

    return cells;
  }, [bookingsByDate, mondayStartOffset, monthDays, month, year]);

  const changeMonth = (delta) => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1),
    );
  };

  const visibleMonthLabel = currentMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Booking Calendar
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Monthly view of bookings by date.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="rounded-lg border border-slate-200 p-1.5 text-slate-700 transition hover:bg-slate-50"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <p className="min-w-36 text-center text-sm font-semibold text-slate-900">
            {visibleMonthLabel}
          </p>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="rounded-lg border border-slate-200 p-1.5 text-slate-700 transition hover:bg-slate-50"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="rounded-md bg-slate-100 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-600"
          >
            {label}
          </div>
        ))}

        {calendarCells.map((cell, index) => {
          if (!cell) {
            return (
              <div
                key={`empty-${index}`}
                className="min-h-20 rounded-md border border-transparent"
              />
            );
          }

          return (
            <article
              key={`day-${cell.day}`}
              className="min-h-20 rounded-md border border-slate-200 bg-slate-50 p-2"
            >
              <p className="text-xs font-semibold text-slate-700">{cell.day}</p>

              {cell.bookingStats ? (
                <div className="mt-1.5 space-y-1 text-[11px]">
                  <p className="font-semibold text-orange-700">
                    {cell.bookingStats.total} bookings
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {cell.bookingStats.approved > 0 && (
                      <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-emerald-700">
                        A:{cell.bookingStats.approved}
                      </span>
                    )}
                    {cell.bookingStats.rejected > 0 && (
                      <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-rose-700">
                        R:{cell.bookingStats.rejected}
                      </span>
                    )}
                    {cell.bookingStats.cancelled > 0 && (
                      <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-slate-700">
                        C:{cell.bookingStats.cancelled}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-[11px] text-slate-400">No bookings</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

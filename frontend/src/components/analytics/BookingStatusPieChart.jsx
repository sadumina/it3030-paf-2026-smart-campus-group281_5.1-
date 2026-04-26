import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const STATUS_COLORS = {
  APPROVED: "#10b981",
  REJECTED: "#f43f5e",
  CANCELLED: "#64748b",
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const entry = payload[0];

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-semibold text-slate-900">{entry.name}</p>
      <p className="text-xs text-slate-600">Bookings: {entry.value}</p>
    </div>
  );
}

export default function BookingStatusPieChart({ statusData = [] }) {
  const hasData = statusData.some((item) => item.value > 0);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">
        Booking Status Analytics
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Approved, rejected, and cancelled booking distribution.
      </p>

      {!hasData ? (
        <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 py-10 text-center text-sm text-slate-500">
          No status data available.
        </div>
      ) : (
        <div className="mt-3 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={94}
                innerRadius={56}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

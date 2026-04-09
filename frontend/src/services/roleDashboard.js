export function normalizeRole(role) {
  return (role || "USER").toUpperCase();
}

export function getDashboardPathForRole(role) {
  const normalized = normalizeRole(role);

  if (normalized === "ADMIN") {
    return "/admin";
  }

  if (normalized === "TECHNICIAN") {
    return "/technician";
  }

  return "/dashboard";
}

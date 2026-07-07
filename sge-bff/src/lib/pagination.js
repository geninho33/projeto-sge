export function parsePagination(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const orderBy = query.orderBy || "id";
  const orderDir = (query.orderDir || "asc").toLowerCase() === "desc" ? "desc" : "asc";
  return { page, limit, orderBy, orderDir, offset: (page - 1) * limit };
}

export function paginatedResponse(data, total, { page, limit, orderBy, orderDir }, filters = {}) {
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      sort: { orderBy, orderDir },
    },
    filters: { applied: filters, available: Object.keys(filters) },
  };
}

export function sortRows(rows, orderBy, orderDir) {
  return [...rows].sort((a, b) => {
    const av = a[orderBy] ?? "";
    const bv = b[orderBy] ?? "";
    const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv), "pt-BR");
    return orderDir === "desc" ? -cmp : cmp;
  });
}

export function filterRows(rows, query, fields) {
  let result = rows;
  if (query.q) {
    const q = query.q.toLowerCase();
    result = result.filter((r) =>
      fields.some((f) => String(r[f] ?? "").toLowerCase().includes(q))
    );
  }
  if (query.status) {
    result = result.filter((r) => r.status === query.status);
  }
  return result;
}

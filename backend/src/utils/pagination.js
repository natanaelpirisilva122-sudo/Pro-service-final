export function parsePagination(query) {
  const page = Math.max(Number.parseInt(query.page ?? '1', 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(query.limit ?? '20', 10) || 20, 1),
    100,
  );

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

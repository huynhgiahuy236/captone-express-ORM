export const buildQueryPrisma = (req) => {
  let { page, pageSize, search, filters } = req.query;

  try {
    filters = typeof filters === "string" ? JSON.parse(filters) : filters || {};
  } catch (error) {
    filters = {};
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (typeof value === "string") {
      filters[key] = {
        contains: value,
      };
    }
  });

  const where = {
    isDeleted: false,
    ...filters,
  };

  if (search && typeof search === "string") {
    where.ten_hinh = {
      contains: search,
    };
  }

  const pageDefault = 1;
  const pageSizeDefault = 12;

  page = Number(page) || pageDefault;
  pageSize = Number(pageSize) || pageSizeDefault;

  if (page < 1) page = pageDefault;
  if (pageSize < 1) pageSize = pageSizeDefault;

  const index = (page - 1) * pageSize;

  return {
    where,
    page,
    pageSize,
    index,
  };
};

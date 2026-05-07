const prisma = require("../config/db");
const {
  PENDING_STATUS_VALUES,
  VERIFIED_STATUS_VALUES,
} = require("../utils/documentStatus");

const buildSearchWhere = (search) => {
  const value = typeof search === "string" ? search.trim() : "";

  if (!value) {
    return {};
  }

  return {
    OR: [
      {
        title: {
          contains: value,
        },
      },
      {
        sender: {
          contains: value,
        },
      },
    ],
  };
};

const getOverview = async ({ search, page = 1, limit = 10 }) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Math.min(50, Number(limit) || 10));
  const skip = (safePage - 1) * safeLimit;
  const searchWhere = buildSearchWhere(search);
  const pendingWhere = {
    ...searchWhere,
    status: {
      in: PENDING_STATUS_VALUES,
    },
  };

  const [total, pending, verified, pendingTotal, data] = await Promise.all([
    prisma.document.count(),
    prisma.document.count({
      where: {
        status: {
          in: PENDING_STATUS_VALUES,
        },
      },
    }),
    prisma.document.count({
      where: {
        status: {
          in: VERIFIED_STATUS_VALUES,
        },
      },
    }),
    prisma.document.count({
      where: pendingWhere,
    }),
    prisma.document.findMany({
      where: pendingWhere,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: safeLimit,
      select: {
        id: true,
        title: true,
        filePath: true,
        status: true,
        createdAt: true,
        type: true,
        sender: true,
        documentDate: true,
      },
    }),
  ]);

  return {
    data,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.max(1, Math.ceil(pendingTotal / safeLimit)),
    totalPending: pendingTotal,
    stats: {
      total,
      pending,
      verified,
    },
  };
};

module.exports = {
  getOverview,
};

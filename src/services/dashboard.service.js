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

  // Kita gabungkan query-nya biar database nggak kerja berkali-kali ya dikk..
  const [counts, pendingTotal, data] = await Promise.all([
    // Ambil semua statistik status dalam satu tarikan napas!
    prisma.document.groupBy({
      by: ['status'],
      _count: {
        _all: true
      }
    }),
    // Ini buat pagination data yang lagi dicari/difilter
    prisma.document.count({
      where: {
        ...searchWhere,
        status: { in: PENDING_STATUS_VALUES }
      },
    }),
    // Ambil datanya
    prisma.document.findMany({
      where: {
        ...searchWhere,
        status: { in: PENDING_STATUS_VALUES }
      },
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

  // Kita rapihin datanya biar gampang dipake di frontend
  let total = 0;
  let pending = 0;
  let verified = 0;

  counts.forEach(item => {
    const count = item._count._all;
    total += count;
    if (PENDING_STATUS_VALUES.includes(item.status)) {
      pending += count;
    } else if (VERIFIED_STATUS_VALUES.includes(item.status)) {
      verified += count;
    }
  });

  return {
    data,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(pendingTotal / safeLimit),
    totalPending: pendingTotal,
    stats: {
      total,
      pending,
      verified,
    },
  };
};

const bulkUpdateStatus = async (ids, status) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { count: 0 };
  }

  return prisma.document.updateMany({
    where: {
      id: {
        in: ids.map((id) => Number(id)),
      },
    },
    data: {
      status,
    },
  });
};

module.exports = {
  getOverview,
  bulkUpdateStatus,
};

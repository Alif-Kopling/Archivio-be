const prisma = require("../config/db");
const {
  PENDING_STATUS_VALUES,
  VERIFIED_STATUS_VALUES,
} = require("../utils/documentStatus");

const getAll = async ({ search, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const where = {
    type: "masuk",
    ...(search && {
      title: {
        contains: search,
      },
    }),
  };

  const [data, total, pending, verified] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.document.count({ where }),
    prisma.document.count({
      where: {
        ...where,
        status: {
          in: PENDING_STATUS_VALUES,
        },
      },
    }),
    prisma.document.count({
      where: {
        ...where,
        status: {
          in: VERIFIED_STATUS_VALUES,
        },
      },
    }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    stats: {
      total,
      pending,
      verified,
    },
  };
};

const getById = async (id) => {
  return prisma.document.findUnique({
    where: {
      id: Number(id),
    },
  });
};

const create = async (data) => {
  return prisma.document.create({
    data: {
      title: data.title,
      sender: data.sender ?? null,
      documentDate: data.documentDate ?? null,
      filePath: data.filePath,
      type: "masuk",
      status: data.status || "pending",
      createdBy: data.createdBy,
    },
  });
};

const update = async (id, data) => {
  return prisma.document.update({
    where: { id: Number(id) },
    data,
  });
};

const remove = async (id) => {
  return prisma.document.delete({
    where: { id: Number(id) },
  });
};

module.exports = {
  getAll,
  create,
  getById,
  update,
  remove,
};

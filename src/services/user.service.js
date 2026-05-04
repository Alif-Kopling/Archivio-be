const prisma = require("../config/db");
const bcrypt = require("bcrypt");

const getAll = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      _count: {
        select: { documents: true }
      }
    }
  });
};

const create = async (data) => {
  // Hash password biar aman ya adikk!
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.password, salt);

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || "staff"
    }
  });
};

const update = async (id, data) => {
  const updateData = { ...data };

  // Kalau ada password baru, kita hash juga
  if (updateData.password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(updateData.password, salt);
  }

  return prisma.user.update({
    where: { id: Number(id) },
    data: updateData
  });
};

const remove = async (id) => {
  return prisma.user.delete({
    where: { id: Number(id) }
  });
};

module.exports = {
  getAll,
  create,
  update,
  remove
};

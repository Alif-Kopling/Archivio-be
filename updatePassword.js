const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.update({
    where: { email: 'admin@gmail.com' },
    data: { password: hash }
  });
  console.log('Password updated successfully for admin@gmail.com!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

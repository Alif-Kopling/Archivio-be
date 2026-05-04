const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testLogin() {
  const email = "admin@example.com"; // Ganti dengan email admin adikk
  const password = "admin123";      // Ganti dengan password admin adikk

  console.log(`Mencoba login untuk: ${email}`);

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log("HASIL: User TIDAK ditemukan di database!");
      return;
    }

    console.log(`User ditemukan! Password di DB: "${user.password}"`);
    console.log(`Password input: "${password}"`);

    const isMatch = password.trim() === user.password.trim();
    console.log(`Hasil perbandingan: ${isMatch}`);

    if (isMatch) {
      console.log("HASIL: Login BERHASIL (di skrip test)");
    } else {
      console.log("HASIL: Login GAGAL (di skrip test)");
    }
  } catch (error) {
    console.error("ERROR saat test:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();

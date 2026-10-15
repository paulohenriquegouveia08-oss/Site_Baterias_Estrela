import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function run() {
  const email = process.argv[2] || process.env.ADMIN_EMAIL;
  const password = process.argv[3] || process.env.ADMIN_PASSWORD;
  const name = process.argv[4] || process.env.ADMIN_NAME || 'Administrador';

  if (!email || !password) {
    console.error('Uso: pnpm admin:create <email> <senha> [nome]');
    console.error('Exemplo: pnpm admin:create admin@bateriasestrela.com.br MinhaSenhaForte123 "Gerente Estrela"');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.adminUser.upsert({
    where: { email },
    update: {
      passwordHash,
      name,
      isActive: true,
    },
    create: {
      email,
      passwordHash,
      name,
      role: 'admin',
      isActive: true,
    },
  });

  console.log(`✅ Administrador [${user.email}] configurado com sucesso! (ID: ${user.id})`);
}

run()
  .catch((e) => {
    console.error('Erro ao provisionar administrador:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

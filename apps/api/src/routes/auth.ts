import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../prisma';
import {
  LoginSchema,
  PasswordResetRequestSchema,
  PasswordResetConfirmSchema,
  ChangePasswordSchema,
} from '@baterias-estrela/shared';

export async function authRoutes(app: FastifyInstance) {
  // Login
  app.post('/login', async (request, reply) => {
    const parseResult = LoginSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parseResult.error.flatten(),
      });
    }

    const { email, password } = parseResult.data;

    // Busca usuário pelo e-mail
    const user = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      // Mensagem genérica para segurança contra enumeração de usuários
      return reply.status(401).send({
        error: 'Credenciais inválidas',
        message: 'E-mail ou senha incorretos.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return reply.status(401).send({
        error: 'Credenciais inválidas',
        message: 'E-mail ou senha incorretos.',
      });
    }

    // Atualiza lastLoginAt
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = app.jwt.sign(tokenPayload, { expiresIn: '7d' });

    // Define cookie HttpOnly
    reply.setCookie('admin_token', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 dias
    });

    await app.logAudit('LOGIN', 'AdminUser', user.id, { email: user.email }, request);

    return reply.send({
      message: 'Login realizado com sucesso',
      user: tokenPayload,
      token,
    });
  });

  // Logout
  app.post('/logout', async (request, reply) => {
    reply.clearCookie('admin_token', { path: '/' });
    return reply.send({ message: 'Logout realizado com sucesso' });
  });

  // Me
  app.get('/me', { preHandler: [app.authenticate] }, async (request, reply) => {
    const user = await prisma.adminUser.findUnique({
      where: { id: request.adminUser!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return reply.status(404).send({ error: 'Usuário não encontrado' });
    }

    return reply.send({ user });
  });

  // Alterar senha (autenticado)
  app.post('/change-password', { preHandler: [app.authenticate] }, async (request, reply) => {
    const parseResult = ChangePasswordSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parseResult.error.flatten(),
      });
    }

    const { currentPassword, newPassword } = parseResult.data;
    const user = await prisma.adminUser.findUnique({
      where: { id: request.adminUser!.id },
    });

    if (!user) {
      return reply.status(404).send({ error: 'Usuário não encontrado' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return reply.status(400).send({
        error: 'Senha atual incorreta',
        message: 'A senha atual informada está incorreta.',
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    await app.logAudit('CHANGE_PASSWORD', 'AdminUser', user.id, {}, request);

    return reply.send({ message: 'Senha atualizada com sucesso' });
  });

  // Solicitar recuperação de senha
  app.post('/forgot-password', async (request, reply) => {
    const parseResult = PasswordResetRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: 'E-mail inválido' });
    }

    const { email } = parseResult.data;
    const user = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user && user.isActive) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      await prisma.adminUser.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetExpires,
        },
      });

      console.log(`[AUTH] Token de redefinição para ${user.email}: ${resetToken}`);
    }

    // Resposta genérica sempre para evitar vazamento de existência do e-mail
    return reply.send({
      message: 'Se o endereço de e-mail estiver cadastrado, as instruções para redefinição foram enviadas.',
    });
  });

  // Redefinir senha com token
  app.post('/reset-password', async (request, reply) => {
    const parseResult = PasswordResetConfirmSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parseResult.error.flatten(),
      });
    }

    const { token, newPassword } = parseResult.data;
    const user = await prisma.adminUser.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
        isActive: true,
      },
    });

    if (!user) {
      return reply.status(400).send({
        error: 'Token inválido ou expirado',
        message: 'O link de recuperação expirou ou é inválido. Solicite uma nova recuperação.',
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    await app.logAudit('RESET_PASSWORD', 'AdminUser', user.id, {}, request);

    return reply.send({ message: 'Senha redefinida com sucesso. Faça login com a nova senha.' });
  });
}

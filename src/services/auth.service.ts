import prisma from '../config/prisma';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/authUtils';

// Defining types inline for speed, or better to put in a types file. I'll put them inline for now or use `any` if it gets verbose, but let's try to be clean.
interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

interface LoginInput {
    email: string;
    password: string;
}

export const register = async (data: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) throw new Error('User already exists');

  const hashedPassword = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  });

  return { id: user.id, email: user.email, name: user.name };
};

export const login = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !(await comparePassword(data.password, user.password))) {
    throw new Error('Invalid credentials');
  }

  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken(user.id);

  // Save refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return { accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name } };
};

export const refresh = async (token: string) => {
    // 1. Verify signature
    let payload: any;
    try {
        payload = verifyRefreshToken(token);
    } catch (e) {
        throw new Error('Invalid refresh token');
    }

    // 2. Check DB
    const storedToken = await prisma.refreshToken.findUnique({ where: { token } });
    if (!storedToken || storedToken.revoked) {
        // reuse detection could be implemented here
        throw new Error('Invalid or revoked refresh token');
    }

    // 3. Generate new tokens
    const newAccessToken = generateAccessToken({ userId: payload.userId });
    const newRefreshToken = generateRefreshToken(payload.userId);

    // 4. Revoke old, save new (Rotation)
    await prisma.$transaction([
        prisma.refreshToken.update({ where: { id: storedToken.id }, data: { revoked: true } }),
        prisma.refreshToken.create({
            data: {
                token: newRefreshToken,
                userId: payload.userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            }
        })
    ]);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

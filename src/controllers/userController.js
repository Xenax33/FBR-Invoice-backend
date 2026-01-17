import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/password.js';
import { AppError, catchAsync } from '../utils/errors.js';

const prisma = new PrismaClient();

export const createUser = catchAsync(async (req, res, next) => {
  const {
    name,
    email,
    businessName,
    province,
    address,
    ntncnic,
    password,
    postInvoiceTokenTest,
    validateInvoiceTokenTest,
    postInvoiceToken,
    validateInvoiceToken,
  } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { ntncnic },
      ],
    },
  });

  if (existingUser) {
    throw new AppError('User with this email or NTN/CNIC already exists', 400);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      businessName,
      province,
      address,
      ntncnic,
      role: 'USER',
      password: hashedPassword,
      postInvoiceTokenTest,
      validateInvoiceTokenTest,
      postInvoiceToken,
      validateInvoiceToken,
    },
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  res.status(201).json({
    status: 'success',
    data: {
      user: userWithoutPassword,
    },
  });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search, role, isActive } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Build filter
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { businessName: { contains: search, mode: 'insensitive' } },
      { ntncnic: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  // Get users and total count
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        businessName: true,
        province: true,
        address: true,
        ntncnic: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

export const getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      businessName: true,
      province: true,
      address: true,
      ntncnic: true,
      role: true,
      postInvoiceTokenTest: true,
      validateInvoiceTokenTest: true,
      postInvoiceToken: true,
      validateInvoiceToken: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    email,
    businessName,
    province,
    address,
    ntncnic,
    postInvoiceTokenTest,
    validateInvoiceTokenTest,
    postInvoiceToken,
    validateInvoiceToken,
  } = req.body;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new AppError('User not found', 404);
  }

  // Check if email or ntncnic is being changed and if it's already taken
  if (email || ntncnic) {
    const duplicateUser = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              email ? { email } : {},
              ntncnic ? { ntncnic } : {},
            ],
          },
        ],
      },
    });

    if (duplicateUser) {
      throw new AppError('Email or NTN/CNIC already in use', 400);
    }
  }

  // Update user
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(businessName && { businessName }),
      ...(province && { province }),
      ...(address && { address }),
      ...(ntncnic && { ntncnic }),
      ...(postInvoiceTokenTest !== undefined && { postInvoiceTokenTest }),
      ...(validateInvoiceTokenTest !== undefined && { validateInvoiceTokenTest }),
      ...(postInvoiceToken !== undefined && { postInvoiceToken }),
      ...(validateInvoiceToken !== undefined && { validateInvoiceToken }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      businessName: true,
      province: true,
      address: true,
      ntncnic: true,
      role: true,
      postInvoiceTokenTest: true,
      validateInvoiceTokenTest: true,
      postInvoiceToken: true,
      validateInvoiceToken: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Prevent deleting admin user
  if (user.role === 'ADMIN') {
    throw new AppError('Cannot delete admin user', 403);
  }

  await prisma.user.delete({
    where: { id },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const toggleUserStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Prevent deactivating admin user
  if (user.role === 'ADMIN') {
    throw new AppError('Cannot deactivate admin user', 403);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      isActive: !user.isActive,
    },
    select: {
      id: true,
      name: true,
      email: true,
      businessName: true,
      isActive: true,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

export const updateUserPassword = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { password } = req.body;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const hashedPassword = await hashPassword(password);

  await prisma.user.update({
    where: { id },
    data: {
      password: hashedPassword,
    },
  });

  // Delete all refresh tokens for this user to force re-login
  await prisma.refreshToken.deleteMany({
    where: { userId: id },
  });

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully',
  });
});

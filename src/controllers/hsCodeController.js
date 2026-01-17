import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors.js';

const prisma = new PrismaClient();

/**
 * Create a new HS Code
 * @route POST /api/v1/hs-codes
 */
export const createHsCode = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { hsCode, description } = req.body;

    // Check if HS code already exists for this user
    const existingHsCode = await prisma.hsCode.findFirst({
      where: {
        userId,
        hsCode,
      },
    });

    if (existingHsCode) {
      throw new AppError('HS Code already exists', 400);
    }

    const newHsCode = await prisma.hsCode.create({
      data: {
        userId,
        hsCode,
        description,
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        hsCode: newHsCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all HS codes for the authenticated user
 * @route GET /api/v1/hs-codes
 */
export const getAllHsCodes = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, search } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter conditions
    const where = {
      userId,
      ...(search && {
        OR: [
          { hsCode: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Get HS codes with pagination
    const [hsCodes, total] = await Promise.all([
      prisma.hsCode.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.hsCode.count({ where }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        hsCodes,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific HS code by ID
 * @route GET /api/v1/hs-codes/:id
 */
export const getHsCodeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const hsCode = await prisma.hsCode.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!hsCode) {
      throw new AppError('HS Code not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        hsCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an HS code
 * @route PATCH /api/v1/hs-codes/:id
 */
export const updateHsCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { hsCode, description } = req.body;

    // Check if HS code exists and belongs to user
    const existingHsCode = await prisma.hsCode.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingHsCode) {
      throw new AppError('HS Code not found', 404);
    }

    // If HS code is being updated, check for duplicates
    if (hsCode && hsCode !== existingHsCode.hsCode) {
      const duplicateHsCode = await prisma.hsCode.findFirst({
        where: {
          userId,
          hsCode,
          id: { not: id },
        },
      });

      if (duplicateHsCode) {
        throw new AppError('HS Code already exists', 400);
      }
    }

    const updatedHsCode = await prisma.hsCode.update({
      where: { id },
      data: {
        ...(hsCode && { hsCode }),
        ...(description !== undefined && { description }),
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        hsCode: updatedHsCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an HS code
 * @route DELETE /api/v1/hs-codes/:id
 */
export const deleteHsCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if HS code exists and belongs to user
    const hsCode = await prisma.hsCode.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!hsCode) {
      throw new AppError('HS Code not found', 404);
    }

    // Check if HS code is used in any invoice items
    const invoiceItemCount = await prisma.invoiceItem.count({
      where: { hsCodeId: id },
    });

    if (invoiceItemCount > 0) {
      throw new AppError(
        'Cannot delete HS Code that is used in invoice items',
        400
      );
    }

    await prisma.hsCode.delete({
      where: { id },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

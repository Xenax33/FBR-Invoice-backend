import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors.js';

const prisma = new PrismaClient();

/**
 * Create a new buyer
 * @route POST /api/v1/buyers
 */
export const createBuyer = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { ntncnic, businessName, province, address, registrationType } = req.body;

    // Check if buyer with same NTN/CNIC already exists for this user
    const existingBuyer = await prisma.buyer.findFirst({
      where: {
        userId,
        ntncnic,
      },
    });

    if (existingBuyer) {
      throw new AppError('Buyer with this NTN/CNIC already exists', 400);
    }

    const buyer = await prisma.buyer.create({
      data: {
        userId,
        ntncnic,
        businessName,
        province,
        address,
        registrationType,
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        buyer,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all buyers for the authenticated user
 * @route GET /api/v1/buyers
 */
export const getAllBuyers = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, search, registrationType } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter conditions
    const where = {
      userId,
      ...(registrationType && { registrationType }),
      ...(search && {
        OR: [
          { ntncnic: { contains: search, mode: 'insensitive' } },
          { businessName: { contains: search, mode: 'insensitive' } },
          { province: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Get buyers with pagination
    const [buyers, total] = await Promise.all([
      prisma.buyer.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.buyer.count({ where }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        buyers,
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
 * Get a specific buyer by ID
 * @route GET /api/v1/buyers/:id
 */
export const getBuyerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const buyer = await prisma.buyer.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!buyer) {
      throw new AppError('Buyer not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        buyer,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a buyer
 * @route PATCH /api/v1/buyers/:id
 */
export const updateBuyer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { ntncnic, businessName, province, address, registrationType } = req.body;

    // Check if buyer exists and belongs to user
    const existingBuyer = await prisma.buyer.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingBuyer) {
      throw new AppError('Buyer not found', 404);
    }

    // If NTN/CNIC is being updated, check for duplicates
    if (ntncnic && ntncnic !== existingBuyer.ntncnic) {
      const duplicateBuyer = await prisma.buyer.findFirst({
        where: {
          userId,
          ntncnic,
          id: { not: id },
        },
      });

      if (duplicateBuyer) {
        throw new AppError('Buyer with this NTN/CNIC already exists', 400);
      }
    }

    const buyer = await prisma.buyer.update({
      where: { id },
      data: {
        ...(ntncnic && { ntncnic }),
        ...(businessName && { businessName }),
        ...(province && { province }),
        ...(address && { address }),
        ...(registrationType && { registrationType }),
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        buyer,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a buyer
 * @route DELETE /api/v1/buyers/:id
 */
export const deleteBuyer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if buyer exists and belongs to user
    const buyer = await prisma.buyer.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!buyer) {
      throw new AppError('Buyer not found', 404);
    }

    // Check if buyer is used in any invoices
    const invoiceCount = await prisma.invoice.count({
      where: { buyerId: id },
    });

    if (invoiceCount > 0) {
      throw new AppError(
        'Cannot delete buyer that is used in invoices',
        400
      );
    }

    await prisma.buyer.delete({
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

import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors.js';

const prisma = new PrismaClient();

/**
 * Create a new Scenario
 * @route POST /api/v1/scenarios
 */
export const createScenario = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { scenarioCode, scenarioDescription } = req.body;

    // Check if scenario code already exists for this user
    const existingScenario = await prisma.scenario.findFirst({
      where: {
        userId,
        scenarioCode,
      },
    });

    if (existingScenario) {
      throw new AppError('Scenario with this code already exists', 400);
    }

    const newScenario = await prisma.scenario.create({
      data: {
        userId,
        scenarioCode,
        scenarioDescription,
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        scenario: newScenario,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all scenarios for the authenticated user
 * @route GET /api/v1/scenarios
 */
export const getAllScenarios = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, search } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter conditions
    const where = {
      userId,
      ...(search && {
        OR: [
          { scenarioCode: { contains: search, mode: 'insensitive' } },
          { scenarioDescription: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Get scenarios with pagination
    const [scenarios, total] = await Promise.all([
      prisma.scenario.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.scenario.count({ where }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        scenarios,
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
 * Get assigned scenario options (code + description)
 * @route GET /api/v1/scenarios/list
 */
export const getScenarioOptions = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const scenarios = await prisma.scenario.findMany({
      where: { userId },
      select: { scenarioCode: true, scenarioDescription: true },
      orderBy: { scenarioCode: 'asc' },
    });

    const options = scenarios.map((s) => ({ code: s.scenarioCode, description: s.scenarioDescription }));
    res.status(200).json({ status: 'success', data: { options } });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific scenario by ID
 * @route GET /api/v1/scenarios/:id
 */
export const getScenarioById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const scenario = await prisma.scenario.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!scenario) {
      throw new AppError('Scenario not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        scenario,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a scenario
 * @route PATCH /api/v1/scenarios/:id
 */
export const updateScenario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { scenarioCode, scenarioDescription } = req.body;

    // Check if scenario exists and belongs to user
    const existingScenario = await prisma.scenario.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingScenario) {
      throw new AppError('Scenario not found', 404);
    }

    // If scenario code is being updated, check for duplicates
    if (scenarioCode && scenarioCode !== existingScenario.scenarioCode) {
      const duplicateScenario = await prisma.scenario.findFirst({
        where: {
          userId,
          scenarioCode,
          id: { not: id },
        },
      });

      if (duplicateScenario) {
        throw new AppError('Scenario with this code already exists', 400);
      }
    }

    const updatedScenario = await prisma.scenario.update({
      where: { id },
      data: {
        ...(scenarioCode && { scenarioCode }),
        ...(scenarioDescription !== undefined && { scenarioDescription }),
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        scenario: updatedScenario,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a scenario
 * @route DELETE /api/v1/scenarios/:id
 */
export const deleteScenario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if scenario exists and belongs to user
    const scenario = await prisma.scenario.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!scenario) {
      throw new AppError('Scenario not found', 404);
    }

    // Check if scenario is used in any invoices
    const invoiceCount = await prisma.invoice.count({
      where: { scenarioId: id },
    });

    if (invoiceCount > 0) {
      throw new AppError(
        'Cannot delete scenario that is used in invoices',
        400
      );
    }

    await prisma.scenario.delete({
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

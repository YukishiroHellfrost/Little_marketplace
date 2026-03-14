const MovementService = require('../services/MovementService');

class MovementController {
  async getMovements(req, res, next) {
    try {
      const result = await MovementService.getMovements(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getMovementById(req, res, next) {
    try {
      const movement = await MovementService.getMovementById(req.params.id);
      res.json({ success: true, data: movement });
    } catch (error) {
      next(error);
    }
  }

  async createMovement(req, res, next) {
    try {
      const movement = await MovementService.createMovement(req.body);
      res.status(201).json({ success: true, data: movement });
    } catch (error) {
      next(error);
    }
  }

  async updateMovement(req, res, next) {
    try {
      const movement = await MovementService.updateMovement(req.params.id, req.body);
      res.json({ success: true, data: movement });
    } catch (error) {
      next(error);
    }
  }

  async deleteMovement(req, res, next) {
    try {
      const result = await MovementService.deleteMovement(req.params.id);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MovementController();
const StoreService = require('../services/StoreService');

class StoreController {
  async getStores(req, res, next) {
    try {
      const result = await StoreService.getStores(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getStoreById(req, res, next) {
    try {
      const store = await StoreService.getStoreById(req.params.id);
      res.json({ success: true, data: store });
    } catch (error) {
      next(error);
    }
  }

  async createStore(req, res, next) {
    try {
      const store = await StoreService.createStore(req.body);
      res.status(201).json({ success: true, data: store });
    } catch (error) {
      next(error);
    }
  }

  async updateStore(req, res, next) {
    try {
      const store = await StoreService.updateStore(req.params.id, req.body);
      res.json({ success: true, data: store });
    } catch (error) {
      next(error);
    }
  }

  async deleteStore(req, res, next) {
    try {
      const result = await StoreService.DeleteStore(req.params.id);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StoreController();
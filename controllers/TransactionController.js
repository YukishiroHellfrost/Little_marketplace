const TransactionService = require('../services/TransactionService');

class TransactionController {
  async getTransactions(req, res, next) {
    try {
      const result = await TransactionService.getTransactions(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionById(req, res, next) {
    try {
      const transaction = await TransactionService.getTransactionById(req.params.id);
      res.json({ success: true, data: transaction });
    } catch (error) {
      next(error);
    }
  }

  async createTransaction(req, res, next) {
    try {
      const transaction = await TransactionService.createTransaction(req.body);
      res.status(201).json({ success: true, data: transaction });
    } catch (error) {
      next(error);
    }
  }

  async updateTransaction(req, res, next) {
    try {
      const transaction = await TransactionService.updateTransaction(req.params.id, req.body);
      res.json({ success: true, data: transaction });
    } catch (error) {
      next(error);
    }
  }

  async deleteTransaction(req, res, next) {
    try {
      const result = await TransactionService.deleteTransaction(req.params.id);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TransactionController();
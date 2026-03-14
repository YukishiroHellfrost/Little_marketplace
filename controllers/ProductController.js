const ProductService = require('../services/ProductService');

class ProductController {
  async getProducts(req, res, next) {
    try {
      const result = await ProductService.getProducts(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req, res, next) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req, res, next) {
    try {
      const product = await ProductService.createProduct(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.body);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async DeleteProduct(req, res, next) {
    try {
      const result = await ProductService.DeleteProduct(req.params.id);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
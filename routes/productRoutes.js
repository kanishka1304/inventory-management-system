const express = require('express');
const Product = require('../models/Product');
const StockHistory = require('../models/StockHistory');

const router = express.Router();

// Middleware
const isAuthenticated = (req, res, next) => {
  // if (req.session.userId) {
    return next();
  // }
  // res.redirect('/login');
};

// Dashboard
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const products = await Product.find();
    const totalProducts = products.length;
    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
    const lowStock = products.filter(p => p.quantity < 5);
    res.render('dashboard', { totalProducts, totalQuantity, lowStock, message: req.flash('success') });
  } catch (err) {
    res.status(500).send('Error loading dashboard');
  }
});

// Add Product Page
router.get('/add', isAuthenticated, (req, res) => {
  res.render('addProduct', { message: req.flash('error') });
});

// Add Product
router.post('/add', isAuthenticated, async (req, res) => {
  const { name, price, quantity, category } = req.body;
  try {
    const product = new Product({ name, price: parseFloat(price), quantity: parseInt(quantity), category });
    await product.save();
    req.flash('success', 'Product added successfully');
    res.redirect('/products/dashboard');
  } catch (err) {
    req.flash('error', 'Error adding product');
    res.redirect('/products/add');
  }
});

// Product List
router.get('/list', isAuthenticated, async (req, res) => {
  try {
    let products = await Product.find();
    const search = req.query.search;
    const category = req.query.category;
    if (search) {
      products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (category) {
      products = products.filter(p => p.category === category);
    }
    const categories = [...new Set(products.map(p => p.category))];
    res.render('productList', { products, message: req.flash('success'), categories });
  } catch (err) {
    res.status(500).send('Error loading products');
  }
});

// Update Product Page
router.get('/update/:id', isAuthenticated, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.render('updateProduct', { product, message: req.flash('error') });
  } catch (err) {
    res.status(500).send('Error loading product');
  }
});

// Update Product
router.put('/update/:id', isAuthenticated, async (req, res) => {
  const { name, price, quantity, category } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    const oldQuantity = product.quantity;
    product.name = name;
    product.price = parseFloat(price);
    product.quantity = parseInt(quantity);
    product.category = category;
    await product.save();
    // Track stock change
    if (oldQuantity !== product.quantity) {
      const history = new StockHistory({
        productName: product.name,
        oldQuantity,
        newQuantity: product.quantity
      });
      await history.save();
    }
    req.flash('success', 'Product updated successfully');
    res.redirect('/products/list');
  } catch (err) {
    req.flash('error', 'Error updating product');
    res.redirect('/products/update/' + req.params.id);
  }
});

// Delete Product
router.delete('/delete/:id', isAuthenticated, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    req.flash('success', 'Product deleted successfully');
    res.redirect('/products/list');
  } catch (err) {
    req.flash('error', 'Error deleting product');
    res.redirect('/products/list');
  }
});

// Analytics
router.get('/analytics', isAuthenticated, async (req, res) => {
  try {
    const products = await Product.find();
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const categories = {};
    products.forEach(p => {
      if (!categories[p.category]) categories[p.category] = 0;
      categories[p.category] += p.quantity;
    });
    const mostStocked = products.reduce((max, p) => p.quantity > max.quantity ? p : max, products[0] || {});
    const lowStockCount = products.filter(p => p.quantity < 5).length;
    res.render('analytics', { totalValue, categories, mostStocked, lowStockCount });
  } catch (err) {
    res.status(500).send('Error loading analytics');
  }
});

// Stock History
router.get('/history', isAuthenticated, async (req, res) => {
  try {
    const history = await StockHistory.find().sort({ date: -1 });
    res.render('history', { history });
  } catch (err) {
    res.status(500).send('Error loading history');
  }
});

module.exports = router;
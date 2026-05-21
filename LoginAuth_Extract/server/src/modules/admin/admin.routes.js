const AdminController = require('./admin.controller');
const router = require('express').Router();
const { requireAuth, requireAdmin } = require('../../middleware/auth.middleware');

// Apply auth & admin middleware to all routes
router.use(requireAuth, requireAdmin);

// Dashboard
router.get('/stats', AdminController.getStats);

// Orders
router.get('/orders', AdminController.getOrders);
router.get('/orders/:id', AdminController.getOrderById);
router.patch('/orders/:id/status', AdminController.updateOrderStatus);

// Products
router.get('/products', AdminController.getProducts);
router.get('/products/:id', AdminController.getProductById);
router.post('/products', AdminController.createProduct);
router.put('/products/:id', AdminController.updateProduct);
router.delete('/products/:id', AdminController.deleteProduct);

// Users
router.get('/users', AdminController.getUsers);
router.get('/users/:id', AdminController.getUserById);
router.put('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);
router.post('/users', AdminController.createUser);

// Categories
router.get('/categories', AdminController.getCategories);
router.post('/categories', AdminController.createCategory);
router.put('/categories/:id', AdminController.updateCategory);
router.delete('/categories/:id', AdminController.deleteCategory);

module.exports = router;

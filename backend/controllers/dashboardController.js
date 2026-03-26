const Order = require('../models/Order');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get dashboard stats for owner
// @route   GET /api/dashboard/owner
// @access  Private (Owner)
exports.getOwnerDashboard = async (req, res) => {
  try {
    // Date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisYear = new Date(today.getFullYear(), 0, 1);

    // Today's stats (sales + paid orders)
    const todaySales = await Sale.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);
    const todayOrderSales = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);

    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // Monthly stats (sales + paid orders)
    const monthlySales = await Sale.aggregate([
      { $match: { createdAt: { $gte: thisMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);
    const monthlyOrderSales = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: thisMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);

    const monthlyOrders = await Order.countDocuments({
      createdAt: { $gte: thisMonth }
    });

    // Yearly stats (sales + paid orders)
    const yearlySales = await Sale.aggregate([
      { $match: { createdAt: { $gte: thisYear } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);
    const yearlyOrderSales = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: thisYear } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);

    // Product stats
    const totalProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.countDocuments({
      $expr: { $lte: ['$stock', '$minStock'] },
      isActive: true
    });

    // User stats
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Pending orders
    const pendingOrders = await Order.countDocuments({
      orderStatus: { $in: ['pending', 'confirmed', 'processing'] }
    });

    // Credit sales
    const creditSales = await Sale.aggregate([
      { $match: { paymentStatus: { $in: ['credit', 'partial'] } } },
      { $group: { _id: null, total: { $sum: '$creditAmount' } } }
    ]);

    // Sales trend (paid orders)
    const range = req.query.range || 'last_12_months';
    let trendStart = new Date(today.getFullYear() - 1, today.getMonth(), 1);
    let trendEnd = null;
    let trendFormat = '%Y-%m';

    if (range === 'last_7_days') {
      trendStart = new Date(today);
      trendStart.setDate(trendStart.getDate() - 6);
      trendFormat = '%Y-%m-%d';
    } else if (range === 'last_30_days') {
      trendStart = new Date(today);
      trendStart.setDate(trendStart.getDate() - 29);
      trendFormat = '%Y-%m-%d';
    } else if (range === 'previous_month') {
      trendStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      trendEnd = new Date(today.getFullYear(), today.getMonth(), 1);
      trendFormat = '%Y-%m-%d';
    }

    const trendMatch = {
      paymentStatus: 'paid',
      createdAt: trendEnd ? { $gte: trendStart, $lt: trendEnd } : { $gte: trendStart }
    };

    const salesTrend = await Order.aggregate([
      { $match: trendMatch },
      {
        $group: {
          _id: { $dateToString: { format: trendFormat, date: '$createdAt' } },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Sales by category (based on paid orders)
    const categorySales = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          total: { $sum: '$items.total' },
          quantity: { $sum: '$items.quantity' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Top selling products
    const topProducts = await Sale.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .sort('-createdAt')
      .limit(5)
      .populate('user', 'name')
      .select('orderNumber totalAmount orderStatus createdAt');

    // Recent sales
    const recentSales = await Sale.find()
      .sort('-createdAt')
      .limit(5)
      .populate('billedBy', 'name')
      .select('billNumber customer.name totalAmount createdAt');

    res.status(200).json({
      success: true,
      data: {
        today: {
          sales: (todaySales[0]?.total || 0) + (todayOrderSales[0]?.total || 0),
          salesCount: (todaySales[0]?.count || 0) + (todayOrderSales[0]?.count || 0),
          orders: todayOrders
        },
        monthly: {
          sales: (monthlySales[0]?.total || 0) + (monthlyOrderSales[0]?.total || 0),
          salesCount: (monthlySales[0]?.count || 0) + (monthlyOrderSales[0]?.count || 0),
          orders: monthlyOrders
        },
        yearly: {
          sales: (yearlySales[0]?.total || 0) + (yearlyOrderSales[0]?.total || 0),
          salesCount: (yearlySales[0]?.count || 0) + (yearlyOrderSales[0]?.count || 0)
        },
        products: {
          total: totalProducts,
          lowStock: lowStockProducts
        },
        users: {
          total: totalUsers,
          byRole: usersByRole
        },
        orders: {
          pending: pendingOrders
        },
        credit: {
          total: creditSales[0]?.total || 0
        },
        charts: {
          salesTrend,
          categorySales
        },
        topProducts,
        recentOrders,
        recentSales
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get dashboard stats for manager
// @route   GET /api/dashboard/manager
// @access  Private (Manager, Owner)
exports.getManagerDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's stats
    const todaySales = await Sale.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);

    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // Pending orders
    const pendingOrders = await Order.find({
      orderStatus: { $in: ['pending', 'confirmed'] }
    })
      .sort('-createdAt')
      .limit(10)
      .populate('user', 'name phone');

    // Low stock products
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stock', '$minStock'] },
      isActive: true
    })
      .sort('stock')
      .limit(10)
      .select('name stock minStock category');

    // Recent sales by this manager
    const mySales = await Sale.find({ billedBy: req.user.id })
      .sort('-createdAt')
      .limit(10)
      .select('billNumber customer.name totalAmount createdAt');

    res.status(200).json({
      success: true,
      data: {
        today: {
          sales: todaySales[0]?.total || 0,
          salesCount: todaySales[0]?.count || 0,
          orders: todayOrders
        },
        pendingOrders,
        lowStockProducts,
        mySales
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

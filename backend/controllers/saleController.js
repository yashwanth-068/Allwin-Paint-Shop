const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Create counter sale
// @route   POST /api/sales
// @access  Private (Manager, Owner)
exports.createSale = async (req, res) => {
  try {
    const { customer, items, paymentMethod, discount, amountPaid, notes } = req.body;

    // Validate and calculate totals
    let subtotal = 0;
    let gstTotal = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      const itemPrice = product.price - (product.price * product.discount / 100);
      const itemGst = itemPrice * product.gst / 100;
      const itemTotal = (itemPrice + itemGst) * item.quantity;

      saleItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: itemPrice,
        gst: itemGst * item.quantity,
        total: itemTotal
      });

      subtotal += itemPrice * item.quantity;
      gstTotal += itemGst * item.quantity;

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    const totalAmount = subtotal + gstTotal - (discount || 0);
    const creditAmount = totalAmount - (amountPaid || totalAmount);
    
    let paymentStatus = 'paid';
    if (creditAmount > 0) {
      paymentStatus = amountPaid > 0 ? 'partial' : 'credit';
    }

    const sale = await Sale.create({
      saleType: 'counter',
      customer,
      items: saleItems,
      subtotal,
      gstTotal,
      discount: discount || 0,
      totalAmount,
      paymentMethod,
      paymentStatus,
      amountPaid: amountPaid || totalAmount,
      creditAmount,
      billedBy: req.user.id,
      notes
    });

    await sale.populate('billedBy', 'name');

    res.status(201).json({
      success: true,
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Convert order to sale
// @route   POST /api/sales/from-order/:orderId
// @access  Private (Manager, Owner)
exports.createSaleFromOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('user', 'name phone email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order payment not completed'
      });
    }

    // Check if sale already exists for this order
    const existingSale = await Sale.findOne({ order: order._id });
    if (existingSale) {
      return res.status(400).json({
        success: false,
        message: 'Sale already created for this order'
      });
    }

    const sale = await Sale.create({
      saleType: 'online',
      order: order._id,
      customer: {
        name: order.shippingAddress.name,
        phone: order.shippingAddress.phone,
        email: order.user.email,
        address: `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`
      },
      items: order.items,
      subtotal: order.subtotal,
      gstTotal: order.gstTotal,
      discount: order.discount,
      totalAmount: order.totalAmount,
      paymentMethod: 'online',
      paymentStatus: 'paid',
      amountPaid: order.totalAmount,
      billedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private (Manager, Owner)
exports.getSales = async (req, res) => {
  try {
    let query = {};

    // Filter by sale type
    if (req.query.saleType) {
      query.saleType = req.query.saleType;
    }

    // Filter by payment status
    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
    }

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Today's sales
    if (req.query.today === 'true') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.createdAt = { $gte: today, $lt: tomorrow };
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const total = await Sale.countDocuments(query);
    const sales = await Sale.find(query)
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit)
      .populate('billedBy', 'name')
      .populate('items.product', 'name');

    // Calculate totals
    const allSales = await Sale.find(query);
    const totalSalesAmount = allSales.reduce((acc, sale) => acc + sale.totalAmount, 0);
    const totalCredit = allSales.reduce((acc, sale) => acc + sale.creditAmount, 0);

    res.status(200).json({
      success: true,
      count: sales.length,
      total,
      summary: {
        totalSalesAmount,
        totalCredit,
        salesCount: total
      },
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: sales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Private (Manager, Owner)
exports.getSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('billedBy', 'name')
      .populate('items.product', 'name images')
      .populate('order');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    res.status(200).json({
      success: true,
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update credit payment
// @route   PUT /api/sales/:id/payment
// @access  Private (Manager, Owner)
exports.updatePayment = async (req, res) => {
  try {
    const { amount } = req.body;

    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    if (sale.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Sale is already fully paid'
      });
    }

    if (amount > sale.creditAmount) {
      return res.status(400).json({
        success: false,
        message: `Amount exceeds credit balance of ₹${sale.creditAmount}`
      });
    }

    sale.amountPaid += amount;
    sale.creditAmount -= amount;
    
    if (sale.creditAmount <= 0) {
      sale.paymentStatus = 'paid';
      sale.creditAmount = 0;
    }

    await sale.save();

    res.status(200).json({
      success: true,
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get sales report
// @route   GET /api/sales/report
// @access  Private (Owner)
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;

    const matchStage = {};
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let groupId;
    switch (groupBy) {
      case 'day':
        groupId = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        break;
      case 'month':
        groupId = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        break;
      case 'year':
        groupId = { $dateToString: { format: '%Y', date: '$createdAt' } };
        break;
      default:
        groupId = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    }

    const report = await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupId,
          totalSales: { $sum: '$totalAmount' },
          totalGST: { $sum: '$gstTotal' },
          totalDiscount: { $sum: '$discount' },
          salesCount: { $sum: 1 },
          cashSales: {
            $sum: { $cond: [{ $eq: ['$paymentMethod', 'cash'] }, '$totalAmount', 0] }
          },
          onlineSales: {
            $sum: { $cond: [{ $eq: ['$paymentMethod', 'online'] }, '$totalAmount', 0] }
          },
          creditSales: {
            $sum: '$creditAmount'
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Category wise sales
    const categoryReport = await Sale.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          totalSales: { $sum: '$items.total' },
          quantity: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        salesReport: report,
        categoryReport
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

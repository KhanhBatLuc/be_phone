import express from "express";
import asyncHandler from "express-async-handler";
import { admin, protect } from "../Middleware/AuthMiddleware.js";
import Order from "./../Models/OrderModel.js";
import User from "../Models/UserModel.js";
import Product from "../Models/ProductModel.js";

const orderRouter = express.Router();

// CREATE ORDER
orderRouter.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      typePay,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error("No order items");
    }

    const updateProductQuantities = orderItems.map(async (element) => {
      const product = await Product.findOne({name: element.name});
      if (product) {
        product.countInStock = element.countInStock - element.qty;
        await product.save();
      }
    });

    await Promise.all(updateProductQuantities);


    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      typePay,
    });

    const createOrder = await order.save();

    res.status(201).json(createOrder);
  })
);

// ADMIN GET ALL ORDERS
orderRouter.get(
  "/all",
  asyncHandler(async (req, res) => {
    const orders = await Order.find({})
      .sort({ _id: -1 })
      .populate("user", "id name email");
    res.json(orders);
  })
);
// USER LOGIN ORDERS
orderRouter.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.find({ user: req.user._id }).sort({ _id: -1 });
    res.json(order);
  })
);

// GET ORDER BY ID
orderRouter.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (order) {
      res.json(order);
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  })
);

// ORDER IS PAID
orderRouter.put(
  "/:id/pay",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  })
);

// ORDER IS PAID
orderRouter.put(
  "/:id/delivered",
  protect,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.status = status;

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  })
);

// GET ORDER BY ID
orderRouter.get(
  "/search/:search",
  asyncHandler(async (req, res) => {
    const search = req.params.search;
    // const docs = await Order.find({ email: { $regex: 'gmail' } });

    // const data = await Order.find({
    //   "user.name": { $regex: search },
    // });

    // console.log(data);

    User.find({ name: { $regex: search } })
      .exec()
      .then((docs) => {
        let ids = docs.map((doc) => doc.id);
        Order.find({
          user: { $in: ids },
        })
          .populate({
            path: "user",
          })
          .exec()
          .then((docs) => {
            res.status(200).json({
              docs,
            });
          })
          .catch((err) => {
            res.status(500).json({
              error: err,
            });
          });
      });
  })
);

orderRouter.get(
  "/status/:status",
  asyncHandler(async (req, res) => {
    const status = req.params.status;
    if (status === "choxuli") {
      const order = await Order.find({
        status: null,
      }).populate("user", "name email");

      if (order) {
        res.json(order);
      } else {
        res.status(404);
        throw new Error("Order Not Found");
      }
    } else if (status == "default") {
      const order = await Order.find({}).populate("user", "name email");

      if (order) {
        res.json(order);
      } else {
        res.status(404);
        throw new Error("Order Not Found");
      }
    } else {
      const order = await Order.find({
        status: status,
      }).populate("user", "name email");

      if (order) {
        res.json(order);
      } else {
        res.status(404);
        throw new Error("Order Not Found");
      }
    }
  })
);

orderRouter.get(
  "/option/:option",
  asyncHandler(async (req, res) => {
    const status = req.params.option;
    if (status == "default") {
      const order = await Order.find({}).populate("user", "name email");

      if (order) {
        res.json(order);
      } else {
        res.status(404);
        throw new Error("Order Not Found");
      }
    } else {
      const order = await Order.find({
        typePay: status,
      }).populate("user", "name email");

      if (order) {
        res.json(order);
      } else {
        res.status(404);
        throw new Error("Order Not Found");
      }
    }
  })
);

orderRouter.get(
  "/combine/:status/:option",
  asyncHandler(async (req, res) => {
    const status = req.params.status;
    const option = req.params.option;

    if (status == "choxuli") {
      const order = await Order.find({
        status: null,
        typePay: option,
      }).populate("user", "name email");

      if (order) {
        res.json(order);
      } else {
        res.status(404);
        throw new Error("Order Not Found");
      }
    } else {
      const order = await Order.find({
        status: status,
        typePay: option,
      }).populate("user", "name email");

      if (order) {
        res.json(order);
      } else {
        res.status(404);
        throw new Error("Order Not Found");
      }
    }
  })
);


orderRouter.get(
  "/filter/:startDate/:endDate",
  asyncHandler(async (req, res) => {
    const startOfYear = new Date(req.params.startDate);
    const endOfYear = new Date(req.params.endDate);

    Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfYear,
            $lt: endOfYear
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          count: { $sum: 1 },
          totalPrice: { $sum: "$totalPrice" }
        }
      },
      {
        $sort: { "_id.month": 1 }
      }
    ])
    .exec((err, result) => {
      if (err) throw err;
    
      res.json(result);
    });
  })
);

export default orderRouter;

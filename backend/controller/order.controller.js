import orderModel from "../model/order.model.js";
import userModel from "../model/user.model.js"
import foodModel from "../model/product.model.js"
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//config variables
const currency = "inr";
const deliveryCharge = 50;
const frontend_URL = 'http://localhost:5173';

// Placing User Order for Frontend using stripe
const placeOrder = async (req, res) => {

    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
        })
        await newOrder.save();
            // Update stock for each ordered item
            for (const item of req.body.items) {
                await foodModel.findByIdAndUpdate(
                    item._id, 
                    { $inc: { stock: -item.quantity } }
                );
            }

        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
        const user = await userModel.findById(req.body.userId);
        await userModel.findByIdAndUpdate(req.body.userId, { 
            points: user.points + (req.body.amount * 2) / 100 
        });

        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100 
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: "Delivery Charge"
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${frontend_URL}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_URL}/verify?success=false&orderId=${newOrder._id}`,
            line_items: line_items,
            mode: 'payment',
        });

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// Placing User Order for Frontend using stripe
const placeOrderCod = async (req, res) => {

    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            payment: true,
        })
        await newOrder.save();

            // Update stock for each ordered item
            for (const item of req.body.items) {
                await foodModel.findByIdAndUpdate(
                    item._id, 
                    { $inc: { stock: -item.quantity } }
                );
            }

        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
        const user = await userModel.findById(req.body.userId);
        await userModel.findByIdAndUpdate(req.body.userId, { 
            points: user.points + (req.body.amount * 2) / 100 
        });

        res.json({ success: true, message: "Order Placed" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// Listing Order for Admin panel
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// User Orders for Frontend
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

const updateStatus = async (req, res) => {
    console.log(req.body);
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status Updated" })
    } catch (error) {
        res.json({ success: false, message: "Error" })
    }

}

const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Paid" })
        }
        else {
            await orderModel.findByIdAndDelete(orderId)
            res.json({ success: false, message: "Not Paid" })
        }
    } catch (error) {
        res.json({ success: false, message: "Not  Verified" })
    }

}

// Add this helper function in order.controller.js
// const checkStock = async (items) => {
//     for (const item of items) {
//         const product = await foodModel.findById(item._id);
//         if (!product || product.stock < item.quantity) {
//             return {
//                 success: false,
//                 message: `Not enough stock for ${product ? product.name : 'item'}`,
//                 itemId: item._id
//             };
//         }
//     }
//     return { success: true };
// }

export { placeOrder, listOrders, userOrders, updateStatus, verifyOrder, placeOrderCod }
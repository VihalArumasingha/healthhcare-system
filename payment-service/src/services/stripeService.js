const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (amount) => {
    return await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: "usd",
        payment_method_types: ["card"],
    });
};
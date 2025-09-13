"use strict";
// @ts-ignore
const stripe = require("stripe")(process.env.STRIPE_KEY);
const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async create(ctx) {
    try {
      console.log("Body recibido:", ctx.request.body);

      // 🔥 Fallback: admite tanto { data: { products } } como { products }
      const products =
        ctx.request.body?.data?.products || ctx.request.body?.products;

      if (!products || !Array.isArray(products) || products.length === 0) {
        return ctx.badRequest("No products provided 🚨");
      }

      // Crear line items
      const lineItems = products.map((product) => ({
        price_data: {
          currency: "eur",
          product_data: { name: product.productName },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: 1,
      }));

      // Crear sesión de Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        shipping_address_collection: { allowed_countries: ["ES"] },
        success_url: `${process.env.CLIENT_URL}/success`,
        cancel_url: `${process.env.CLIENT_URL}/cancel`,
        line_items: lineItems,
      });

      // Guardar orden en Strapi
      await strapi.service("api::order.order").create({
        data: { products, stripeId: session.id },
      });

      return { stripeSession: session };
    } catch (error) {
      console.error("Stripe Checkout Error:", error);
      ctx.response.status = 500;
      return { error: error.message };
    }
  },
}));
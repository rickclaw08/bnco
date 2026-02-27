/**
 * ClawOps Stripe Webhook Handler
 * Firebase Cloud Function that listens for Stripe events and updates
 * Firestore user profiles with the correct plan and scan limits.
 *
 * Events handled:
 * - checkout.session.completed: New subscription purchased
 * - customer.subscription.updated: Plan changed (upgrade/downgrade)
 * - customer.subscription.deleted: Subscription cancelled
 * - invoice.payment_failed: Payment failed
 */

const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const Stripe = require("stripe");

admin.initializeApp();
const db = admin.firestore();

// Plan mapping: Stripe Price ID -> plan details
const PRICE_TO_PLAN = {
  // Shield Starter $5.99/mo (prod_U2pgenBs3usTit)
  "price_1T4k0oGVy0YtRkxZtrkiM4V7": { plan: "starter", scansLimit: 10 },
  // Shield Pro $9.99/mo (prod_U2pgjhOG69Q008)
  "price_1T4k1WGVy0YtRkxZamlhOo7D": { plan: "pro", scansLimit: 999999 },
  // Shield Enterprise $14.99/mo (prod_U2phMG8ZZvagC3)
  "price_1T4k2EGVy0YtRkxZTHwrp0PE": { plan: "enterprise", scansLimit: 999999 }
};

// Fallback: map by dollar amount (cents)
const AMOUNT_TO_PLAN = {
  599: { plan: "starter", scansLimit: 10 },
  999: { plan: "pro", scansLimit: 999999 },
  1499: { plan: "enterprise", scansLimit: 999999 }
};

exports.stripeWebhook = onRequest(
  {
    region: "us-east1",
    cors: false,
    // Raw body needed for Stripe signature verification
    rawBody: true
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecret || !webhookSecret) {
      console.error("Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET env vars");
      res.status(500).send("Server misconfigured");
      return;
    }

    const stripe = new Stripe(stripeSecret);

    // Verify webhook signature
    let event;
    try {
      const sig = req.headers["stripe-signature"];
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      res.status(400).send("Invalid signature");
      return;
    }

    console.log("Stripe event received:", event.type, event.id);

    try {
      switch (event.type) {
        case "checkout.session.completed":
          await handleCheckoutComplete(stripe, event.data.object);
          break;

        case "customer.subscription.updated":
          await handleSubscriptionUpdated(stripe, event.data.object);
          break;

        case "customer.subscription.deleted":
          await handleSubscriptionDeleted(stripe, event.data.object);
          break;

        case "invoice.payment_failed":
          await handlePaymentFailed(stripe, event.data.object);
          break;

        default:
          console.log("Unhandled event type:", event.type);
      }

      res.status(200).json({ received: true });
    } catch (err) {
      console.error("Error processing webhook:", err);
      res.status(500).send("Webhook processing error");
    }
  }
);

/**
 * checkout.session.completed
 * Customer just purchased a subscription via payment link.
 * Link their Stripe customer to their Firebase user and set the plan.
 */
async function handleCheckoutComplete(stripe, session) {
  console.log("Checkout completed:", session.id);

  // Get customer email from session
  const customerEmail = session.customer_email || session.customer_details?.email;
  if (!customerEmail) {
    console.error("No customer email in checkout session:", session.id);
    return;
  }

  // Get subscription details
  const subscriptionId = session.subscription;
  if (!subscriptionId) {
    console.log("No subscription in session (one-time payment), skipping plan update");
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price?.id;
  const unitAmount = subscription.items.data[0]?.price?.unit_amount;
  const customerId = session.customer;

  // Resolve plan from price ID first, then fall back to amount
  const planInfo = PRICE_TO_PLAN[priceId] || AMOUNT_TO_PLAN[unitAmount] || { plan: "starter", scansLimit: 10 };

  console.log(`Customer ${customerEmail} purchased ${planInfo.plan} (amount: ${unitAmount}, price: ${priceId})`);

  // Find Firebase user by email
  const usersQuery = await db.collection("users")
    .where("email", "==", customerEmail.toLowerCase())
    .limit(1)
    .get();

  if (usersQuery.empty) {
    // User hasn't signed up yet. Create a pending record.
    // When they sign up with this email, ensureUserProfile will merge.
    console.log("No Firebase user found for", customerEmail, "- creating pending subscription record");
    await db.collection("pending_subscriptions").doc(customerEmail.toLowerCase()).set({
      email: customerEmail.toLowerCase(),
      plan: planInfo.plan,
      scansLimit: planInfo.scansLimit,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return;
  }

  // Update the user's Firestore profile
  const userDoc = usersQuery.docs[0];
  await userDoc.ref.update({
    plan: planInfo.plan,
    scansLimit: planInfo.scansLimit,
    scansUsed: 0, // Reset scan count on new subscription
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    stripePriceId: priceId,
    subscriptionStatus: "active",
    subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log(`Updated user ${userDoc.id} to plan: ${planInfo.plan}`);
}

/**
 * customer.subscription.updated
 * Handles upgrades, downgrades, or renewal changes.
 */
async function handleSubscriptionUpdated(stripe, subscription) {
  console.log("Subscription updated:", subscription.id, "status:", subscription.status);

  const customerId = subscription.customer;
  const unitAmount = subscription.items.data[0]?.price?.unit_amount;
  const priceId = subscription.items.data[0]?.price?.id;
  const planInfo = AMOUNT_TO_PLAN[unitAmount] || { plan: "starter", scansLimit: 10 };

  // Find user by stripeCustomerId
  const usersQuery = await db.collection("users")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();

  if (usersQuery.empty) {
    console.log("No user found for Stripe customer:", customerId);
    return;
  }

  const userDoc = usersQuery.docs[0];
  const updateData = {
    stripePriceId: priceId,
    subscriptionStatus: subscription.status,
    subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  // Only change plan if subscription is active
  if (subscription.status === "active") {
    updateData.plan = planInfo.plan;
    updateData.scansLimit = planInfo.scansLimit;
  }

  // If subscription was cancelled but still in billing period
  if (subscription.cancel_at_period_end) {
    updateData.subscriptionEndsAt = new Date(subscription.current_period_end * 1000);
    updateData.subscriptionStatus = "cancelling";
  }

  await userDoc.ref.update(updateData);
  console.log(`Updated user ${userDoc.id}: plan=${updateData.plan || "(unchanged)"}, status=${updateData.subscriptionStatus}`);
}

/**
 * customer.subscription.deleted
 * Subscription fully cancelled (past the grace period).
 * Downgrade to free plan.
 */
async function handleSubscriptionDeleted(stripe, subscription) {
  console.log("Subscription deleted:", subscription.id);

  const customerId = subscription.customer;

  const usersQuery = await db.collection("users")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();

  if (usersQuery.empty) {
    console.log("No user found for Stripe customer:", customerId);
    return;
  }

  const userDoc = usersQuery.docs[0];
  await userDoc.ref.update({
    plan: "free",
    scansLimit: 1,
    subscriptionStatus: "cancelled",
    stripeSubscriptionId: null,
    stripePriceId: null,
    subscriptionEndsAt: null,
    subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log(`Downgraded user ${userDoc.id} to free plan`);
}

/**
 * invoice.payment_failed
 * Mark the subscription as past_due. User keeps access until Stripe
 * exhausts retries and fires subscription.deleted.
 */
async function handlePaymentFailed(stripe, invoice) {
  console.log("Payment failed for invoice:", invoice.id);

  const customerId = invoice.customer;

  const usersQuery = await db.collection("users")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();

  if (usersQuery.empty) {
    console.log("No user found for Stripe customer:", customerId);
    return;
  }

  const userDoc = usersQuery.docs[0];
  await userDoc.ref.update({
    subscriptionStatus: "past_due",
    subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log(`Marked user ${userDoc.id} as past_due`);
}

import {
  buildTrackingSteps,
  formatOrderDateShort,
  getOrderById,
  resolveOrderStatus,
  statusHeadline,
  StoredOrder,
  trackingId,
} from "@/lib/orders";
import { formatPrice } from "@/lib/products";

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  at: string;
}

export interface ChatOpenContext {
  orderId?: string;
  topic?: string;
}

const QUICK_REPLIES_GENERAL = [
  "Track my order",
  "Return or refund",
  "Delivery & PIN code",
  "Payment issue",
  "Talk to support",
];

const QUICK_REPLIES_ORDER = [
  "Where is my package?",
  "Return this order",
  "Wrong or damaged item",
  "Update delivery address",
  "Talk to support",
];

export function defaultQuickReplies(orderId?: string): string[] {
  return orderId ? QUICK_REPLIES_ORDER : QUICK_REPLIES_GENERAL;
}

function greeting(orderId?: string): string {
  if (orderId) {
    return `Hi! I'm MedLive Assist. I can help with order **${orderId}** — tracking, returns, refunds, or delivery questions. What do you need?`;
  }
  return "Hi! I'm **MedLive Assist**. Ask me about orders, delivery, returns, payments, or products. How can I help today?";
}

export function initialMessages(context?: ChatOpenContext): ChatMessage[] {
  const now = new Date().toISOString();
  const msgs: ChatMessage[] = [
    {
      id: "welcome",
      role: "bot",
      text: greeting(context?.orderId),
      at: now,
    },
  ];

  if (context?.topic) {
    msgs.push({
      id: "topic-prompt",
      role: "bot",
      text: getBotReply(context.topic, context),
      at: now,
    });
  }

  return msgs;
}

function orderSummary(order: StoredOrder): string {
  const status = statusHeadline(resolveOrderStatus(order));
  const track = trackingId(order);
  const eta = buildTrackingSteps(order).find((s) => s.current);
  return [
    `Order **${order.id}**`,
    `Placed: ${formatOrderDateShort(order.createdAt)}`,
    `Total: ${formatPrice(order.total)}`,
    `Status: **${status}**`,
    `Tracking ID: \`${track}\``,
    eta ? `Latest update: ${eta.label} — ${eta.detail}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function getBotReply(input: string, context?: ChatOpenContext): string {
  const text = input.trim().toLowerCase();
  const order = context?.orderId ? getOrderById(context.orderId) : null;

  if (!text) {
    return "Please type a message or pick one of the quick options below.";
  }

  if (text.includes("need help") && order) {
    return `I'm here for order **${order.id}**.\n\nYou can:\n• **Track** your package\n• Start a **return or refund**\n• Report a **wrong or damaged** item\n• **Talk to support** for urgent issues\n\nPick a quick option below or type your question.`;
  }

  if (
    text.includes("track") ||
    text.includes("where") ||
    text.includes("package") ||
    text.includes("delivery status")
  ) {
    if (order) {
      return `${orderSummary(order)}\n\nView full tracking on your [order details page](/account/orders/${order.id}#track).`;
    }
    return "Open **My Account → Order History** and tap **Track package** on your order. You'll see live steps from processing to delivery.";
  }

  if (
    text.includes("return") ||
    text.includes("refund") ||
    text.includes("replace")
  ) {
    if (order) {
      const status = resolveOrderStatus(order);
      if (order.returnRequest) {
        return `A return is already requested for this order. Refund of **${formatPrice(order.returnRequest.refundAmount)}** is **${order.returnRequest.status}**.`;
      }
      if (status === "delivered" || status === "shipped" || status === "out_for_delivery") {
        return `You can start a return on [order ${order.id}](/account/orders/${order.id}) — tap **Return / refund**, select items, and choose a reason. Refund goes to your original payment method in 5–7 business days after pickup.`;
      }
      return `Returns open once the order is shipped. Current status: **${statusHeadline(status)}**. Check back soon or contact support if urgent.`;
    }
    return "Go to **My Account → Order History → View order details → Return / refund**. Pick items, reason, and submit — we'll schedule a free pickup.";
  }

  if (
    text.includes("wrong") ||
    text.includes("damaged") ||
    text.includes("missing") ||
    text.includes("defective")
  ) {
    if (order) {
      return `Sorry about that! For order **${order.id}**, tap **Return / refund** on the order page and choose "Item arrived damaged" or "Wrong item received". We'll prioritise pickup within 2 business days.`;
    }
    return "Sorry to hear that. Open the order in **My Account**, use **Return / refund**, and select damaged/wrong item. Our team will call you within 24 hours.";
  }

  if (
    text.includes("address") ||
    text.includes("pin") ||
    text.includes("pincode") ||
    text.includes("delivery")
  ) {
    if (text.includes("change") || text.includes("update")) {
      if (order) {
        const status = resolveOrderStatus(order);
        if (status === "processing" || status === "paid") {
          return `Address changes may still be possible for order **${order.id}**. Email **support@medlivehealthcare.in** with your order ID and new address — we'll confirm within a few hours.`;
        }
        return `Order **${order.id}** is already **${statusHeadline(status)}**, so the address can't be changed. Contact support for exceptional cases.`;
      }
    }
    return "We deliver across India. Enter your **6-digit PIN code** on the product or checkout page to check serviceability. Free delivery on orders above **₹2,000**.";
  }

  if (
    text.includes("payment") ||
    text.includes("pay") ||
    text.includes("razorpay") ||
    text.includes("charged") ||
    text.includes("failed")
  ) {
    if (order?.paymentId) {
      return `Payment for order **${order.id}** was received (ID: \`${order.paymentId}\`). If you were charged twice, email **support@medlivehealthcare.in** with this payment ID.`;
    }
    return "We use **Razorpay** (UPI, cards, net banking). If payment failed but money was deducted, it is usually auto-reversed in 5–7 days. For help, email **support@medlivehealthcare.in** with your order ID.";
  }

  if (
    text.includes("support") ||
    text.includes("human") ||
    text.includes("agent") ||
    text.includes("call") ||
    text.includes("email") ||
    text.includes("talk")
  ) {
    return "Our support team is available Mon–Sat, 9 AM – 6 PM IST.\n\n📧 **support@medlivehealthcare.in**\n📞 **+91 97192 50086**\n\nOr use the [Contact Us](/contact) form — we reply within 24 hours.";
  }

  if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
    return order
      ? `Hello! I'm here to help with order **${order.id}**. Ask about tracking, returns, or delivery.`
      : "Hello! How can I help you with your MedLive order today?";
  }

  if (text.includes("thank")) {
    return "You're welcome! Is there anything else I can help with?";
  }

  return "I can help with **order tracking**, **returns & refunds**, **delivery & PIN codes**, and **payment** questions. Try a quick option below, or email **support@medlivehealthcare.in** for anything else.";
}

export function newMessage(role: "user" | "bot", text: string): ChatMessage {
  return {
    id: `${role}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    role,
    text,
    at: new Date().toISOString(),
  };
}

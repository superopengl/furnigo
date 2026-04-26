import type { FastifyInstance } from "fastify";

const STYLE = `
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px 16px; color: #333; line-height: 1.6; }
  h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
  h2 { font-size: 1.15rem; margin-top: 1.5rem; }
  p, li { font-size: 0.95rem; }
  .updated { color: #888; font-size: 0.85rem; margin-bottom: 1.5rem; }
`;

export async function legalRoutes(app: FastifyInstance) {
  app.get("/privacy_policy", async (_request, reply) => {
    reply.type("text/html").send(`<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Privacy Policy — Furnigo</title><style>${STYLE}</style></head><body>
<h1>Privacy Policy</h1>
<p class="updated">Last updated: 26 April 2026</p>

<h2>1. Information We Collect</h2>
<p>We collect information you provide directly: your email address, display name, and messages sent through the in-app chat. We also collect device identifiers for push notifications.</p>

<h2>2. How We Use Your Information</h2>
<p>Your information is used to operate the Furnigo service — authenticating your account, delivering messages between you and our agents, sending push notifications, and coordinating furniture orders.</p>

<h2>3. Data Sharing</h2>
<p>We do not sell your personal information. We share data only with service providers necessary to operate Furnigo (cloud hosting, email delivery, push notifications) and when required by law.</p>

<h2>4. Data Storage &amp; Security</h2>
<p>Your data is stored on servers located in Australia and protected with encryption in transit and at rest. We retain your data for as long as your account is active.</p>

<h2>5. Your Rights</h2>
<p>You may request access to, correction of, or deletion of your personal data by contacting us. We will respond within 30 days.</p>

<h2>6. Contact</h2>
<p>For privacy inquiries, email <strong>privacy@furnigo.com.au</strong>.</p>
</body></html>`);
  });

  app.get("/terms_of_use", async (_request, reply) => {
    reply.type("text/html").send(`<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Terms of Use — Furnigo</title><style>${STYLE}</style></head><body>
<h1>Terms of Use</h1>
<p class="updated">Last updated: 26 April 2026</p>

<h2>1. Acceptance</h2>
<p>By using Furnigo you agree to these terms. If you do not agree, please do not use the app.</p>

<h2>2. The Service</h2>
<p>Furnigo connects Australian home buyers with furniture manufacturers in Foshan, China. We facilitate overseas trip arrangements, purchase guidance, shipping, customs clearance, and door-to-door delivery with setup.</p>

<h2>3. User Accounts</h2>
<p>You must provide a valid email address to create an account. You are responsible for all activity under your account.</p>

<h2>4. Payments &amp; Pricing</h2>
<p>All prices are quoted in Australian Dollars (AUD). Final pricing is confirmed in your order summary before payment. Furnigo is not responsible for additional customs duties or taxes unless explicitly included in the quote.</p>

<h2>5. Limitation of Liability</h2>
<p>Furnigo acts as a facilitator between buyers and manufacturers. We are not liable for manufacturing defects, delays caused by third-party shipping, or force majeure events. Our liability is limited to the fees paid to Furnigo for our service.</p>

<h2>6. Termination</h2>
<p>We may suspend or terminate your account if you breach these terms. You may delete your account at any time by contacting us.</p>

<h2>7. Governing Law</h2>
<p>These terms are governed by the laws of New South Wales, Australia.</p>

<h2>8. Contact</h2>
<p>For questions about these terms, email <strong>support@furnigo.com.au</strong>.</p>
</body></html>`);
  });
}

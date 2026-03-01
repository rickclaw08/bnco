# Stripe Account Setup Checklist for ClawOps

## Pre-Setup: What You Need Ready

- [ ] Legal business name (or your personal name if sole prop)
- [ ] Business EIN (or SSN if sole prop)
- [ ] Business address
- [ ] Phone number
- [ ] Government-issued ID (driver's license or passport)
- [ ] Bank account details (routing + account number)
- [ ] Business website URL (claw-agency.com or portfolio site)

## Step 1: Create Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Enter your email address
3. Create a strong password
4. Click "Create account"
5. Verify your email (check inbox for Stripe verification link)

## Step 2: Choose Business Type

1. Click "Activate payments" in the Stripe dashboard
2. Select business type:
   - **Individual** if you're a sole proprietor (easier, uses SSN)
   - **Company** if you have an LLC (requires EIN)
3. Click "Continue"

**Recommendation for Brand:** Start as Individual for speed. You can upgrade to Company later when you form an LLC.

## Step 3: Enter Business Details

1. Fill out business information:
   - Business name: "ClawOps" (or your legal name)
   - Industry: Select "Software" > "Computer Software"
   - Business website: Enter your portfolio or agency site URL
   - Description: "AI automation and agency services for businesses"
   - Phone number: Your business phone
   - Business address: Your primary business location

2. Click "Continue"

## Step 4: Personal Information (Identity Verification)

1. Enter your personal details:
   - Legal first and last name (must match ID exactly)
   - Date of birth
   - Home address
   - Last 4 digits of SSN (or full SSN for Individual accounts)

2. Upload government ID:
   - Click "Upload ID"
   - Take a photo or upload image of driver's license or passport
   - Make sure all corners are visible and text is readable
   - Submit

**Note:** Stripe uses this for identity verification and fraud prevention. Required by law.

## Step 5: Link Bank Account

1. Click "Add bank account"
2. Choose your bank from the list (Stripe will connect via Plaid)
   - OR manually enter routing and account numbers
3. Confirm the account
4. Stripe will make 2 small deposits (< $1 each) within 1-2 business days
5. Return to Stripe dashboard and verify the deposit amounts

**Important:** Use a business checking account if you have one. Personal checking works fine for sole props.

## Step 6: Tax Information

1. Complete the tax form:
   - For Individual: Provide SSN (W-9 equivalent)
   - For Company: Provide EIN
2. Confirm your tax classification:
   - Sole proprietor
   - LLC (single-member or multi-member)
   - S-Corp or C-Corp
3. Sign electronically
4. Click "Submit"

## Step 7: Security Setup

1. Enable two-factor authentication (2FA):
   - Go to Settings > Security
   - Click "Enable two-factor authentication"
   - Use authenticator app (Authy, Google Authenticator, 1Password)
   - Save backup codes in a secure location

2. Review notification settings:
   - Go to Settings > Notifications
   - Enable email alerts for successful payments, disputes, payouts

## Step 8: Configure Payout Schedule

1. Go to Settings > Bank accounts and scheduling
2. Set payout schedule:
   - **Recommended:** Daily automatic (you get paid every business day)
   - Alternative: Weekly or monthly
3. Click "Save"

**Note:** First payout has a 7-10 day holding period. After that, daily payouts arrive in 2 business days.

## Step 9: Test Mode vs Live Mode

1. Understand the toggle in top-right of dashboard:
   - **Test mode:** For testing integrations (fake money)
   - **Live mode:** Real payments from real customers

2. When creating products and payment links, make sure you're in **Live mode**

## Step 10: Create Your First Product

1. In Live mode, go to Products > Add product
2. Name: "ClawOps Starter Plan"
3. Description: "Monthly AI automation service"
4. Pricing: Recurring, $600/month
5. Click "Save product"

(Full product setup in payment-links.md)

## Step 11: Compliance and Legal

1. Review Stripe's terms of service
2. Add business information:
   - Go to Settings > Business settings > Public details
   - Add support email (support@yourdomain.com or your email)
   - Add support phone (optional but recommended)
3. Configure customer emails:
   - Go to Settings > Emails
   - Enable receipt emails (automatic)
   - Customize with your branding (optional)

## Step 12: Final Checklist

- [ ] Account activated (green checkmark in dashboard)
- [ ] Bank account linked and verified
- [ ] Identity verification completed
- [ ] Tax information submitted
- [ ] Two-factor authentication enabled
- [ ] Test payment successful (use test card 4242 4242 4242 4242 in test mode)
- [ ] Payout schedule configured
- [ ] First product created

## Post-Setup: Next Steps

1. Create payment links for all service tiers (see payment-links.md)
2. Set up invoice templates
3. Connect accounting software (QuickBooks, Wave, or FreshBooks)
4. Add Stripe to your website if needed
5. Test the entire payment flow with a $1 test charge to yourself

## Troubleshooting

**"Account under review"** - Stripe is verifying your info. Usually resolves in 24-48 hours. Check email for requests.

**"Bank account verification failed"** - Double-check routing and account numbers. Try linking via Plaid instead of manual entry.

**"Identity verification needed"** - Upload a clear photo of your ID. Make sure it's not expired.

**"Additional information required"** - Stripe may ask for business documents (articles of incorporation, EIN confirmation letter). Check your dashboard notifications.

## Support

- Stripe Support: https://support.stripe.com
- Live chat available 24/7 in dashboard
- Phone: 1-888-926-2289

---

**Time estimate:** 30-45 minutes if you have all documents ready. Identity verification can take up to 48 hours.

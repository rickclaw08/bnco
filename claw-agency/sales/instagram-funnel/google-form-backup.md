# Google Form Backup: ClawOps AI Receptionist Intake

## Setup Instructions

Since we need a reliable backup for lead capture, create this Google Form manually at forms.google.com.

### Form Title
**ClawOps AI Receptionist - Get Started**

### Form Description
Tell us about your business and we will reach out within 24 hours to get your AI receptionist set up. Questions? Call (888) 457-8980 to talk to the AI yourself.

---

### Form Fields (in order)

**1. Full Name** (Short answer, Required)
- Validation: None

**2. Email Address** (Short answer, Required)
- Validation: Email

**3. Phone Number** (Short answer, Required)
- Helper text: "Best number to reach you"

**4. Business Name** (Short answer, Required)

**5. Business Type** (Dropdown, Required)
- HVAC
- Plumbing
- Electrical
- Roofing
- General Contractor
- Landscaping
- Pest Control
- Other

**6. How many calls does your business get per month?** (Dropdown, Required)
- Under 50
- 50 to 100
- 100 to 200
- 200 to 500
- 500+
- Not sure

**7. Do you currently have a receptionist or answering service?** (Multiple choice, Required)
- No, calls go to voicemail
- Yes, a receptionist (but they miss calls)
- Yes, an answering service
- I answer calls myself

**8. What happens when you miss a call right now?** (Paragraph, Required)
- Helper text: "Be honest. We want to understand the real impact on your business."

**9. How did you hear about ClawOps?** (Dropdown, Required)
- Instagram
- Google Search
- Referral
- Facebook
- TikTok
- Other

**10. Anything else we should know?** (Paragraph, Optional)

---

### Form Settings

- **Collect email addresses:** ON
- **Limit to 1 response:** OFF (some people submit twice)
- **Confirmation message:** "We got it. Expect a call or message within 24 hours. In the meantime, try the live AI demo: (888) 457-8980"
- **Response destination:** Create a new Google Sheet named "ClawOps Intake Responses"

### Post-Setup

1. Create the form at https://forms.google.com
2. Copy the share link
3. Set up email notifications for new responses (go to Responses tab, click the 3-dot menu, enable email notifications)
4. Add the form link to the Instagram bio as a backup CTA
5. Connect the response spreadsheet to any CRM or automation you use

---

## Google Apps Script (for website form integration)

To connect the booking page form to a Google Sheet, deploy this Apps Script as a web app:

1. Go to https://script.google.com
2. Create a new project called "ClawOps Booking Form Handler"
3. Paste the code below
4. Deploy as Web App (execute as: Me, access: Anyone)
5. Copy the deployment URL
6. Paste it into `book/index.html` where it says `YOUR_GOOGLE_APPS_SCRIPT_URL`

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getSheetByName('Sheet1');

  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.name || '',
    data.email || '',
    data.phone || '',
    data.business || '',
    data.callVolume || '',
    data.missedPain || '',
    data.source || 'website'
  ]);

  // Send notification email
  MailApp.sendEmail({
    to: 'rickclaw08@gmail.com',
    subject: 'New ClawOps Lead: ' + (data.name || 'Unknown'),
    body: 'New lead from ' + (data.source || 'website') + ':\n\n' +
          'Name: ' + (data.name || '') + '\n' +
          'Email: ' + (data.email || '') + '\n' +
          'Phone: ' + (data.phone || '') + '\n' +
          'Business: ' + (data.business || '') + '\n' +
          'Call Volume: ' + (data.callVolume || '') + '\n' +
          'Missed Call Pain: ' + (data.missedPain || '') + '\n\n' +
          'Submitted: ' + new Date().toString()
  });

  return ContentService
    .createTextOutput(JSON.stringify({status: 'success'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({status: 'ok', message: 'ClawOps form handler active'}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Sheet Columns (set up header row):
| Timestamp | Name | Email | Phone | Business Type | Call Volume | Missed Call Pain | Source |
|-----------|------|-------|-------|---------------|-------------|------------------|--------|

---

## Why Both a Google Form and a Custom Form?

- **Custom form on theclawops.com/book/:** Primary. Better UX, matches our brand, tracks source properly.
- **Google Form:** Backup for when we need a quick sharable link (Instagram bio, DMs to people who want a form instead of a call). Also works if the website form has any issues.

Both feed into the same Google Sheet via Apps Script so all leads end up in one place.

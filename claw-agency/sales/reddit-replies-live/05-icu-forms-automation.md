# Reddit Reply #5: r/automation - "Need automation to fill daily forms for ICU Patients"

**Post URL:** https://www.reddit.com/r/automation/comments/1r97ngd/need_automation_to_fill_daily_forms_for_icu/
**Subreddit:** r/automation
**Engagement:** 6 comments
**Posted:** This week (Feb 2026)

---

## Reply

This is a great use case for automation because it's highly repetitive and structured. Daily forms with mostly the same data (patient details that don't change) and only a few fields that update each day is the perfect pattern for automation.

Here's how I'd approach this:

**Option 1 - Low-code approach (fastest to set up):**

Use a tool like Make.com or Power Automate to:
1. Pull static patient data from your source system (EHR or spreadsheet)
2. Pre-fill the daily form template with the data that stays the same
3. Present you with only the fields that need daily updates
4. Submit the completed form

If your forms are web-based, you can use browser automation to fill them. If they're PDFs or Word docs, there are APIs that can fill those too.

**Option 2 - Spreadsheet-based (simplest):**

Create a master patient list with all static info. Build a daily template that pulls from this list. You only type the changing values each day. A macro or script can then push this data to your form system.

**Option 3 - Custom script (most flexible):**

A Python script using Selenium (for web forms) or python-docx/reportlab (for documents) that:
- Reads patient data from your master list
- Fills forms with yesterday's data as defaults
- Lets you update only what changed
- Submits and logs everything

**Important considerations for healthcare:**

- Make sure whatever solution you use is HIPAA-compliant (or your local equivalent)
- Keep an audit trail of all form submissions
- Don't store patient data in third-party tools without proper agreements in place
- Check with your IT department about approved automation tools

Which form system are you using? That'll determine the best approach. If it's a web app, I can give you a much more specific recommendation.

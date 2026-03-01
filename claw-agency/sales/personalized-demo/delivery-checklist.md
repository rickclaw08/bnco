# Demo Delivery Checklist

Target: 15 minutes from start to outreach message sent.

---

## Phase 1: Research (5-7 minutes)

- [ ] **Open prospect-template.md** and start filling it in
- [ ] **Pull up their website** - grab business name, address, phone, hours, services
- [ ] **Check their Google Business listing** - verify hours, read recent reviews for FAQ ideas and pain points
- [ ] **Scan Yelp/review sites** (30 seconds) - look for recurring customer questions or complaints
- [ ] **Note their industry and tone** - professional? Casual? Family-friendly? Match it.
- [ ] **List 5-8 FAQs** - use their website FAQ page + common questions from reviews + industry standards
- [ ] **Identify pain points** - missed calls, no after-hours, no online booking, understaffed
- [ ] **Save completed prospect-template.md** to `sales/personalized-demo/prospects/[business-name].md`

**Checkpoint:** You should have all the info needed to build their prompt. If you're missing hours or services, check Google Maps or call their current number (good recon anyway - see how they handle calls now).

---

## Phase 2: Build the Prompt (3-5 minutes)

- [ ] **Open prompt-template.md** - copy the master template
- [ ] **Fill in all bracketed fields** using your completed prospect template
- [ ] **Pick a receptionist name** that matches their brand tone
  - Professional (dental, law, medical): Sarah, Emily, Michael
  - Friendly/casual (auto, HVAC, salon): Sam, Alex, Jamie
  - Neutral (any industry): Jordan, Taylor, Casey
- [ ] **Write the greeting** - short, includes business name, sounds natural
- [ ] **Paste in services** from prospect template
- [ ] **Write 5-8 FAQ entries** with accurate answers (from their website/reviews)
- [ ] **Set transfer rules** - use placeholder numbers if you don't have real ones
- [ ] **Write emergency handling** appropriate to their industry
- [ ] **Set the closing line** - match their brand energy
- [ ] **Review the full prompt** - read it out loud. Does it sound like a real receptionist for THIS business?

**Checkpoint:** Prompt should be complete and ready to deploy. No placeholder brackets remaining except transfer numbers (which you may not have yet).

---

## Phase 3: Deploy and Test (2-3 minutes)

- [ ] **Update the server config** with the new system prompt
  - Server config location: [YOUR_SERVER_CONFIG_PATH]
  - Update the system prompt field with the completed prompt
  - Set the business name in the caller ID / greeting config
- [ ] **Restart/reload the service** if needed
- [ ] **Make a test call** to (702) 728-4638
  - Test greeting: Does it say the right business name?
  - Test FAQ: Ask one of the FAQs you wrote. Does it answer correctly?
  - Test booking: Say "I'd like to schedule an appointment." Does it collect the right info?
  - Test transfer: Ask "Can I speak to a manager?" Does it handle it properly?
  - Test edge case: Ask something not in the FAQs. Does it handle it gracefully?
- [ ] **Fix any issues** - update the prompt and test again if something was off

**Checkpoint:** Demo is live and working. You've personally verified it sounds good and handles calls correctly for this specific business.

---

## Phase 4: Send Outreach (1-2 minutes)

- [ ] **Pick the right channel** based on where you found the prospect:
  - Found on Reddit: Use Reddit DM script from outreach-scripts.md
  - Found via website/Google: Use email script from outreach-scripts.md
  - Found both: Start with whichever feels more personal
- [ ] **Personalize the script** - fill in their name, business name, reference to how you found them
- [ ] **Include the demo number** (702) 728-4638 or web widget link
- [ ] **Double-check before sending:**
  - [ ] Business name is spelled correctly
  - [ ] Their name is correct
  - [ ] The demo is actually live and working right now
  - [ ] No template brackets left in the message
- [ ] **Send it**
- [ ] **Log the outreach** in your tracking sheet:
  - Date/time sent
  - Business name
  - Channel (Reddit DM, email, etc.)
  - Their contact info
  - Status: Sent

---

## Phase 5: Follow-Up Tracking

- [ ] **Set a reminder** to check for a response in 24-48 hours
- [ ] **If they respond:** Use the appropriate follow-up script from outreach-scripts.md
- [ ] **If no response after 48h:** Send one follow-up, then move on
- [ ] **If they engage:** Move to pricing conversation using the pricing script
- [ ] **Update status** in tracking sheet: Responded / No Response / Closed / Follow-Up Sent

---

## File Organization

```
sales/personalized-demo/
  prospect-template.md       <- Blank template (reuse for every prospect)
  prompt-template.md         <- System prompt generator with examples
  outreach-scripts.md        <- All outreach/follow-up/pricing scripts
  delivery-checklist.md      <- This file
  prospects/                 <- Completed prospect research files
    comfort-zone-hvac.md
    bright-smile-dental.md
    [business-name].md
```

---

## Time Targets

| Phase | Target Time | Running Total |
|---|---|---|
| Research | 5-7 min | 5-7 min |
| Build Prompt | 3-5 min | 8-12 min |
| Deploy + Test | 2-3 min | 10-15 min |
| Send Outreach | 1-2 min | 11-17 min |

First few times might take 20+ minutes. After 3-5 prospects, you should be hitting the 15-minute target consistently.

---

## Common Mistakes to Avoid

1. **Sending outreach before testing the demo.** Always call the number yourself first. Nothing kills credibility faster than "I built this for you" and it doesn't work.
2. **Using generic FAQs.** "What are your hours?" is fine, but also include industry-specific questions. A dental office gets "Do you accept my insurance?" An auto shop gets "How much is an oil change?" Make it real.
3. **Forgetting to switch the prompt between prospects.** Double-check the greeting says the right business name before sending outreach. Calling a dental office and hearing "Thanks for calling Ironclad Auto Repair" is a deal-killer.
4. **Over-researching.** You don't need to know everything about the business. Website + Google listing gives you 90% of what you need. Don't spend 20 minutes on research.
5. **Copy-pasting outreach without personalizing.** The whole point is that this is personalized. If your DM could be sent to any business, you did it wrong.

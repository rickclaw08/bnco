# Reddit Reply Draft: Similar-Incident18
## Thread: r/gohighlevel - Callback time field extraction question
## Context: User has a GHL question about extracting callback time from a field

---

## Draft Reply

```
The callback time extraction depends on how you're storing the data and where in the workflow you need it.

If you're pulling from a custom field (like a "preferred callback time" field), you can use the custom field merge tag in your workflow trigger. Format: {{contact.custom_field_name}}. Make sure the field ID matches exactly - GHL is case-sensitive on custom field keys.

If you're trying to extract a time from a conversation transcript or form submission where the caller said something like "call me back at 3pm," that's trickier. You'd need to:

1. Store the raw response in a custom field first
2. Use a webhook to send that text to an external parser (or GHL's built-in AI action if you're on the 497 plan)
3. Parse the time value out and write it back to a dedicated "callback_time" field
4. Then trigger your callback workflow based on that field value

For the workflow timing itself, use a "Wait" step with "Wait until date/time in contact field" and point it at your callback_time field. The format needs to be ISO 8601 or a standard date-time format GHL recognizes.

One gotcha: if the callback time is today and the workflow processes after that time, it'll either fire immediately or skip it depending on your wait configuration. Add a condition branch to check if the callback time is in the past before the wait step.

If you can share how you're collecting the callback time (form, voice call, manual entry), I can get more specific on the best approach.
```

**Word count:** 232
**Tone:** Genuinely helpful, technical, no sales pitch. This is pure value. Builds credibility for our account in r/gohighlevel.
**Post to:** Reply in the thread where Similar-Incident18 asked the question
**Follow-up plan:** If they reply with more details, keep helping. This is karma building + credibility. No pitch unless they explicitly ask what we do.

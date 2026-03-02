# Reddit Reply: Similar-Incident18
## Thread: r/gohighlevel - Callback time field extraction question
## Context: User has a GHL question about extracting callback time from a field

---

If you're pulling from a custom field, use the merge tag {{contact.custom_field_name}} in your workflow trigger. Make sure the field ID matches exactly, GHL is case-sensitive on those.

For the timing itself, use a "Wait" step set to "Wait until date/time in contact field" pointed at your callback_time field. Needs ISO 8601 or a standard format GHL recognizes.

One gotcha: if the callback time already passed when the workflow runs, it'll fire immediately. Add a condition branch to check before the wait step.

How are you collecting the callback time? Can get more specific from there.

---

**Word count:** 99
**Tone:** Pure value, no pitch. Credibility building in r/gohighlevel.
**Post to:** Reply in the thread where Similar-Incident18 asked
**Follow-up plan:** Keep helping if they reply. No pitch unless they ask what we do.

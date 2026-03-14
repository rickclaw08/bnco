# Prompt Evolution: Side-by-Side Transcript Comparison

## Batch 1 Transcripts (Prompt v10.2 - March 14, 10:28 AM)

### PROBLEM 1: IVR LOOPS ($1.45 burned)
**Mechanical One - $0.73 wasted (65 messages)**
```
JORDAN: Hey. It's Jordan. Quick business call.
IVR:    Thank you for calling Mechanical One. Press one. Press two. Press three.
JORDAN: Hey. It's Jordan. Quick business call.
IVR:    Thank you for calling Mechanical One. Press one. Press two. Press three.
JORDAN: Hey. It's Jordan. Quick business call.
[... repeated 30+ more times for 10 full minutes until maxDuration hit]
```

**Benefit Air - $0.72 wasted (58 messages)**
```
JORDAN: Hey. It's Jordan. Quick business call.
IVR:    Press nine for emergency. Press three for message.
JORDAN: Hey. It's Jordan. Quick business call.
[... repeated 28+ times, same pattern]
```

**v12 Fix:** IVR detection - stay silent first play, one attempt on 2nd play, hang up on 3rd. maxDuration dropped from unlimited to 180s (worst case burn: $0.22 not $0.73).

---

### PROBLEM 2: NAME PRONUNCIATION
**Bold City**
```
JORDAN: Hey. This is Jordan with Clops. Clops, who am I speaking with?
```
**Punbar Air**
```
JORDAN: Hey. This is Jordan with Clops. Who am I speaking with?
```
**Coast to Coast**
```
JORDAN: Hey. This is Jordan with Claw, l ops. Who am I speaking with?
```
**Desert Diamond**
```
JORDAN: Hey. This is Jordan with Claw. Oops. Who am I speaking with?
```
**Straight Cool**
```
JORDAN: Hey. This is Jordan with claw... Clops. Who am I speaking with?
```
**Bradham Comfort**
```
JORDAN: Hey. This is Jordan with CallOps. Who am I speaking with?
```

**v12 Fix:** Removed phonetic instruction that was confusing the model ("say Claw then Ops as two words"). Replaced with: "Say it confidently as one smooth word. Like mailbox but ClawOps."

---

### PROBLEM 3: FILLER WORDS
**Elite AC**
```
JORDAN: Jessica, that's exactly what I needed. Um, I'll call back, um, Monday at seven thirty, uh, and ask for the office manager.
```
**Apex Pros**
```
JORDAN: Absolutely, Sarah. Um, can you connect me with the owner or whoever handles, uh, these business decisions right now?
```
**Punbar Air**
```
JORDAN: You nailed it, Marlon. Uh, appreciate your help. Um, if anything changes...
```

**v12 Fix:** Hard rule - "NEVER say um, uh, er anywhere in any response. Ever. Not at the start, not in the middle, not at the end. Zero filler words."

---

### PROBLEM 4: TALKING AFTER GOODBYE
**Total Comfort (3 extra messages after prospect said bye)**
```
THEM:   Okay. Bye bye.
JORDAN: Thanks, Ariana. Have a great day. If anything changes, you've got my number.
THEM:   You too. Bye bye.
JORDAN: Take care, Ariana.
THEM:   Thank you. Bye bye.
JORDAN: if any By Ariana.
```
**Elite AC (2 extra messages)**
```
THEM:   Thanks so much. You have an awesome weekend too. Talk to you Monday.
JORDAN: [call should have ended here but kept going]
```

**v12 Fix:** "After the prospect says goodbye or 'bye', say ONE short goodbye and STOP. Do not say another word."

---

### PROBLEM 5: PITCHING RECORDINGS
**AmeriTech (said intro 3 times to an IVR recording)**
```
JORDAN: Hey. This is Jordan with ClawOps. Who am I speaking with?
IVR:    Press one to hold. Press two for AI receptionist. Press three for voicemail.
JORDAN: Hey. This is Jordan with CallOps. Who am I speaking with?
IVR:    [same menu again]
JORDAN: Hey. It's Jordan. Quick business call.
```

**v12 Fix:** "HOW TO TELL IF IT'S A HUMAN VS A RECORDING" section. Plus: "Do NOT launch into your full pitch until a HUMAN is talking to you."

---

### PROBLEM 6: PUSHING GATEKEEPERS AFTER REJECTION
**Heights AC (asked ANOTHER question after explicit DNC request)**
```
THEM:   We are not interested at the request of mister Perez. Please remove from calling list.
JORDAN: Ray, totally respect that. Just curious, are you losing any calls right now when you're out on a job site?
THEM:   I'll be disconnecting due to automated caller.
```
**Coast to Coast (kept pushing after firm no)**
```
THEM:   They're probably not gonna be interested, but thank you.
JORDAN: Appreciate you, Jamie. Out of curiosity, do you ever see calls get missed when things get busy?
THEM:   Like I said, they're not going to be interested. Thank you very much.
JORDAN: No worries, Jamie. If anything changes and you start missing calls, you've got my number. Right?
```

**v12 Fix:** "HARD NO / REMOVAL REQUEST: FULL STOP. Say nothing else." Plus gatekeeper protocol: "ONE attempt to get the info. If the gatekeeper says no, accept it."

---

### PROBLEM 7: DESCRIBING ACTIONS OUT LOUD
**Airco Mechanical**
```
JORDAN: Hey. It's Jordan. Quick business call. Go completely silent until a human picks up.
JORDAN: Hey. It's Jordan. Quick business call. silent
```
**Rolando's HVAC**
```
JORDAN: Presses one, then wait silently for a human to pick up.
```

**v12 Fix:** "Never say 'Presses one' or describe actions you're taking. You're on a phone call."

---

### PROBLEM 8: firstMessage too aggressive for recordings
Every single call started with Jordan immediately launching his pitch into whatever recording was playing.
```
JORDAN: Hey. It's Jordan. Just giving a quick call.
THEM:   [recording about call being recorded/company greeting]
JORDAN: Hey. This is Jordan with ClawOps. Who am I speaking with? [talking to a recording]
```

**v12 Fix:** firstMessage shortened to "Hey, this is Jordan with ClawOps." Then WAIT AND LISTEN before saying anything else.

---

## Settings Changes Summary

| Setting | v10.2 (Batch 1) | v12 (Current) |
|---------|------------------|---------------|
| Prompt size | 8,403 chars | 10,665 chars |
| maxDurationSeconds | unlimited | 180 (3 min cap) |
| voicemailDetection | off | enabled (vapi) |
| temperature | 0.5 | 0.4 |
| firstMessage | "Hey. It's Jordan. Just giving a quick call." | "Hey, this is Jordan with ClawOps." |
| IVR handling | none | 3-strike hangup |
| Voicemail handling | none | scripted 15-sec pitch |
| Gatekeeper rules | none | dedicated protocol |
| Hard no handling | kept pushing | full stop |
| Filler words | frequent | banned |
| Goodbye handling | 3+ extra messages | one and done |

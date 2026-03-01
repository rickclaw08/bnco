# Comment Templates

## Version: 0.1.0

## How to Use

These are structural templates, not copy-paste scripts. Adapt the structure and fill in genuine, specific content for each situation. Never post a template without significant customization.

## Template 1: Answering a Technical Question

**Use when:** Someone asks how to do something technical that you have experience with.

**Structure:**
```
[Direct answer to the question in 1-2 sentences]

[Explain how or why, with specific details]

[Optional: mention what you tried that did not work]

[Optional: link to a resource that helps]
```

**Example:**
```
You can handle this with a simple state machine pattern. Each agent step checks the current state, executes the appropriate action, then transitions to the next state.

I found that trying to chain everything with callbacks gets messy fast. The state machine approach lets you retry failed steps without restarting the whole flow.

This guide covers the pattern well: [link]
```

## Template 2: Sharing a Build Experience

**Use when:** A thread discusses a problem you have solved or a tool you have built.

**Structure:**
```
[Connect to the thread topic: "I ran into the same thing when..."]

[What you built or how you solved it]

[Specific results: numbers, time saved, lessons]

[What you would do differently next time]
```

**Example:**
```
Ran into the same problem when building an automated reporting flow for clients. The biggest challenge was handling edge cases where the data source was inconsistent.

What worked: adding a validation step before each transformation. The agent checks the data shape, flags anything unexpected, and either auto-corrects or asks for clarification.

Went from spending 3 hours a week on reports to about 5 minutes of review time. The main thing I would change: I would add the validation layer from day one instead of retrofitting it.
```

## Template 3: Adding Context or Perspective

**Use when:** A discussion is happening and you can add a useful angle others have not mentioned.

**Structure:**
```
[Acknowledge the existing discussion briefly]

[Add your unique perspective or information]

[Support with specifics]
```

**Example:**
```
Good points above. One thing worth considering is the maintenance cost. The initial build is usually the easy part.

From my experience, the ongoing cost of keeping an AI agent system running smoothly is about 20% of the build cost per month (mainly monitoring, fixing edge cases, and updating prompts as needs change).

Worth factoring that in when comparing the "build vs buy" decision.
```

## Template 4: Resource Recommendation

**Use when:** Someone asks for tool recommendations, tutorials, or resources.

**Structure:**
```
[Recommend the resource with brief context on why]

[Who it is best for / when to use it]

[Optional: alternatives or caveats]
```

**Example:**
```
For that use case, I would look at LangGraph. It handles stateful, multi-step agent workflows well and the documentation is solid.

It is best suited for cases where you need branching logic and human-in-the-loop checkpoints. If your workflow is more linear, LangChain's simpler chain API might be enough.
```

## Template 5: Discussion Starter (For Original Posts)

**Use when:** Creating a new post to spark discussion.

**Structure:**
```
[Hook: interesting observation or question]

[Context: why this matters or your experience with it]

[Open question for the community]
```

**Example:**
```
After building AI agents for 6 months, I have noticed that the hardest part is not the AI. It is defining what "done" means for each task.

Most agent failures I have seen come from vague task definitions, not model limitations. The agent can do the work, but if you do not specify what success looks like, it goes in circles.

How do you handle this? Do you define strict acceptance criteria for each agent task, or do you use a more flexible evaluation approach?
```

## Universal Rules for All Comments

1. Be specific. Numbers, examples, and details beat vague claims
2. No em dashes. Use commas, periods, colons, or parentheses
3. Match the tone of the community
4. Keep it concise. Say what you need to say, then stop
5. Do not force a ClawOps mention. If it fits naturally, fine. If not, skip it
6. Always add value. If your comment does not help anyone, do not post it

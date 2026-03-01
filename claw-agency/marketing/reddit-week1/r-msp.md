# r/msp

**Title:** Free security scanner for quick client assessments - built this, looking for feedback

---

I built a web-based security scanner that I've been using internally for client-facing assessments, and I figured this community would be the right group to tear it apart and tell me what's missing.

**What It Is**

It's a browser-based scanner that evaluates AI-facing attack surfaces, specifically looking at prompt injection vulnerabilities, data exfiltration patterns, and common misconfigurations in web applications that use or integrate with AI/LLM services.

Link: [https://theclawops.com/scanner/index.html](https://theclawops.com/scanner/index.html)

No login required. No data stored on our end. You punch in a URL, it runs, you get a report.

**What It Scans For**

23 detection rules currently, broken into a few categories:

**Prompt Injection Detection (8 rules)**
- Hidden instruction injection in page content
- Invisible text/CSS tricks that feed instructions to AI crawlers
- Meta tag and comment-based injection attempts
- Unicode/encoding-based obfuscation
- Indirect injection via user-generated content fields

**Data Exfiltration Patterns (7 rules)**
- Outbound data channels that could leak context to third parties
- Hidden form fields collecting AI-generated content
- Pixel tracking on AI-processed pages
- API endpoints that accept and forward conversation data
- Cross-origin requests to known data collection services

**Configuration and Exposure (8 rules)**
- AI/LLM API keys exposed in client-side code
- Overly permissive CORS configurations on AI endpoints
- Missing rate limiting on AI-facing APIs
- Unprotected webhook endpoints
- Debug/verbose modes left enabled in production
- Exposed model configuration files
- Missing input sanitization on AI-facing forms

**Why I Built It**

More of my clients are integrating AI tools, chatbots, and LLM-based features into their operations. Most of them have zero visibility into the new attack surface that creates. Traditional vulnerability scanners don't check for prompt injection or AI-specific data leak patterns because it's still a relatively new category.

I needed something quick I could run during assessments to flag obvious problems without spinning up a full pentest engagement. So I built it.

**How I've Been Using It**

During initial client assessments, I run this alongside my normal tooling. It adds maybe 3-4 minutes to the process and gives me a section in my report that most other MSPs aren't covering yet. Clients notice when you flag something their last IT provider missed.

I've also started using it as a conversation starter with prospects. "Hey, I ran a quick scan on your site, here's what I found" is a much better opener than "let me tell you about our managed services." Especially when the scan actually finds something, which it does about 60% of the time on sites with AI integrations.

**What I Want Feedback On**

1. **Rule coverage** - Am I missing obvious detection categories? What would you want to see added for your client base?
2. **Report format** - Is the output useful for including in client-facing reports, or does it need work?
3. **False positives** - If you run it and get results that look wrong, I want to know. Still tuning the detection sensitivity.
4. **Speed** - It should complete in under 60 seconds for most sites. If it's hanging or timing out, that's a bug.

**What's Next**

I'm considering building an API tier for MSPs who want to run bulk scans across their client portfolio. Think: scan 50 client domains on a schedule, get a consolidated report, flag anything new that pops up. Would be useful for quarterly business reviews or ongoing monitoring.

If there's enough interest I'd also look at integrating with PSA/RMM platforms so scan results can auto-generate tickets.

Right now it's completely free. The API tier would probably be a paid product, but the single-scan tool will stay free.

Seriously though, rip it apart. Tell me what sucks, what's missing, and what would make you actually use this with clients. I'd rather get honest feedback from this community than launch something half-baked.

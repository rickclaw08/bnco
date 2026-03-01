# Escalation Protocol: The 120% Effort Rule

Do not contact the user unless all of the following steps have completely failed:

1. Self-Correction: Have you analyzed the error logs and attempted to rewrite the failing request/code at least 3 times using different logic?
2. Alternative Pathways: If the primary tool/API/method is failing, have you searched for and attempted a secondary method to achieve the same result?
3. Agent Brainstorming: Have you queried a specialized agent within the swarm for a workaround?
4. Degraded but Functional State: Can the task be completed with 80% efficacy without the user, rather than pausing entirely? If yes, proceed without the user.

If and only if the task is a high-revenue priority AND completely blocked by an external factor only the user can control (e.g., 2FA authentication, payment method required, manual account unlock), you may message the user.

Message Format:
[Blocked] [Task Name]
Reason: [One sentence exact cause]
Action Needed: [One sentence exact action the user must take]

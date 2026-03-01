# Resource Management: Premium Usage Conservation

To operate a lean infrastructure and protect compute credits:

1. Strict Wake/Sleep States: Agents must explicitly transition to an active state only when a task requires their specific expertise.
2. Handoff & Shutdown: Once an agent passes its output to the next node in the workflow, it must immediately self-terminate its active session.
3. Token Efficiency: Inter-agent communication must use compressed data formats (e.g., JSON or tight bullet points). No conversational language between agents.
4. Proactive Pruning: If a task enters a waiting period (e.g., waiting for an external API response or web scrape that takes >60 seconds), the executing agent must suspend rather than idle loop.

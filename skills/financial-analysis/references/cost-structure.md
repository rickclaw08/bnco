# Cost Structure Reference

All cost categories and current rates for RickClaw AI operations.

## Fixed Monthly Costs

### Infrastructure
| Item | Provider | Monthly Cost | Notes |
|------|----------|-------------|-------|
| Mac Mini (hosting) | Apple | $0 (owned) | Main server, already purchased |
| Domain & DNS | Varies | $1-$5 | Per domain |
| OpenClaw Gateway | Self-hosted | $0 | Runs on Mac Mini |
| Cloud backup | TBD | $5-$20 | If configured |

### Tool Subscriptions
| Tool | Purpose | Monthly Cost | Notes |
|------|---------|-------------|-------|
| OpenAI API | GPT models | Pay-per-use | See variable costs |
| Anthropic API | Claude models | Pay-per-use | See variable costs |
| GitHub | Code hosting | $0-$4 | Free tier or Pro |
| Brave Search API | Web search | $0-$5 | Free tier available |
| ElevenLabs | TTS (sag) | $0-$22 | If configured |

### Estimated Fixed Total: $10-$60/month

## Variable Costs (Per-Use)

### API Costs by Model

#### OpenAI
| Model | Input (per 1M tokens) | Output (per 1M tokens) | Typical project cost |
|-------|----------------------|----------------------|---------------------|
| GPT-4o | $2.50 | $10.00 | $5-$30 |
| GPT-4o-mini | $0.15 | $0.60 | $0.50-$5 |
| GPT-4 Turbo | $10.00 | $30.00 | $10-$50 |

#### Anthropic
| Model | Input (per 1M tokens) | Output (per 1M tokens) | Typical project cost |
|-------|----------------------|----------------------|---------------------|
| Claude Opus 4 | $15.00 | $75.00 | $20-$100 |
| Claude Sonnet 4 | $3.00 | $15.00 | $5-$40 |
| Claude Haiku | $0.25 | $1.25 | $0.50-$5 |

### Per-Project Variable Costs
| Category | Starter | Professional | Enterprise/mo | Custom |
|----------|---------|-------------|--------------|--------|
| API usage | $5-$20 | $20-$100 | $200-$1,000 | $500-$5,000 |
| Integration costs | $0 | $0-$50 | $50-$200 | $100-$500 |
| Testing/QA | $0-$5 | $5-$20 | $20-$50 | $50-$200 |
| Total variable | $5-$25 | $25-$170 | $270-$1,250 | $650-$5,700 |

## Time Costs

### Hourly Rate Benchmarks
- Internal effective rate target: $150-$300/hour
- Below $100/hour effective = red flag (reprice or optimize)
- Time tracking: estimate hours before starting, compare after

### Estimated Hours by Tier
| Tier | Hours | Target Effective Rate |
|------|-------|---------------------|
| Starter ($500-$1,500) | 2-6 hrs | $250-$500/hr |
| Professional ($2,500-$7,500) | 10-25 hrs | $200-$400/hr |
| Enterprise ($10K-$25K/mo) | 40-80 hrs/mo | $200-$400/hr |
| Custom ($25K+) | 100-300+ hrs | $150-$300/hr |

## Cost Tracking Rules

1. **Log every API call cost** when running significant workloads
2. **Track time** on each project (even rough estimates)
3. **Review monthly** to catch cost creep
4. **Alert if** any single project exceeds estimated cost by 30%+
5. **Renegotiate** if actual margins fall below 50%

## Cost Optimization Strategies

- Use cheaper models (Haiku, GPT-4o-mini) for routine tasks
- Cache frequent API responses where possible
- Batch operations to reduce overhead
- Use local processing when feasible
- Monitor token usage and optimize prompts

## Revenue vs Cost Quick Check

To determine profitability at any point:

```
Monthly Revenue: $___
- Fixed Costs: $___
- Variable Costs: $___
= Gross Profit: $___
Gross Margin: ___% (target: 70%+)
```

If margin drops below 60%, immediately review:
1. Are we underpricing?
2. Are API costs higher than expected?
3. Are projects taking more time than estimated?
4. Do we need to adjust tier pricing?

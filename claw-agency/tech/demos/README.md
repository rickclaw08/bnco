# ClawOps Demo Assets - Requirements

Install these Python packages to run the demo scripts:

```bash
pip install colorama
```

## Running the Demos

### Email Automation Demo
```bash
python email-automation-demo.py
```

This demo showcases:
- Email categorization (Urgent, Sales Lead, Billing, etc.)
- Automatic summarization
- AI-powered reply drafting
- Processing statistics and time savings

### Lead Scraper Demo
```bash
# Basic usage
python lead-scraper-demo.py

# With options
python lead-scraper-demo.py --industry restaurants --location "Austin, TX" --count 15
```

Options:
- `--industry`: restaurants, retail, services, healthcare
- `--location`: Any US city
- `--count`: Number of leads to scrape (default: 10)

This demo showcases:
- Business lead scraping simulation
- Contact information extraction
- Lead scoring and qualification
- Export to JSON format

## Documentation

- **capabilities-by-industry.md** - Comprehensive list of all automation capabilities organized by industry (E-Commerce, Healthcare, Real Estate, SaaS, etc.)

- **project-checklist.md** - Complete project template from discovery through deployment, including phases, tasks, deliverables, and risk management

## Notes

Both Python demos use simulated data and are designed for screen recording demonstrations. They showcase the capabilities visually with colored terminal output and realistic workflows.

For production implementations, contact ClawOps for custom solutions tailored to your business needs.

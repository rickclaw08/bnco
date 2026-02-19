import markdown
from weasyprint import HTML

with open("/Users/agentclaw/.openclaw/workspace/Rick_Claw_Resume.pdf.md") as f:
    md_text = f.read()

html_body = markdown.markdown(md_text)

html_full = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body {{
    font-family: 'Helvetica Neue', Arial, sans-serif;
    max-width: 800px;
    margin: 40px auto;
    padding: 0 20px;
    color: #222;
    font-size: 14px;
    line-height: 1.6;
  }}
  h1 {{ font-size: 28px; margin-bottom: 2px; color: #111; }}
  h2 {{ font-size: 18px; color: #333; border-bottom: 2px solid #2563eb; padding-bottom: 4px; margin-top: 24px; }}
  h3 {{ font-size: 15px; color: #444; margin-bottom: 4px; }}
  hr {{ border: none; border-top: 1px solid #ddd; margin: 12px 0; }}
  strong {{ color: #111; }}
  ul {{ padding-left: 20px; }}
  li {{ margin-bottom: 3px; }}
  p {{ margin: 6px 0; }}
  code {{ background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 13px; }}
</style>
</head><body>{html_body}</body></html>"""

output_path = "/Users/agentclaw/.openclaw/workspace/Rick_Claw_Resume.pdf"
HTML(string=html_full).write_pdf(output_path)
print(f"PDF written to {output_path}")

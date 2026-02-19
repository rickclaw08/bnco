import markdown
import subprocess, os

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
</style>
</head><body>{html_body}</body></html>"""

html_path = "/Users/agentclaw/.openclaw/workspace/Rick_Claw_Resume.html"
pdf_path = "/Users/agentclaw/.openclaw/workspace/Rick_Claw_Resume.pdf"

with open(html_path, "w") as f:
    f.write(html_full)

# Use macOS cupsfilter or /usr/sbin/cupsfilter, or use a simple AppleScript approach
# Actually, let's use the textutil + cupsfilter approach, or just use Chrome/Safari headless
# Simplest: use macOS's built-in Python + objc for PDF generation via WebKit
script = f'''
tell application "System Events"
    do shell script "/usr/bin/open -a Safari '{html_path}'"
end tell
'''

# Better approach: use cupsfilter or wkhtmltopdf alternative
# Let's try /usr/sbin/cupsfilter
os.system(f'/usr/sbin/cupsfilter "{html_path}" > "{pdf_path}" 2>/dev/null')
if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 100:
    print(f"PDF created: {pdf_path}")
else:
    print("cupsfilter failed, trying alternative...")
    # Use textutil to convert HTML to RTF, then to PDF via AppleScript
    os.system(f'textutil -convert rtf "{html_path}" -output /Users/agentclaw/.openclaw/workspace/Rick_Claw_Resume.rtf 2>&1')
    print("Created RTF, will use AppleScript for PDF conversion")

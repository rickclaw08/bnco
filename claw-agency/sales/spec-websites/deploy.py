#!/usr/bin/env python3
"""
Deploy all generated spec websites to GitHub Pages.
Creates a new repo or uses existing one, pushes all sites as subdirectories.
Each site accessible at: https://rickclaw08.github.io/client-demos/{slug}/
"""

import os
import subprocess
import sys
import json

GENERATED_DIR = os.path.join(os.path.dirname(__file__), "generated")
REPO_NAME = "client-demos"
GITHUB_USER = "rickclaw08"
DEPLOY_DIR = "/tmp/client-demos-deploy"

def run(cmd, cwd=None):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd)
    if result.returncode != 0:
        print(f"ERROR: {cmd}\n{result.stderr}")
    return result

def main():
    # Check if repo exists
    check = run(f"gh repo view {GITHUB_USER}/{REPO_NAME} --json name 2>/dev/null")
    
    if check.returncode != 0:
        print(f"Creating repo {GITHUB_USER}/{REPO_NAME}...")
        run(f"gh repo create {GITHUB_USER}/{REPO_NAME} --public --description 'Client website demos by ClawOps'")
    
    # Clone or create fresh
    if os.path.exists(DEPLOY_DIR):
        run(f"rm -rf {DEPLOY_DIR}")
    
    clone = run(f"git clone https://github.com/{GITHUB_USER}/{REPO_NAME}.git {DEPLOY_DIR}")
    if clone.returncode != 0:
        os.makedirs(DEPLOY_DIR, exist_ok=True)
        run("git init", cwd=DEPLOY_DIR)
        run(f"git remote add origin https://github.com/{GITHUB_USER}/{REPO_NAME}.git", cwd=DEPLOY_DIR)
    
    # Create index page
    sites = []
    if os.path.exists(GENERATED_DIR):
        for slug in sorted(os.listdir(GENERATED_DIR)):
            site_dir = os.path.join(GENERATED_DIR, slug)
            if os.path.isdir(site_dir) and os.path.exists(os.path.join(site_dir, "index.html")):
                sites.append(slug)
                # Copy site to deploy dir
                dest = os.path.join(DEPLOY_DIR, slug)
                run(f"rm -rf {dest}")
                run(f"cp -r {site_dir} {dest}")
    
    # Create root index
    index_html = """<!DOCTYPE html>
<html><head><title>ClawOps Client Demos</title>
<style>
body { font-family: Inter, sans-serif; background: #0a0a0a; color: #f5f5f5; padding: 40px; }
h1 { margin-bottom: 20px; }
a { color: #4ade80; display: block; margin: 8px 0; }
</style></head><body>
<h1>ClawOps Client Demos</h1>
<p>Professional website redesigns by <a href="https://theclawops.com" target="_blank">ClawOps</a></p>
"""
    for slug in sites:
        name = slug.replace('-', ' ').title()
        index_html += f'<a href="{slug}/">{name}</a>\n'
    index_html += "</body></html>"
    
    with open(os.path.join(DEPLOY_DIR, "index.html"), "w") as f:
        f.write(index_html)
    
    # Add .nojekyll for GitHub Pages
    with open(os.path.join(DEPLOY_DIR, ".nojekyll"), "w") as f:
        f.write("")
    
    # Commit and push
    run("git add -A", cwd=DEPLOY_DIR)
    run('git commit -m "Update client demos"', cwd=DEPLOY_DIR)
    run("git branch -M main", cwd=DEPLOY_DIR)
    push = run(f"git push -u origin main --force", cwd=DEPLOY_DIR)
    
    if push.returncode == 0:
        print(f"\nDeployed {len(sites)} sites!")
        print(f"Root: https://{GITHUB_USER}.github.io/{REPO_NAME}/")
        for slug in sites:
            print(f"  - https://{GITHUB_USER}.github.io/{REPO_NAME}/{slug}/")
        
        # Enable GitHub Pages if not already
        run(f'gh api repos/{GITHUB_USER}/{REPO_NAME}/pages -X POST -f "source[branch]=main" -f "source[path]=/" 2>/dev/null')
    else:
        print("Push failed. Check git auth.")

if __name__ == "__main__":
    main()

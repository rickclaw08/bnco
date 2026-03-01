#!/usr/bin/env python3
"""
ClawOps Automation Demo: Before vs After
A visual demonstration of automating a repetitive data entry task.

This script shows:
- BEFORE: Manual, slow, error-prone data entry (simulated)
- AFTER: Automated, fast, accurate processing

Perfect for screen recording to show prospects the power of automation.
"""

import time
import sys
from datetime import datetime
import random

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'

def print_header(text):
    """Print a styled header."""
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'=' * 60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text.center(60)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'=' * 60}{Colors.END}\n")

def slow_type(text, delay=0.05):
    """Simulate slow typing for effect."""
    for char in text:
        sys.stdout.write(char)
        sys.stdout.flush()
        time.sleep(delay)
    print()

def demo_before():
    """Simulate the BEFORE state: manual, slow data entry."""
    print_header("BEFORE: Manual Data Entry")
    
    print(f"{Colors.YELLOW}Task: Process 20 customer invoices{Colors.END}")
    print(f"{Colors.YELLOW}Method: Manual copy-paste from email to spreadsheet{Colors.END}\n")
    
    time.sleep(1)
    
    # Simulate manual processing
    invoices = [
        {"id": f"INV-{1000 + i}", "amount": random.randint(100, 5000), "customer": f"Customer {i+1}"}
        for i in range(20)
    ]
    
    start_time = time.time()
    
    for i, invoice in enumerate(invoices, 1):
        print(f"{Colors.RED}[Manual Entry {i}/20]{Colors.END} ", end="")
        
        # Simulate slow manual work with typing
        slow_type(f"Opening email... finding invoice {invoice['id']}...", delay=0.03)
        time.sleep(random.uniform(0.5, 1.2))
        
        print(f"  Copying customer: {invoice['customer']}")
        time.sleep(random.uniform(0.3, 0.8))
        
        print(f"  Copying amount: ${invoice['amount']}")
        time.sleep(random.uniform(0.3, 0.8))
        
        print(f"  Pasting to spreadsheet...")
        time.sleep(random.uniform(0.4, 1.0))
        
        # Simulate occasional typo
        if random.random() < 0.15:
            print(f"  {Colors.RED}Oops! Typo detected. Fixing...{Colors.END}")
            time.sleep(random.uniform(0.5, 1.0))
        
        print(f"  {Colors.GREEN}✓ Entry complete{Colors.END}\n")
        time.sleep(0.3)
    
    elapsed_time = time.time() - start_time
    
    print(f"\n{Colors.BOLD}{Colors.RED}Total Time: {elapsed_time:.1f} seconds (~{elapsed_time/60:.1f} minutes){Colors.END}")
    print(f"{Colors.RED}Human effort required: HIGH{Colors.END}")
    print(f"{Colors.RED}Error rate: ~15%{Colors.END}")
    print(f"{Colors.RED}Employee satisfaction: LOW (repetitive, boring){Colors.END}")

def demo_after():
    """Simulate the AFTER state: automated, fast processing."""
    print_header("AFTER: Automated Processing with ClawOps")
    
    print(f"{Colors.CYAN}Task: Process 20 customer invoices{Colors.END}")
    print(f"{Colors.CYAN}Method: Automated extraction and data entry{Colors.END}\n")
    
    time.sleep(1)
    
    print(f"{Colors.BOLD}🤖 Initializing automation agent...{Colors.END}")
    time.sleep(0.8)
    print(f"{Colors.GREEN}✓ Agent ready{Colors.END}\n")
    
    time.sleep(0.5)
    
    # Simulate automated processing
    invoices = [
        {"id": f"INV-{1000 + i}", "amount": random.randint(100, 5000), "customer": f"Customer {i+1}"}
        for i in range(20)
    ]
    
    start_time = time.time()
    
    print(f"{Colors.CYAN}[Automation Running]{Colors.END} Processing all invoices...")
    print()
    
    for i, invoice in enumerate(invoices, 1):
        # Show progress bar
        progress = i / len(invoices)
        bar_length = 40
        filled = int(bar_length * progress)
        bar = '█' * filled + '░' * (bar_length - filled)
        
        sys.stdout.write(f"\r{Colors.CYAN}Progress: [{bar}] {i}/{len(invoices)} ({progress*100:.0f}%){Colors.END}")
        sys.stdout.flush()
        
        time.sleep(0.15)  # Much faster than manual
    
    print("\n")
    
    elapsed_time = time.time() - start_time
    
    # Show results
    print(f"{Colors.GREEN}✓ Email parsing complete{Colors.END}")
    print(f"{Colors.GREEN}✓ Data validation complete{Colors.END}")
    print(f"{Colors.GREEN}✓ Spreadsheet updated{Colors.END}")
    print(f"{Colors.GREEN}✓ Confirmation emails sent{Colors.END}")
    
    print(f"\n{Colors.BOLD}{Colors.GREEN}Total Time: {elapsed_time:.1f} seconds{Colors.END}")
    print(f"{Colors.GREEN}Human effort required: ZERO (runs in background){Colors.END}")
    print(f"{Colors.GREEN}Error rate: 0%{Colors.END}")
    print(f"{Colors.GREEN}Employee satisfaction: HIGH (no boring work){Colors.END}")

def show_comparison():
    """Show side-by-side comparison."""
    print_header("ROI Analysis")
    
    print(f"{Colors.BOLD}Time Savings:{Colors.END}")
    print(f"  Manual: ~8-12 minutes per batch")
    print(f"  Automated: ~3 seconds per batch")
    print(f"  {Colors.GREEN}➜ 99.5% time reduction{Colors.END}\n")
    
    print(f"{Colors.BOLD}Cost Savings (assuming $50/hr labor):{Colors.END}")
    print(f"  Manual (5 batches/day × 10 min × 250 days): ~208 hours/year")
    print(f"  Annual cost: $10,400")
    print(f"  {Colors.GREEN}➜ Recover your time for strategic work{Colors.END}\n")
    
    print(f"{Colors.BOLD}Additional Benefits:{Colors.END}")
    print(f"  {Colors.GREEN}✓{Colors.END} Eliminates human error")
    print(f"  {Colors.GREEN}✓{Colors.END} Runs 24/7, never takes breaks")
    print(f"  {Colors.GREEN}✓{Colors.END} Frees employees for higher-value work")
    print(f"  {Colors.GREEN}✓{Colors.END} Scales instantly without hiring\n")
    
    print(f"{Colors.BOLD}{Colors.CYAN}Ready to automate your workflows?{Colors.END}")
    print(f"{Colors.CYAN}Contact: agentclaw08@icloud.com{Colors.END}")
    print(f"{Colors.CYAN}Website: theclawops.com{Colors.END}")

def main():
    """Run the complete demo."""
    print(f"\n{Colors.BOLD}{Colors.HEADER}")
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║         ClawOps Automation Demo: Before vs After          ║")
    print("║                                                           ║")
    print("║  Scenario: Processing customer invoices from email       ║")
    print("╚═══════════════════════════════════════════════════════════╝")
    print(f"{Colors.END}\n")
    
    time.sleep(2)
    
    # Show BEFORE
    demo_before()
    
    input(f"\n{Colors.YELLOW}Press ENTER to see the automated solution...{Colors.END}")
    
    # Show AFTER
    demo_after()
    
    time.sleep(2)
    
    # Show comparison
    show_comparison()
    
    print(f"\n{Colors.BOLD}Demo complete!{Colors.END}")
    print(f"{Colors.CYAN}This was a simplified simulation. Real automation includes:{Colors.END}")
    print(f"  • Email monitoring and parsing")
    print(f"  • OCR for PDF invoices")
    print(f"  • Smart data validation")
    print(f"  • Multi-system integration")
    print(f"  • Error handling and notifications")
    print(f"  • Audit trails and reporting\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Demo interrupted. Thanks for watching!{Colors.END}\n")
        sys.exit(0)

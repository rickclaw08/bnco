#!/usr/bin/env python3
"""
ClawOps Email Automation Demo
------------------------------
Demonstrates AI-powered email inbox automation:
- Categorize emails by type
- Generate summaries
- Draft intelligent replies

Usage: python email-automation-demo.py
"""

import json
import random
from datetime import datetime, timedelta
from typing import List, Dict
from colorama import Fore, Back, Style, init

# Initialize colorama for cross-platform colored terminal output
init(autoreset=True)


class EmailAutomationDemo:
    """Demo showcasing email automation capabilities"""
    
    # Sample email templates for demo
    SAMPLE_EMAILS = [
        {
            "from": "sarah.johnson@techstartup.io",
            "subject": "Partnership Opportunity - AI Integration",
            "body": "Hi, I came across ClawOps and I'm impressed with your automation work. We're a Series A startup looking to integrate AI into our customer service workflow. Would love to discuss how you could help us automate our support inbox and routing system. Are you available for a call next week?",
            "received": "2 hours ago"
        },
        {
            "from": "billing@cloudservices.com",
            "subject": "Invoice #4521 - Payment Due",
            "body": "Your monthly invoice for Cloud Services is now available. Amount due: $299.00. Payment is due by March 1st, 2026. Please remit payment to avoid service interruption.",
            "received": "5 hours ago"
        },
        {
            "from": "newsletter@marketingweekly.com",
            "subject": "Top 10 Marketing Trends for 2026",
            "body": "Check out our latest insights on marketing automation, AI-driven campaigns, and customer personalization strategies that are reshaping the industry this year.",
            "received": "1 day ago"
        },
        {
            "from": "john.martinez@enterprise-corp.com",
            "subject": "Urgent: API Integration Issue",
            "body": "Our production API integration stopped working this morning. We're getting 500 errors on all automation endpoints. This is blocking our entire operations team. Can someone from your team jump on a call ASAP?",
            "received": "30 minutes ago"
        },
        {
            "from": "recruiter@techtalent.io",
            "subject": "Senior AI Engineer Position",
            "body": "We're recruiting for a Senior AI Engineer role at a well-funded startup in SF. Compensation is $200k-$250k plus equity. Would you be interested or know anyone in your network?",
            "received": "3 hours ago"
        },
        {
            "from": "jessica.chen@retailchain.com",
            "subject": "Re: Automation Proposal - Follow Up",
            "body": "Thanks for sending over the proposal last week. Our team reviewed it and we have a few questions about the implementation timeline and the data migration process. Can we schedule a call to discuss?",
            "received": "6 hours ago"
        }
    ]
    
    CATEGORIES = {
        "URGENT": {"color": Fore.RED, "priority": "HIGH"},
        "SALES_LEAD": {"color": Fore.GREEN, "priority": "HIGH"},
        "BILLING": {"color": Fore.YELLOW, "priority": "MEDIUM"},
        "NEWSLETTER": {"color": Fore.CYAN, "priority": "LOW"},
        "RECRUITMENT": {"color": Fore.MAGENTA, "priority": "LOW"},
        "FOLLOW_UP": {"color": Fore.BLUE, "priority": "MEDIUM"}
    }
    
    def __init__(self):
        self.processed_emails = []
    
    def print_header(self, text: str):
        """Print a styled header"""
        print("\n" + "="*70)
        print(f"{Fore.CYAN}{Style.BRIGHT}{text:^70}")
        print("="*70 + "\n")
    
    def print_section(self, text: str):
        """Print a section divider"""
        print(f"\n{Fore.YELLOW}{Style.BRIGHT}>>> {text}")
        print("-" * 70)
    
    def categorize_email(self, email: Dict) -> str:
        """Categorize email based on content (simplified ML simulation)"""
        subject_lower = email['subject'].lower()
        body_lower = email['body'].lower()
        
        # Simple keyword-based categorization (in production, use actual ML)
        if any(word in subject_lower or word in body_lower for word in ['urgent', 'asap', 'critical', 'issue', 'error']):
            return "URGENT"
        elif any(word in subject_lower or word in body_lower for word in ['partnership', 'opportunity', 'interested in', 'looking to']):
            return "SALES_LEAD"
        elif any(word in subject_lower for word in ['invoice', 'payment', 'billing']):
            return "BILLING"
        elif any(word in subject_lower or word in body_lower for word in ['newsletter', 'insights', 'trends']):
            return "NEWSLETTER"
        elif any(word in subject_lower or word in body_lower for word in ['recruiting', 'position', 'role', 'hiring']):
            return "RECRUITMENT"
        elif subject_lower.startswith('re:') or 'follow up' in subject_lower:
            return "FOLLOW_UP"
        else:
            return "FOLLOW_UP"
    
    def generate_summary(self, email: Dict) -> str:
        """Generate a concise email summary"""
        body = email['body']
        # Simple summary: first sentence or first 100 chars
        sentences = body.split('.')
        if sentences:
            return sentences[0].strip() + "."
        return body[:100] + "..."
    
    def draft_reply(self, email: Dict, category: str) -> str:
        """Generate a draft reply based on email category"""
        sender_name = email['from'].split('@')[0].replace('.', ' ').title()
        
        replies = {
            "URGENT": f"Hi {sender_name},\n\nI've received your urgent request and I'm escalating this to our technical team immediately. Someone will reach out within the next hour to address the API integration issue.\n\nBest regards,\nClawOps Support Team",
            
            "SALES_LEAD": f"Hi {sender_name},\n\nThank you for reaching out! We'd love to discuss how ClawOps can help automate your workflows. I have availability next Tuesday or Wednesday afternoon for a discovery call.\n\nCould you share a bit more about your current pain points? This will help us prepare a tailored solution.\n\nLooking forward to connecting!\n\nBest,\nEthan - CTO, ClawOps",
            
            "BILLING": f"Hi,\n\nThank you for the invoice. Payment will be processed before the due date.\n\nBest regards,\nClawOps Finance Team",
            
            "NEWSLETTER": "[Auto-archived - No reply needed]",
            
            "RECRUITMENT": f"Hi {sender_name},\n\nThank you for thinking of us. We're not actively looking right now, but I'll keep this in mind and pass it along to our network.\n\nBest,\nClawOps Team",
            
            "FOLLOW_UP": f"Hi {sender_name},\n\nThanks for following up! I'd be happy to discuss your questions about the proposal. How about a call this Thursday at 2pm EST?\n\nI'll send over a calendar invite.\n\nBest,\nEthan"
        }
        
        return replies.get(category, "Thank you for your email. We'll review and get back to you shortly.")
    
    def process_email(self, email: Dict, index: int):
        """Process a single email through the automation pipeline"""
        print(f"{Fore.WHITE}{Style.BRIGHT}Email #{index + 1}")
        print(f"{Fore.WHITE}From: {email['from']}")
        print(f"{Fore.WHITE}Subject: {email['subject']}")
        print(f"{Fore.WHITE}Received: {email['received']}")
        
        # Simulate processing delay
        print(f"\n{Fore.CYAN}[Processing...]", end="", flush=True)
        import time
        time.sleep(0.5)
        print(" Done!")
        
        # Categorize
        category = self.categorize_email(email)
        category_info = self.CATEGORIES[category]
        print(f"\n{category_info['color']}{Style.BRIGHT}Category: {category}")
        print(f"{category_info['color']}Priority: {category_info['priority']}")
        
        # Summarize
        summary = self.generate_summary(email)
        print(f"\n{Fore.WHITE}Summary: {Fore.LIGHTYELLOW_EX}{summary}")
        
        # Draft reply
        draft = self.draft_reply(email, category)
        print(f"\n{Fore.WHITE}Draft Reply:")
        print(f"{Fore.LIGHTGREEN_EX}{draft}")
        
        # Store result
        self.processed_emails.append({
            "email": email,
            "category": category,
            "priority": category_info['priority'],
            "summary": summary,
            "draft_reply": draft
        })
        
        print("\n" + "="*70)
    
    def display_statistics(self):
        """Display processing statistics"""
        self.print_section("AUTOMATION STATISTICS")
        
        total = len(self.processed_emails)
        print(f"{Fore.WHITE}Total Emails Processed: {Fore.CYAN}{Style.BRIGHT}{total}")
        
        # Category breakdown
        category_counts = {}
        for item in self.processed_emails:
            cat = item['category']
            category_counts[cat] = category_counts.get(cat, 0) + 1
        
        print(f"\n{Fore.WHITE}Breakdown by Category:")
        for category, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
            color = self.CATEGORIES[category]['color']
            percentage = (count / total) * 100
            print(f"  {color}{category}: {count} ({percentage:.1f}%)")
        
        # Priority breakdown
        priority_counts = {"HIGH": 0, "MEDIUM": 0, "LOW": 0}
        for item in self.processed_emails:
            priority_counts[item['priority']] += 1
        
        print(f"\n{Fore.WHITE}Breakdown by Priority:")
        for priority, count in priority_counts.items():
            if priority == "HIGH":
                color = Fore.RED
            elif priority == "MEDIUM":
                color = Fore.YELLOW
            else:
                color = Fore.GREEN
            percentage = (count / total) * 100
            print(f"  {color}{priority}: {count} ({percentage:.1f}%)")
        
        # Time saved estimate
        time_saved = total * 3  # Assume 3 minutes saved per email
        print(f"\n{Fore.GREEN}{Style.BRIGHT}Estimated Time Saved: {time_saved} minutes ({time_saved/60:.1f} hours)")
    
    def run_demo(self):
        """Run the complete email automation demo"""
        self.print_header("ClawOps Email Automation Demo")
        
        print(f"{Fore.WHITE}Demonstrating AI-powered email processing:")
        print(f"{Fore.WHITE}- Intelligent categorization")
        print(f"{Fore.WHITE}- Automatic summarization")
        print(f"{Fore.WHITE}- Smart reply drafting")
        
        self.print_section(f"Processing {len(self.SAMPLE_EMAILS)} Emails")
        
        for index, email in enumerate(self.SAMPLE_EMAILS):
            self.process_email(email, index)
            if index < len(self.SAMPLE_EMAILS) - 1:
                import time
                time.sleep(0.3)
        
        self.display_statistics()
        
        print(f"\n{Fore.GREEN}{Style.BRIGHT}Demo Complete!")
        print(f"{Fore.WHITE}This is a simplified demonstration of ClawOps' email automation capabilities.")
        print(f"{Fore.WHITE}Production systems include: ML-based classification, sentiment analysis,")
        print(f"{Fore.WHITE}CRM integration, custom workflows, and much more.")
        print(f"\n{Fore.CYAN}Contact us: https://rickclaw08.github.io/claw-systems/")


def main():
    """Main entry point"""
    demo = EmailAutomationDemo()
    demo.run_demo()


if __name__ == "__main__":
    main()

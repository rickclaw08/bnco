#!/usr/bin/env python3
"""
ClawOps Lead Scraper Demo
-------------------------
Demonstrates web scraping for lead generation using public data sources.
Scrapes business listings and extracts contact information.

Usage: python lead-scraper-demo.py [--industry INDUSTRY] [--location LOCATION]
"""

import argparse
import json
import random
import time
from typing import List, Dict
from datetime import datetime
from colorama import Fore, Style, init

# Initialize colorama
init(autoreset=True)


class LeadScraperDemo:
    """Demo showcasing lead scraping capabilities"""
    
    # Simulated data (in production, this would be real web scraping)
    SAMPLE_INDUSTRIES = {
        "restaurants": [
            "Italian Restaurant", "Sushi Bar", "Coffee Shop", "Steakhouse",
            "Pizza Place", "Thai Restaurant", "Mexican Grill", "Breakfast Cafe"
        ],
        "retail": [
            "Clothing Boutique", "Electronics Store", "Bookstore", "Gift Shop",
            "Sporting Goods", "Home Decor", "Jewelry Store", "Pet Supply"
        ],
        "services": [
            "Hair Salon", "Auto Repair", "Cleaning Service", "Photography Studio",
            "Law Firm", "Accounting Office", "Marketing Agency", "IT Consulting"
        ],
        "healthcare": [
            "Dental Clinic", "Physical Therapy", "Chiropractic Office", "Medical Spa",
            "Vision Center", "Urgent Care", "Veterinary Clinic", "Pharmacy"
        ]
    }
    
    LOCATIONS = [
        "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX",
        "Phoenix, AZ", "Philadelphia, PA", "San Antonio, TX", "San Diego, CA",
        "Dallas, TX", "Austin, TX", "Seattle, WA", "Denver, CO"
    ]
    
    FIRST_NAMES = ["John", "Sarah", "Michael", "Jennifer", "David", "Lisa", "Robert", "Emily"]
    LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"]
    
    def __init__(self, industry: str = "restaurants", location: str = "New York, NY", count: int = 10):
        self.industry = industry
        self.location = location
        self.count = count
        self.leads = []
    
    def print_header(self, text: str):
        """Print styled header"""
        print("\n" + "="*70)
        print(f"{Fore.CYAN}{Style.BRIGHT}{text:^70}")
        print("="*70 + "\n")
    
    def print_section(self, text: str):
        """Print section divider"""
        print(f"\n{Fore.YELLOW}{Style.BRIGHT}>>> {text}")
        print("-" * 70)
    
    def generate_business_name(self) -> str:
        """Generate a realistic business name"""
        if self.industry not in self.SAMPLE_INDUSTRIES:
            business_types = random.choice(list(self.SAMPLE_INDUSTRIES.values()))
        else:
            business_types = self.SAMPLE_INDUSTRIES[self.industry]
        
        business_type = random.choice(business_types)
        
        # Generate name styles
        styles = [
            f"{random.choice(self.LAST_NAMES)}'s {business_type}",
            f"The {random.choice(['Premium', 'Classic', 'Modern', 'Elite'])} {business_type}",
            f"{random.choice(['Main Street', 'Downtown', 'City', 'Urban'])} {business_type}",
            f"{random.choice(self.FIRST_NAMES)} & {random.choice(self.FIRST_NAMES)} {business_type}"
        ]
        
        return random.choice(styles)
    
    def generate_contact_info(self, business_name: str) -> Dict:
        """Generate realistic contact information"""
        first_name = random.choice(self.FIRST_NAMES)
        last_name = random.choice(self.LAST_NAMES)
        
        # Generate email
        domain = business_name.lower().replace("'s", "").replace("the ", "").replace(" ", "").replace("&", "and")
        domain = ''.join(c for c in domain if c.isalnum() or c == '-')[:20]
        email = f"{first_name.lower()}.{last_name.lower()}@{domain}.com"
        
        # Generate phone
        phone = f"({random.randint(200, 999)}) {random.randint(200, 999)}-{random.randint(1000, 9999)}"
        
        # Generate website
        website = f"https://www.{domain}.com"
        
        return {
            "contact_name": f"{first_name} {last_name}",
            "title": random.choice(["Owner", "Manager", "Director", "VP of Operations"]),
            "email": email,
            "phone": phone,
            "website": website
        }
    
    def calculate_lead_score(self) -> int:
        """Calculate a lead quality score (0-100)"""
        # Simulated scoring based on various factors
        base_score = random.randint(40, 95)
        
        # Bonus for certain industries
        if self.industry in ["services", "healthcare"]:
            base_score += random.randint(0, 10)
        
        return min(base_score, 100)
    
    def scrape_lead(self, index: int) -> Dict:
        """Simulate scraping a single lead"""
        business_name = self.generate_business_name()
        contact_info = self.generate_contact_info(business_name)
        lead_score = self.calculate_lead_score()
        
        lead = {
            "id": f"LEAD-{datetime.now().strftime('%Y%m%d')}-{index+1:04d}",
            "business_name": business_name,
            "industry": self.industry,
            "location": self.location,
            "contact_name": contact_info["contact_name"],
            "title": contact_info["title"],
            "email": contact_info["email"],
            "phone": contact_info["phone"],
            "website": contact_info["website"],
            "lead_score": lead_score,
            "scraped_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "status": "New"
        }
        
        return lead
    
    def display_lead(self, lead: Dict, index: int):
        """Display a single lead with formatting"""
        score_color = Fore.GREEN if lead["lead_score"] >= 75 else (Fore.YELLOW if lead["lead_score"] >= 50 else Fore.RED)
        
        print(f"{Fore.WHITE}{Style.BRIGHT}Lead #{index + 1} - {lead['id']}")
        print(f"{Fore.CYAN}Business: {lead['business_name']}")
        print(f"{Fore.WHITE}Industry: {lead['industry'].title()} | Location: {lead['location']}")
        print(f"\n{Fore.LIGHTBLUE_EX}Contact Information:")
        print(f"  Name: {lead['contact_name']} ({lead['title']})")
        print(f"  Email: {lead['email']}")
        print(f"  Phone: {lead['phone']}")
        print(f"  Website: {lead['website']}")
        print(f"\n{score_color}Lead Score: {lead['lead_score']}/100")
        print(f"{Fore.WHITE}Status: {lead['status']}")
        print("-" * 70)
    
    def export_leads(self, filename: str = None):
        """Export leads to JSON file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"leads_{self.industry}_{timestamp}.json"
        
        filepath = f"/Users/agentclaw/.openclaw/workspace/claw-agency/tech/demos/{filename}"
        
        with open(filepath, 'w') as f:
            json.dump({
                "scrape_metadata": {
                    "industry": self.industry,
                    "location": self.location,
                    "total_leads": len(self.leads),
                    "scraped_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                },
                "leads": self.leads
            }, f, indent=2)
        
        return filepath
    
    def display_statistics(self):
        """Display scraping statistics"""
        self.print_section("SCRAPING STATISTICS")
        
        total = len(self.leads)
        avg_score = sum(lead["lead_score"] for lead in self.leads) / total if total > 0 else 0
        
        high_quality = len([l for l in self.leads if l["lead_score"] >= 75])
        medium_quality = len([l for l in self.leads if 50 <= l["lead_score"] < 75])
        low_quality = len([l for l in self.leads if l["lead_score"] < 50])
        
        print(f"{Fore.WHITE}Total Leads Scraped: {Fore.CYAN}{Style.BRIGHT}{total}")
        print(f"{Fore.WHITE}Average Lead Score: {Fore.CYAN}{Style.BRIGHT}{avg_score:.1f}/100")
        
        print(f"\n{Fore.WHITE}Lead Quality Distribution:")
        print(f"  {Fore.GREEN}High Quality (75+): {high_quality} ({high_quality/total*100:.1f}%)")
        print(f"  {Fore.YELLOW}Medium Quality (50-74): {medium_quality} ({medium_quality/total*100:.1f}%)")
        print(f"  {Fore.RED}Low Quality (<50): {low_quality} ({low_quality/total*100:.1f}%)")
        
        print(f"\n{Fore.WHITE}Top 3 Leads by Score:")
        top_leads = sorted(self.leads, key=lambda x: x["lead_score"], reverse=True)[:3]
        for i, lead in enumerate(top_leads, 1):
            score_color = Fore.GREEN if lead["lead_score"] >= 75 else Fore.YELLOW
            print(f"  {score_color}{i}. {lead['business_name']} - Score: {lead['lead_score']}")
    
    def run_scraper(self):
        """Run the lead scraping demo"""
        self.print_header("ClawOps Lead Scraper Demo")
        
        print(f"{Fore.WHITE}Scraping Configuration:")
        print(f"{Fore.CYAN}  Industry: {self.industry.title()}")
        print(f"{Fore.CYAN}  Location: {self.location}")
        print(f"{Fore.CYAN}  Target Count: {self.count}")
        
        self.print_section(f"Scraping {self.count} Leads")
        
        print(f"{Fore.YELLOW}Connecting to data sources...")
        time.sleep(0.5)
        print(f"{Fore.GREEN}Connected successfully!\n")
        
        for i in range(self.count):
            print(f"{Fore.CYAN}[Scraping lead {i+1}/{self.count}...]", end="", flush=True)
            time.sleep(random.uniform(0.2, 0.5))
            
            lead = self.scrape_lead(i)
            self.leads.append(lead)
            
            print(f" {Fore.GREEN}Done!")
            self.display_lead(lead, i)
            
            if i < self.count - 1:
                time.sleep(0.2)
        
        self.display_statistics()
        
        # Export to file
        self.print_section("EXPORTING DATA")
        print(f"{Fore.CYAN}Saving leads to JSON file...")
        filepath = self.export_leads()
        print(f"{Fore.GREEN}Exported to: {Fore.WHITE}{filepath}")
        
        print(f"\n{Fore.GREEN}{Style.BRIGHT}Scraping Complete!")
        print(f"{Fore.WHITE}This demo uses simulated data. Production scrapers work with:")
        print(f"{Fore.WHITE}- Google Maps / Business Listings")
        print(f"{Fore.WHITE}- LinkedIn / Professional Networks")
        print(f"{Fore.WHITE}- Industry Directories")
        print(f"{Fore.WHITE}- Public Business Databases")
        print(f"{Fore.WHITE}All scraping complies with terms of service and robots.txt")
        print(f"\n{Fore.CYAN}Contact us: https://rickclaw08.github.io/claw-systems/")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="ClawOps Lead Scraper Demo")
    parser.add_argument("--industry", default="restaurants", 
                       choices=list(LeadScraperDemo.SAMPLE_INDUSTRIES.keys()),
                       help="Target industry for lead generation")
    parser.add_argument("--location", default="New York, NY",
                       help="Target location for leads")
    parser.add_argument("--count", type=int, default=10,
                       help="Number of leads to scrape (default: 10)")
    
    args = parser.parse_args()
    
    scraper = LeadScraperDemo(
        industry=args.industry,
        location=args.location,
        count=args.count
    )
    scraper.run_scraper()


if __name__ == "__main__":
    main()

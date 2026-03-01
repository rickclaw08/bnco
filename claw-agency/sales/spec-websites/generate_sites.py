#!/usr/bin/env python3
"""
Spec Website Generator for ClawOps
Reads prospect data and generates custom websites from the base template.
Each site gets deployed to GitHub Pages as a subdirectory.
"""

import json
import os
import sys
import re

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "base-template.html")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "generated")

# Niche-specific configurations
NICHE_CONFIGS = {
    "roofing": {
        "primary_color": "#dc2626",
        "primary_dark": "#b91c1c",
        "accent_color": "#f97316",
        "services_title": "Our Roofing Services",
        "services_subtitle": "Professional roofing solutions backed by years of experience",
        "default_services": [
            {"icon": "🏠", "title": "Residential Roofing", "desc": "Complete roof replacement, repairs, and new installations for homes of all sizes."},
            {"icon": "🏢", "title": "Commercial Roofing", "desc": "Flat roofs, metal roofing, and TPO systems for commercial properties."},
            {"icon": "🔧", "title": "Roof Repair", "desc": "Emergency leak repairs, storm damage restoration, and preventive maintenance."},
            {"icon": "🛡️", "title": "Roof Inspections", "desc": "Comprehensive inspections with detailed reports and honest recommendations."},
            {"icon": "💨", "title": "Storm Damage", "desc": "Insurance claim assistance and rapid response for weather-related damage."},
            {"icon": "🌿", "title": "Gutter Systems", "desc": "Seamless gutter installation, guards, and downspout solutions."},
        ],
        "why_items": [
            {"title": "Licensed & Insured", "desc": "Fully licensed, bonded, and insured for your peace of mind."},
            {"title": "Free Estimates", "desc": "No-obligation inspections and transparent, upfront pricing."},
            {"title": "Warranty Protection", "desc": "Industry-leading warranties on materials and workmanship."},
            {"title": "Local Experts", "desc": "We know your area's weather patterns and building codes."},
        ],
        "hero_badge": "Trusted Local Roofers",
        "cta_text": "Get a Free Estimate",
        "secondary_cta": "View Our Work",
    },
    "dental": {
        "primary_color": "#0ea5e9",
        "primary_dark": "#0284c7",
        "accent_color": "#06b6d4",
        "services_title": "Our Dental Services",
        "services_subtitle": "Comprehensive dental care for the whole family",
        "default_services": [
            {"icon": "😁", "title": "General Dentistry", "desc": "Cleanings, exams, fillings, and preventive care to keep your smile healthy."},
            {"icon": "✨", "title": "Cosmetic Dentistry", "desc": "Veneers, whitening, bonding, and smile makeovers that transform your confidence."},
            {"icon": "🦷", "title": "Dental Implants", "desc": "Permanent tooth replacement that looks, feels, and functions like natural teeth."},
            {"icon": "😬", "title": "Orthodontics", "desc": "Invisalign and clear aligners for straighter teeth without traditional braces."},
            {"icon": "🏥", "title": "Emergency Care", "desc": "Same-day appointments for dental emergencies when you need us most."},
            {"icon": "👶", "title": "Pediatric Dentistry", "desc": "Gentle, kid-friendly dental care in a comfortable environment."},
        ],
        "why_items": [
            {"title": "Modern Technology", "desc": "Digital X-rays, 3D imaging, and laser dentistry for precise, comfortable care."},
            {"title": "Flexible Financing", "desc": "Insurance accepted, payment plans available, and transparent pricing."},
            {"title": "Experienced Team", "desc": "Skilled professionals with advanced training and a gentle approach."},
            {"title": "Patient Comfort", "desc": "Sedation options, warm blankets, and a relaxing office atmosphere."},
        ],
        "hero_badge": "Your Smile Experts",
        "cta_text": "Book an Appointment",
        "secondary_cta": "Meet Our Team",
    },
    "law_firm": {
        "primary_color": "#1e40af",
        "primary_dark": "#1e3a8a",
        "accent_color": "#6366f1",
        "services_title": "Practice Areas",
        "services_subtitle": "Experienced legal representation when it matters most",
        "default_services": [
            {"icon": "⚖️", "title": "Personal Injury", "desc": "Aggressive representation for car accidents, slip and falls, and workplace injuries."},
            {"icon": "👨‍👩‍👧", "title": "Family Law", "desc": "Divorce, custody, support, and adoption handled with care and discretion."},
            {"icon": "🏛️", "title": "Criminal Defense", "desc": "Protecting your rights and freedom with strategic, experienced defense."},
            {"icon": "💼", "title": "Business Law", "desc": "Contracts, disputes, formation, and compliance for growing businesses."},
            {"icon": "🏠", "title": "Real Estate Law", "desc": "Closings, title issues, disputes, and commercial transactions."},
            {"icon": "📋", "title": "Estate Planning", "desc": "Wills, trusts, powers of attorney, and probate administration."},
        ],
        "why_items": [
            {"title": "No Fee Unless We Win", "desc": "Contingency fee arrangements for personal injury cases."},
            {"title": "Free Consultations", "desc": "Discuss your case at no cost with an experienced attorney."},
            {"title": "Proven Track Record", "desc": "Millions recovered for clients across hundreds of cases."},
            {"title": "Personal Attention", "desc": "Direct access to your attorney, not just a paralegal."},
        ],
        "hero_badge": "Experienced Attorneys",
        "cta_text": "Free Consultation",
        "secondary_cta": "Our Practice Areas",
    },
    "hvac": {
        "primary_color": "#059669",
        "primary_dark": "#047857",
        "accent_color": "#0ea5e9",
        "services_title": "HVAC Services",
        "services_subtitle": "Keeping your home comfortable year-round",
        "default_services": [
            {"icon": "❄️", "title": "AC Installation", "desc": "Energy-efficient cooling systems sized perfectly for your home."},
            {"icon": "🔥", "title": "Heating Systems", "desc": "Furnaces, heat pumps, and boilers installed and maintained by experts."},
            {"icon": "🔧", "title": "Repairs", "desc": "Fast, reliable repairs for all makes and models with upfront pricing."},
            {"icon": "🔄", "title": "Maintenance Plans", "desc": "Preventive maintenance that extends equipment life and saves money."},
            {"icon": "🌬️", "title": "Air Quality", "desc": "Filtration, purifiers, humidifiers, and duct cleaning for healthier air."},
            {"icon": "🏠", "title": "Duct Work", "desc": "Design, installation, sealing, and insulation for optimal airflow."},
        ],
        "why_items": [
            {"title": "24/7 Emergency Service", "desc": "Your comfort cannot wait. We respond any time, day or night."},
            {"title": "Upfront Pricing", "desc": "No hidden fees. Know the cost before any work begins."},
            {"title": "Licensed Technicians", "desc": "NATE-certified techs with ongoing training and background checks."},
            {"title": "Satisfaction Guaranteed", "desc": "100% satisfaction guarantee on every job we complete."},
        ],
        "hero_badge": "Your Comfort Experts",
        "cta_text": "Schedule Service",
        "secondary_cta": "View Our Services",
    },
    "medspa": {
        "primary_color": "#a855f7",
        "primary_dark": "#9333ea",
        "accent_color": "#ec4899",
        "services_title": "Our Treatments",
        "services_subtitle": "Advanced aesthetics in a luxurious, relaxing environment",
        "default_services": [
            {"icon": "💉", "title": "Botox & Fillers", "desc": "Smooth wrinkles and restore volume with expert injectable treatments."},
            {"icon": "✨", "title": "Laser Treatments", "desc": "Skin resurfacing, hair removal, and pigmentation correction."},
            {"icon": "🧖", "title": "Facials & Peels", "desc": "Medical-grade facials, chemical peels, and microneedling."},
            {"icon": "💎", "title": "Body Contouring", "desc": "Non-invasive fat reduction and skin tightening treatments."},
            {"icon": "🌟", "title": "Skin Rejuvenation", "desc": "PRP therapy, microdermabrasion, and advanced anti-aging protocols."},
            {"icon": "💆", "title": "Wellness", "desc": "IV therapy, hormone optimization, and holistic wellness programs."},
        ],
        "why_items": [
            {"title": "Board-Certified Providers", "desc": "Treatments performed by licensed medical professionals."},
            {"title": "Custom Treatment Plans", "desc": "Personalized protocols tailored to your unique goals."},
            {"title": "Premium Products", "desc": "Only FDA-approved products and medical-grade equipment."},
            {"title": "Luxury Experience", "desc": "Spa-like atmosphere with concierge-level service."},
        ],
        "hero_badge": "Aesthetic Excellence",
        "cta_text": "Book a Consultation",
        "secondary_cta": "View Treatments",
    },
    "remodeling": {
        "primary_color": "#d97706",
        "primary_dark": "#b45309",
        "accent_color": "#ea580c",
        "services_title": "Our Services",
        "services_subtitle": "Quality craftsmanship that transforms your home",
        "default_services": [
            {"icon": "🍳", "title": "Kitchen Remodeling", "desc": "Custom kitchens designed for your lifestyle with premium materials."},
            {"icon": "🛁", "title": "Bathroom Renovation", "desc": "Luxury bathrooms from concept to completion, on time and on budget."},
            {"icon": "🏠", "title": "Whole Home Remodel", "desc": "Complete home transformations that increase value and livability."},
            {"icon": "🏗️", "title": "Additions", "desc": "Room additions and expansions that blend seamlessly with your home."},
            {"icon": "🪵", "title": "Flooring", "desc": "Hardwood, tile, luxury vinyl, and custom flooring installations."},
            {"icon": "🎨", "title": "Interior Design", "desc": "Professional design services to bring your vision to life."},
        ],
        "why_items": [
            {"title": "Fixed-Price Contracts", "desc": "No surprises. The price we quote is the price you pay."},
            {"title": "Licensed & Insured", "desc": "Full licensing, bonding, and liability coverage."},
            {"title": "Project Management", "desc": "Dedicated project manager and real-time updates on progress."},
            {"title": "Quality Materials", "desc": "Premium brands and materials backed by manufacturer warranties."},
        ],
        "hero_badge": "Quality Remodeling",
        "cta_text": "Get a Free Quote",
        "secondary_cta": "See Our Projects",
    },
    "chiropractic": {
        "primary_color": "#16a34a",
        "primary_dark": "#15803d",
        "accent_color": "#22d3ee",
        "services_title": "Our Services",
        "services_subtitle": "Natural, drug-free solutions for pain relief and wellness",
        "default_services": [
            {"icon": "🦴", "title": "Spinal Adjustments", "desc": "Gentle, precise adjustments to restore proper alignment and function."},
            {"icon": "💪", "title": "Sports Rehab", "desc": "Performance recovery and injury prevention for athletes of all levels."},
            {"icon": "🚗", "title": "Auto Injury Care", "desc": "Whiplash, back pain, and soft tissue injuries from car accidents."},
            {"icon": "🧘", "title": "Corrective Care", "desc": "Long-term treatment plans that address the root cause, not just symptoms."},
            {"icon": "⚡", "title": "Decompression", "desc": "Non-surgical spinal decompression for disc herniations and sciatica."},
            {"icon": "🏋️", "title": "Wellness Programs", "desc": "Ongoing care plans for optimal health, posture, and mobility."},
        ],
        "why_items": [
            {"title": "Same-Day Appointments", "desc": "Walk-ins welcome. Get relief when you need it, not weeks from now."},
            {"title": "Insurance Accepted", "desc": "We work with most major insurance plans and offer affordable cash rates."},
            {"title": "Experienced Doctor", "desc": "Advanced certifications and thousands of patients treated."},
            {"title": "Holistic Approach", "desc": "Treating the whole person, not just the symptoms."},
        ],
        "hero_badge": "Natural Pain Relief",
        "cta_text": "Book Your Visit",
        "secondary_cta": "Learn More",
    },
    "auto_body": {
        "primary_color": "#ef4444",
        "primary_dark": "#dc2626",
        "accent_color": "#f97316",
        "services_title": "Our Services",
        "services_subtitle": "Expert collision repair and auto body services",
        "default_services": [
            {"icon": "🚗", "title": "Collision Repair", "desc": "Full structural and body repair to pre-accident condition."},
            {"icon": "🎨", "title": "Paint & Refinish", "desc": "Computerized color matching and factory-quality paint finishes."},
            {"icon": "✨", "title": "Auto Detailing", "desc": "Interior and exterior detailing, ceramic coatings, and paint correction."},
            {"icon": "🔩", "title": "Dent Repair", "desc": "Paintless dent removal for hail damage and minor dents."},
            {"icon": "🛡️", "title": "Insurance Claims", "desc": "We handle the paperwork and work directly with your insurance."},
            {"icon": "🔧", "title": "Frame Straightening", "desc": "Precision frame and unibody repair with computerized measuring."},
        ],
        "why_items": [
            {"title": "Lifetime Warranty", "desc": "We stand behind our work with a lifetime warranty on all repairs."},
            {"title": "Free Estimates", "desc": "Quick, accurate estimates with no obligation."},
            {"title": "All Insurance Accepted", "desc": "We work with every insurance company and handle all claims."},
            {"title": "Certified Technicians", "desc": "I-CAR and ASE certified professionals using OEM parts."},
        ],
        "hero_badge": "Certified Auto Body Experts",
        "cta_text": "Get a Free Estimate",
        "secondary_cta": "See Our Work",
    },
    "real_estate": {
        "primary_color": "#0f766e",
        "primary_dark": "#115e59",
        "accent_color": "#14b8a6",
        "services_title": "How We Help",
        "services_subtitle": "Full-service real estate for buyers and sellers",
        "default_services": [
            {"icon": "🏡", "title": "Home Buying", "desc": "Expert guidance from search to closing. We find your perfect home."},
            {"icon": "💰", "title": "Home Selling", "desc": "Strategic marketing, staging advice, and maximum value for your property."},
            {"icon": "📊", "title": "Market Analysis", "desc": "Data-driven pricing and market insights for informed decisions."},
            {"icon": "🏢", "title": "Investment Properties", "desc": "Identify profitable opportunities and build your real estate portfolio."},
            {"icon": "🔑", "title": "First-Time Buyers", "desc": "Patient, step-by-step guidance for navigating your first purchase."},
            {"icon": "📝", "title": "Relocation Services", "desc": "Seamless transitions for families and professionals moving to the area."},
        ],
        "why_items": [
            {"title": "Local Market Expert", "desc": "Deep knowledge of neighborhoods, schools, and market trends."},
            {"title": "Proven Results", "desc": "Hundreds of homes sold with top-dollar results for sellers."},
            {"title": "Client-First Approach", "desc": "Your goals drive every decision. No pressure, just guidance."},
            {"title": "Full-Service Support", "desc": "Financing, inspections, negotiations, and closing all coordinated."},
        ],
        "hero_badge": "Your Trusted Realtor",
        "cta_text": "Start Your Search",
        "secondary_cta": "View Listings",
    },
}


def generate_stats_html(stats):
    """Generate stats bar HTML from a list of {number, label} dicts."""
    items = []
    for s in stats:
        items.append(f'''            <div class="stat">
                <div class="stat-number">{s["number"]}</div>
                <div class="stat-label">{s["label"]}</div>
            </div>''')
    return "\n".join(items)


def generate_services_html(services):
    """Generate service cards HTML."""
    cards = []
    for s in services:
        cards.append(f'''                <div class="service-card">
                    <div class="service-icon">{s["icon"]}</div>
                    <h3>{s["title"]}</h3>
                    <p>{s["desc"]}</p>
                </div>''')
    return "\n".join(cards)


def generate_why_html(items):
    """Generate why-us items HTML."""
    parts = []
    for w in items:
        parts.append(f'''                <div class="why-item">
                    <h3>{w["title"]}</h3>
                    <p>{w["desc"]}</p>
                </div>''')
    return "\n".join(parts)


def generate_testimonials_html(testimonials):
    """Generate testimonial cards HTML."""
    cards = []
    for t in testimonials:
        initials = "".join([w[0].upper() for w in t.get("name", "A B").split()[:2]])
        cards.append(f'''                <div class="testimonial">
                    <div class="testimonial-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                    <p>"{t["quote"]}"</p>
                    <div class="testimonial-author">
                        <div class="testimonial-avatar">{initials}</div>
                        <div>
                            <div class="testimonial-name">{t["name"]}</div>
                            <div class="testimonial-role">{t.get("role", "Satisfied Client")}</div>
                        </div>
                    </div>
                </div>''')
    return "\n".join(cards)


def generate_nav_html(items):
    """Generate nav link items."""
    links = []
    for item in items:
        links.append(f'<li><a href="{item["href"]}">{item["label"]}</a></li>')
    return "\n                ".join(links)


def generate_footer_cols(columns):
    """Generate footer columns."""
    cols = []
    for col in columns:
        items = "\n".join([f'<li><a href="{i.get("href", "#")}">{i["label"]}</a></li>' for i in col["items"]])
        cols.append(f'''                <div class="footer-col">
                    <h4>{col["title"]}</h4>
                    <ul>{items}</ul>
                </div>''')
    return "\n".join(cols)


def generate_site(prospect):
    """Generate a complete website from prospect data."""
    niche = prospect.get("niche_key", "roofing")
    config = NICHE_CONFIGS.get(niche, NICHE_CONFIGS["roofing"])

    with open(TEMPLATE_PATH, "r") as f:
        html = f.read()

    # Basic replacements
    replacements = {
        "{{BUSINESS_NAME}}": prospect["name"],
        "{{TAGLINE}}": prospect.get("tagline", f"Professional {niche.replace('_', ' ').title()} Services"),
        "{{META_DESCRIPTION}}": prospect.get("meta_desc", f"{prospect['name']} - Professional {niche.replace('_', ' ')} services in {prospect.get('city', 'your area')}."),
        "{{PRIMARY_COLOR}}": config["primary_color"],
        "{{PRIMARY_DARK}}": config["primary_dark"],
        "{{ACCENT_COLOR}}": config["accent_color"],
        "{{LOGO_TEXT}}": prospect.get("logo_text", prospect["name"].split()[0] + '<span>' + (" ".join(prospect["name"].split()[1:]) or "") + '</span>'),
        "{{HERO_BADGE}}": prospect.get("hero_badge", config["hero_badge"]),
        "{{HERO_TITLE}}": prospect.get("hero_title", f'{prospect["name"].split()[0]} <span class="gradient">{" ".join(prospect["name"].split()[1:])}</span>'),
        "{{HERO_SUBTITLE}}": prospect.get("hero_subtitle", f"Trusted {niche.replace('_', ' ')} professionals serving {prospect.get('city', 'the local area')} and surrounding communities."),
        "{{CTA_TEXT}}": prospect.get("cta_text", config["cta_text"]),
        "{{SECONDARY_CTA}}": prospect.get("secondary_cta", config.get("secondary_cta", "Learn More")),
        "{{SERVICES_TITLE}}": config["services_title"],
        "{{SERVICES_SUBTITLE}}": config["services_subtitle"],
        "{{WHY_TITLE}}": prospect.get("why_title", f"Why Choose {prospect['name']}"),
        "{{WHY_SUBTITLE}}": prospect.get("why_subtitle", "What sets us apart from the competition"),
        "{{CTA_TITLE}}": prospect.get("cta_title", "Ready to Get Started?"),
        "{{CTA_SUBTITLE}}": prospect.get("cta_subtitle", f"Contact {prospect['name']} today for a free consultation."),
        "{{PHONE}}": prospect.get("phone", ""),
        "{{FOOTER_DESC}}": prospect.get("footer_desc", f"Serving {prospect.get('city', 'the local area')} with professional {niche.replace('_', ' ')} services."),
        "{{ADDRESS}}": prospect.get("address", f"{prospect.get('city', '')}, {prospect.get('state', '')}"),
    }

    for key, val in replacements.items():
        html = html.replace(key, val)

    # Stats
    stats = prospect.get("stats", [
        {"number": "500+", "label": "Projects Completed"},
        {"number": "15+", "label": "Years Experience"},
        {"number": "4.9", "label": "Google Rating"},
        {"number": "100%", "label": "Satisfaction Rate"},
    ])
    html = html.replace("{{STATS_ITEMS}}", generate_stats_html(stats))

    # Services
    services = prospect.get("services", config["default_services"])
    html = html.replace("{{SERVICE_CARDS}}", generate_services_html(services))

    # Why us
    why_items = prospect.get("why_items", config["why_items"])
    html = html.replace("{{WHY_ITEMS}}", generate_why_html(why_items))

    # Testimonials
    testimonials = prospect.get("testimonials", [
        {"name": "Happy Client", "quote": "Outstanding service from start to finish. Highly recommend!", "role": "Local Homeowner"},
        {"name": "Satisfied Customer", "quote": "Professional, reliable, and fair pricing. Will use again.", "role": "Business Owner"},
    ])
    html = html.replace("{{TESTIMONIAL_CARDS}}", generate_testimonials_html(testimonials))

    # Nav
    nav_items = prospect.get("nav_items", [
        {"label": "Services", "href": "#services"},
        {"label": "About", "href": "#about"},
        {"label": "Reviews", "href": "#reviews"},
        {"label": "Contact", "href": "#contact"},
    ])
    html = html.replace("{{NAV_ITEMS}}", generate_nav_html(nav_items))

    # Footer
    footer_cols = prospect.get("footer_columns", [
        {"title": "Services", "items": [{"label": s["title"], "href": "#services"} for s in services[:4]]},
        {"title": "Company", "items": [
            {"label": "About Us", "href": "#about"},
            {"label": "Reviews", "href": "#reviews"},
            {"label": "Contact", "href": "#contact"},
        ]},
        {"title": "Contact", "items": [
            {"label": prospect.get("phone", "Call Us"), "href": f"tel:{prospect.get('phone', '')}"},
            {"label": prospect.get("city", ""), "href": "#"},
        ]},
    ])
    html = html.replace("{{FOOTER_COLUMNS}}", generate_footer_cols(footer_cols))

    return html


def main():
    if len(sys.argv) < 2:
        print("Usage: python generate_sites.py <prospects.json>")
        sys.exit(1)

    with open(sys.argv[1], "r") as f:
        prospects = json.load(f)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for prospect in prospects:
        slug = re.sub(r'[^a-z0-9]+', '-', prospect["name"].lower()).strip('-')
        site_dir = os.path.join(OUTPUT_DIR, slug)
        os.makedirs(site_dir, exist_ok=True)

        html = generate_site(prospect)
        output_path = os.path.join(site_dir, "index.html")
        with open(output_path, "w") as f:
            f.write(html)

        print(f"Generated: {slug}/index.html")

    print(f"\nDone! Generated {len(prospects)} sites in {OUTPUT_DIR}/")


if __name__ == "__main__":
    main()

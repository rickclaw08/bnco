#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// CLI argument parsing (zero dependencies)
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

// ---------------------------------------------------------------------------
// Industry templates
// ---------------------------------------------------------------------------
const TEMPLATES = {
  restaurant: {
    aiName: 'Sophie',
    recommendedVoice: 'coral',
    businessHours: {
      monday: null,
      tuesday:   { open: '11:00', close: '22:00' },
      wednesday: { open: '11:00', close: '22:00' },
      thursday:  { open: '11:00', close: '22:00' },
      friday:    { open: '11:00', close: '23:00' },
      saturday:  { open: '11:00', close: '23:00' },
      sunday:    { open: '11:00', close: '21:00' },
    },
    services: [
      { name: 'Table Reservations', description: 'Reserve a table for lunch or dinner.', priceRange: 'No booking fee' },
      { name: 'Takeaway / Pickup', description: 'Order from the menu for collection.', priceRange: 'Same as dine-in' },
      { name: 'Private Dining', description: 'Private room available for groups up to 20.', priceRange: 'Set menu from $45/person' },
      { name: 'Catering', description: 'Off-site catering for events and parties.', priceRange: 'Custom quotes available' },
    ],
    faqs: [
      { question: 'Do you take walk-ins?', answer: 'We accept walk-ins when tables are available, but reservations are recommended for weekends.' },
      { question: 'Do you have vegan options?', answer: 'Yes, we offer vegan and gluten-free dishes on every menu.' },
      { question: 'Is there parking?', answer: 'Street parking is available nearby and there is a public lot within walking distance.' },
    ],
    emergencyRules: {
      triggers: ['complaint', 'food poisoning', 'allergic reaction', 'speak to a manager', 'media inquiry'],
      instructions: "Express empathy, collect the caller's name and number, and let them know the manager will call back within 30 minutes.",
    },
    personality: {
      tone: 'warm, friendly, and welcoming',
      style: 'Keep responses to 2-3 sentences. Be enthusiastic about the food without overselling.',
      signOff: 'Is there anything else I can help you with?',
    },
    greeting: null,
    recordingDisclosure: 'Just so you know, this call may be recorded for quality purposes.',
    callbackPolicy: 'Take a detailed message and assure the caller someone will return their call within 30 minutes during business hours.',
  },

  hvac: {
    aiName: 'Sarah',
    recommendedVoice: 'alloy',
    businessHours: {
      monday:    { open: '07:00', close: '18:00' },
      tuesday:   { open: '07:00', close: '18:00' },
      wednesday: { open: '07:00', close: '18:00' },
      thursday:  { open: '07:00', close: '18:00' },
      friday:    { open: '07:00', close: '18:00' },
      saturday:  { open: '08:00', close: '14:00' },
      sunday:    null,
    },
    services: [
      { name: 'AC Repair', description: 'Diagnosis and repair of all air conditioning systems.', priceRange: '$89 service call fee, waived with approved repair' },
      { name: 'Heating / Furnace Repair', description: 'Diagnosis and repair of heating systems and furnaces.', priceRange: '$89 service call fee, waived with approved repair' },
      { name: 'System Installation', description: 'New AC or heating system installation.', priceRange: 'Free estimate provided' },
      { name: 'Seasonal Tune-Up', description: 'Preventive maintenance for AC or heating systems.', priceRange: '$79 per system' },
      { name: '24/7 Emergency Service', description: 'Emergency heating and cooling repair around the clock.', priceRange: '$149 after-hours service call fee' },
    ],
    faqs: [
      { question: 'Do you offer free estimates?', answer: 'Yes, we provide free estimates for installations and major repairs.' },
      { question: 'How quickly can you come out?', answer: 'Same-day for emergencies. Routine appointments within 1-2 business days.' },
      { question: 'Are you licensed and insured?', answer: 'Yes, fully licensed and insured with liability and workers\x27 compensation coverage.' },
    ],
    emergencyRules: {
      triggers: ['no heat', 'no cooling', 'no AC', 'gas smell', 'gas leak', 'carbon monoxide', 'CO alarm', 'water leaking from unit'],
      instructions: 'Empathize with the caller, collect their name and address, and connect them to the emergency dispatch line.',
    },
    personality: {
      tone: 'warm, helpful, and professional',
      style: 'Use contractions. Keep responses to 2-3 sentences. Show empathy for stressful situations.',
      signOff: 'Is there anything else I can help you with today?',
    },
    greeting: null,
    recordingDisclosure: 'Just so you know, this call may be recorded for quality purposes.',
    callbackPolicy: 'Take a detailed message and assure the caller someone will call back within 1 hour.',
  },

  dental: {
    aiName: 'Emily',
    recommendedVoice: 'shimmer',
    businessHours: {
      monday:    { open: '08:00', close: '17:00' },
      tuesday:   { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday:  { open: '08:00', close: '17:00' },
      friday:    { open: '08:00', close: '15:00' },
      saturday:  null,
      sunday:    null,
    },
    services: [
      { name: 'Routine Cleaning', description: 'Professional teeth cleaning and oral exam.', priceRange: 'From $99 (may vary with insurance)' },
      { name: 'Fillings', description: 'Composite or amalgam fillings for cavities.', priceRange: 'From $150 per tooth' },
      { name: 'Teeth Whitening', description: 'In-office professional whitening treatment.', priceRange: 'From $299' },
      { name: 'Crowns & Bridges', description: 'Custom crowns and bridge work.', priceRange: 'From $800 per crown' },
      { name: 'Emergency Dental', description: 'Same-day care for toothaches, broken teeth, and dental emergencies.', priceRange: '$125 emergency exam fee' },
      { name: 'New Patient Exam', description: 'Comprehensive exam with X-rays for new patients.', priceRange: '$79 new patient special' },
    ],
    faqs: [
      { question: 'Do you accept insurance?', answer: 'Yes, we accept most major dental insurance plans. Please call with your plan details and we can verify coverage.' },
      { question: 'Are you accepting new patients?', answer: 'Absolutely! We welcome new patients and offer a $79 new patient special that includes a full exam and X-rays.' },
      { question: 'Do you offer payment plans?', answer: 'Yes, we offer flexible payment options including CareCredit financing for larger treatments.' },
      { question: 'What if I have a dental emergency?', answer: 'Call us right away. We reserve time each day for same-day emergency appointments.' },
    ],
    emergencyRules: {
      triggers: ['severe pain', 'knocked out tooth', 'broken tooth', 'swelling', 'abscess', "bleeding that won't stop", 'speak to the dentist'],
      instructions: "Express empathy, ask if they are in pain right now, collect their name and phone number, and let them know the office will call back within 15 minutes to arrange an emergency visit.",
    },
    personality: {
      tone: 'calm, reassuring, and professional',
      style: 'Keep responses to 2-3 sentences. Be gentle and reassuring, especially for patients who sound anxious about dental visits.',
      signOff: 'Is there anything else I can help you with?',
    },
    greeting: null,
    recordingDisclosure: 'This call may be recorded for quality and training purposes.',
    callbackPolicy: "Take a detailed message with the patient's name, phone number, and reason for calling. Assure them someone from the office will call back within 1 hour during business hours.",
  },
};

// Alias: "contractor" maps to "hvac"
TEMPLATES.contractor = TEMPLATES.hvac;

// ---------------------------------------------------------------------------
// Slug helper: "Joe's HVAC" -> "joes-hvac"
// ---------------------------------------------------------------------------
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/['\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ---------------------------------------------------------------------------
// Build the tenant config
// ---------------------------------------------------------------------------
function buildConfig({ name, industry, phone, hours }) {
  const templateKey = industry.toLowerCase();
  const template = TEMPLATES[templateKey];
  if (!template) {
    const available = Object.keys(TEMPLATES).filter(k => TEMPLATES[k] !== TEMPLATES.contractor || k === 'contractor');
    console.error(`Unknown industry: "${industry}". Available templates: ${available.join(', ')}`);
    process.exit(1);
  }

  // Deep-clone template so we don't mutate the original
  const config = JSON.parse(JSON.stringify(template));

  config.businessName = name;
  config.phone = phone;
  config.industry = industry;
  config.timezone = 'America/New_York'; // sensible default; can be overridden later

  // Generate greeting using the AI name from the template
  config.greeting = `Thanks for calling ${name}! This is ${config.aiName}. How can I help you today?`;

  // If hours string was provided, store it as a note (the structured hours come
  // from the template; the freeform string is kept for reference).
  if (hours) {
    config.hoursNote = hours;
  }

  // Placeholder notification targets
  config.ownerNotification = {
    sms: phone,
    email: `owner@${slugify(name)}.example.com`,
  };

  return config;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  const args = parseArgs(process.argv);

  if (args.help) {
    console.log(`
Usage:
  node scripts/provision-demo.js --name "Business Name" --industry <type> --phone "+15551234567" [--hours "Mon-Fri 8am-6pm"]

Industries: restaurant, hvac, contractor, dental

Example:
  node scripts/provision-demo.js --name "Joe's HVAC" --industry hvac --phone "+15551234567" --hours "Mon-Fri 8am-6pm"
`);
    process.exit(0);
  }

  // Validate required args
  const missing = [];
  if (!args.name) missing.push('--name');
  if (!args.industry) missing.push('--industry');
  if (!args.phone) missing.push('--phone');

  if (missing.length > 0) {
    console.error(`Missing required arguments: ${missing.join(', ')}`);
    console.error('Run with --help for usage info.');
    process.exit(1);
  }

  const config = buildConfig({
    name: args.name,
    industry: args.industry,
    phone: args.phone,
    hours: args.hours || null,
  });

  // Write to config/tenants/
  const tenantId = slugify(args.name);
  const tenantsDir = path.resolve(__dirname, '..', 'config', 'tenants');

  if (!fs.existsSync(tenantsDir)) {
    fs.mkdirSync(tenantsDir, { recursive: true });
  }

  const filename = `tenant-${tenantId}.json`;
  const filepath = path.join(tenantsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(config, null, 2) + '\n', 'utf8');

  console.log('');
  console.log('--- Tenant Provisioned ---');
  console.log(`  Tenant ID : ${tenantId}`);
  console.log(`  Business  : ${args.name}`);
  console.log(`  Industry  : ${args.industry}`);
  console.log(`  Phone     : ${args.phone}`);
  console.log(`  Config    : ${filepath}`);
  console.log('');
}

main();

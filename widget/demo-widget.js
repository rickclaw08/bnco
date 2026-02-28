/**
 * ClawOps AI Receptionist Demo Widget
 * Self-contained interactive chat demo for theclawops.com
 * Simulates an AI receptionist for "Comfort Zone HVAC"
 */
(function () {
  'use strict';

  /* ============ CONFIG ============ */
  var BUSINESS = 'Comfort Zone HVAC';
  var PHONE = '(702) 728-4638';
  var PHONE_LINK = 'tel:+17027284638';
  var CONTACT_URL = '#contact';
  var CTA_THRESHOLD = 3; // show CTA after this many user messages

  /* ============ RESPONSE ENGINE ============ */
  var responses = {
    greeting: {
      text: 'Hi there! Thanks for calling ' + BUSINESS + '. My name is Sarah, your AI receptionist. How can I help you today?',
      chips: ['Book an appointment', 'I have an emergency', 'What are your rates?', 'What are your hours?']
    },

    appointment: [
      'I would love to help you schedule a service appointment! What type of service do you need? We handle AC repair, heating, maintenance, and full system installations.',
      'Great choice! We have openings this week. What works better for you, morning or afternoon? Our techs are available Monday through Saturday.',
      'Perfect. To get you on the schedule, I just need your name, address, and a good callback number. One of our team members will confirm the details within 15 minutes. Anything else I can help with?'
    ],

    emergency: [
      'I understand this is urgent, and I want to get you help right away. Can you describe what is happening? For example, is your AC completely out, is there a gas smell, or is there water leaking?',
      'Got it. I am flagging this as a priority call and dispatching our on-call technician. Someone will call you back within 10 minutes. For immediate safety concerns, please call 911 first. Is there anything else you need right now?'
    ],

    pricing: [
      'Great question! Our rates depend on the service. Diagnostic visits start at $89. Routine maintenance plans run $149/year and cover two tune-ups plus priority scheduling. Installations are quoted after a free in-home assessment. Would you like me to schedule a free estimate?',
      'For an accurate quote, I can have one of our comfort advisors call you back within the hour. They can walk you through options and financing. Should I set that up?'
    ],

    hours: [
      'We are open Monday through Friday from 7 AM to 7 PM, and Saturday from 8 AM to 4 PM. We are closed on Sunday, but our emergency line is available 24/7. Would you like to schedule a visit during business hours, or is this an emergency?'
    ],

    general: [
      'I appreciate you reaching out! I am here to help with scheduling, service questions, pricing, or emergencies. What do you need today?',
      'Let me make sure I get you the right help. Are you looking to book a service, get a quote, or something else?'
    ],

    thanks: [
      'You are welcome! Happy to help. Is there anything else I can assist you with today?',
      'Anytime! If you need anything else, just let me know. Have a great day!'
    ],

    goodbye: [
      'Thank you for calling ' + BUSINESS + '! We look forward to serving you. Have a wonderful day!'
    ]
  };

  /* ============ KEYWORD MATCHING ============ */
  var patterns = [
    { keys: ['appointment', 'schedule', 'book', 'booking', 'set up', 'come out', 'visit', 'tune-up', 'tune up', 'maintenance'], category: 'appointment' },
    { keys: ['emergency', 'urgent', 'broken', 'no heat', 'no ac', 'no air', 'gas smell', 'leak', 'flooding', 'not working', 'help now', 'asap'], category: 'emergency' },
    { keys: ['price', 'pricing', 'cost', 'how much', 'rate', 'rates', 'estimate', 'quote', 'afford', 'charge', 'fee', 'fees', 'pay', 'financing'], category: 'pricing' },
    { keys: ['hours', 'open', 'closed', 'close', 'when', 'time', 'available', 'weekend', 'sunday', 'saturday'], category: 'hours' },
    { keys: ['thank', 'thanks', 'appreciate', 'awesome', 'great', 'perfect'], category: 'thanks' },
    { keys: ['bye', 'goodbye', 'see you', 'that is all', "that's all", 'nothing else', 'no thanks', 'nope'], category: 'goodbye' }
  ];

  function matchCategory(text) {
    var lower = text.toLowerCase();
    for (var i = 0; i < patterns.length; i++) {
      for (var j = 0; j < patterns[i].keys.length; j++) {
        if (lower.indexOf(patterns[i].keys[j]) !== -1) {
          return patterns[i].category;
        }
      }
    }
    return 'general';
  }

  /* ============ STATE ============ */
  var state = {
    open: false,
    userMsgCount: 0,
    ctaShown: false,
    categoryCounters: {},
    initialized: false
  };

  function getNextResponse(category) {
    var pool = responses[category];
    if (!pool) pool = responses.general;
    if (typeof pool === 'string') return pool;

    var idx = state.categoryCounters[category] || 0;
    if (idx >= pool.length) idx = pool.length - 1;
    state.categoryCounters[category] = idx + 1;
    return pool[idx];
  }

  /* ============ DOM CREATION ============ */
  function loadCSS() {
    // Try to find the script's own path for relative CSS loading
    var scripts = document.getElementsByTagName('script');
    var basePath = '';
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf('demo-widget.js') !== -1) {
        basePath = scripts[i].src.replace('demo-widget.js', '');
        break;
      }
    }
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = basePath + 'demo-widget.css';
    document.head.appendChild(link);
  }

  function createWidget() {
    // Trigger button
    var trigger = document.createElement('button');
    trigger.className = 'claw-widget-trigger';
    trigger.id = 'clawWidgetTrigger';
    trigger.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>Try Our AI Receptionist</span>';
    trigger.onclick = toggleChat;
    document.body.appendChild(trigger);

    // Chat window
    var chat = document.createElement('div');
    chat.className = 'claw-widget-chat';
    chat.id = 'clawWidgetChat';
    chat.innerHTML = [
      '<div class="claw-widget-header">',
      '  <div class="claw-widget-header-info">',
      '    <div class="claw-widget-avatar">&#x1F3E2;</div>',
      '    <div class="claw-widget-header-text">',
      '      <h4>' + BUSINESS + '</h4>',
      '      <p><span class="claw-widget-status-dot"></span> AI Receptionist Online</p>',
      '    </div>',
      '  </div>',
      '  <div class="claw-widget-header-actions">',
      '    <button onclick="window.open(\'' + PHONE_LINK + '\')" title="Call us live">&#x1F4DE;</button>',
      '    <button id="clawWidgetClose" title="Close">&#x2715;</button>',
      '  </div>',
      '</div>',
      '<div class="claw-widget-messages" id="clawWidgetMessages"></div>',
      '<div class="claw-widget-input">',
      '  <input type="text" id="clawWidgetInputField" placeholder="Type your message..." autocomplete="off" />',
      '  <button class="claw-widget-send" id="clawWidgetSendBtn" title="Send">',
      '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
      '  </button>',
      '</div>',
      '<div class="claw-widget-footer"><a href="https://theclawops.com" target="_blank">Powered by ClawOps AI</a></div>'
    ].join('\n');
    document.body.appendChild(chat);

    // Event listeners
    document.getElementById('clawWidgetClose').onclick = toggleChat;
    document.getElementById('clawWidgetSendBtn').onclick = handleSend;
    document.getElementById('clawWidgetInputField').onkeydown = function (e) {
      if (e.key === 'Enter' || e.keyCode === 13) handleSend();
    };
  }

  /* ============ CHAT LOGIC ============ */
  function toggleChat() {
    state.open = !state.open;
    var chat = document.getElementById('clawWidgetChat');
    var trigger = document.getElementById('clawWidgetTrigger');

    if (state.open) {
      chat.classList.add('claw-widget-open');
      trigger.classList.add('claw-widget-hidden');
      if (!state.initialized) {
        state.initialized = true;
        showGreeting();
      }
      setTimeout(function () {
        document.getElementById('clawWidgetInputField').focus();
      }, 400);
    } else {
      chat.classList.remove('claw-widget-open');
      trigger.classList.remove('claw-widget-hidden');
    }
  }

  function showGreeting() {
    showTyping(function () {
      addMessage(responses.greeting.text, 'ai');
      showQuickReplies(responses.greeting.chips);
    });
  }

  function addMessage(text, sender) {
    var messages = document.getElementById('clawWidgetMessages');
    var div = document.createElement('div');
    div.className = 'claw-msg claw-msg-' + sender;
    div.textContent = text;
    messages.appendChild(div);
    scrollToBottom();
  }

  function showTyping(callback) {
    var messages = document.getElementById('clawWidgetMessages');
    var typing = document.createElement('div');
    typing.className = 'claw-typing';
    typing.id = 'clawTypingIndicator';
    typing.innerHTML = '<div class="claw-typing-dot"></div><div class="claw-typing-dot"></div><div class="claw-typing-dot"></div>';
    messages.appendChild(typing);
    scrollToBottom();

    var delay = 800 + Math.random() * 700;
    setTimeout(function () {
      var el = document.getElementById('clawTypingIndicator');
      if (el) el.remove();
      if (callback) callback();
    }, delay);
  }

  function showQuickReplies(chips) {
    var messages = document.getElementById('clawWidgetMessages');
    var container = document.createElement('div');
    container.className = 'claw-quick-replies';
    container.id = 'clawQuickReplies';

    chips.forEach(function (chip) {
      var btn = document.createElement('button');
      btn.className = 'claw-quick-reply';
      btn.textContent = chip;
      btn.onclick = function () {
        removeQuickReplies();
        addMessage(chip, 'user');
        state.userMsgCount++;
        processResponse(chip);
      };
      container.appendChild(btn);
    });

    messages.appendChild(container);
    scrollToBottom();
  }

  function removeQuickReplies() {
    var el = document.getElementById('clawQuickReplies');
    if (el) el.remove();
  }

  function showCTA() {
    if (state.ctaShown) return;
    state.ctaShown = true;

    var messages = document.getElementById('clawWidgetMessages');
    var cta = document.createElement('div');
    cta.className = 'claw-cta-banner';
    cta.innerHTML = [
      '<h5>Want this for YOUR business?</h5>',
      '<p>Get an AI receptionist that answers calls 24/7, books appointments, and never misses a lead. Setup: $2,000 + $300/mo.</p>',
      '<div class="claw-cta-banner-buttons">',
      '  <a href="' + CONTACT_URL + '" class="claw-cta-btn claw-cta-btn-primary">Get Started</a>',
      '  <a href="' + PHONE_LINK + '" class="claw-cta-btn claw-cta-btn-secondary">&#x1F4DE; Hear It Live</a>',
      '</div>'
    ].join('');
    messages.appendChild(cta);
    scrollToBottom();
  }

  function handleSend() {
    var input = document.getElementById('clawWidgetInputField');
    var text = input.value.trim();
    if (!text) return;

    input.value = '';
    removeQuickReplies();
    addMessage(text, 'user');
    state.userMsgCount++;
    processResponse(text);
  }

  function processResponse(userText) {
    var category = matchCategory(userText);
    var reply = getNextResponse(category);

    showTyping(function () {
      addMessage(reply, 'ai');

      // Contextual follow-up chips
      var followUp = getFollowUpChips(category);
      if (followUp.length > 0 && state.userMsgCount < CTA_THRESHOLD + 2) {
        showQuickReplies(followUp);
      }

      // Show CTA after enough exchanges
      if (state.userMsgCount >= CTA_THRESHOLD && !state.ctaShown) {
        setTimeout(function () {
          showCTA();
        }, 600);
      }
    });
  }

  function getFollowUpChips(category) {
    switch (category) {
      case 'appointment':
        return ['Morning works', 'Afternoon is better', 'What are your rates?'];
      case 'emergency':
        return ['Yes, AC is out', 'I smell gas', 'Water leaking'];
      case 'pricing':
        return ['Schedule a free estimate', 'Book maintenance', 'What are your hours?'];
      case 'hours':
        return ['Book an appointment', 'I have an emergency', 'What are your rates?'];
      case 'thanks':
        return ['Book an appointment', 'That is all, goodbye'];
      case 'goodbye':
        return [];
      default:
        return ['Book an appointment', 'Get a price quote', 'I have an emergency'];
    }
  }

  function scrollToBottom() {
    var messages = document.getElementById('clawWidgetMessages');
    if (messages) {
      setTimeout(function () {
        messages.scrollTop = messages.scrollHeight;
      }, 50);
    }
  }

  /* ============ INIT ============ */
  function init() {
    loadCSS();
    createWidget();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

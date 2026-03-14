// Consent registration automation - runs in browser context
// Each call to registerContact() handles one contact through the full widget flow

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function setNativeValue(element, value) {
  const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  valueSetter.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

async function waitForElement(selector, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const el = document.querySelector(selector);
    if (el && el.offsetParent !== null) return el;
    await sleep(200);
  }
  return null;
}

async function waitForText(text, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (document.body.innerText.includes(text)) return true;
    await sleep(200);
  }
  return false;
}

// State
const state = {
  bill: '',
  tipPercent: null,
  customTip: '',
  people: 1,
};

// DOM refs
const billInput = document.getElementById('billAmount');
const customTipInput = document.getElementById('customTip');
const peopleCountEl = document.getElementById('peopleCount');
const tipBtns = document.querySelectorAll('.tip-btn');
const decreaseBtn = document.getElementById('decreasePeople');
const increaseBtn = document.getElementById('increasePeople');
const resetBtn = document.getElementById('resetBtn');

const tipAmountEl = document.getElementById('tipAmount');
const totalAmountEl = document.getElementById('totalAmount');
const perPersonEl = document.getElementById('perPersonAmount');
const tipPerPersonEl = document.getElementById('TipPerPerson');

// Error elements — inject them dynamically
function getOrCreateError(inputEl) {
  let err = inputEl.parentElement.querySelector('.error-msg');
  if (!err) {
    // Try one level up (for inputs not wrapped in .input-field)
    err = inputEl.closest('.input-group')?.querySelector('.error-msg');
  }
  if (!err) {
    err = document.createElement('span');
    err.className = 'error-msg';
    err.setAttribute('aria-live', 'polite');
    err.style.cssText = 'display:block;color:#ff6b6b;font-size:0.8rem;margin-top:0.4rem;min-height:1em;';
    inputEl.parentElement.appendChild(err);
  }
  return err;
}

function showError(inputEl, msg) {
  const err = getOrCreateError(inputEl);
  err.textContent = msg;
  inputEl.style.borderColor = '#ff6b6b';
  inputEl.setAttribute('aria-invalid', 'true');
}

function clearError(inputEl) {
  const err = getOrCreateError(inputEl);
  err.textContent = '';
  inputEl.style.borderColor = '';
  inputEl.setAttribute('aria-invalid', 'false');
}

// Validation
function validateBill() {
  const val = billInput.value.trim();
  if (val === '') { clearError(billInput); return null; }
  const n = parseFloat(val);
  if (isNaN(n) || n < 0) { showError(billInput, 'Enter a positive number'); return null; }
  if (n > 1_000_000) { showError(billInput, 'Amount seems too large'); return null; }
  clearError(billInput);
  return n;
}

function validateCustomTip() {
  const val = customTipInput.value.trim();
  if (val === '') { clearError(customTipInput); return null; }
  const n = parseFloat(val);
  if (isNaN(n) || n < 0) { showError(customTipInput, 'Tip % must be ≥ 0'); return null; }
  if (n > 100) { showError(customTipInput, 'Tip % max is 100'); return null; }
  clearError(customTipInput);
  return n;
}

// Rounding policy: round UP to nearest cent so the group never underpays.
// The difference (rounding surplus) is ≤ 1 cent × number of people, negligible.
function roundUp(n) {
  return Math.ceil(n * 100) / 100;
}

function fmt(n) {
  return '$' + n.toFixed(2);
}

// Core calculation
function calculate() {
  const bill = validateBill();
  const customTipVal = validateCustomTip();

  // Resolve active tip %
  let tip = state.tipPercent;
  if (customTipVal !== null) tip = customTipVal;

  // Show results only when we have enough valid input
  if (bill === null || tip === null) {
    tipAmountEl.textContent = '$0.00';
    totalAmountEl.textContent = '$0.00';
    perPersonEl.textContent = '$0.00';
    tipPerPersonEl.textContent = '$0.00';
    return;
  }

  const tipTotal = bill * (tip / 100);
  const grandTotal = bill + tipTotal;
  const perPerson = roundUp(grandTotal / state.people);
  const tipPerPerson = roundUp(tipTotal / state.people);

  // Animate value update
  setResult(tipAmountEl, fmt(tipTotal));
  setResult(totalAmountEl, fmt(grandTotal));
  setResult(perPersonEl, fmt(perPerson));
  setResult(tipPerPersonEl, fmt(tipPerPerson));
}

function setResult(el, val) {
  if (el.textContent !== val) {
    el.classList.remove('updated');
    // Force reflow
    void el.offsetWidth;
    el.classList.add('updated');
    el.textContent = val;
  }
}

// Tip button handling
tipBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tipBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.tipPercent = parseFloat(btn.dataset.tip);
    // Clear custom tip when preset selected
    customTipInput.value = '';
    clearError(customTipInput);
    calculate();
  });
});

// Custom tip input
customTipInput.addEventListener('input', () => {
  // Deactivate preset buttons when typing custom
  tipBtns.forEach(b => b.classList.remove('active'));
  state.tipPercent = null;
  calculate();
});

// Bill input
billInput.addEventListener('input', calculate);

// People counter
function updatePeople(n) {
  state.people = n;
  peopleCountEl.textContent = n;
  decreaseBtn.disabled = n <= 1;
  decreaseBtn.setAttribute('aria-disabled', n <= 1);
  calculate();
}

decreaseBtn.addEventListener('click', () => {
  if (state.people > 1) updatePeople(state.people - 1);
});

increaseBtn.addEventListener('click', () => {
  if (state.people < 99) updatePeople(state.people + 1);
});

// Allow keyboard on people count (type directly)
// Optional: make peopleCount a hidden input fallback — kept as display span for now

// Reset
resetBtn.addEventListener('click', () => {
  billInput.value = '';
  customTipInput.value = '';
  state.tipPercent = null;
  state.people = 1;
  tipBtns.forEach(b => b.classList.remove('active'));
  clearError(billInput);
  clearError(customTipInput);
  updatePeople(1);
  calculate();
  billInput.focus();
});

// Keyboard: Enter on bill moves to custom tip
billInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') customTipInput.focus();
});

// Init
updatePeople(1);
calculate();
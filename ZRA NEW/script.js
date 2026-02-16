document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('calculateBtn').addEventListener('click', handleCalculate);
  document.getElementById('resetBtn').addEventListener('click', handleReset);
  document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);
  renderHistory();
});

// array of bands(paye progressively)
const brackets = [
  { threshold: 5100, rate: 0 },
  { threshold: 7100, rate: 0.20 },
  { threshold: 9200, rate: 0.30 },
  { threshold: Infinity, rate: 0.37 }
];
//when calculate is clicked(reads)
function handleCalculate() {
  const gross = parseInput('gross');
  const allowances = parseInput('allowances');
  const deductions = parseInput('deductions');
//if gross = 0,error
  if (!isFinite(gross) || gross <= 0) {
    alert('Please enter a valid Monthly Gross Salary greater than 0.');
    return;
  }
//deducts Napsa then Nhima-taxable income
  const napsa = gross * 0.05;
  const nhima = gross * 0.01;
  const taxableIncome = Math.max(0, gross + allowances - deductions - napsa - nhima);
  const paye = computePAYE(taxableIncome);
  const totalDeductions = napsa + nhima + paye + deductions;
  const netSalary = gross + allowances - totalDeductions;

  showResults(gross, napsa, nhima, paye, totalDeductions, netSalary);
  saveHistory({ time: new Date().toLocaleString(), gross, napsa, nhima, paye, totalDeductions, net: netSalary });
  renderHistory();
}
//calls the compute paye function-sends taxable income
function handleReset() {
  document.getElementById('payeForm').reset();
  hideResults();
}

function parseInput(id) {
  const val = parseFloat(document.getElementById(id).value);
  return isFinite(val) ? val : 0;
}

function computePAYE(amount) {
  let remaining = amount;
  let lower = 0;
  let tax = 0;

  for (const b of brackets) {
    const upper = b.threshold;
    const segment = Math.max(0, Math.min(remaining, upper - lower));
    tax += segment * b.rate;
    remaining -= segment;
    lower = upper;
    if (remaining <= 0) break;
  }
  return Math.max(0, tax);
}
//calculates final values
function showResults(gross, napsa, nhima, paye, totalDeductions, netSalary) {
  document.getElementById('grossResult').textContent = `K${gross.toFixed(2)}`;
  document.getElementById('napsaResult').textContent = `K${napsa.toFixed(2)}`;
  document.getElementById('nhimaResult').textContent = `K${nhima.toFixed(2)}`;
  document.getElementById('payeResult').textContent = `K${paye.toFixed(2)}`;
  document.getElementById('totalDeductions').textContent = `K${totalDeductions.toFixed(2)}`;
  document.getElementById('netResult').textContent = `K${netSalary.toFixed(2)}`;

  const results = document.getElementById('results');
  results.classList.remove('hidden');
  results.classList.remove('fade-in');
  void results.offsetWidth;
  results.classList.add('fade-in');
}
//display results
function hideResults() {
  const results = document.getElementById('results');
  results.classList.add('hidden');
  document.getElementById('grossResult').textContent = '';
  document.getElementById('napsaResult').textContent = '';
  document.getElementById('nhimaResult').textContent = '';
  document.getElementById('payeResult').textContent = '';
  document.getElementById('totalDeductions').textContent = '';
  document.getElementById('netResult').textContent = '';
}

const HISTORY_KEY = 'payeHistory';
const MAX_HISTORY = 8;

function saveHistory(entry) {
  const arr = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  arr.unshift(entry);
  arr.splice(MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
}

function renderHistory() {
  const ul = document.getElementById('historyList');
  ul.innerHTML = '';
  const arr = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  if (!arr.length) {
    const li = document.createElement('li');
    li.textContent = 'No recent calculations.';
    ul.appendChild(li);
    return;
  }
  for (const h of arr) {
    const li = document.createElement('li');
    li.textContent = `${h.time} — Gross: K${h.gross.toFixed(2)}, NAPSA: K${h.napsa.toFixed(2)}, NHIMA: K${h.nhima.toFixed(2)}, PAYE: K${h.paye.toFixed(2)}, Total Deductions: K${h.totalDeductions.toFixed(2)}, Net: K${h.net.toFixed(2)}`;
    ul.appendChild(li);
  }
}
//reset function
function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
}

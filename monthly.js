/* Monthly reports use the existing little-sips-v1 data. No server or account. */
(() => {
  function localDay(date = new Date()) {
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')].join('-');
  }

  function buildReport(logs, month, today = localDay()) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      throw new Error('Choose a valid month.');
    }
    const [year, number] = month.split('-').map(Number);
    // Gregorian leap-year rules, without UTC conversion or timezone shifts.
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const count = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][number - 1];
    const rows = Array.from({ length: count }, (_, i) => ({
      date: month + '-' + String(i + 1).padStart(2, '0'),
      total: 0,
      entries: 0
    }));
    const byDate = new Map(rows.map(row => [row.date, row]));
    for (const log of logs) {
      const row = byDate.get(log.day);
      if (row && row.date <= today && Number.isFinite(log.amount) && log.amount > 0) {
        row.total += log.amount;
        row.entries++;
      }
    }
    const elapsedDays = rows.filter(row => row.date <= today).length;
    const total = rows.reduce((sum, row) => sum + row.total, 0);
    const daysLogged = rows.filter(row => row.entries > 0).length;
    return {
      month, rows, total, elapsedDays, daysLogged,
      average: elapsedDays ? Math.round(total / elapsedDays) : 0
    };
  }

  function toCSV(report, today = localDay()) {
    const lines = [['Date', 'Total_ml', 'Entries', 'Status']];
    report.rows.forEach(row => {
      const future = row.date > today;
      lines.push([
        row.date,
        row.entries ? row.total : '',
        future ? '' : row.entries,
        future ? 'Future date' : row.entries ? 'Logged' : 'No entries recorded'
      ]);
    });
    // Numeric and fixed-text fields only; no notes or other personal text.
    return '\uFEFF' + lines.map(row => row.join(',')).join('\r\n') + '\r\n';
  }

  window.LittleSipsReports = { localDay, buildReport, toCSV };
  if (typeof document === 'undefined') return;
  const picker = document.querySelector('#report-month');
  if (!picker) return;
  const get = id => document.getElementById(id);
  picker.value = localDay().slice(0, 7);
  picker.max = picker.value;
  let followingCurrentMonth = true;

  function readLogs() {
    // Access the live app state: also works when saving is unavailable.
    return state.logs;
  }

  function renderMonthly() {
    const currentMonth = localDay().slice(0, 7);
    picker.max = currentMonth;
    if (followingCurrentMonth) picker.value = currentMonth;
    if (!picker.value || !picker.validity.valid) return;
    const report = buildReport(readLogs(), picker.value);
    get('month-total').textContent = report.total.toLocaleString() + ' ml';
    get('month-average').textContent = report.average.toLocaleString() + ' ml';
    get('month-days').textContent = report.daysLogged + ' / ' + report.elapsedDays;
    const label = new Date(Number(picker.value.slice(0, 4)),
      Number(picker.value.slice(5)) - 1, 1).toLocaleDateString(undefined,
      { month: 'long', year: 'numeric' });
    get('month-description').textContent = label + ' · Daily average = total logged ÷ ' +
      report.elapsedDays + ' calendar days' +
      (picker.value === currentMonth ? ' through today' : '') +
      '. Days without entries contribute 0 to this average. Only records saved in this browser are included.';
    const body = get('month-rows');
    body.replaceChildren();
    const today = localDay();
    report.rows.forEach(row => {
      const tr = document.createElement('tr');
      const values = [row.date,
        row.date > today ? 'Upcoming' : row.entries ? row.total.toLocaleString() + ' ml' : '—',
        row.date > today ? '—' : row.entries];
      values.forEach(value => {
        const td = document.createElement('td');
        td.textContent = value;
        tr.append(td);
      });
      body.append(tr);
    });
  }

  window.renderMonthly = renderMonthly;
  picker.addEventListener('change', () => {
    followingCurrentMonth = picker.value === localDay().slice(0, 7);
    renderMonthly();
  });

  get('download-csv').addEventListener('click', () => {
    if (!picker.reportValidity()) return;
    const report = buildReport(readLogs(), picker.value);
    const blob = new Blob([toCSV(report)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'little-sips-' + report.month + '.csv';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    toast('Monthly CSV downloaded ♡');
  });
  renderMonthly();
})();

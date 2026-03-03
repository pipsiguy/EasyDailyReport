/* ══════════════════════════════════════════
   Mufu – app.js
   QR, LocalStorage, i18n, and snapshot logic
══════════════════════════════════════════ */

/* ═══════════════════════════════════════════
   CONFIG
═══════════════════════════════════════════ */
let employees = [];  // dynamic, loaded from storage
let currentWeekDate = '';  // tracks which week is displayed, for save-on-switch
let storeName = 'Store Name';  // editable, saved to meta
const WEEK_PREFIX = 'mufu_week_';   // per-week keys: mufu_week_2026-02-23
const META_KEY    = 'mufu_meta';    // stores { lang, lastWeek, employees }
const QR_SIZE = 180;
const QR_RENDER_DELAY_MS = 300;
const QR_MAX_BYTES = 2900;  // QR capacity with EC Level L; maxJsonBytes() = ~2175 usable bytes

/* ═══════════════════════════════════════════
   i18n – translations
═══════════════════════════════════════════ */
const I18N = {
  en: {
    subtitle: 'Weekly Sales & Hours Log',
    weekStarting: 'Week starting:',
    generateSnapshot: 'Generate Snapshot',
    dailySales: 'Daily Sales',
    employeeHours: 'Employee Hours',
    day: 'Day',
    totalSales: 'Total Sales',
    cash: 'Cash',
    creditCard: 'Credit Card',
    doordashUber: 'DoorDash / Uber',
    totals: 'Totals',
    employee: 'Employee',
    totalHrs: 'Total hrs',
    totalSalary: 'Total Salary',
    working: 'Working…',
    snapshotSaved: '📸 Snapshot saved!',
    snapshotError: '⚠ Error generating snapshot',
    days: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    daysShort: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    weekOf: 'Week of',
    scanToRestore: 'Scan to restore',
    previousWeeks: 'Previous Weeks',
    uploadPastWeeks: 'Upload Past Weeks',
    noSavedWeeks: 'No saved weeks yet. Enter data or upload past week snapshots.',
    weekLoaded: '✅ Week loaded!',
    weekDeleted: '🗑 Week deleted',
    confirmDelete: 'Are you sure you want to delete this week?',
    addEmployee: 'Add Employee',
    deleteEmployee: 'Delete Employees',
    employeeName: 'Employee name:',
    removeWhich: 'Select employee to remove:',
    cancel: 'Cancel',
    confirmDeleteNames: 'Delete the following?\n\n{names}',
    bulkImported: '✅ Imported {n} week(s) from photos!',
    bulkNone: '⚠ No QR codes found in the uploaded images',
    totalSalesLabel: 'Total Sales',
    invoices: 'Invoices',
    vendor: 'Vendor',
    addVendor: 'Add Vendor',
    deleteVendors: 'Delete Vendors',
    vendorName: 'Vendor name:',
    cashExpenses: 'Cash Expenses',
    expense: 'Expense',
    addExpense: 'Add Expense',
    deleteExpenses: 'Delete Expenses',
    expenseName: 'Expense name:',
    storeName: 'Store Name',
    editStoreName: 'Enter store name:',
    storeNameRequired: 'Please enter your store name before generating a snapshot:',
    salary: 'Salary',
    infoMessage: 'All data is stored only on your device. If you delete the app, clear your storage, switch phones, or change browsers, your data will be lost. However, every snapshot includes a QR code \u2014 simply upload your snapshot photos here to restore all your previous weeks instantly.',
    notes: 'Notes',
    notesPlaceholder: 'Add notes for this week…',
    qrTooLarge: '⚠ Data too large for QR code! Please reduce notes ({over} characters over limit).',
    notesRemaining: '{n} characters remaining for QR',
    deleteOldest10: 'Delete Oldest 10 Weeks',
    confirmDeleteOldest: 'This will permanently delete the 10 oldest weeks. Continue?',
    weeksMax: '20 weeks max stored on device',
    oldestDeleted: '🗑 Deleted {n} oldest week(s)',
    maxWeeksReached: '⚠ Max 20 weeks reached — oldest week auto-deleted',
    forbiddenChars: '⚠ Names cannot contain < > " & characters',
    exportCSV: 'Export CSV',
    csvHint: 'Download this week as a .csv file for Excel, Google Sheets, or Numbers.',
    csvSaved: '📄 CSV exported!',
    cashOnHand: 'Cash on Hand',
    startingCash: 'Starting Cash',
    autoFill: 'Auto-fill',
    cohHint: 'Tip: Use auto-fill to pull from the most recent previous week, or enter manually.',
    cohAutoFilled: '✅ Starting cash auto-filled from previous week',
    cohNoPrevious: '⚠ No previous week data found to auto-fill from'
  },
  zh: {
    subtitle: '每周销售和工时记录',
    weekStarting: '周起始日：',
    generateSnapshot: '生成快照',
    dailySales: '每日销售',
    employeeHours: '员工工时',
    day: '日期',
    totalSales: '总销售额',
    cash: '现金',
    creditCard: '信用卡',
    doordashUber: 'DoorDash / Uber',
    totals: '合计',
    employee: '员工',
    totalHrs: '总工时',
    totalSalary: '工资合计',
    working: '处理中…',
    snapshotSaved: '📸 快照已保存！',
    snapshotError: '⚠ 生成快照出错',
    days: ['星期一','星期二','星期三','星期四','星期五','星期六','星期日'],
    daysShort: ['一','二','三','四','五','六','日'],
    weekOf: '周报 –',
    scanToRestore: '扫描恢复',
    previousWeeks: '历史周报',
    uploadPastWeeks: '上传过去的周报',
    noSavedWeeks: '暂无保存的周报。输入数据或上传过去的周报快照。',
    weekLoaded: '✅ 周报已加载！',
    weekDeleted: '🗑 周报已删除',
    confirmDelete: '确定要删除这个周报吗？',
    addEmployee: '添加员工',
    deleteEmployee: '删除员工',
    employeeName: '员工姓名：',
    removeWhich: '选择要删除的员工：',
    cancel: '取消',
    confirmDeleteNames: '删除以下内容？\n\n{names}',
    bulkImported: '✅ 已从照片导入 {n} 个周报！',
    bulkNone: '⚠ 上传的图片中未找到二维码',
    totalSalesLabel: '总销售额',
    invoices: '发票',
    vendor: '供应商',
    addVendor: '添加供应商',
    deleteVendors: '删除供应商',
    vendorName: '供应商名称：',
    cashExpenses: '现金支出',
    expense: '支出',
    addExpense: '添加支出',
    deleteExpenses: '删除支出',
    expenseName: '支出名称：',
    storeName: '店铺名称',
    editStoreName: '输入店铺名称：',
    storeNameRequired: '生成快照前请先输入店铺名称：',
    salary: '工资',
    infoMessage: '所有数据仅存储在您的设备上。如果您删除应用、清除存储、更换手机或更换浏览器，数据将会丢失。但每张快照都包含二维码 — 只需在此处上传快照照片，即可立即恢复所有以前的周报。',
    notes: '备注',
    notesPlaceholder: '添加本周备注…',
    qrTooLarge: '⚠ 数据超出二维码容量！请减少备注（超出 {over} 个字符）。',
    notesRemaining: '二维码剩余 {n} 个字符',
    deleteOldest10: '删除最旧的10周',
    confirmDeleteOldest: '这将永久删除最旧的10个周报。继续？',
    weeksMax: '设备最多存储20周',
    oldestDeleted: '🗑 已删除 {n} 个最旧周报',
    maxWeeksReached: '⚠ 已达20周上限 — 已自动删除最旧周报',
    forbiddenChars: '⚠ 名称不能包含 < > " & 字符',
    exportCSV: '导出 CSV',
    csvHint: '将本周数据下载为 .csv 文件，可在 Excel、Google Sheets 或 Numbers 中打开。',
    csvSaved: '📄 CSV 已导出！',
    cashOnHand: '手头现金',
    startingCash: '期初现金',
    autoFill: '自动填充',
    cohHint: '提示：使用自动填充从最近的上一周提取，或手动输入。',
    cohAutoFilled: '✅ 期初现金已从上周自动填充',
    cohNoPrevious: '⚠ 未找到可自动填充的上周数据'
  },
  es: {
    subtitle: 'Registro Semanal de Ventas y Horas',
    weekStarting: 'Semana iniciando:',
    generateSnapshot: 'Generar Captura',
    dailySales: 'Ventas Diarias',
    employeeHours: 'Horas de Empleados',
    day: 'Día',
    totalSales: 'Ventas Totales',
    cash: 'Efectivo',
    creditCard: 'Tarjeta de Crédito',
    doordashUber: 'DoorDash / Uber',
    totals: 'Totales',
    employee: 'Empleado',
    totalHrs: 'Total horas',
    totalSalary: 'Salario Total',
    working: 'Procesando…',
    snapshotSaved: '📸 ¡Captura guardada!',
    snapshotError: '⚠ Error al generar captura',
    days: ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'],
    daysShort: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'],
    weekOf: 'Semana del',
    scanToRestore: 'Escanear para restaurar',
    previousWeeks: 'Semanas Anteriores',
    uploadPastWeeks: 'Subir Semanas Pasadas',
    noSavedWeeks: 'Aún no hay semanas guardadas. Ingrese datos o suba capturas de semanas pasadas.',
    weekLoaded: '✅ ¡Semana cargada!',
    weekDeleted: '🗑 Semana eliminada',
    confirmDelete: '¿Estás seguro de que quieres eliminar esta semana?',
    addEmployee: 'Agregar Empleado',
    deleteEmployee: 'Eliminar Empleados',
    employeeName: 'Nombre del empleado:',
    removeWhich: 'Seleccione el empleado a eliminar:',
    cancel: 'Cancelar',
    confirmDeleteNames: '¿Eliminar los siguientes?\n\n{names}',
    bulkImported: '✅ ¡Se importaron {n} semana(s) desde fotos!',
    bulkNone: '⚠ No se encontraron códigos QR en las imágenes subidas',
    totalSalesLabel: 'Ventas Totales',
    invoices: 'Facturas',
    vendor: 'Proveedor',
    addVendor: 'Agregar Proveedor',
    deleteVendors: 'Eliminar Proveedores',
    vendorName: 'Nombre del proveedor:',
    cashExpenses: 'Gastos en Efectivo',
    expense: 'Gasto',
    addExpense: 'Agregar Gasto',
    deleteExpenses: 'Eliminar Gastos',
    expenseName: 'Nombre del gasto:',
    storeName: 'Nombre de la Tienda',
    editStoreName: 'Ingrese el nombre de la tienda:',
    storeNameRequired: 'Ingrese el nombre de la tienda antes de generar la captura:',
    salary: 'Salario',
    infoMessage: 'Todos los datos se almacenan solo en su dispositivo. Si elimina la aplicaci\u00f3n, borra el almacenamiento, cambia de tel\u00e9fono o de navegador, los datos se perder\u00e1n. Sin embargo, cada captura incluye un c\u00f3digo QR \u2014 simplemente suba las fotos de sus capturas aqu\u00ed para restaurar todas sus semanas anteriores al instante.',
    notes: 'Notas',
    notesPlaceholder: 'Agregar notas para esta semana…',
    qrTooLarge: '⚠ ¡Datos demasiado grandes para el código QR! Reduzca las notas ({over} caracteres de más).',
    notesRemaining: '{n} caracteres restantes para QR',
    deleteOldest10: 'Eliminar 10 Semanas Más Antiguas',
    confirmDeleteOldest: 'Esto eliminará permanentemente las 10 semanas más antiguas. ¿Continuar?',
    weeksMax: 'Máximo 20 semanas guardadas',
    oldestDeleted: '🗑 Se eliminaron {n} semana(s) más antigua(s)',
    maxWeeksReached: '⚠ Máx 20 semanas — se eliminó la semana más antigua',
    forbiddenChars: '⚠ Los nombres no pueden contener < > " & caracteres',
    exportCSV: 'Exportar CSV',
    csvHint: 'Descargue esta semana como archivo .csv para Excel, Google Sheets o Numbers.',
    csvSaved: '📄 ¡CSV exportado!',
    cashOnHand: 'Efectivo Disponible',
    startingCash: 'Efectivo Inicial',
    autoFill: 'Auto-llenar',
    cohHint: 'Consejo: Use auto-llenar para traer datos de la semana anterior, o ingrese manualmente.',
    cohAutoFilled: '✅ Efectivo inicial auto-llenado de la semana anterior',
    cohNoPrevious: '⚠ No se encontraron datos de semana anterior para auto-llenar'
  }
};

let currentLang = 'en';
function t(key) { return (I18N[currentLang] || I18N.en)[key] || I18N.en[key] || key; }
function DAYS() { return t('days'); }

/* Safe querySelector for data-key (handles special chars in names) */
function qsel(key) {
  return document.querySelector(`[data-key="${CSS.escape(key)}"]`);
}

/* Validate name input — reject characters that break HTML */
const FORBIDDEN_RE = /[<>"&]/;
function isNameSafe(name) {
  if (FORBIDDEN_RE.test(name)) {
    showToast(t('forbiddenChars'));
    return false;
  }
  return true;
}

/* ═══════════════════════════════════════════
   STATE helpers  (per-week storage)
═══════════════════════════════════════════ */
function weekKey(dateStr) {
  return WEEK_PREFIX + dateStr;
}

function getMeta() {
  try { return JSON.parse(localStorage.getItem(META_KEY)) || {}; }
  catch(e) { return {}; }
}

function saveMeta(patch) {
  const m = Object.assign(getMeta(), patch);
  localStorage.setItem(META_KEY, JSON.stringify(m));
}

function getSavedWeeks() {
  const weeks = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(WEEK_PREFIX)) {
      weeks.push(k.replace(WEEK_PREFIX, ''));
    }
  }
  // Also migrate old mufu_v1 if present
  return weeks.sort().reverse();
}

function loadWeekData(dateStr) {
  try { return JSON.parse(localStorage.getItem(weekKey(dateStr))) || null; }
  catch(e) { return null; }
}

function saveCurrentWeek() {
  const ws = document.getElementById('week-start').value;
  if (!ws) return;
  const s = {};
  document.querySelectorAll('[data-key]').forEach(el => {
    if (el.value && el.value !== '0') s[el.dataset.key] = el.value;
  });
  // Save if there's any data OR if a week entry already exists (to allow clearing)
  const hasData = Object.keys(s).length > 0 || localStorage.getItem(weekKey(ws)) !== null;
  if (hasData) {
    s['__weekStart'] = ws;
    s['__employees'] = employees.slice();
    s['__vendors'] = vendors.slice();
    s['__cashExpenses'] = cashExpenses.slice();
    localStorage.setItem(weekKey(ws), JSON.stringify(s));
    enforceWeekLimit();
  }
  saveMeta({ lang: currentLang, lastWeek: ws, employees: employees.slice(), vendors: vendors.slice(), cashExpenses: cashExpenses.slice() });
}

function loadState() {
  // Try loading from per-week storage
  const meta = getMeta();
  if (meta.lastWeek) {
    const data = loadWeekData(meta.lastWeek);
    if (data) return data;
  }
  // Migrate old single-key storage
  try {
    const old = JSON.parse(localStorage.getItem('mufu_v1'));
    if (old && old['__weekStart']) {
      localStorage.setItem(weekKey(old['__weekStart']), JSON.stringify(old));
      localStorage.removeItem('mufu_v1');
      saveMeta({ lang: old['__lang'] || 'en', lastWeek: old['__weekStart'] });
      return old;
    }
    return old || {};
  } catch(e) { return {}; }
}

function saveState() {
  saveCurrentWeek();
}

function clearForm() {
  document.querySelectorAll('[data-key]').forEach(el => { el.value = ''; });
  updateSalesTotals();
  updateHoursTotals();
}

function applyState(s) {
  // If saved state has employees, use them and rebuild table
  if (s['__employees'] && Array.isArray(s['__employees'])) {
    employees = s['__employees'];
    saveMeta({ employees: employees.slice() });
    buildHoursTable();
  }
  if (s['__vendors'] && Array.isArray(s['__vendors'])) {
    vendors = s['__vendors'];
    saveMeta({ vendors: vendors.slice() });
    buildInvoicesTable();
  }
  if (s['__cashExpenses'] && Array.isArray(s['__cashExpenses'])) {
    cashExpenses = s['__cashExpenses'];
    saveMeta({ cashExpenses: cashExpenses.slice() });
    buildExpensesTable();
  }
  clearForm();
  Object.entries(s).forEach(([k, v]) => {
    const el = qsel(k);
    if (el) el.value = v;
  });
  if (s['__weekStart']) {
    document.getElementById('week-start').value = s['__weekStart'];
  }
  updateDateLabels();
  updateSalesTotals();
  updateHoursTotals();
  updateInvoicesTotals();
  updateExpensesTotals();
  updateNotesCounter();
}

function switchToWeek(dateStr) {
  // Save current first
  saveCurrentWeek();
  // Load target week
  const data = loadWeekData(dateStr);
  if (data) {
    applyState(data);
  } else {
    // New blank week
    document.getElementById('week-start').value = dateStr;
    clearForm();
    updateDateLabels();
    tryAutoFillCashOnHand();
  }
  currentWeekDate = dateStr;
  saveMeta({ lastWeek: dateStr });
  renderHistory();
  updateNotesCounter();
  showToast(t('weekLoaded'));
}

function deleteWeek(dateStr) {
  if (!confirm(t('confirmDelete'))) return;
  localStorage.removeItem(weekKey(dateStr));
  // If we deleted the currently displayed week, switch to this Monday
  const curWeek = document.getElementById('week-start').value;
  if (curWeek === dateStr) {
    const mon = thisMonday();
    const monStr = isoDate(mon);
    document.getElementById('week-start').value = monStr;
    // Load this Monday's data if it exists, otherwise blank
    const existing = loadWeekData(monStr);
    if (existing) {
      applyState(existing);
    } else {
      clearForm();
      updateDateLabels();
    }
    saveMeta({ lastWeek: monStr });
    currentWeekDate = monStr;
  }
  renderHistory();
  showToast(t('weekDeleted'));
}

/* ═══════════════════════════════════════════
   WEEK START – default to current Monday
═══════════════════════════════════════════ */
function thisMonday() {
  const d = new Date();
  const day = d.getDay(); // 0=Sun
  const diff = (day === 0) ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function formatDate(d) {
  const locales = { en: 'en-US', zh: 'zh-CN', es: 'es-ES' };
  return d.toLocaleDateString(locales[currentLang] || 'en-US', { month:'short', day:'numeric' });
}

function isoDate(d) {
  return d.toISOString().slice(0,10);
}

function getWeekDates() {
  const raw = document.getElementById('week-start').value;
  const base = raw ? new Date(raw + 'T00:00:00') : thisMonday();
  return DAYS().map((_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d;
  });
}

/* ═══════════════════════════════════════════
   BUILD SALES TABLE
═══════════════════════════════════════════ */
function buildSalesTable() {
  // Header: blank + days + Totals
  const headRow = document.getElementById('sales-head-row');
  headRow.innerHTML = '<th></th>';
  DAYS().forEach((_, i) => {
    const th = document.createElement('th');
    th.innerHTML = `<div>${t('daysShort')[i]}</div><div class="day-date" data-day-date="${i}"></div>`;
    headRow.appendChild(th);
  });
  headRow.innerHTML += `<th data-i18n="totals">${t('totals')}</th>`;

  // Rows: Sales, Cash, Credit Card, DoorDash/Uber
  const categories = [
    { key: 'sales', label: 'totalSales' },
    { key: 'cash',  label: 'cash' },
    { key: 'cc',    label: 'creditCard' },
    { key: 'dd',    label: 'doordashUber' }
  ];

  const tbody = document.getElementById('sales-body');
  tbody.innerHTML = '';

  categories.forEach(cat => {
    const tr = document.createElement('tr');
    let row = `<td class="row-label" data-i18n="${cat.label}">${t(cat.label)}</td>`;
    DAYS().forEach((_, i) => {
      row += `<td><input class="inp" type="number" inputmode="decimal" min="0" step="0.01"
        placeholder="0.00"
        data-key="s_${i}_${cat.key}"
        data-col="${cat.key}"
        data-row="${i}" /></td>`;
    });
    row += `<td class="tot-cell" id="tot-${cat.key}">$0.00</td>`;
    tr.innerHTML = row;
    tbody.appendChild(tr);
  });

  // Day totals row
  const totTr = document.createElement('tr');
  totTr.className = 'totals-row';
  let totRow = `<td data-i18n="totals">${t('totals')}</td>`;
  DAYS().forEach((_, i) => {
    totRow += `<td class="tot-cell" id="day-tot-${i}">$0.00</td>`;
  });
  totRow += `<td class="tot-cell tot-grand" id="grand-total">$0.00</td>`;
  totTr.innerHTML = totRow;
  tbody.appendChild(totTr);
}

function updateDateLabels() {
  const dates = getWeekDates();
  const today = isoDate(new Date());

  DAYS().forEach((_, i) => {
    const span = document.querySelector(`[data-day-date="${i}"]`);
    if (span) span.textContent = formatDate(dates[i]);
  });
}

/* ═══════════════════════════════════════════
   BUILD HOURS TABLE
═══════════════════════════════════════════ */
function buildHoursTable() {
  const headRow = document.getElementById('hours-head-row');
  headRow.innerHTML = `<th data-i18n="employee">${t('employee')}</th>`;
  DAYS().forEach((_, i) => {
    const th = document.createElement('th');
    th.textContent = t('daysShort')[i];
    headRow.appendChild(th);
  });
  headRow.innerHTML += `<th data-i18n="totalHrs">${t('totalHrs')}</th><th data-i18n="salary">${t('salary')}</th>`;

  // Salary totals row (no day totals)
  const totRow = document.getElementById('hours-totals-row');
  totRow.innerHTML = '';
  const colspan = 1 + 7 + 1; // employee + days + totalHrs
  totRow.innerHTML = `<td colspan="${colspan}" style="text-align:right;font-weight:600" data-i18n="totalSalary">${t('totalSalary') || 'Total Salary'}</td><td class="tot-cell" id="htot-salary">$0.00</td>`;

  const tbody = document.getElementById('hours-body');
  tbody.innerHTML = '';
  employees.forEach(emp => {
    const tr = document.createElement('tr');
    const safeId = CSS.escape(emp);
    let row = `<td>${emp}</td>`;
    DAYS().forEach((_, i) => {
      const key = `h_${emp}_${i}`;
      row += `<td><input class="inp" type="number" inputmode="decimal" min="0" step="0.5"
        placeholder="0"
        data-key="${key}"
        data-emp="${emp}"
        data-day="${i}" /></td>`;
    });
    row += `<td class="tot-cell" id="etot-${safeId}">0</td>`;
    row += `<td><input class="inp" type="number" inputmode="decimal" min="0" step="0.01"
      placeholder="0.00"
      data-key="sal_${emp}"
      data-salary="1" /></td>`;
    tr.innerHTML = row;
    tbody.appendChild(tr);
  });

  // Render add/delete employee buttons
  renderEmployeeActions();
}

/* ═══════════════════════════════════════════
   EMPLOYEE MANAGEMENT
═══════════════════════════════════════════ */
let deleteMode = false;

function renderEmployeeActions() {
  let bar = document.getElementById('emp-actions');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'emp-actions';
    bar.className = 'emp-actions';
    document.getElementById('hours-card').appendChild(bar);
  }
  bar.innerHTML = `
    <button class="btn-emp btn-emp-add" id="btn-add-emp">
      <i data-lucide="user-plus" style="width:15px;height:15px;"></i>
      <span>${t('addEmployee')}</span>
    </button>
    <button class="btn-emp btn-emp-del-toggle" id="btn-del-mode">
      <i data-lucide="user-minus" style="width:15px;height:15px;"></i>
      <span>${t('deleteEmployee')}</span>
    </button>
  `;

  document.getElementById('btn-add-emp').addEventListener('click', addEmployee);
  document.getElementById('btn-del-mode').addEventListener('click', toggleDeleteMode);
  lucide.createIcons();
}

function toggleDeleteMode() {
  deleteMode = !deleteMode;
  const tbody = document.getElementById('hours-body');
  const bar = document.getElementById('emp-actions');

  if (deleteMode && employees.length === 0) {
    deleteMode = false;
    return;
  }

  if (deleteMode) {
    // Add checkbox to each employee row
    tbody.querySelectorAll('tr').forEach(tr => {
      const td = document.createElement('td');
      td.className = 'emp-check-cell';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'emp-check';
      cb.dataset.emp = tr.querySelector('td').textContent;
      td.appendChild(cb);
      tr.insertBefore(td, tr.firstChild);
    });
    // Add checkbox header
    const headRow = document.getElementById('hours-head-row');
    const th = document.createElement('th');
    th.className = 'emp-check-cell';
    th.textContent = '';
    headRow.insertBefore(th, headRow.firstChild);
    // Add empty cell in totals row
    const totRow = document.getElementById('hours-totals-row');
    const td = document.createElement('td');
    td.className = 'emp-check-cell';
    totRow.insertBefore(td, totRow.firstChild);

    // Show confirm-delete button, hide others
    bar.innerHTML = `
      <button class="btn-emp btn-emp-cancel" id="btn-del-cancel">
        <span>${t('cancel')}</span>
      </button>
      <button class="btn-emp btn-emp-confirm-del" id="btn-del-confirm">
        <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
        <span>${t('deleteEmployee')}</span>
      </button>
    `;
    document.getElementById('btn-del-cancel').addEventListener('click', exitDeleteMode);
    document.getElementById('btn-del-confirm').addEventListener('click', confirmDeleteEmployees);
    lucide.createIcons();
  } else {
    exitDeleteMode();
  }
}

function exitDeleteMode() {
  deleteMode = false;
  // Remove checkbox cells
  document.querySelectorAll('.emp-check-cell').forEach(el => el.remove());
  renderEmployeeActions();
}

function confirmDeleteEmployees() {
  const checked = Array.from(document.querySelectorAll('.emp-check:checked'));
  if (checked.length === 0) return;
  const names = checked.map(cb => cb.dataset.emp);
  const msg = t('confirmDeleteNames').replace('{names}', names.join(', '));
  if (!confirm(msg)) return;
  employees = employees.filter(e => !names.includes(e));
  saveMeta({ employees: employees.slice() });
  deleteMode = false;
  buildHoursTable();
  saveCurrentWeek();
  updateNotesCounter();
}

function addEmployee() {
  const name = prompt(t('employeeName'));
  if (!name || !name.trim()) return;
  const trimmed = name.trim();
  if (!isNameSafe(trimmed)) return;
  if (employees.includes(trimmed)) return;
  employees.push(trimmed);
  saveMeta({ employees: employees.slice() });
  buildHoursTable();
  saveCurrentWeek();
  updateNotesCounter();
}

function removeEmployee(emp) {
  employees = employees.filter(e => e !== emp);
  saveMeta({ employees: employees.slice() });
  buildHoursTable();
  saveCurrentWeek();
  updateNotesCounter();
}

/* ═══════════════════════════════════════════
   INVOICES (dynamic vendors)
═══════════════════════════════════════════ */
let vendors = [];  // loaded from storage

function buildInvoicesTable() {
  // Header
  const headRow = document.getElementById('invoices-head-row');
  headRow.innerHTML = `<th data-i18n="vendor">${t('vendor')}</th>`;
  DAYS().forEach((_, i) => {
    const th = document.createElement('th');
    th.textContent = t('daysShort')[i];
    headRow.appendChild(th);
  });
  headRow.innerHTML += `<th data-i18n="totals">${t('totals')}</th>`;

  // Body — one row per vendor
  const tbody = document.getElementById('invoices-body');
  tbody.innerHTML = '';
  vendors.forEach(v => {
    const tr = document.createElement('tr');
    let row = `<td class="row-label">${v}</td>`;
    DAYS().forEach((_, i) => {
      row += `<td><input class="inp" type="number" inputmode="decimal" min="0" step="0.01"
        placeholder="0.00"
        data-key="inv_${v}_${i}"
        data-vendor="${v}"
        data-day="${i}" /></td>`;
    });
    row += `<td class="tot-cell" id="vtot-${v}">$0.00</td>`;
    tr.innerHTML = row;
    tbody.appendChild(tr);
  });

  // Totals row
  const totRow = document.getElementById('invoices-totals-row');
  totRow.innerHTML = `<td data-i18n="totals">${t('totals')}</td>`;
  DAYS().forEach((_, i) => {
    const td = document.createElement('td');
    td.className = 'tot-cell';
    td.id = `inv-day-tot-${i}`;
    td.textContent = '$0.00';
    totRow.appendChild(td);
  });
  const gtd = document.createElement('td');
  gtd.className = 'tot-cell tot-grand';
  gtd.id = 'inv-grand-total';
  gtd.textContent = '$0.00';
  totRow.appendChild(gtd);

  renderVendorActions();
}

function updateInvoicesTotals() {
  let grand = 0;
  // Per-vendor row totals
  vendors.forEach(v => {
    let vSum = 0;
    DAYS().forEach((_, i) => {
      const el = qsel(`inv_${v}_${i}`);
      vSum += el ? (parseFloat(el.value) || 0) : 0;
    });
    const td = document.getElementById(`vtot-${v}`);
    if (td) td.textContent = fmt(vSum);
  });
  // Per-day column totals
  DAYS().forEach((_, i) => {
    let daySum = 0;
    vendors.forEach(v => {
      const el = qsel(`inv_${v}_${i}`);
      daySum += el ? (parseFloat(el.value) || 0) : 0;
    });
    grand += daySum;
    const td = document.getElementById(`inv-day-tot-${i}`);
    if (td) td.textContent = fmt(daySum);
  });
  const gt = document.getElementById('inv-grand-total');
  if (gt) gt.textContent = fmt(grand);
}

let vendorDeleteMode = false;

function renderVendorActions() {
  const bar = document.getElementById('vendor-actions');
  bar.innerHTML = `
    <button class="btn-emp btn-emp-add" id="btn-add-vendor">
      <i data-lucide="plus" style="width:15px;height:15px;"></i>
      <span data-i18n="addVendor">${t('addVendor')}</span>
    </button>
    <button class="btn-emp btn-emp-del-toggle" id="btn-del-vendor-mode">
      <i data-lucide="minus" style="width:15px;height:15px;"></i>
      <span data-i18n="deleteVendors">${t('deleteVendors')}</span>
    </button>
  `;
  document.getElementById('btn-add-vendor').addEventListener('click', addVendor);
  document.getElementById('btn-del-vendor-mode').addEventListener('click', toggleVendorDeleteMode);
  lucide.createIcons();
}

function toggleVendorDeleteMode() {
  vendorDeleteMode = !vendorDeleteMode;
  const tbody = document.getElementById('invoices-body');
  const bar = document.getElementById('vendor-actions');

  if (vendorDeleteMode && vendors.length === 0) {
    vendorDeleteMode = false;
    return;
  }

  if (vendorDeleteMode) {
    // Add checkbox to each vendor row
    tbody.querySelectorAll('tr').forEach(tr => {
      const td = document.createElement('td');
      td.className = 'emp-check-cell';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'emp-check';
      cb.dataset.vendor = tr.querySelector('td').textContent;
      td.appendChild(cb);
      tr.insertBefore(td, tr.firstChild);
    });
    // Add checkbox header
    const headRow = document.getElementById('invoices-head-row');
    const th = document.createElement('th');
    th.className = 'emp-check-cell';
    headRow.insertBefore(th, headRow.firstChild);
    // Add empty cell in totals row
    const totRow = document.getElementById('invoices-totals-row');
    const td = document.createElement('td');
    td.className = 'emp-check-cell';
    totRow.insertBefore(td, totRow.firstChild);

    // Show confirm-delete button
    bar.innerHTML = `
      <button class="btn-emp btn-emp-cancel" id="btn-vdel-cancel">
        <span>${t('cancel')}</span>
      </button>
      <button class="btn-emp btn-emp-confirm-del" id="btn-vdel-confirm">
        <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
        <span>${t('deleteVendors')}</span>
      </button>
    `;
    document.getElementById('btn-vdel-cancel').addEventListener('click', exitVendorDeleteMode);
    document.getElementById('btn-vdel-confirm').addEventListener('click', confirmDeleteVendors);
    lucide.createIcons();
  } else {
    exitVendorDeleteMode();
  }
}

function exitVendorDeleteMode() {
  vendorDeleteMode = false;
  document.querySelectorAll('#invoices-table .emp-check-cell').forEach(el => el.remove());
  renderVendorActions();
}

function confirmDeleteVendors() {
  const checked = Array.from(document.querySelectorAll('#invoices-body .emp-check:checked'));
  if (checked.length === 0) return;
  const names = checked.map(cb => cb.dataset.vendor);
  const msg = t('confirmDeleteNames').replace('{names}', names.join(', '));
  if (!confirm(msg)) return;
  vendors = vendors.filter(v => !names.includes(v));
  saveMeta({ vendors: vendors.slice() });
  vendorDeleteMode = false;
  buildInvoicesTable();
  saveCurrentWeek();
  updateNotesCounter();
}

function addVendor() {
  const name = prompt(t('vendorName'));
  if (!name || !name.trim()) return;
  const trimmed = name.trim();
  if (!isNameSafe(trimmed)) return;
  if (vendors.includes(trimmed)) return;
  vendors.push(trimmed);
  saveMeta({ vendors: vendors.slice() });
  buildInvoicesTable();
  saveCurrentWeek();
  updateNotesCounter();
}

function removeVendor(v) {
  vendors = vendors.filter(x => x !== v);
  saveMeta({ vendors: vendors.slice() });
  buildInvoicesTable();
  saveCurrentWeek();
  updateNotesCounter();
}

/* ═══════════════════════════════════════════
   CASH EXPENSES (dynamic expense items)
═══════════════════════════════════════════ */
let cashExpenses = [];  // loaded from storage

function buildExpensesTable() {
  // Header
  const headRow = document.getElementById('expenses-head-row');
  headRow.innerHTML = `<th data-i18n="expense">${t('expense')}</th>`;
  DAYS().forEach((_, i) => {
    const th = document.createElement('th');
    th.textContent = t('daysShort')[i];
    headRow.appendChild(th);
  });
  headRow.innerHTML += `<th data-i18n="totals">${t('totals')}</th>`;

  // Body — one row per expense
  const tbody = document.getElementById('expenses-body');
  tbody.innerHTML = '';
  cashExpenses.forEach(ex => {
    const tr = document.createElement('tr');
    let row = `<td class="row-label">${ex}</td>`;
    DAYS().forEach((_, i) => {
      row += `<td><input class="inp" type="number" inputmode="decimal" min="0" step="0.01"
        placeholder="0.00"
        data-key="exp_${ex}_${i}"
        data-expense="${ex}"
        data-day="${i}" /></td>`;
    });
    row += `<td class="tot-cell" id="etot-${ex}">$0.00</td>`;
    tr.innerHTML = row;
    tbody.appendChild(tr);
  });

  // Totals row
  const totRow = document.getElementById('expenses-totals-row');
  totRow.innerHTML = `<td data-i18n="totals">${t('totals')}</td>`;
  DAYS().forEach((_, i) => {
    const td = document.createElement('td');
    td.className = 'tot-cell';
    td.id = `exp-day-tot-${i}`;
    td.textContent = '$0.00';
    totRow.appendChild(td);
  });
  const gtd = document.createElement('td');
  gtd.className = 'tot-cell tot-grand';
  gtd.id = 'exp-grand-total';
  gtd.textContent = '$0.00';
  totRow.appendChild(gtd);

  renderExpenseActions();
}

function updateExpensesTotals() {
  let grand = 0;
  // Per-expense row totals
  cashExpenses.forEach(ex => {
    let eSum = 0;
    DAYS().forEach((_, i) => {
      const el = qsel(`exp_${ex}_${i}`);
      eSum += el ? (parseFloat(el.value) || 0) : 0;
    });
    const td = document.getElementById(`etot-${ex}`);
    if (td) td.textContent = fmt(eSum);
  });
  // Per-day column totals
  DAYS().forEach((_, i) => {
    let daySum = 0;
    cashExpenses.forEach(ex => {
      const el = qsel(`exp_${ex}_${i}`);
      daySum += el ? (parseFloat(el.value) || 0) : 0;
    });
    grand += daySum;
    const td = document.getElementById(`exp-day-tot-${i}`);
    if (td) td.textContent = fmt(daySum);
  });
  const gt = document.getElementById('exp-grand-total');
  if (gt) gt.textContent = fmt(grand);
}

let expenseDeleteMode = false;

function renderExpenseActions() {
  const bar = document.getElementById('expense-actions');
  bar.innerHTML = `
    <button class="btn-emp btn-emp-add" id="btn-add-expense">
      <i data-lucide="plus" style="width:15px;height:15px;"></i>
      <span data-i18n="addExpense">${t('addExpense')}</span>
    </button>
    <button class="btn-emp btn-emp-del-toggle" id="btn-del-expense-mode">
      <i data-lucide="minus" style="width:15px;height:15px;"></i>
      <span data-i18n="deleteExpenses">${t('deleteExpenses')}</span>
    </button>
  `;
  document.getElementById('btn-add-expense').addEventListener('click', addExpense);
  document.getElementById('btn-del-expense-mode').addEventListener('click', toggleExpenseDeleteMode);
  lucide.createIcons();
}

function toggleExpenseDeleteMode() {
  expenseDeleteMode = !expenseDeleteMode;
  const tbody = document.getElementById('expenses-body');
  const bar = document.getElementById('expense-actions');

  if (expenseDeleteMode && cashExpenses.length === 0) {
    expenseDeleteMode = false;
    return;
  }

  if (expenseDeleteMode) {
    // Add checkbox to each expense row
    tbody.querySelectorAll('tr').forEach(tr => {
      const td = document.createElement('td');
      td.className = 'emp-check-cell';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'emp-check';
      cb.dataset.expense = tr.querySelector('td').textContent;
      td.appendChild(cb);
      tr.insertBefore(td, tr.firstChild);
    });
    // Add checkbox header
    const headRow = document.getElementById('expenses-head-row');
    const th = document.createElement('th');
    th.className = 'emp-check-cell';
    headRow.insertBefore(th, headRow.firstChild);
    // Add empty cell in totals row
    const totRow = document.getElementById('expenses-totals-row');
    const td = document.createElement('td');
    td.className = 'emp-check-cell';
    totRow.insertBefore(td, totRow.firstChild);

    // Show confirm-delete button
    bar.innerHTML = `
      <button class="btn-emp btn-emp-cancel" id="btn-edel-cancel">
        <span>${t('cancel')}</span>
      </button>
      <button class="btn-emp btn-emp-confirm-del" id="btn-edel-confirm">
        <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
        <span>${t('deleteExpenses')}</span>
      </button>
    `;
    document.getElementById('btn-edel-cancel').addEventListener('click', exitExpenseDeleteMode);
    document.getElementById('btn-edel-confirm').addEventListener('click', confirmDeleteExpenses);
    lucide.createIcons();
  } else {
    exitExpenseDeleteMode();
  }
}

function exitExpenseDeleteMode() {
  expenseDeleteMode = false;
  document.querySelectorAll('#expenses-table .emp-check-cell').forEach(el => el.remove());
  renderExpenseActions();
}

function confirmDeleteExpenses() {
  const checked = Array.from(document.querySelectorAll('#expenses-body .emp-check:checked'));
  if (checked.length === 0) return;
  const names = checked.map(cb => cb.dataset.expense);
  const msg = t('confirmDeleteNames').replace('{names}', names.join(', '));
  if (!confirm(msg)) return;
  cashExpenses = cashExpenses.filter(ex => !names.includes(ex));
  saveMeta({ cashExpenses: cashExpenses.slice() });
  expenseDeleteMode = false;
  buildExpensesTable();
  saveCurrentWeek();
  updateNotesCounter();
}

function addExpense() {
  const name = prompt(t('expenseName'));
  if (!name || !name.trim()) return;
  const trimmed = name.trim();
  if (!isNameSafe(trimmed)) return;
  if (cashExpenses.includes(trimmed)) return;
  cashExpenses.push(trimmed);
  saveMeta({ cashExpenses: cashExpenses.slice() });
  buildExpensesTable();
  saveCurrentWeek();
  updateNotesCounter();
}

function removeExpense(ex) {
  cashExpenses = cashExpenses.filter(x => x !== ex);
  saveMeta({ cashExpenses: cashExpenses.slice() });
  buildExpensesTable();
  saveCurrentWeek();
  updateNotesCounter();
}

/* ═══════════════════════════════════════════
   CASH ON HAND – auto-populate from previous week
═══════════════════════════════════════════ */
function calcEndingCash(weekData) {
  if (!weekData) return null;
  const startCash = parseFloat(weekData['coh_start']) || 0;
  // Sum cash sales for the week
  let cashIn = 0;
  for (let i = 0; i < 7; i++) {
    cashIn += parseFloat(weekData[`s_${i}_cash`]) || 0;
  }
  // Sum cash expenses for the week
  let cashOut = 0;
  const expenses = weekData['__cashExpenses'] || [];
  expenses.forEach(ex => {
    for (let i = 0; i < 7; i++) {
      cashOut += parseFloat(weekData[`exp_${ex}_${i}`]) || 0;
    }
  });
  return startCash + cashIn - cashOut;
}

function findPreviousWeekData(currentDateStr) {
  const weeks = getSavedWeeks(); // newest first
  // Find weeks that are before the current week
  const prior = weeks.filter(w => w < currentDateStr);
  if (prior.length === 0) return null;
  // Most recent previous week (prior is sorted newest-first)
  return loadWeekData(prior[0]);
}

function autoFillCashOnHand() {
  const currentDate = document.getElementById('week-start').value;
  if (!currentDate) return;
  const prevData = findPreviousWeekData(currentDate);
  if (!prevData) {
    showToast(t('cohNoPrevious'));
    return;
  }
  const ending = calcEndingCash(prevData);
  if (ending !== null) {
    document.getElementById('coh-start').value = ending.toFixed(2);
    saveState();
    showToast(t('cohAutoFilled'));
  } else {
    showToast(t('cohNoPrevious'));
  }
}

function tryAutoFillCashOnHand() {
  // Only auto-fill if the field is currently empty
  const cohEl = document.getElementById('coh-start');
  if (cohEl && !cohEl.value) {
    const currentDate = document.getElementById('week-start').value;
    if (!currentDate) return;
    const prevData = findPreviousWeekData(currentDate);
    if (prevData) {
      const ending = calcEndingCash(prevData);
      if (ending !== null && ending !== 0) {
        cohEl.value = ending.toFixed(2);
        saveState();
      }
    }
  }
}

/* ═══════════════════════════════════════════
   STORE NAME
═══════════════════════════════════════════ */
function editStoreName() {
  const name = prompt(t('editStoreName'), storeName);
  if (name === null) return; // cancelled
  if (name.trim() && !isNameSafe(name.trim())) return;
  storeName = name.trim() || t('storeName');
  document.getElementById('store-name').textContent = storeName;
  saveMeta({ storeName });
}

/* ═══════════════════════════════════════════
   TOTALS
═══════════════════════════════════════════ */
function fmt(n) { return '$' + n.toFixed(2); }

function updateSalesTotals() {
  const cols = ['sales','cash','cc','dd'];
  // Row totals (each category across all days)
  cols.forEach(c => {
    let sum = 0;
    DAYS().forEach((_, i) => {
      const el = qsel(`s_${i}_${c}`);
      sum += el ? (parseFloat(el.value) || 0) : 0;
    });
    const td = document.getElementById(`tot-${c}`);
    if (td) td.textContent = fmt(sum);
  });
  // Column totals (each day across all categories)
  let grand = 0;
  DAYS().forEach((_, i) => {
    let daySum = 0;
    cols.forEach(c => {
      const el = qsel(`s_${i}_${c}`);
      daySum += el ? (parseFloat(el.value) || 0) : 0;
    });
    grand += daySum;
    const td = document.getElementById(`day-tot-${i}`);
    if (td) td.textContent = fmt(daySum);
  });
  // Grand total
  const gt = document.getElementById('grand-total');
  if (gt) gt.textContent = fmt(grand);
}

function updateHoursTotals() {
  // Salary total
  let salarySum = 0;
  employees.forEach(emp => {
    const el = qsel(`sal_${emp}`);
    salarySum += el ? (parseFloat(el.value) || 0) : 0;
  });
  const salTd = document.getElementById('htot-salary');
  if (salTd) salTd.textContent = fmt(salarySum);

  // Per-employee total hours
  employees.forEach(emp => {
    let empSum = 0;
    DAYS().forEach((_, i) => {
      const el = qsel(`h_${emp}_${i}`);
      empSum += el ? (parseFloat(el.value) || 0) : 0;
    });
    const td = document.getElementById(`etot-${CSS.escape(emp)}`);
    if (td) td.textContent = empSum % 1 === 0 ? empSum : empSum.toFixed(1);
  });
}

/* ═══════════════════════════════════════════
   SNAPSHOT / QR GENERATION
═══════════════════════════════════════════ */

/* Calculate byte length of a string (UTF-8) */
function byteLen(str) {
  return new Blob([str]).size;
}

/* Encode JSON string to base64 for QR (pure ASCII, no multi-byte issues) */
function toQRText(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

/* Decode QR text back to JSON string (handles both base64 and raw legacy formats) */
function fromQRText(str) {
  // If it starts with '{' it's raw JSON (legacy QR)
  if (str.charAt(0) === '{') return str;
  // Otherwise assume base64
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch(e) {
    return str; // fallback
  }
}

/* Max JSON bytes that fit in QR after base64 encoding */
function maxJsonBytes() {
  return Math.floor(QR_MAX_BYTES * 3 / 4);
}

/* Build QR data WITHOUT notes, return { json, baseSize } */
function collectDataBase() {
  const out = { w: document.getElementById('week-start').value, e: employees.slice(), v: vendors.slice(), cx: cashExpenses.slice(), s: {}, h: {}, inv: {}, exp: {} };
  // Cash on hand
  const cohEl = document.getElementById('coh-start');
  const cohVal = cohEl ? (parseFloat(cohEl.value) || 0) : 0;
  if (cohVal) out.coh = cohVal;
  DAYS().forEach((_, i) => {
    ['sales','cash','cc','dd'].forEach(c => {
      const el = qsel(`s_${i}_${c}`);
      const v = el ? (parseFloat(el.value) || 0) : 0;
      if (v) out.s[`${i}_${c}`] = v;
    });
  });
  employees.forEach(emp => {
    const salEl = qsel(`sal_${emp}`);
    const salV = salEl ? (parseFloat(salEl.value) || 0) : 0;
    if (salV) out.sal = out.sal || {}, out.sal[emp] = salV;
    DAYS().forEach((_, i) => {
      const el = qsel(`h_${emp}_${i}`);
      const v = el ? (parseFloat(el.value) || 0) : 0;
      if (v) out.h[`${emp}|${i}`] = v;
    });
  });
  vendors.forEach(vnd => {
    DAYS().forEach((_, i) => {
      const el = qsel(`inv_${vnd}_${i}`);
      const val = el ? (parseFloat(el.value) || 0) : 0;
      if (val) out.inv[`${vnd}|${i}`] = val;
    });
  });
  cashExpenses.forEach(ex => {
    DAYS().forEach((_, i) => {
      const el = qsel(`exp_${ex}_${i}`);
      const val = el ? (parseFloat(el.value) || 0) : 0;
      if (val) out.exp[`${ex}|${i}`] = val;
    });
  });
  const baseJson = JSON.stringify(out);
  return { data: out, baseSize: byteLen(baseJson) };
}

/* Get how many characters of notes can still fit in QR */
function getNotesRemaining() {
  const { baseSize } = collectDataBase();
  // Account for the ',"n":"..."' wrapper (~7 bytes overhead)
  const overhead = 7;
  const available = maxJsonBytes() - baseSize - overhead;
  return Math.max(0, available);
}

/* Update the notes character counter */
function updateNotesCounter() {
  const counter = document.getElementById('notes-counter');
  if (!counter) return;
  const remaining = getNotesRemaining();
  const notesEl = document.getElementById('week-notes');
  const notesLen = notesEl ? byteLen(notesEl.value.trim()) : 0;
  const left = remaining - notesLen;

  if (left < 0) {
    counter.textContent = t('qrTooLarge').replace('{over}', Math.abs(left));
    counter.className = 'notes-counter over';
  } else {
    counter.textContent = t('notesRemaining').replace('{n}', left);
    counter.className = 'notes-counter' + (left < 50 ? ' warn' : '');
  }
}

function collectData() {
  const { data } = collectDataBase();
  const notesEl = document.getElementById('week-notes');
  if (notesEl && notesEl.value.trim()) data.n = notesEl.value.trim();
  return JSON.stringify(data);
}

async function generateSnapshot() {
  // Force store name if still default
  const defaults = [I18N.en.storeName, I18N.zh.storeName, I18N.es.storeName];
  if (defaults.includes(storeName)) {
    const name = prompt(t('storeNameRequired'));
    if (!name || !name.trim()) return;
    if (!isNameSafe(name.trim())) return;
    storeName = name.trim();
    document.getElementById('store-name').textContent = storeName;
    saveMeta({ storeName });
  }

  const btn = document.getElementById('btn-snapshot');
  btn.disabled = true;
  btn.textContent = t('working');

  try {
    const jsonStr = collectData();
    const dataSize = byteLen(jsonStr);

    if (dataSize > maxJsonBytes()) {
      const over = dataSize - maxJsonBytes();
      showToast(t('qrTooLarge').replace('{over}', over));
      return;
    }

    // Build an off-screen clone for screenshot (base64-encode for QR)
    const qrText = toQRText(jsonStr);
    const clone = buildScreenshotClone(qrText);
    document.body.appendChild(clone);

    // Small delay so QR canvas renders
    await new Promise(r => setTimeout(r, QR_RENDER_DELAY_MS));

    const canvas = await html2canvas(clone, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false
    });

    document.body.removeChild(clone);

    // Download
    const link = document.createElement('a');
    const weekVal = document.getElementById('week-start').value || 'week';
    link.download = `${storeName}-${weekVal}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    showToast(t('snapshotSaved'));
  } catch(e) {
    console.error(e);
    showToast(t('snapshotError') + ' (' + (e.message || e) + ')');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i data-lucide="camera" style="width:18px;height:18px;"></i> <span data-i18n="generateSnapshot">${t('generateSnapshot')}</span>`;
    lucide.createIcons();
  }
}

/* Helper: always returns English translation */
function tEn(key) { return I18N.en[key]; }

/* Replace all data-i18n text in a cloned element with English */
function forceEnglishClone(clone) {
  clone.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (I18N.en[key]) el.textContent = I18N.en[key];
  });
  // Replace day-short headers (th elements with day abbreviations)
  const enDays = I18N.en.daysShort;
  const curDays = t('daysShort');
  clone.querySelectorAll('th').forEach(th => {
    // Check if th contains a day short text (could be inside a div)
    const divs = th.querySelectorAll('div');
    if (divs.length > 0) {
      const dayDiv = divs[0];
      const idx = curDays.indexOf(dayDiv.textContent);
      if (idx >= 0) dayDiv.textContent = enDays[idx];
    } else {
      const idx = curDays.indexOf(th.textContent);
      if (idx >= 0) th.textContent = enDays[idx];
    }
  });
}

function buildScreenshotClone(qrText) {
  const wrap = document.createElement('div');
  wrap.style.cssText = [
    'position:absolute','left:-9999px','top:0',
    'background:#ffffff','padding:24px',
    'border-radius:16px','min-width:680px',
    'font-family:Segoe UI,system-ui,sans-serif',
    'color:#1e1e2f'
  ].join(';');

  // Title — always English, use store name
  const dates = getWeekDates();
  const title = document.createElement('div');
  title.style.cssText = 'font-size:18px;font-weight:700;margin-bottom:14px;color:#1e1e2f;';
  title.textContent = `${storeName} – ${tEn('weekOf')} ${formatDate(dates[0])} – ${formatDate(dates[6])}`;
  wrap.appendChild(title);

  // Cash on Hand line
  const cohEl = document.getElementById('coh-start');
  const cohVal = cohEl ? (parseFloat(cohEl.value) || 0) : 0;
  if (cohVal) {
    const cohLine = document.createElement('div');
    cohLine.style.cssText = 'font-size:13px;color:#1e1e2f;margin-bottom:12px;padding:8px 12px;background:#eef0f4;border-radius:8px;display:inline-block;';
    cohLine.innerHTML = `<strong style="color:#6b7194;text-transform:uppercase;font-size:11px;letter-spacing:.05em;">${tEn('cashOnHand')}:</strong> <span style="font-weight:700;margin-left:6px;">$${cohVal.toFixed(2)}</span>`;
    wrap.appendChild(cohLine);
  }

  // Clone sales table
  const salesClone = document.getElementById('sales-table').cloneNode(true);
  forceEnglishClone(salesClone);
  styleCloneTable(salesClone);
  wrap.appendChild(salesClone);

  // Replace sales inputs with text
  salesClone.querySelectorAll('input').forEach(inp => {
    const span = document.createElement('span');
    const v = parseFloat(inp.value);
    span.textContent = isNaN(v) ? '–' : '$' + v.toFixed(2);
    span.style.cssText = 'display:block;text-align:right;font-size:13px;padding:4px;color:#1e1e2f;';
    inp.parentNode.replaceChild(span, inp);
  });

  // Clone hours table — English title
  const hoursTitle = document.createElement('div');
  hoursTitle.style.cssText = 'font-size:13px;font-weight:600;color:#6b7194;text-transform:uppercase;letter-spacing:.06em;margin:16px 0 8px;';
  hoursTitle.textContent = tEn('employeeHours');
  wrap.appendChild(hoursTitle);

  const hoursClone = document.getElementById('hours-table').cloneNode(true);
  forceEnglishClone(hoursClone);
  styleCloneTable(hoursClone);
  hoursClone.querySelectorAll('input').forEach(inp => {
    const span = document.createElement('span');
    if (inp.dataset.salary) {
      const v = parseFloat(inp.value);
      span.textContent = isNaN(v) || v === 0 ? '–' : '$' + v.toFixed(2);
    } else {
      span.textContent = inp.value || '–';
    }
    span.style.cssText = 'display:block;text-align:right;font-size:13px;padding:4px;color:#1e1e2f;';
    inp.parentNode.replaceChild(span, inp);
  });
  hoursClone.querySelectorAll('.emp-check-cell').forEach(el => el.remove());
  wrap.appendChild(hoursClone);

  // Clone invoices table (if vendors exist) — English title
  if (vendors.length > 0) {
    const invTitle = document.createElement('div');
    invTitle.style.cssText = 'font-size:13px;font-weight:600;color:#6b7194;text-transform:uppercase;letter-spacing:.06em;margin:16px 0 8px;';
    invTitle.textContent = tEn('invoices');
    wrap.appendChild(invTitle);

    const invClone = document.getElementById('invoices-table').cloneNode(true);
    forceEnglishClone(invClone);
    styleCloneTable(invClone);
    invClone.querySelectorAll('input').forEach(inp => {
      const span = document.createElement('span');
      const v = parseFloat(inp.value);
      span.textContent = isNaN(v) ? '–' : '$' + v.toFixed(2);
      span.style.cssText = 'display:block;text-align:right;font-size:13px;padding:4px;color:#1e1e2f;';
      inp.parentNode.replaceChild(span, inp);
    });
    invClone.querySelectorAll('.emp-check-cell').forEach(el => el.remove());
    wrap.appendChild(invClone);
  }

  // Clone cash expenses table (if expenses exist) — English title
  if (cashExpenses.length > 0) {
    const expTitle = document.createElement('div');
    expTitle.style.cssText = 'font-size:13px;font-weight:600;color:#6b7194;text-transform:uppercase;letter-spacing:.06em;margin:16px 0 8px;';
    expTitle.textContent = tEn('cashExpenses');
    wrap.appendChild(expTitle);

    const expClone = document.getElementById('expenses-table').cloneNode(true);
    forceEnglishClone(expClone);
    styleCloneTable(expClone);
    expClone.querySelectorAll('input').forEach(inp => {
      const span = document.createElement('span');
      const v = parseFloat(inp.value);
      span.textContent = isNaN(v) ? '–' : '$' + v.toFixed(2);
      span.style.cssText = 'display:block;text-align:right;font-size:13px;padding:4px;color:#1e1e2f;';
      inp.parentNode.replaceChild(span, inp);
    });
    expClone.querySelectorAll('.emp-check-cell').forEach(el => el.remove());
    wrap.appendChild(expClone);
  }

  // Notes section (if any)
  const notesEl = document.getElementById('week-notes');
  if (notesEl && notesEl.value.trim()) {
    const notesTitle = document.createElement('div');
    notesTitle.style.cssText = 'font-size:13px;font-weight:600;color:#6b7194;text-transform:uppercase;letter-spacing:.06em;margin:16px 0 8px;';
    notesTitle.textContent = tEn('notes');
    wrap.appendChild(notesTitle);

    const notesBox = document.createElement('div');
    notesBox.style.cssText = 'font-size:13px;color:#1e1e2f;line-height:1.5;padding:10px 12px;background:#f4f5f7;border-radius:8px;white-space:pre-wrap;';
    notesBox.textContent = notesEl.value.trim();
    wrap.appendChild(notesBox);
  }

  // ── QR code in its own dedicated section — English label ──
  {
    const qrSection = document.createElement('div');
    qrSection.style.cssText = [
      'margin-top:20px',
      'padding-top:16px',
      'border-top:1px solid #d4d8e1',
      'display:flex',
      'align-items:center',
      'gap:16px'
    ].join(';');

    const qrBox = document.createElement('div');
    qrBox.style.cssText = 'background:#fff;padding:4px;border-radius:6px;border:1px solid #d4d8e1;line-height:0;flex-shrink:0;';

    const qrLabel = document.createElement('div');
    qrLabel.style.cssText = 'font-size:11px;color:#6b7194;line-height:1.4;';
    qrLabel.innerHTML = `<strong style="font-size:12px;color:#1e1e2f;">${tEn('scanToRestore')}</strong><br>` +
      storeName + ' – ' + formatDate(dates[0]) + ' – ' + formatDate(dates[6]);

    qrSection.appendChild(qrBox);
    qrSection.appendChild(qrLabel);
    wrap.appendChild(qrSection);

    // QR data is base64-encoded (pure ASCII, no multi-byte issues)
    new QRCode(qrBox, {
      text: qrText,
      width: QR_SIZE,
      height: QR_SIZE,
      correctLevel: QRCode.CorrectLevel.L
    });
  }

  return wrap;
}

function styleCloneTable(tbl) {
  tbl.style.cssText = 'width:100%;border-collapse:separate;border-spacing:0 5px;font-size:13px;margin-bottom:4px;';
  tbl.querySelectorAll('th').forEach(th => {
    th.style.cssText = 'color:#6b7194;font-size:11px;text-transform:uppercase;letter-spacing:.05em;padding:0 6px 6px;text-align:center;';
  });
  tbl.querySelectorAll('thead th:first-child, tfoot td:first-child').forEach(el => {
    el.style.textAlign = 'left';
  });
  tbl.querySelectorAll('tbody td').forEach(td => {
    td.style.cssText = 'background:#eef0f4;padding:5px 8px;color:#1e1e2f;';
  });
  tbl.querySelectorAll('tbody tr').forEach(tr => {
    const tds = tr.querySelectorAll('td');
    if (tds[0]) { tds[0].style.borderRadius = '8px 0 0 8px'; tds[0].style.paddingLeft = '12px'; }
    if (tds[tds.length-1]) tds[tds.length-1].style.borderRadius = '0 8px 8px 0';
  });
  tbl.querySelectorAll('tfoot td').forEach(td => {
    td.style.cssText = 'border-top:1px solid #d4d8e1;padding-top:8px;font-weight:700;color:#1fa855;text-align:right;font-size:13px;';
  });
  tbl.querySelectorAll('tfoot td:first-child').forEach(td => {
    td.style.color = '#6b7194';
    td.style.textAlign = 'left';
  });
}



/* ═══════════════════════════════════════════
   SAVE QR DATA TO STORAGE (without loading into form)
   Used by bulk upload to import past weeks silently
═══════════════════════════════════════════ */
function saveQRDataToStorage(jsonStr) {
  const data = JSON.parse(jsonStr);
  if (!data.w) return false;
  const s = {};
  s['__weekStart'] = data.w;
  if (data.e) s['__employees'] = data.e;
  if (data.v) s['__vendors'] = data.v;
  if (data.cx) s['__cashExpenses'] = data.cx;
  if (data.coh) s['coh_start'] = data.coh;
  if (data.s) {
    Object.entries(data.s).forEach(([k, v]) => {
      s[`s_${k}`] = v;
    });
  }
  if (data.sal) {
    Object.entries(data.sal).forEach(([emp, v]) => {
      s[`sal_${emp}`] = v;
    });
  }
  if (data.n) {
    s['notes'] = data.n;
  }
  if (data.h) {
    Object.entries(data.h).forEach(([k, v]) => {
      const [emp, day] = k.split('|');
      s[`h_${emp}_${day}`] = v;
    });
  }
  if (data.inv) {
    Object.entries(data.inv).forEach(([k, v]) => {
      const [vnd, day] = k.split('|');
      s[`inv_${vnd}_${day}`] = v;
    });
  }
  if (data.exp) {
    Object.entries(data.exp).forEach(([k, v]) => {
      const [ex, day] = k.split('|');
      s[`exp_${ex}_${day}`] = v;
    });
  }
  localStorage.setItem(weekKey(data.w), JSON.stringify(s));
  return true;
}

/* ═══════════════════════════════════════════
   BULK UPLOAD – import multiple past week photos
═══════════════════════════════════════════ */
function triggerBulkUpload() {
  document.getElementById('bulk-file-input').click();
}

async function handleBulkFiles(e) {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  let imported = 0;

  for (const file of files) {
    try {
      const result = await decodeQRFromFile(file);
      if (result) {
        const saved = saveQRDataToStorage(result);
        if (saved) imported++;
      }
    } catch(err) {
      // Skip failed files
    }
  }

  if (imported > 0) {
    enforceWeekLimit();
    showToast(t('bulkImported').replace('{n}', imported));
    renderHistory();
    // Show the sidebar
    document.getElementById('history-panel').classList.add('open');
    document.getElementById('sidebar-overlay').classList.add('open');
  } else {
    showToast(t('bulkNone'));
  }

  e.target.value = '';
}

function decodeQRFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement('canvas');
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: 'dontInvert' });
      if (code) {
        // Decode QR text (base64 or raw JSON)
        resolve(fromQRText(code.data));
      } else {
        resolve(null);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(img.src); reject(new Error('load failed')); };
    img.src = URL.createObjectURL(file);
  });
}

/* ═══════════════════════════════════════════
   HISTORY PANEL
═══════════════════════════════════════════ */
function toggleHistoryPanel() {
  const panel = document.getElementById('history-panel');
  const overlay = document.getElementById('sidebar-overlay');
  const isOpen = panel.classList.contains('open');
  if (isOpen) {
    panel.classList.remove('open');
    overlay.classList.remove('open');
  } else {
    renderHistory();
    panel.classList.add('open');
    overlay.classList.add('open');
  }
}

function renderHistory() {
  const list = document.getElementById('history-list');
  const empty = document.getElementById('history-empty');
  const delBtn = document.getElementById('btn-delete-oldest');
  const weeks = getSavedWeeks();
  const currentWeek = document.getElementById('week-start').value;

  list.innerHTML = '';

  // Show/hide delete oldest button (only useful when there are weeks to delete)
  if (delBtn) delBtn.style.display = weeks.length > 0 ? '' : 'none';

  if (weeks.length === 0) {
    empty.style.display = '';
    list.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  list.style.display = '';

  weeks.forEach(dateStr => {
    const data = loadWeekData(dateStr);
    const totalSales = calcWeekTotalSales(data);

    // Build date range label
    const base = new Date(dateStr + 'T00:00:00');
    const end = new Date(base);
    end.setDate(base.getDate() + 6);

    const item = document.createElement('div');
    item.className = 'history-item' + (dateStr === currentWeek ? ' active' : '');

    item.innerHTML = `
      <div class="history-item-icon">
        <i data-lucide="calendar-days" style="color:#fff;width:18px;height:18px;"></i>
      </div>
      <div class="history-item-info">
        <div class="history-item-title">${t('weekOf')} ${formatDate(base)} – ${formatDate(end)}</div>
        <div class="history-item-sub">${t('totalSalesLabel')}: ${fmt(totalSales)}</div>
      </div>
      <button class="history-item-delete" data-week="${dateStr}" title="Delete" aria-label="Delete">&times;</button>
    `;

    // Click to load week (but not on the delete button)
    item.addEventListener('click', (e) => {
      if (e.target.closest('.history-item-delete')) return;
      switchToWeek(dateStr);
    });

    // Delete button
    item.querySelector('.history-item-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteWeek(dateStr);
    });

    list.appendChild(item);
  });

  lucide.createIcons();
}

function calcWeekTotalSales(data) {
  if (!data) return 0;
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const key = `s_${i}_sales`;
    if (data[key]) total += parseFloat(data[key]) || 0;
  }
  return total;
}

const MAX_WEEKS = 20;

function deleteOldest10Weeks() {
  const weeks = getSavedWeeks(); // newest first
  if (weeks.length === 0) return;
  if (!confirm(t('confirmDeleteOldest'))) return;
  const currentWeek = document.getElementById('week-start').value;
  const oldest = weeks.slice(-10).filter(w => w !== currentWeek);
  if (oldest.length === 0) return;
  oldest.forEach(w => localStorage.removeItem(weekKey(w)));
  renderHistory();
  showToast(t('oldestDeleted').replace('{n}', oldest.length));
}

function enforceWeekLimit() {
  const weeks = getSavedWeeks(); // newest first
  if (weeks.length <= MAX_WEEKS) return;
  // Remove oldest weeks beyond limit
  const toRemove = weeks.slice(MAX_WEEKS);
  toRemove.forEach(w => localStorage.removeItem(weekKey(w)));
  if (toRemove.length) showToast(t('maxWeeksReached'));
}

/* ═══════════════════════════════════════════
   TOAST
═══════════════════════════════════════════ */
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

/* ═══════════════════════════════════════════
   LANGUAGE SWITCHING
═══════════════════════════════════════════ */
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (val) el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    const val = t(key);
    if (val) el.placeholder = val;
  });
  document.title = `Mufu – ${t('subtitle')}`;
}

function setLanguage(lang) {
  currentLang = lang;
  // Update html lang attribute to prevent browser auto-translate
  document.documentElement.lang = lang;
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  // Preserve current input values
  const savedValues = {};
  document.querySelectorAll('[data-key]').forEach(el => {
    savedValues[el.dataset.key] = el.value;
  });
  // Rebuild tables with new language
  buildSalesTable();
  buildHoursTable();
  buildInvoicesTable();
  buildExpensesTable();
  // Restore input values
  Object.entries(savedValues).forEach(([k, v]) => {
    const el = qsel(k);
    if (el) el.value = v;
  });
  applyI18n();
  updateDateLabels();
  updateSalesTotals();
  updateHoursTotals();
  updateInvoicesTotals();
  updateExpensesTotals();
  saveState();
}

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
function init() {
  const mon = thisMonday();
  const weekInput = document.getElementById('week-start');
  weekInput.value = isoDate(mon);
  // Restrict picker to Mondays: step=7 from a known Monday
  weekInput.setAttribute('step', '7');
  weekInput.setAttribute('min', '2024-01-01'); // a Monday

  // Load saved state (may contain language preference)
  const meta = getMeta();
  if (meta.lang) currentLang = meta.lang;
  if (meta.employees && Array.isArray(meta.employees)) employees = meta.employees;
  if (meta.vendors && Array.isArray(meta.vendors)) vendors = meta.vendors;
  if (meta.cashExpenses && Array.isArray(meta.cashExpenses)) cashExpenses = meta.cashExpenses;
  if (meta.storeName) storeName = meta.storeName;
  document.getElementById('store-name').textContent = storeName;
  const saved = loadState();
  // Use employees/vendors from saved week data if present (but NOT __lang — meta is authoritative)
  if (saved && saved['__employees'] && Array.isArray(saved['__employees'])) employees = saved['__employees'];
  if (saved && saved['__vendors'] && Array.isArray(saved['__vendors'])) vendors = saved['__vendors'];
  if (saved && saved['__cashExpenses'] && Array.isArray(saved['__cashExpenses'])) cashExpenses = saved['__cashExpenses'];

  // Build tables
  buildSalesTable();
  buildHoursTable();
  buildInvoicesTable();
  buildExpensesTable();

  // Apply language
  document.documentElement.lang = currentLang;
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
  applyI18n();

  // Load saved state (may override week-start)
  if (saved && Object.keys(saved).length) applyState(saved);
  else updateDateLabels();

  // Initialize notes counter
  updateNotesCounter();

  // Week change — save current week under OLD date, then load new week or start fresh
  currentWeekDate = document.getElementById('week-start').value;

  document.getElementById('week-start').addEventListener('change', () => {
    // Snap to Monday if a non-Monday was somehow selected
    const picked = document.getElementById('week-start').value;
    if (picked) {
      const d = new Date(picked + 'T00:00:00');
      const day = d.getDay();
      if (day !== 1) {
        const diff = (day === 0) ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
        document.getElementById('week-start').value = isoDate(d);
      }
    }

    // Save the old week under the previous date
    if (currentWeekDate) {
      const oldWs = currentWeekDate;
      const s = {};
      document.querySelectorAll('[data-key]').forEach(el => {
        if (el.value && el.value !== '0') s[el.dataset.key] = el.value;
      });
      if (Object.keys(s).length > 0) {
        s['__weekStart'] = oldWs;
        s['__employees'] = employees.slice();
        s['__vendors'] = vendors.slice();
        s['__cashExpenses'] = cashExpenses.slice();
        localStorage.setItem(weekKey(oldWs), JSON.stringify(s));
      }
    }

    const newDate = document.getElementById('week-start').value;
    currentWeekDate = newDate;
    const existing = loadWeekData(newDate);
    if (existing) {
      applyState(existing);
    } else {
      clearForm();
      updateDateLabels();
      tryAutoFillCashOnHand();
    }
    saveMeta({ lastWeek: newDate });
    renderHistory();
    updateNotesCounter();
  });

  // Auto-save + totals on input
  document.addEventListener('input', e => {
    if (e.target.matches('[data-key]')) {
      saveState();
      const col = e.target.dataset.col;
      if (col) updateSalesTotals();
      if (e.target.dataset.emp || e.target.dataset.salary) updateHoursTotals();
      if (e.target.dataset.vendor) updateInvoicesTotals();
      if (e.target.dataset.expense) updateExpensesTotals();
      updateNotesCounter();
    }
  });

  // Language switcher
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  // Buttons
  document.getElementById('btn-snapshot').addEventListener('click', generateSnapshot);

  // History
  document.getElementById('btn-history').addEventListener('click', toggleHistoryPanel);
  document.getElementById('btn-history-close').addEventListener('click', toggleHistoryPanel);
  document.getElementById('sidebar-overlay').addEventListener('click', toggleHistoryPanel);
  document.getElementById('btn-delete-oldest').addEventListener('click', deleteOldest10Weeks);

  // Bulk upload
  document.getElementById('btn-bulk-upload').addEventListener('click', triggerBulkUpload);
  document.getElementById('bulk-file-input').addEventListener('change', handleBulkFiles);

  // Store name edit
  document.getElementById('btn-edit-name').addEventListener('click', editStoreName);

  // Cash on Hand auto-fill button
  document.getElementById('btn-auto-fill-coh').addEventListener('click', autoFillCashOnHand);

  // Export CSV
  document.getElementById('btn-export-csv').addEventListener('click', exportCSV);

  // Info popup
  document.getElementById('btn-info').addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleInfoPopup();
  });
  document.getElementById('btn-info-close').addEventListener('click', toggleInfoPopup);
  document.getElementById('info-overlay').addEventListener('click', toggleInfoPopup);

  // Lucide icons
  lucide.createIcons();
}

function toggleInfoPopup() {
  document.getElementById('info-popup').classList.toggle('show');
  document.getElementById('info-overlay').classList.toggle('show');
}

/* ═══════════════════════════════════════════
   EXPORT CSV
═══════════════════════════════════════════ */
function csvEscape(val) {
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function exportCSV() {
  const dates = getWeekDates();
  const enDays = I18N.en.daysShort;
  const rows = [];

  // Header
  rows.push(storeName + ' \u2013 Week of ' + formatDate(dates[0]) + ' \u2013 ' + formatDate(dates[6]));
  rows.push('');

  // --- Cash on Hand ---
  const cohEl = document.getElementById('coh-start');
  const cohVal = cohEl ? (parseFloat(cohEl.value) || 0) : 0;
  if (cohVal) {
    rows.push('CASH ON HAND');
    rows.push('Starting Cash,' + cohVal.toFixed(2));
    rows.push('');
  }

  // --- Sales ---
  rows.push('DAILY SALES');
  const salesHeader = ['', ...enDays.map((d, i) => d + ' ' + formatDate(dates[i])), 'Total'];
  rows.push(salesHeader.map(csvEscape).join(','));

  const cats = [
    { key: 'sales', label: 'Total Sales' },
    { key: 'cash', label: 'Cash' },
    { key: 'cc', label: 'Credit Card' },
    { key: 'dd', label: 'DoorDash / Uber' }
  ];
  cats.forEach(cat => {
    let total = 0;
    const vals = enDays.map((_, i) => {
      const el = qsel(`s_${i}_${cat.key}`);
      const v = el ? (parseFloat(el.value) || 0) : 0;
      total += v;
      return v.toFixed(2);
    });
    rows.push([csvEscape(cat.label), ...vals, total.toFixed(2)].join(','));
  });

  // Day totals
  let grandTotal = 0;
  const dayTots = enDays.map((_, i) => {
    let daySum = 0;
    cats.forEach(cat => {
      const el = qsel(`s_${i}_${cat.key}`);
      daySum += el ? (parseFloat(el.value) || 0) : 0;
    });
    grandTotal += daySum;
    return daySum.toFixed(2);
  });
  rows.push(['Totals', ...dayTots, grandTotal.toFixed(2)].join(','));

  // --- Hours ---
  if (employees.length > 0) {
    rows.push('');
    rows.push('EMPLOYEE HOURS');
    rows.push(['Employee', ...enDays, 'Total Hrs', 'Salary'].map(csvEscape).join(','));
    employees.forEach(emp => {
      let empTotal = 0;
      const hrs = enDays.map((_, i) => {
        const el = qsel(`h_${emp}_${i}`);
        const v = el ? (parseFloat(el.value) || 0) : 0;
        empTotal += v;
        return v;
      });
      const salEl = qsel(`sal_${emp}`);
      const sal = salEl ? (parseFloat(salEl.value) || 0) : 0;
      rows.push([csvEscape(emp), ...hrs, empTotal % 1 === 0 ? empTotal : empTotal.toFixed(1), sal.toFixed(2)].join(','));
    });
  }

  // --- Invoices ---
  if (vendors.length > 0) {
    rows.push('');
    rows.push('INVOICES');
    rows.push(['Vendor', ...enDays, 'Total'].map(csvEscape).join(','));
    vendors.forEach(v => {
      let vTotal = 0;
      const vals = enDays.map((_, i) => {
        const el = qsel(`inv_${v}_${i}`);
        const val = el ? (parseFloat(el.value) || 0) : 0;
        vTotal += val;
        return val.toFixed(2);
      });
      rows.push([csvEscape(v), ...vals, vTotal.toFixed(2)].join(','));
    });
  }

  // --- Cash Expenses ---
  if (cashExpenses.length > 0) {
    rows.push('');
    rows.push('CASH EXPENSES');
    rows.push(['Expense', ...enDays, 'Total'].map(csvEscape).join(','));
    cashExpenses.forEach(ex => {
      let exTotal = 0;
      const vals = enDays.map((_, i) => {
        const el = qsel(`exp_${ex}_${i}`);
        const val = el ? (parseFloat(el.value) || 0) : 0;
        exTotal += val;
        return val.toFixed(2);
      });
      rows.push([csvEscape(ex), ...vals, exTotal.toFixed(2)].join(','));
    });
  }

  // --- Notes ---
  const notesEl = document.getElementById('week-notes');
  if (notesEl && notesEl.value.trim()) {
    rows.push('');
    rows.push('NOTES');
    rows.push(csvEscape(notesEl.value.trim()));
  }

  // Download
  const bom = '\uFEFF'; // UTF-8 BOM so Excel handles Unicode
  const csv = bom + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const weekVal = document.getElementById('week-start').value || 'week';
  link.download = `${storeName}-${weekVal}.csv`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
  showToast(t('csvSaved'));
}

document.addEventListener('DOMContentLoaded', init);

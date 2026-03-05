/* ══════════════════════════════════════════
   Monthly Inventory – inventory.js
   Categorised inventory, QR snapshot, LocalStorage
══════════════════════════════════════════ */

/* ═══════════════════════════════════════════
   CONFIG
═══════════════════════════════════════════ */
const INV_PREFIX = 'edr_inv_';       // per-month keys: edr_inv_2026-03
const META_KEY   = 'edr_meta';
const INV_CFG_KEY = 'edr_inv_cfg_v1';
const QR_SIZE = 180;
const QR_MAX_BYTES = 2900;  // QR capacity per code at EC Level L

/* ═══════════════════════════════════════════
   INVENTORY DATA  (from inventory_items_price_units.txt)
   Items with obviously invalid prices or vendor entries excluded.
═══════════════════════════════════════════ */
const DEFAULT_CATEGORIES = [
  {
    id: 'meat_seafood',
    labelKey: 'catMeatSeafood',
    items: [
      { name: 'Beef',           price: 5.21,  unit: 'lbs' },
      { name: 'Chicken',        price: 1.27,  unit: 'lbs' },
      { name: 'Chicken Bones',  price: 0.66,  unit: 'lbs' },
      { name: 'Shrimp',         price: 128.00,unit: 'box' },
      { name: 'Salmon',         price: 4.60,  unit: 'lb' },
      { name: 'Crab Sticks',    price: 3.15,  unit: 'lbs' },
      { name: 'Fried Shrimp',   price: 51.00, unit: 'box' },
      { name: 'Minced Tuna',    price: 4.95,  unit: 'lbs' },
      { name: 'Sushi Salmon',   price: null,  unit: '' },
    ]
  },
  {
    id: 'produce',
    labelKey: 'catProduce',
    items: [
      { name: 'Broccoli',              price: 27.00, unit: 'box' },
      { name: 'Carrots',               price: 26.00, unit: 'box' },
      { name: 'Cabbage',               price: 6.00,  unit: 'each' },
      { name: 'Large Onion',           price: 20.00, unit: 'bag' },
      { name: 'Celery',                price: 43.00, unit: 'each' },
      { name: 'Ginger',                price: 2.95,  unit: 'lbs' },
      { name: 'Garlic',                price: 3.85,  unit: 'lbs' },
      { name: 'Green/Red Bell Peppers',price: 19.50, unit: 'box' },
      { name: 'Avocado',               price: 43.00, unit: 'box' },
      { name: 'Green Onion',           price: 0.20,  unit: 'each' },
    ]
  },
  {
    id: 'rice_noodles',
    labelKey: 'catRiceNoodles',
    items: [
      { name: 'Rice',             price: 23.50,  unit: 'bags' },
      { name: 'Kokuho Rice',      price: 28.50,  unit: 'bags' },
      { name: 'Egg Noodles',      price: 300.00, unit: 'each' },
      { name: 'Tofu',             price: 2.98,   unit: 'bags' },
      { name: 'Spring Rolls',     price: 39.95,  unit: 'box' },
      { name: 'Dumplings',        price: 64.95,  unit: 'box' },
      { name: 'Chicken Roll',     price: 30.95,  unit: 'box' },
      { name: 'Spring Roll Bags', price: 14.50,  unit: 'box' },
    ]
  },
  {
    id: 'sauces',
    labelKey: 'catSauces',
    items: [
      { name: 'Soy Sauce',         price: 26.50, unit: 'buckets' },
      { name: 'Vegetable Oil',     price: 28.95, unit: 'buckets' },
      { name: 'Chili Sauce',       price: 2.29,  unit: 'bottles' },
      { name: 'Mayonnaise',        price: 4.00,  unit: 'each' },
      { name: 'Ketchup',           price: 1.00,  unit: 'each' },
      { name: 'Teppanyaki Sauce',  price: 1.00,  unit: 'each' },
      { name: 'Sesame Oil',        price: 1.00,  unit: 'each' },
      { name: 'Shaoxing Rice Wine',price: 1.00,  unit: 'each' },
      { name: 'Sushi Vinegar',     price: 45.00, unit: 'box' },
      { name: 'White Vinegar',     price: 1.00,  unit: 'each' },
      { name: 'Butter',            price: 33.00, unit: 'box' },
      { name: 'Wine',              price: 1.00,  unit: 'each' },
      { name: 'Cornstarch',        price: 0.50,  unit: 'each' },
      { name: 'White Sugar',       price: 0.80,  unit: 'each' },
      { name: 'Brown Sugar',       price: 1.50,  unit: 'each' },
      { name: 'Yellow Mustard Powder', price: null, unit: '' },
    ]
  },
  {
    id: 'sushi',
    labelKey: 'catSushi',
    items: [
      { name: 'Sushi Nori',         price: 80.00, unit: 'box' },
      { name: 'Sushi Kombu',        price: 17.95, unit: 'bag' },
      { name: 'Sushi Wasabi Powder',price: 7.50,  unit: 'bags' },
      { name: 'Sushi Red Ginger',   price: null,  unit: '' },
      { name: 'Sushi Plate No. 10', price: 87.50, unit: 'box' },
      { name: 'Sushi Lids',         price: 87.50, unit: 'box' },
    ]
  },
  {
    id: 'drinks',
    labelKey: 'catDrinks',
    items: [
      { name: 'Bottled Drinks',       price: 32.15,  unit: 'box' },
      { name: 'Bottled Water',        price: 4.99,   unit: 'box' },
      { name: 'Self-purchased Drinks',price: 4.99,   unit: 'packs' },
      { name: 'Soda Syrup',           price: 113.10, unit: 'box' },
      { name: 'CO2',                  price: 40.64,  unit: 'pieces' },
    ]
  },
  {
    id: 'packaging',
    labelKey: 'catPackaging',
    items: [
      { name: 'Small Lunch Box',   price: null,  unit: '' },
      { name: '22oz Cups',         price: 52.50, unit: 'box' },
      { name: '22oz Lids',         price: 52.50, unit: 'box' },
      { name: 'Plastic Wrap',      price: 19.50, unit: 'box' },
      { name: '2 oz Cups',         price: 33.00, unit: 'sets' },
      { name: '2 oz Lids',         price: null,  unit: '' },
      { name: '306 Box',           price: 43.00, unit: 'box' },
      { name: 'Lunch Box 241',     price: 18.00, unit: 'box' },
      { name: 'Takeout Bags',      price: 30.00, unit: 'box' },
      { name: 'Forks',             price: 16.00, unit: 'box' },
      { name: 'Chopsticks',        price: 37.00, unit: 'box' },
      { name: 'Napkins',           price: 28.00, unit: 'box' },
      { name: 'Straws',            price: null,  unit: '' },
      { name: 'Water Cups',        price: null,  unit: '' },
      { name: 'Disposable Plates', price: null,  unit: '' },
      { name: 'Trash Bags',        price: 7.50,  unit: 'box' },
      { name: 'Receipt Paper',     price: 48.00, unit: 'box' },
      { name: 'Small Soy Sauce Packets',    price: 6.95,  unit: 'box' },
      { name: 'Small Chili Packets',        price: 12.75, unit: 'box' },
      { name: 'Small Yellow Mustard Packets',price: null,  unit: '' },
      { name: 'Gloves',            price: null,  unit: '' },
      { name: 'Aprons',            price: null,  unit: '' },
    ]
  },
  {
    id: 'cleaning',
    labelKey: 'catCleaning',
    items: [
      { name: 'Dish Soap',        price: 13.95, unit: 'box' },
      { name: 'Bleach',           price: 19.95, unit: 'box' },
      { name: 'Stove Cleaner',    price: 19.00, unit: 'box' },
      { name: 'Grey Paper Towels',price: 23.50, unit: 'box' },
      { name: 'Toilet Paper',     price: 20.50, unit: 'box' },
      { name: 'Cleaning Towels',  price: null,  unit: '' },
      { name: 'Cleanser',         price: null,  unit: '' },
    ]
  }
];

/* ═══════════════════════════════════════════
   i18n
═══════════════════════════════════════════ */
const I18N = {
  en: {
    invSubtitle: 'Monthly Inventory',
    backToDaily: 'Back to Daily Sales',
    selectMonth: 'Select Month:',
    monthPickerTitle: 'Select Year and Month',
    year: 'Year',
    apply: 'Apply',
    generateSnapshot: 'Generate Snapshot',
    uploadQr: 'Upload QR',
    addCategory: 'Add Category',
    previousMonths: 'Previous Months',
    addItem: 'Add Item',
    deleteCategory: 'Delete Category',
    deleteItem: 'Delete Item',
    actions: 'Actions',
    clearAll: 'Clear All',
    noSavedMonths: 'No saved months yet.',
    grandTotal: 'Grand Total',
    subtotal: 'Subtotal',
    item: 'Item',
    price: 'Price',
    unitLabel: 'Unit',
    qty: 'Qty',
    lineTotal: 'Total',
    catMeatSeafood: 'Meat & Seafood',
    catProduce: 'Produce & Vegetables',
    catRiceNoodles: 'Rice, Noodles & Prepared',
    catSauces: 'Sauces & Seasonings',
    catSushi: 'Sushi Supplies',
    catDrinks: 'Drinks',
    catPackaging: 'Packaging & Smallwares',
    catCleaning: 'Cleaning Supplies',
    monthLoaded: '✅ Month loaded!',
    monthDeleted: '🗑 Month deleted',
    confirmDelete: 'Are you sure you want to delete this month?',
    working: 'Working…',
    snapshotSaved: '📸 Snapshot saved!',
    snapshotError: '⚠ Error generating snapshot',
    qrUploadSuccess: '✅ Inventory restored from QR',
    qrUploadPartial: '⚠ Imported one QR part. Please upload the other part too.',
    qrUploadNone: '⚠ No inventory QR found in image',
    qrUploadError: '⚠ Error reading QR image',
    categoryAdded: '✅ Category added',
    itemAdded: '✅ Item added',
    categoryDeleted: '🗑 Category deleted',
    itemDeleted: '🗑 Item deleted',
    clearedAll: '🧹 All quantities cleared',
    forbiddenChars: '⚠ Names cannot contain < > " & characters',
    promptCategoryName: 'Category name:',
    promptItemName: 'Item name:',
    promptItemPrice: 'Price (number):',
    promptItemUnit: 'Unit:',
    promptDeleteCategoryPick: 'Enter the number of the category to delete:',
    promptDeleteItemPick: 'Enter the number of the item to delete:',
    confirmDeleteCategory: 'Are you sure you want to delete this category?',
    confirmDeleteItem: 'Are you sure you want to delete this item?',
    confirmDeleteCategoryMany: 'Are you sure you want to delete the selected categories?',
    confirmDeleteItemMany: 'Are you sure you want to delete the selected items?',
    confirmClearAll: 'Are you sure you want to clear all quantities for this month?',
    selectCategoriesToDelete: 'Select categories to delete',
    selectItemsToDelete: 'Select items to delete',
    cancel: 'Cancel',
    deleteSelected: 'Delete Selected',
    inventoryOf: 'Inventory –',
    na: 'N/A',
    monthlyInventory: 'Monthly Inventory',
    monthlyInvoicesTitle: 'Monthly Invoices',
    monthlyInvoicesTotal: 'Monthly Invoices Total',
    autoFillInvoices: 'Auto-fill from Sales',
    invoicesHint: 'Add invoices manually or auto-fill from your saved weekly reports.',
    invoicesAutoFilled: '✅ Invoices auto-filled from {n} week(s)',
    invoicesNoWeeks: '⚠ No saved weeks found for this month',
    invoicesWeekOf: 'Week of',
    vendor: 'Vendor',
    weekTotal: 'Week Total',
    totals: 'Totals',
    addInvoice: 'Add Invoice',
    deleteInvoice: 'Delete Invoice',
    invoiceVendorName: 'Vendor name:',
    invoiceAmount: 'Amount:',
    paid: 'Paid',
    unpaid: 'Unpaid',
    amount: 'Amount',
    status: 'Status',
    invoiceDate: 'Date',
    invoiceDatePrompt: 'Date (YYYY-MM-DD):',
    invoiceAdded: '✅ Invoice added',
    invoiceDeleted: '🗑 Invoice deleted',
    selectInvoicesToDelete: 'Select invoices to delete',
    confirmDeleteInvoices: 'Delete the selected invoices?',
    invNotes: 'Notes',
    invNotesPlaceholder: 'Add notes for this month…',
    searchPlaceholder: 'Search items…',
    noSearchResults: 'No items match your search.',
    notesRemaining: '{n} characters remaining for QR',
    qrTooLarge: '⚠ Notes too large for QR! Please reduce ({over} bytes over limit).',
    exportCSV: 'Export CSV',
    csvHint: 'Download this month\u2019s inventory as a .csv file for Excel, Google Sheets, or Numbers.',
    csvSaved: '📄 CSV exported!',
  },
  zh: {
    invSubtitle: '月度库存',
    backToDaily: '返回每日销售',
    selectMonth: '选择月份：',
    monthPickerTitle: '选择年份和月份',
    year: '年份',
    apply: '应用',
    generateSnapshot: '生成快照',
    uploadQr: '上传二维码',
    addCategory: '新增分类',
    previousMonths: '历史月份',
    addItem: '新增项目',
    deleteCategory: '删除分类',
    deleteItem: '删除项目',
    actions: '操作',
    clearAll: '清空全部',
    noSavedMonths: '暂无保存的月份。',
    grandTotal: '总计',
    subtotal: '小计',
    item: '项目',
    price: '价格',
    unitLabel: '单位',
    qty: '数量',
    lineTotal: '合计',
    catMeatSeafood: '肉类 & 海鲜',
    catProduce: '蔬菜 & 果蔬',
    catRiceNoodles: '米饭, 面条 & 预制品',
    catSauces: '酱料 & 调味品',
    catSushi: '寿司用品',
    catDrinks: '饮料',
    catPackaging: '包装 & 小件用品',
    catCleaning: '清洁用品',
    monthLoaded: '✅ 月份已加载！',
    monthDeleted: '🗑 月份已删除',
    confirmDelete: '确定要删除这个月份吗？',
    working: '处理中…',
    snapshotSaved: '📸 快照已保存！',
    snapshotError: '⚠ 生成快照出错',
    qrUploadSuccess: '✅ 已从二维码恢复库存',
    qrUploadPartial: '⚠ 已导入一个二维码部分，请再上传另一个部分。',
    qrUploadNone: '⚠ 图片中未识别到库存二维码',
    qrUploadError: '⚠ 读取二维码图片出错',
    categoryAdded: '✅ 分类已添加',
    itemAdded: '✅ 项目已添加',
    categoryDeleted: '🗑 分类已删除',
    itemDeleted: '🗑 项目已删除',
    clearedAll: '🧹 本月数量已清空',
    forbiddenChars: '⚠ 名称不能包含 < > " & 字符',
    promptCategoryName: '分类名称：',
    promptItemName: '项目名称：',
    promptItemPrice: '价格（数字）：',
    promptItemUnit: '单位：',
    promptDeleteCategoryPick: '输入要删除分类的编号：',
    promptDeleteItemPick: '输入要删除项目的编号：',
    confirmDeleteCategory: '确定要删除这个分类吗？',
    confirmDeleteItem: '确定要删除这个项目吗？',
    confirmDeleteCategoryMany: '确定要删除所选分类吗？',
    confirmDeleteItemMany: '确定要删除所选项目吗？',
    confirmClearAll: '确定要清空本月所有数量吗？',
    selectCategoriesToDelete: '选择要删除的分类',
    selectItemsToDelete: '选择要删除的项目',
    cancel: '取消',
    deleteSelected: '删除所选',
    inventoryOf: '库存 –',
    na: '无',
    monthlyInventory: '月度库存',
    monthlyInvoicesTitle: '月度发票',
    monthlyInvoicesTotal: '月度发票总计',
    autoFillInvoices: '从销售自动填充',
    invoicesHint: '从保存的本月周报中提取供应商发票总额。',
    invoicesAutoFilled: '✅ 已从 {n} 个周报自动填充发票',
    invoicesNoWeeks: '⚠ 未找到本月的已保存周报',
    invoicesWeekOf: '周报',
    vendor: '供应商',
    weekTotal: '周总计',
    totals: '合计',
    addInvoice: '添加发票',
    deleteInvoice: '删除发票',
    invoiceVendorName: '供应商名称：',
    invoiceAmount: '金额：',
    paid: '已付',
    unpaid: '未付',
    amount: '金额',
    status: '状态',
    invoiceDate: '日期',
    invoiceDatePrompt: '日期 (YYYY-MM-DD)：',
    invoiceAdded: '✅ 发票已添加',
    invoiceDeleted: '🗑 发票已删除',
    selectInvoicesToDelete: '选择要删除的发票',
    confirmDeleteInvoices: '删除所选发票？',
    invNotes: '备注',
    invNotesPlaceholder: '添加本月备注…',
    searchPlaceholder: '搜索项目…',
    noSearchResults: '没有匹配的项目。',
    notesRemaining: '二维码剩余 {n} 个字符',
    qrTooLarge: '⚠ 备注超出二维码容量！请减少（超出 {over} 字节）。',
    exportCSV: '导出 CSV',
    csvHint: '将本月库存数据下载为 .csv 文件，可在 Excel、Google Sheets 或 Numbers 中打开。',
    csvSaved: '📄 CSV 已导出！',
  },
  es: {
    invSubtitle: 'Inventario Mensual',
    backToDaily: 'Volver a Ventas Diarias',
    selectMonth: 'Seleccionar Mes:',
    monthPickerTitle: 'Seleccionar Año y Mes',
    year: 'Año',
    apply: 'Aplicar',
    generateSnapshot: 'Generar Captura',
    uploadQr: 'Subir QR',
    addCategory: 'Añadir Categoría',
    previousMonths: 'Meses Anteriores',
    addItem: 'Añadir Artículo',
    deleteCategory: 'Eliminar Categoría',
    deleteItem: 'Eliminar Artículo',
    actions: 'Acciones',
    clearAll: 'Borrar Todo',
    noSavedMonths: 'No hay meses guardados.',
    grandTotal: 'Total General',
    subtotal: 'Subtotal',
    item: 'Artículo',
    price: 'Precio',
    unitLabel: 'Unidad',
    qty: 'Cant.',
    lineTotal: 'Total',
    catMeatSeafood: 'Carne & Mariscos',
    catProduce: 'Frutas & Verduras',
    catRiceNoodles: 'Arroz, Fideos & Preparados',
    catSauces: 'Salsas & Condimentos',
    catSushi: 'Suministros de Sushi',
    catDrinks: 'Bebidas',
    catPackaging: 'Empaques & Utensilios',
    catCleaning: 'Productos de Limpieza',
    monthLoaded: '✅ ¡Mes cargado!',
    monthDeleted: '🗑 Mes eliminado',
    confirmDelete: '¿Estás seguro de que quieres eliminar este mes?',
    working: 'Procesando…',
    snapshotSaved: '📸 ¡Captura guardada!',
    snapshotError: '⚠ Error al generar captura',
    qrUploadSuccess: '✅ Inventario restaurado desde QR',
    qrUploadPartial: '⚠ Se importó una parte del QR. Sube la otra parte también.',
    qrUploadNone: '⚠ No se encontró QR de inventario en la imagen',
    qrUploadError: '⚠ Error al leer la imagen QR',
    categoryAdded: '✅ Categoría añadida',
    itemAdded: '✅ Artículo añadido',
    categoryDeleted: '🗑 Categoría eliminada',
    itemDeleted: '🗑 Artículo eliminado',
    clearedAll: '🧹 Todas las cantidades borradas',
    forbiddenChars: '⚠ Los nombres no pueden contener < > " & caracteres',
    promptCategoryName: 'Nombre de la categoría:',
    promptItemName: 'Nombre del artículo:',
    promptItemPrice: 'Precio (número):',
    promptItemUnit: 'Unidad:',
    promptDeleteCategoryPick: 'Ingresa el número de la categoría a eliminar:',
    promptDeleteItemPick: 'Ingresa el número del artículo a eliminar:',
    confirmDeleteCategory: '¿Seguro que quieres eliminar esta categoría?',
    confirmDeleteItem: '¿Seguro que quieres eliminar este artículo?',
    confirmDeleteCategoryMany: '¿Seguro que quieres eliminar las categorías seleccionadas?',
    confirmDeleteItemMany: '¿Seguro que quieres eliminar los artículos seleccionados?',
    confirmClearAll: '¿Seguro que quieres borrar todas las cantidades de este mes?',
    selectCategoriesToDelete: 'Selecciona las categorías a eliminar',
    selectItemsToDelete: 'Selecciona los artículos a eliminar',
    cancel: 'Cancelar',
    deleteSelected: 'Eliminar seleccionados',
    inventoryOf: 'Inventario –',
    na: 'N/D',
    monthlyInventory: 'Inventario Mensual',
    monthlyInvoicesTitle: 'Facturas Mensuales',
    monthlyInvoicesTotal: 'Total Facturas del Mes',
    autoFillInvoices: 'Auto-llenar desde Ventas',
    invoicesHint: 'Obtener totales de facturas de proveedores de sus reportes semanales guardados para este mes.',
    invoicesAutoFilled: '✅ Facturas auto-llenadas de {n} semana(s)',
    invoicesNoWeeks: '⚠ No se encontraron semanas guardadas para este mes',
    invoicesWeekOf: 'Semana del',
    vendor: 'Proveedor',
    weekTotal: 'Total Semanal',
    totals: 'Totales',
    addInvoice: 'Añadir Factura',
    deleteInvoice: 'Eliminar Factura',
    invoiceVendorName: 'Nombre del proveedor:',
    invoiceAmount: 'Monto:',
    paid: 'Pagado',
    unpaid: 'No pagado',
    amount: 'Monto',
    status: 'Estado',
    invoiceDate: 'Fecha',
    invoiceDatePrompt: 'Fecha (YYYY-MM-DD):',
    invoiceAdded: '✅ Factura añadida',
    invoiceDeleted: '🗑 Factura eliminada',
    selectInvoicesToDelete: 'Seleccionar facturas a eliminar',
    confirmDeleteInvoices: '¿Eliminar las facturas seleccionadas?',
    invNotes: 'Notas',
    invNotesPlaceholder: 'Agregar notas para este mes…',
    searchPlaceholder: 'Buscar artículos…',
    noSearchResults: 'Ningún artículo coincide con tu búsqueda.',
    notesRemaining: '{n} caracteres restantes para QR',
    qrTooLarge: '⚠ ¡Notas demasiado grandes para QR! Reduzca ({over} bytes de más).',
    exportCSV: 'Exportar CSV',
    csvHint: 'Descargue el inventario de este mes como archivo .csv para Excel, Google Sheets o Numbers.',
    csvSaved: '📄 ¡CSV exportado!',
  }
};

let currentLang = 'en';
function t(key) { return (I18N[currentLang] || I18N.en)[key] || I18N.en[key] || key; }

function sanitizeIdPart(value) {
  return String(value || '')
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'x';
}

function uniqueId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeCategories(raw) {
  const seenCatIds = new Set();
  return (Array.isArray(raw) ? raw : []).map((cat, catIdx) => {
    const baseCatId = sanitizeIdPart(cat.id || cat.labelKey || cat.name || `cat_${catIdx + 1}`);
    let catId = baseCatId;
    let n = 2;
    while (seenCatIds.has(catId)) {
      catId = `${baseCatId}_${n++}`;
    }
    seenCatIds.add(catId);

    const seenItemIds = new Set();
    const items = (Array.isArray(cat.items) ? cat.items : []).map((item, itemIdx) => {
      const itemName = String(item.name || `Item ${itemIdx + 1}`).trim();
      const baseItemId = sanitizeIdPart(item.id || itemName || `item_${itemIdx + 1}`);
      let itemId = baseItemId;
      let k = 2;
      while (seenItemIds.has(itemId)) {
        itemId = `${baseItemId}_${k++}`;
      }
      seenItemIds.add(itemId);
      const numPrice = parseFloat(item.price);
      return {
        id: itemId,
        name: itemName,
        price: Number.isFinite(numPrice) ? numPrice : null,
        unit: item.unit ? String(item.unit) : '',
      };
    });

    return {
      id: catId,
      labelKey: cat.labelKey || null,
      name: cat.name || '',
      items,
    };
  });
}

function loadCategoriesConfig() {
  try {
    const raw = JSON.parse(localStorage.getItem(INV_CFG_KEY));
    if (Array.isArray(raw) && raw.length) return normalizeCategories(raw);
  } catch {
    // ignore and fall back to defaults
  }
  return normalizeCategories(DEFAULT_CATEGORIES);
}

function saveCategoriesConfig() {
  localStorage.setItem(INV_CFG_KEY, JSON.stringify(CATEGORIES));
}

function getCategoryLabel(cat) {
  return cat.labelKey ? t(cat.labelKey) : (cat.name || 'Category');
}

/* Validate name input — reject characters that break HTML */
const FORBIDDEN_RE = /[<>"&|]/;
function isNameSafe(name) {
  if (FORBIDDEN_RE.test(name)) {
    showToast(t('forbiddenChars'));
    return false;
  }
  return true;
}

/* Escape HTML entities for safe innerHTML usage */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

let CATEGORIES = loadCategoriesConfig(); // Used only for the first-ever month

function cloneCategories(cats) {
  return JSON.parse(JSON.stringify(cats));
}

/* ═══════════════════════════════════════════
   STATE / STORAGE
═══════════════════════════════════════════ */
function getMeta() {
  try { return JSON.parse(localStorage.getItem(META_KEY)) || {}; }
  catch { return {}; }
}
function saveMeta(patch) {
  const m = Object.assign(getMeta(), patch);
  localStorage.setItem(META_KEY, JSON.stringify(m));
}

function invKey(monthStr) { return INV_PREFIX + monthStr; }

function getSavedMonths() {
  const months = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(INV_PREFIX)) months.push(k.replace(INV_PREFIX, ''));
  }
  return months.sort().reverse();
}

function loadMonthData(monthStr) {
  try { return JSON.parse(localStorage.getItem(invKey(monthStr))) || null; }
  catch { return null; }
}

function saveCurrentMonth() {
  const ms = document.getElementById('inv-month').value;
  if (!ms) return;
  const data = { __month: ms };
  // Save this month's categories/items structure
  data.__categories = cloneCategories(CATEGORIES);
  document.querySelectorAll('.inv-qty').forEach(el => {
    const q = parseFloat(el.value);
    if (q) data[el.dataset.itemKey] = q;
  });
  // Persist monthly invoices data
  if (monthlyInvoices.length) data.__invoices = monthlyInvoices;
  // Persist notes
  const notesVal = (document.getElementById('inv-notes') || {}).value || '';
  if (notesVal.trim()) data.__notes = notesVal;
  localStorage.setItem(invKey(ms), JSON.stringify(data));
}

/* ═══════════════════════════════════════════
   ITEM KEY helper (stable per item id)
═══════════════════════════════════════════ */
function itemKey(catId, itemId) {
  return `${catId}__${itemId}`;
}

function findCategory(catId) {
  return CATEGORIES.find(cat => cat.id === catId);
}

function findItem(cat, itemId) {
  return (cat && Array.isArray(cat.items)) ? cat.items.find(item => item.id === itemId) : null;
}

function addCategory() {
  const name = (prompt(t('promptCategoryName')) || '').trim();
  if (!name) return;
  if (!isNameSafe(name)) return;
  const catId = uniqueId('cat');
  CATEGORIES.push({ id: catId, labelKey: null, name, items: [] });
  saveCategoriesConfig();
  buildInventory();
  recalcAll();
  showToast(t('categoryAdded'));
}

function addItemToCategory(catId) {
  const cat = findCategory(catId);
  if (!cat) return;

  const itemName = (prompt(t('promptItemName')) || '').trim();
  if (!itemName) return;
  if (!isNameSafe(itemName)) return;

  const priceRaw = (prompt(t('promptItemPrice'), '0') || '').trim();
  const numPrice = parseFloat(priceRaw);
  const unit = (prompt(t('promptItemUnit')) || '').trim();

  cat.items.push({
    id: uniqueId('item'),
    name: itemName,
    price: Number.isFinite(numPrice) ? numPrice : 0,
    unit,
  });

  saveCategoriesConfig();
  const ms = document.getElementById('inv-month').value;
  const data = loadMonthData(ms);
  buildInventory();
  if (data) applyMonthData(data); else recalcAll();
  showToast(t('itemAdded'));
}

function deleteCategory(catId) {
  if (!confirm(t('confirmDeleteCategory'))) return;
  CATEGORIES = CATEGORIES.filter(cat => cat.id !== catId);
  saveCategoriesConfig();
  saveCurrentMonth();
  buildInventory();
  const ms = document.getElementById('inv-month').value;
  const data = loadMonthData(ms);
  if (data) applyMonthData(data); else recalcAll();
  showToast(t('categoryDeleted'));
}

function showDeletePickerModal(title, options) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'inv-picker-overlay';

    const modal = document.createElement('div');
    modal.className = 'inv-picker-modal';

    const safeOptions = Array.isArray(options) ? options : [];
    const optsHtml = safeOptions.map(opt => `
      <label class="inv-picker-option">
        <input type="checkbox" value="${String(opt.id).replace(/"/g, '&quot;')}" />
        <span>${escapeHtml(opt.label)}</span>
      </label>
    `).join('');

    modal.innerHTML = `
      <div class="inv-picker-title">${title}</div>
      <div class="inv-picker-list">${optsHtml || '<div class="inv-picker-empty">—</div>'}</div>
      <div class="inv-picker-actions">
        <button class="btn btn-secondary inv-mini-btn" type="button" data-action="cancel">${t('cancel')}</button>
        <button class="btn inv-mini-btn inv-danger-btn" type="button" data-action="confirm">${t('deleteSelected')}</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const close = (selected) => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      resolve(selected || []);
    };

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close([]);
    });

    modal.querySelector('[data-action="cancel"]').addEventListener('click', () => close([]));
    modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
      const selected = Array.from(modal.querySelectorAll('input[type="checkbox"]:checked')).map(el => el.value);
      close(selected);
    });
  });
}

async function deleteCategoryFromTop() {
  if (!CATEGORIES.length) return;

  const selected = await showDeletePickerModal(
    t('selectCategoriesToDelete'),
    CATEGORIES.map(cat => ({ id: cat.id, label: getCategoryLabel(cat) }))
  );
  if (!selected.length) return;
  if (!confirm(t('confirmDeleteCategoryMany'))) return;

  CATEGORIES = CATEGORIES.filter(cat => !selected.includes(cat.id));
  saveCategoriesConfig();
  saveCurrentMonth();
  buildInventory();
  const ms = document.getElementById('inv-month').value;
  const data = loadMonthData(ms);
  if (data) applyMonthData(data); else recalcAll();
  showToast(t('categoryDeleted'));
}

function deleteItem(catId, itemId) {
  if (!confirm(t('confirmDeleteItem'))) return;
  const cat = findCategory(catId);
  if (!cat) return;
  cat.items = cat.items.filter(item => item.id !== itemId);
  saveCategoriesConfig();
  saveCurrentMonth();
  const ms = document.getElementById('inv-month').value;
  const data = loadMonthData(ms);
  buildInventory();
  if (data) applyMonthData(data); else recalcAll();
  showToast(t('itemDeleted'));
}

async function deleteItemFromCategory(catId) {
  const cat = findCategory(catId);
  if (!cat || !Array.isArray(cat.items) || !cat.items.length) return;

  const selected = await showDeletePickerModal(
    t('selectItemsToDelete'),
    cat.items.map(item => ({ id: item.id, label: item.name }))
  );
  if (!selected.length) return;
  if (!confirm(t('confirmDeleteItemMany'))) return;

  cat.items = cat.items.filter(item => !selected.includes(item.id));
  saveCategoriesConfig();
  saveCurrentMonth();
  const ms = document.getElementById('inv-month').value;
  const data = loadMonthData(ms);
  buildInventory();
  if (data) applyMonthData(data); else recalcAll();
  showToast(t('itemDeleted'));
}

/* ═══════════════════════════════════════════
   BUILD UI
═══════════════════════════════════════════ */
function buildInventory() {
  const container = document.getElementById('inventory-categories');
  container.innerHTML = '';

  const topActions = document.createElement('div');
  topActions.className = 'inv-top-actions';
  topActions.innerHTML = `
    <button class="btn btn-secondary inv-mini-btn" id="btn-add-category"><span data-i18n="addCategory">${t('addCategory')}</span></button>
    <button class="btn inv-mini-btn inv-danger-btn" id="btn-del-category-global"><span data-i18n="deleteCategory">${t('deleteCategory')}</span></button>
  `;
  container.appendChild(topActions);

  CATEGORIES.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'card inv-card';
    card.id = `cat-${cat.id}`;

    const header = document.createElement('div');
    header.className = 'inv-cat-header';
    header.innerHTML = `
      <div class="card-title inv-cat-title">
        <i data-lucide="package" style="width:14px;height:14px;"></i>
        <span>${escapeHtml(getCategoryLabel(cat))}</span>
      </div>
      <div class="inv-cat-subtotal" id="subtotal-${cat.id}">$0.00</div>
      <button class="inv-collapse-btn rotated" data-cat="${cat.id}" aria-label="Toggle">
        <i data-lucide="chevron-up" style="width:16px;height:16px;"></i>
      </button>
    `;
    card.appendChild(header);

    const tableWrap = document.createElement('div');
    tableWrap.className = 'table-wrap inv-table-wrap collapsed';
    tableWrap.id = `wrap-${cat.id}`;

    const wrapActions = document.createElement('div');
    wrapActions.className = 'inv-wrap-actions';
    wrapActions.innerHTML = `
      <button class="btn btn-secondary inv-mini-btn inv-add-item" data-cat="${cat.id}">${t('addItem')}</button>
      <button class="btn inv-mini-btn inv-danger-btn inv-del-item-global" data-cat="${cat.id}">${t('deleteItem')}</button>
    `;
    tableWrap.appendChild(wrapActions);

    const table = document.createElement('table');
    table.className = 'inv-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th class="inv-th-item" data-i18n="item">${t('item')}</th>
          <th class="inv-th-price" data-i18n="price">${t('price')}</th>
          <th class="inv-th-unit" data-i18n="unitLabel">${t('unitLabel')}</th>
          <th class="inv-th-qty" data-i18n="qty">${t('qty')}</th>
          <th class="inv-th-total" data-i18n="lineTotal">${t('lineTotal')}</th>
        </tr>
      </thead>
    `;

    const tbody = document.createElement('tbody');
    cat.items.forEach(item => {
      const key = itemKey(cat.id, item.id);
      const priceVal = item.price !== null ? item.price : 0;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="inv-item-name"><input class="inp inv-edit-name" type="text" value="${item.name.replace(/"/g, '&quot;')}" data-cat="${cat.id}" data-item="${item.id}" /></td>
        <td class="inv-item-price"><input class="inp inv-edit-price" type="number" step="0.01" min="0" value="${priceVal}" data-cat="${cat.id}" data-item="${item.id}" /></td>
        <td class="inv-item-unit"><input class="inp inv-edit-unit" type="text" value="${(item.unit || '').replace(/"/g, '&quot;')}" data-cat="${cat.id}" data-item="${item.id}" /></td>
        <td>
          <input class="inp inv-qty" type="number" inputmode="decimal" min="0" step="0.01"
            placeholder="0"
            data-item-key="${key}"
            data-cat="${cat.id}"
            data-item="${item.id}" />
        </td>
        <td class="inv-line-total" id="lt-${key}">$0.00</td>
      `;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    const tfoot = document.createElement('tfoot');
    tfoot.innerHTML = `
      <tr class="totals-row">
        <td colspan="4" style="text-align:right;padding-right:12px;" data-i18n="subtotal">${t('subtotal')}</td>
        <td class="tot-cell" id="subtotal-foot-${cat.id}">$0.00</td>
      </tr>
    `;
    table.appendChild(tfoot);
    tableWrap.appendChild(table);
    card.appendChild(tableWrap);
    container.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();

  document.getElementById('btn-add-category')?.addEventListener('click', addCategory);
  document.getElementById('btn-del-category-global')?.addEventListener('click', deleteCategoryFromTop);

  document.querySelectorAll('.inv-collapse-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.dataset.cat;
      const wrap = document.getElementById(`wrap-${catId}`);
      wrap.classList.toggle('collapsed');
      btn.classList.toggle('rotated');
    });
  });

  document.querySelectorAll('.inv-add-item').forEach(btn => {
    btn.addEventListener('click', () => addItemToCategory(btn.dataset.cat));
  });

  document.querySelectorAll('.inv-del-item-global').forEach(btn => {
    btn.addEventListener('click', () => deleteItemFromCategory(btn.dataset.cat));
  });

  document.querySelectorAll('.inv-edit-name').forEach(inp => {
    inp.addEventListener('change', () => {
      const cat = findCategory(inp.dataset.cat);
      const item = findItem(cat, inp.dataset.item);
      if (!item) return;
      item.name = inp.value.trim() || item.name;
      inp.value = item.name;
      saveCategoriesConfig();
    });
  });

  document.querySelectorAll('.inv-edit-price').forEach(inp => {
    inp.addEventListener('input', () => {
      const cat = findCategory(inp.dataset.cat);
      const item = findItem(cat, inp.dataset.item);
      if (!item) return;
      const p = parseFloat(inp.value);
      item.price = Number.isFinite(p) ? p : 0;
      const qtyInp = document.querySelector(`.inv-qty[data-cat="${CSS.escape(inp.dataset.cat)}"][data-item="${CSS.escape(inp.dataset.item)}"]`);
      if (qtyInp) {
        updateLineTotal(qtyInp);
        updateCategorySubtotal(inp.dataset.cat);
        updateGrandTotal();
      }
      saveCategoriesConfig();
    });
  });

  document.querySelectorAll('.inv-edit-unit').forEach(inp => {
    inp.addEventListener('change', () => {
      const cat = findCategory(inp.dataset.cat);
      const item = findItem(cat, inp.dataset.item);
      if (!item) return;
      item.unit = inp.value.trim();
      saveCategoriesConfig();
    });
  });

  // Debounce localStorage writes while still updating UI instantly
  let _saveTimer = null;
  function debouncedSave() {
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(saveCurrentMonth, 400);
  }

  document.querySelectorAll('.inv-qty').forEach(inp => {
    inp.addEventListener('input', () => {
      updateLineTotal(inp);
      updateCategorySubtotal(inp.dataset.cat);
      updateGrandTotal();
      debouncedSave();
      updateInvNotesCounter();
    });
  });

  // Notes auto-save + counter
  const notesBox = document.getElementById('inv-notes');
  if (notesBox) {
    notesBox.addEventListener('input', () => {
      debouncedSave();
      updateInvNotesCounter();
    });
  }
}

/* ═══════════════════════════════════════════
   SEARCH / FILTER
═══════════════════════════════════════════ */
function applySearchFilter(query) {
  const term = (query || '').trim().toLowerCase();
  const clearBtn = document.getElementById('inv-search-clear');
  if (clearBtn) clearBtn.style.display = term ? '' : 'none';

  // Remove any previous "no results" message
  const prev = document.getElementById('inv-no-results');
  if (prev) prev.remove();

  const container = document.getElementById('inventory-categories');
  if (!container) return;

  let anyVisible = false;

  CATEGORIES.forEach(cat => {
    const card = document.getElementById(`cat-${cat.id}`);
    if (!card) return;

    const tbody = card.querySelector('tbody');
    if (!tbody) return;

    let catHasMatch = false;

    Array.from(tbody.rows).forEach(tr => {
      const nameInput = tr.querySelector('.inv-edit-name');
      const name = nameInput ? nameInput.value.toLowerCase() : '';
      const match = !term || name.includes(term);
      tr.classList.toggle('inv-search-hidden', !match);
      if (match) catHasMatch = true;
    });

    // Hide entire category card when no items match
    card.classList.toggle('inv-search-hidden', !catHasMatch);

    // Auto-expand matching categories while searching, collapse when cleared
    if (term && catHasMatch) {
      const wrap = document.getElementById(`wrap-${cat.id}`);
      const btn = card.querySelector('.inv-collapse-btn');
      if (wrap && wrap.classList.contains('collapsed')) {
        wrap.classList.remove('collapsed');
        if (btn) btn.classList.remove('rotated');
      }
    }

    if (catHasMatch) anyVisible = true;
  });

  // Show "no results" message when nothing matches
  if (term && !anyVisible) {
    const msg = document.createElement('p');
    msg.id = 'inv-no-results';
    msg.className = 'inv-no-results';
    msg.textContent = t('noSearchResults');
    container.appendChild(msg);
  }
}

function initSearch() {
  const input = document.getElementById('inv-search');
  const clearBtn = document.getElementById('inv-search-clear');
  if (!input) return;

  input.addEventListener('input', () => applySearchFilter(input.value));

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      applySearchFilter('');
      input.focus();
    });
  }
}

/* ═══════════════════════════════════════════
   NOTES CHARACTER COUNTER (QR capacity aware)
═══════════════════════════════════════════ */
function byteLen(str) {
  return new Blob([str]).size;
}

/** Calculate the total QR data size WITHOUT notes, across both codes */
function getInvDataBaseSize() {
  const ms = document.getElementById('inv-month').value || '';
  const storeName = document.getElementById('store-name').textContent || '';
  const entries = [];
  document.querySelectorAll('.inv-qty').forEach(inp => {
    const qty = parseFloat(inp.value) || 0;
    if (qty) entries.push([inp.dataset.itemKey, qty]);
  });

  // Simulate the split without notes
  const q1 = {}, q2 = {};
  const base1 = JSON.stringify({ t: 'inv', p: '1/2', m: ms, s: storeName, q: {} }).length;
  const base2 = JSON.stringify({ t: 'inv', p: '2/2', m: ms, s: storeName, q: {} }).length;
  let size1 = base1, size2 = base2;

  entries.forEach(([key, qty]) => {
    const est = key.length + String(qty).length + 6;
    if (size1 <= size2) { q1[key] = qty; size1 += est; }
    else { q2[key] = qty; size2 += est; }
  });

  return { size1, size2 };
}

/** How many bytes of notes can still fit in QR part 2 */
function getInvNotesRemaining() {
  const { size1, size2 } = getInvDataBaseSize();
  // Notes go in part 2 as ,"n":"..." → overhead ~7 bytes for the JSON wrapper
  const overhead = 7;
  // Total capacity is the minimum bottleneck of either code
  // Part 1 just needs to fit; part 2 needs to fit data + notes
  const availablePart2 = QR_MAX_BYTES - size2 - overhead;
  return Math.max(0, availablePart2);
}

function updateInvNotesCounter() {
  const counter = document.getElementById('inv-notes-counter');
  if (!counter) return;
  const remaining = getInvNotesRemaining();
  const notesEl = document.getElementById('inv-notes');
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

/* ═══════════════════════════════════════════
   CALCULATIONS
═══════════════════════════════════════════ */
function updateLineTotal(inp) {
  const qty = parseFloat(inp.value) || 0;
  const cat = findCategory(inp.dataset.cat);
  const item = findItem(cat, inp.dataset.item);
  const price = item && Number.isFinite(parseFloat(item.price)) ? parseFloat(item.price) : 0;
  const total = qty * price;
  const key = inp.dataset.itemKey;
  const cell = document.getElementById(`lt-${key}`);
  if (cell) cell.textContent = `$${total.toFixed(2)}`;
}

function updateCategorySubtotal(catId) {
  let subtotal = 0;
  document.querySelectorAll(`.inv-qty[data-cat="${catId}"]`).forEach(inp => {
    const qty = parseFloat(inp.value) || 0;
    const cat = findCategory(catId);
    const item = findItem(cat, inp.dataset.item);
    const price = item && Number.isFinite(parseFloat(item.price)) ? parseFloat(item.price) : 0;
    subtotal += qty * price;
  });
  const headerEl = document.getElementById(`subtotal-${catId}`);
  const footEl = document.getElementById(`subtotal-foot-${catId}`);
  if (headerEl) headerEl.textContent = `$${subtotal.toFixed(2)}`;
  if (footEl) footEl.textContent = `$${subtotal.toFixed(2)}`;
}

function updateGrandTotal() {
  let grand = 0;
  document.querySelectorAll('.inv-qty').forEach(inp => {
    const qty = parseFloat(inp.value) || 0;
    const cat = findCategory(inp.dataset.cat);
    const item = findItem(cat, inp.dataset.item);
    const price = item && Number.isFinite(parseFloat(item.price)) ? parseFloat(item.price) : 0;
    grand += qty * price;
  });
  document.getElementById('grand-total-value').textContent = `$${grand.toFixed(2)}`;
}

function recalcAll() {
  document.querySelectorAll('.inv-qty').forEach(inp => {
    updateLineTotal(inp);
  });
  CATEGORIES.forEach(cat => updateCategorySubtotal(cat.id));
  updateGrandTotal();
}

/* ═══════════════════════════════════════════
   LOAD / APPLY
═══════════════════════════════════════════ */
function clearForm() {
  document.querySelectorAll('.inv-qty').forEach(inp => { inp.value = ''; });
  monthlyInvoices = [];
  renderInvoicesSection();
  const notesEl = document.getElementById('inv-notes');
  if (notesEl) notesEl.value = '';
  // Reset search filter
  const searchEl = document.getElementById('inv-search');
  if (searchEl && searchEl.value) { searchEl.value = ''; applySearchFilter(''); }
  recalcAll();
  updateInvNotesCounter();
}

function clearAllQuantities() {
  if (!confirm(t('confirmClearAll'))) return;
  clearForm();
  saveCurrentMonth();
  showToast(t('clearedAll'));
}

function applyMonthData(data) {
  clearForm();
  if (data.__categories && Array.isArray(data.__categories)) {
    CATEGORIES = cloneCategories(data.__categories);
  }
  if (data.__month) document.getElementById('inv-month').value = data.__month;
  Object.entries(data).forEach(([k, v]) => {
    if (k.startsWith('__')) return;
    const inp = document.querySelector(`.inv-qty[data-item-key="${CSS.escape(k)}"]`);
    if (inp) inp.value = v;
  });
  // Restore monthly invoices
  monthlyInvoices = Array.isArray(data.__invoices) ? data.__invoices.map(inv => ({
    vendor: String(inv.vendor || ''),
    amount: parseFloat(inv.amount) || 0,
    paid: !!inv.paid,
    date: inv.date || '',
  })) : [];
  renderInvoicesSection();
  // Restore notes
  const notesEl = document.getElementById('inv-notes');
  if (notesEl) notesEl.value = data.__notes || '';
  recalcAll();
  updateInvNotesCounter();
}

function switchToMonth(monthStr) {
  saveCurrentMonth();
  const data = loadMonthData(monthStr);
  if (data) {
    applyMonthData(data);
  } else {
    document.getElementById('inv-month').value = monthStr;
    // For a new month, start with a clone of the current categories/items
    CATEGORIES = cloneCategories(CATEGORIES);
    clearForm();
  }
  // Update _prevMonth tracker if it exists
  if (typeof _prevMonth !== 'undefined') _prevMonth = monthStr;
  renderHistory();
  showToast(t('monthLoaded'));
}

function deleteMonth(monthStr) {
  if (!confirm(t('confirmDelete'))) return;
  localStorage.removeItem(invKey(monthStr));
  const cur = document.getElementById('inv-month').value;
  if (cur === monthStr) {
    const now = new Date();
    const ms = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    document.getElementById('inv-month').value = ms;
    _prevMonth = ms;
    const existing = loadMonthData(ms);
    if (existing) applyMonthData(existing);
    else clearForm();
  }
  renderHistory();
  showToast(t('monthDeleted'));
}

/* ═══════════════════════════════════════════
   HISTORY SIDEBAR
═══════════════════════════════════════════ */
function renderHistory() {
  const list = document.getElementById('history-list');
  const empty = document.getElementById('history-empty');
  const months = getSavedMonths();
  const curMonth = document.getElementById('inv-month').value;

  list.innerHTML = '';
  if (!months.length) { empty.style.display = ''; return; }
  empty.style.display = 'none';

  months.forEach(ms => {
    const div = document.createElement('div');
    div.className = 'history-item' + (ms === curMonth ? ' active' : '');
    div.innerHTML = `
      <div class="history-item-icon">
        <i data-lucide="calendar" style="width:18px;height:18px;color:#fff;"></i>
      </div>
      <div class="history-item-info">
        <div class="history-item-title">${formatMonth(ms)}</div>
      </div>
      <button class="history-item-delete" data-month="${ms}" title="Delete">&times;</button>
    `;
    div.addEventListener('click', (e) => {
      if (e.target.closest('.history-item-delete')) return;
      switchToMonth(ms);
    });
    div.querySelector('.history-item-delete').addEventListener('click', () => deleteMonth(ms));
    list.appendChild(div);
  });

  if (window.lucide) lucide.createIcons();
}

function formatMonth(ms) {
  // ms = "2026-03"
  const [y, m] = ms.split('-');
  const d = new Date(parseInt(y), parseInt(m) - 1, 1);
  const locales = { en: 'en-US', zh: 'zh-CN', es: 'es-ES' };
  return d.toLocaleDateString(locales[currentLang] || 'en-US', { year: 'numeric', month: 'long' });
}

function openMonthPicker() {
  const input = document.getElementById('inv-month');
  const now = new Date();
  const cur = input.value && /^\d{4}-\d{2}$/.test(input.value)
    ? input.value
    : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  let selectedYear = parseInt(cur.slice(0, 4), 10);
  let selectedMonth = parseInt(cur.slice(5, 7), 10);

  const overlay = document.createElement('div');
  overlay.className = 'inv-month-overlay';

  const modal = document.createElement('div');
  modal.className = 'inv-month-modal';

  const currentYear = now.getFullYear();
  const startYear = currentYear - 5;
  const endYear = currentYear + 5;
  const yearOptions = [];
  for (let y = startYear; y <= endYear; y++) {
    yearOptions.push(`<option value="${y}" ${y === selectedYear ? 'selected' : ''}>${y}</option>`);
  }

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthButtons = monthNames.map((name, idx) => {
    const monthNum = idx + 1;
    const active = monthNum === selectedMonth ? ' active' : '';
    return `<button type="button" class="inv-month-btn${active}" data-month="${monthNum}">${name}</button>`;
  }).join('');

  modal.innerHTML = `
    <div class="inv-month-title">${t('monthPickerTitle')}</div>
    <div class="inv-month-year-row">
      <label for="inv-month-year">${t('year')}</label>
      <select id="inv-month-year">${yearOptions.join('')}</select>
    </div>
    <div class="inv-month-grid">${monthButtons}</div>
    <div class="inv-month-actions">
      <button class="btn btn-secondary inv-mini-btn" type="button" data-action="cancel">${t('cancel')}</button>
      <button class="btn btn-primary inv-mini-btn" type="button" data-action="apply">${t('apply')}</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const close = () => {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  };

  const yearSel = modal.querySelector('#inv-month-year');
  yearSel.addEventListener('change', () => {
    selectedYear = parseInt(yearSel.value, 10);
  });

  modal.querySelectorAll('.inv-month-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedMonth = parseInt(btn.dataset.month, 10);
      modal.querySelectorAll('.inv-month-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
  modal.querySelector('[data-action="apply"]').addEventListener('click', () => {
    const newVal = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    if (input.value !== newVal) {
      input.value = newVal;
      input.dispatchEvent(new Event('change'));
    }
    close();
  });
}

/* ═══════════════════════════════════════════
   QR + SNAPSHOT
═══════════════════════════════════════════ */
function gatherSnapshotData() {
  const ms = document.getElementById('inv-month').value;
  const storeName = document.getElementById('store-name').textContent || '';
  const data = { t: 'inv', m: ms, s: storeName, q: {} };
  document.querySelectorAll('.inv-qty').forEach(inp => {
    const qty = parseFloat(inp.value) || 0;
    if (qty) data.q[inp.dataset.itemKey] = qty;
  });
  return data;
}

/**
 * Split inventory QR data into two parts, dividing categories roughly in half.
 * Each part is self-describing with metadata so they can be scanned independently.
 */
function gatherSnapshotDataSplit() {
  const ms = document.getElementById('inv-month').value;
  const storeName = document.getElementById('store-name').textContent || '';
  const notesEl = document.getElementById('inv-notes');
  const notes = notesEl ? notesEl.value.trim() : '';

  // Collect non-zero quantities
  const entries = [];
  document.querySelectorAll('.inv-qty').forEach(inp => {
    const qty = parseFloat(inp.value) || 0;
    if (qty) entries.push([inp.dataset.itemKey, qty]);
  });

  // Byte-aware balancing so one QR doesn't become much denser than the other
  const q1 = {};
  const q2 = {};
  const base1 = JSON.stringify({ t: 'inv', p: '1/2', m: ms, s: storeName, q: {} }).length;
  const base2Obj = { t: 'inv', p: '2/2', m: ms, s: storeName, q: {} };
  if (notes) base2Obj.n = '';
  const base2 = JSON.stringify(base2Obj).length + byteLen(notes);
  let size1 = base1;
  let size2 = base2;

  entries.forEach(([key, qty]) => {
    const est = key.length + String(qty).length + 6;
    if (size1 <= size2) {
      q1[key] = qty;
      size1 += est;
    } else {
      q2[key] = qty;
      size2 += est;
    }
  });

  // Ensure both parts have at least one key when possible
  if (entries.length > 1 && Object.keys(q2).length === 0) {
    const [moveKey, moveQty] = entries[entries.length - 1];
    if (Object.prototype.hasOwnProperty.call(q1, moveKey)) {
      delete q1[moveKey];
      q2[moveKey] = moveQty;
    }
  }

  return [
    { t: 'inv', p: '1/2', m: ms, s: storeName, q: q1 },
    Object.assign({ t: 'inv', p: '2/2', m: ms, s: storeName, q: q2 }, notes ? { n: notes } : {}),
  ];
}

// Keep partial QR parts so users can upload 1/2 and 2/2 separately
const INV_QR_PARTS = {};

function fromQRText(str) {
  if (!str || typeof str !== 'string') return '';
  if (str.charAt(0) === '{') return str;
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return str;
  }
}

function parseInventoryQRPayload(text) {
  const raw = fromQRText(text).trim();
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    if (!obj || obj.t !== 'inv' || typeof obj.q !== 'object') return null;
    return obj;
  } catch {
    return null;
  }
}

function decodeQRTextsFromImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const scans = [
        [0, 0, canvas.width, canvas.height],
        [0, 0, Math.floor(canvas.width / 2), canvas.height],
        [Math.floor(canvas.width / 2), 0, Math.ceil(canvas.width / 2), canvas.height],
        [0, 0, canvas.width, Math.floor(canvas.height / 2)],
        [0, Math.floor(canvas.height / 2), canvas.width, Math.ceil(canvas.height / 2)],
        [Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), Math.ceil(canvas.width / 2), Math.ceil(canvas.height / 2)],
      ];

      const found = new Set();
      scans.forEach(([x, y, w, h]) => {
        if (w < 20 || h < 20) return;
        try {
          const imgData = ctx.getImageData(x, y, w, h);
          const code = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: 'dontInvert' });
          if (code && code.data) found.add(code.data);
        } catch {
          // ignore individual region failures
        }
      });

      resolve(Array.from(found));
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('load failed'));
    };
    img.src = URL.createObjectURL(file);
  });
}

function applyImportedInventoryData(monthStr, quantities, notes) {
  const targetMonth = monthStr || document.getElementById('inv-month').value;
  const data = { __month: targetMonth };
  Object.entries(quantities || {}).forEach(([k, v]) => {
    const n = parseFloat(v);
    if (Number.isFinite(n) && n !== 0) data[k] = n;
  });
  if (notes) data.__notes = notes;

  applyMonthData(data);
  _prevMonth = targetMonth;
  saveCurrentMonth();
  renderHistory();
}

async function handleInventoryQRUpload(e) {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;

  try {
    const payloads = [];
    for (const file of files) {
      const texts = await decodeQRTextsFromImage(file);
      texts.forEach(txt => {
        const payload = parseInventoryQRPayload(txt);
        if (payload) payloads.push(payload);
      });
    }

    if (!payloads.length) {
      showToast(t('qrUploadNone'));
      return;
    }

    let applied = false;
    const fullPayload = payloads.find(p => !p.p);
    if (fullPayload) {
      applyImportedInventoryData(fullPayload.m, fullPayload.q, fullPayload.n);
      applied = true;
    }

    const partPayloads = payloads.filter(p => p.p === '1/2' || p.p === '2/2');
    if (partPayloads.length) {
      const sample = partPayloads[0];
      const cacheKey = `${sample.m || ''}|${sample.s || ''}`;
      if (!INV_QR_PARTS[cacheKey]) INV_QR_PARTS[cacheKey] = {};
      partPayloads.forEach(p => {
        INV_QR_PARTS[cacheKey][p.p] = p.q || {};
        if (p.n) INV_QR_PARTS[cacheKey]['2/2_notes'] = p.n;
      });

      const part1 = INV_QR_PARTS[cacheKey]['1/2'];
      const part2 = INV_QR_PARTS[cacheKey]['2/2'];
      if (part1 && part2) {
        const merged = Object.assign({}, part1, part2);
        // Extract notes from whichever part carries it
        const notes = INV_QR_PARTS[cacheKey]['2/2_notes'] ||
          partPayloads.find(p => p.n)?.n || '';
        applyImportedInventoryData(sample.m, merged, notes);
        delete INV_QR_PARTS[cacheKey];
        applied = true;
      } else if (!applied) {
        showToast(t('qrUploadPartial'));
        return;
      }
    }

    if (applied) showToast(t('qrUploadSuccess'));
    else showToast(t('qrUploadNone'));
  } catch (err) {
    console.error(err);
    showToast(t('qrUploadError'));
  } finally {
    e.target.value = '';
  }
}

async function generateSnapshot() {
  const btn = document.getElementById('btn-inv-snapshot');
  const origHTML = btn.innerHTML;
  btn.innerHTML = `<span>${t('working')}</span>`;
  btn.disabled = true;

  try {
    saveCurrentMonth();

    // Check QR capacity
    const [qrCheck1, qrCheck2] = gatherSnapshotDataSplit();
    const s1 = byteLen(JSON.stringify(qrCheck1));
    const s2 = byteLen(JSON.stringify(qrCheck2));
    if (s1 > QR_MAX_BYTES || s2 > QR_MAX_BYTES) {
      const over = Math.max(s1 - QR_MAX_BYTES, s2 - QR_MAX_BYTES);
      showToast(t('qrTooLarge').replace('{over}', over));
      return;
    }

    // Build a temporary snapshot container
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:-9999px;top:0;width:760px;background:#fff;padding:24px;font-family:Segoe UI,system-ui,sans-serif;color:#1e1e2f;';
    document.body.appendChild(wrap);

    const ms = document.getElementById('inv-month').value;
    const storeName = document.getElementById('store-name').textContent || '';

    // Title
    const title = document.createElement('div');
    title.style.cssText = 'font-size:18px;font-weight:700;margin-bottom:4px;';
    title.textContent = storeName;
    wrap.appendChild(title);

    const subtitle = document.createElement('div');
    subtitle.style.cssText = 'font-size:13px;color:#6b7194;margin-bottom:16px;';
    subtitle.textContent = `${t('inventoryOf')} ${formatMonth(ms)}`;
    wrap.appendChild(subtitle);

    const categorySnapshots = [];
    CATEGORIES.forEach(cat => {
      let catTotal = 0;
      const items = [];
      cat.items.forEach(item => {
        const key = itemKey(cat.id, item.id);
        const inp = document.querySelector(`.inv-qty[data-item-key="${CSS.escape(key)}"]`);
        const qty = inp ? (parseFloat(inp.value) || 0) : 0;
        const price = item.price || 0;
        const lineTotal = qty * price;
        catTotal += lineTotal;
        if (qty > 0) items.push({ name: item.name, qty, price, unit: item.unit, lineTotal });
      });

      if (items.length > 0) {
        categorySnapshots.push({
          label: getCategoryLabel(cat),
          items,
          catTotal,
          weight: items.length + 2,
        });
      }
    });

    const categoriesGrid = document.createElement('div');
    categoriesGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:8px;';

    const leftCol = document.createElement('div');
    leftCol.style.cssText = 'display:flex;flex-direction:column;gap:12px;';
    const rightCol = document.createElement('div');
    rightCol.style.cssText = 'display:flex;flex-direction:column;gap:12px;';

    let leftWeight = 0;
    let rightWeight = 0;

    categorySnapshots.forEach(catSnap => {
      const card = document.createElement('div');
      card.style.cssText = 'border:1px solid #d4d8e1;border-radius:10px;padding:10px 10px 8px;';

      const catHeader = document.createElement('div');
      catHeader.style.cssText = 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#6c63ff;margin-bottom:6px;border-bottom:1px solid #d4d8e1;padding-bottom:4px;';
      catHeader.textContent = catSnap.label;
      card.appendChild(catHeader);

      catSnap.items.forEach(it => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;justify-content:space-between;font-size:11px;padding:2px 0;gap:8px;';
        const left = document.createElement('span');
        left.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
        const priceStr = it.price ? `@$${it.price.toFixed(2)}/${it.unit}` : '';
        left.textContent = `${it.name} × ${it.qty} ${priceStr}`;
        const right = document.createElement('span');
        right.style.cssText = 'font-weight:600;white-space:nowrap;';
        right.textContent = `$${it.lineTotal.toFixed(2)}`;
        row.appendChild(left);
        row.appendChild(right);
        card.appendChild(row);
      });

      const subRow = document.createElement('div');
      subRow.style.cssText = 'text-align:right;font-size:11px;font-weight:700;color:#1fa855;margin-top:6px;padding-top:4px;border-top:1px dashed #d4d8e1;';
      subRow.textContent = `${t('subtotal')}: $${catSnap.catTotal.toFixed(2)}`;
      card.appendChild(subRow);

      if (leftWeight <= rightWeight) {
        leftCol.appendChild(card);
        leftWeight += catSnap.weight;
      } else {
        rightCol.appendChild(card);
        rightWeight += catSnap.weight;
      }
    });

    categoriesGrid.appendChild(leftCol);
    categoriesGrid.appendChild(rightCol);
    wrap.appendChild(categoriesGrid);

    // Grand total (sum category subtotals already computed above)
    let grand = 0;
    categorySnapshots.forEach(cs => { grand += cs.catTotal; });

    const grandRow = document.createElement('div');
    grandRow.style.cssText = 'margin-top:16px;padding-top:10px;border-top:2px solid #6c63ff;display:flex;justify-content:space-between;font-size:16px;font-weight:700;color:#6c63ff;';
    grandRow.innerHTML = `<span>${t('grandTotal')}</span><span>$${grand.toFixed(2)}</span>`;
    wrap.appendChild(grandRow);

    // QR codes – split data across two codes
    const [qrData1, qrData2] = gatherSnapshotDataSplit();

    const qrRow = document.createElement('div');
    qrRow.style.cssText = 'margin-top:16px;display:flex;justify-content:flex-end;gap:12px;';
    wrap.appendChild(qrRow);

    // Smaller size so two QR codes fit side by side reliably in the snapshot
    const QR_DUAL_SIZE = 96;

    // Helper to create a labeled QR block
    function buildQRBlock(data, label) {
      const block = document.createElement('div');
      block.style.cssText = `display:flex;flex-direction:column;align-items:center;width:${QR_DUAL_SIZE}px;flex-shrink:0;`;

      const container = document.createElement('div');
      container.style.cssText = `width:${QR_DUAL_SIZE}px;height:${QR_DUAL_SIZE}px;overflow:hidden;`;
      block.appendChild(container);

      new QRCode(container, {
        text: JSON.stringify(data),
        width: QR_DUAL_SIZE,
        height: QR_DUAL_SIZE,
        correctLevel: QRCode.CorrectLevel.L,
      });

      // Force the generated QR element to stay within bounds (canvas/img/table fallback)
      const rendered = container.querySelectorAll('canvas, img, table');
      rendered.forEach(el => {
        el.style.width = QR_DUAL_SIZE + 'px';
        el.style.height = QR_DUAL_SIZE + 'px';
        el.style.display = 'block';
      });

      const lbl = document.createElement('div');
      lbl.style.cssText = 'font-size:10px;color:#6b7194;margin-top:4px;text-align:center;font-weight:600;';
      lbl.textContent = label;
      block.appendChild(lbl);

      return block;
    }

    qrRow.appendChild(buildQRBlock(qrData1, '1 / 2'));
    qrRow.appendChild(buildQRBlock(qrData2, '2 / 2'));

    const qrDisclaimer = document.createElement('div');
    qrDisclaimer.style.cssText = 'margin-top:8px;font-size:10px;color:#6b7194;text-align:right;line-height:1.35;';
    qrDisclaimer.textContent = 'These 2 QR codes are for the Inventory page only because a large amount of inventory data must be stored.';
    wrap.appendChild(qrDisclaimer);

    // Give QRCode.js time to render, then force-resize generated elements
    await new Promise(r => setTimeout(r, 200));
    qrRow.querySelectorAll('canvas, img, table').forEach(el => {
      el.style.width = QR_DUAL_SIZE + 'px';
      el.style.height = QR_DUAL_SIZE + 'px';
      el.style.display = 'block';
    });

    // Final wait for rendering to stabilize
    await new Promise(r => setTimeout(r, 300));

    const canvas = await html2canvas(wrap, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });

    document.body.removeChild(wrap);

    // Save as image
    const link = document.createElement('a');
    link.download = `inventory_${ms}_${storeName.replace(/\s+/g,'_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    showToast(t('snapshotSaved'));
  } catch (err) {
    console.error(err);
    showToast(t('snapshotError'));
  } finally {
    btn.innerHTML = origHTML;
    btn.disabled = false;
    if (window.lucide) lucide.createIcons();
  }
}

/* ═══════════════════════════════════════════
   TOAST
═══════════════════════════════════════════ */
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

/* ═══════════════════════════════════════════
   i18n APPLY
═══════════════════════════════════════════ */
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (I18N[currentLang] && I18N[currentLang][key]) {
      el.textContent = I18N[currentLang][key];
    } else if (I18N.en[key]) {
      el.textContent = I18N.en[key];
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    el.placeholder = t(key);
  });
}

function setLang(lang) {
  currentLang = lang;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  applyI18n();
  buildInventory();
  // Re-apply saved data after rebuild
  const ms = document.getElementById('inv-month').value;
  if (ms) {
    const data = loadMonthData(ms);
    if (data) applyMonthData(data);
  }
  renderHistory();
  saveMeta({ lang });
}

/* ═══════════════════════════════════════════
   EXPORT CSV
═══════════════════════════════════════════ */
function csvEscape(val) {
  let s = String(val);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function exportInventoryCSV() {
  const ms = document.getElementById('inv-month').value || '';
  const storeName = document.getElementById('store-name').textContent || 'Store';
  const rows = [];

  // Title
  rows.push(storeName + ' \u2013 ' + t('monthlyInventory') + ' \u2013 ' + formatMonth(ms));
  rows.push('');

  // Category tables
  let grandTotal = 0;

  CATEGORIES.forEach(cat => {
    const label = getCategoryLabel(cat);
    const items = [];
    let catTotal = 0;

    cat.items.forEach(item => {
      const key = itemKey(cat.id, item.id);
      const inp = document.querySelector(`.inv-qty[data-item-key="${CSS.escape(key)}"]`);
      const qty = inp ? (parseFloat(inp.value) || 0) : 0;
      const price = item.price || 0;
      const lineTotal = qty * price;
      catTotal += lineTotal;
      if (qty > 0) items.push({ name: item.name, price, unit: item.unit || '', qty, lineTotal });
    });

    if (items.length === 0) return;

    rows.push(label.toUpperCase());
    rows.push(['Item', 'Price', 'Unit', 'Qty', 'Total'].map(csvEscape).join(','));
    items.forEach(it => {
      rows.push([
        csvEscape(it.name),
        it.price.toFixed(2),
        csvEscape(it.unit),
        it.qty % 1 === 0 ? it.qty : it.qty.toFixed(2),
        it.lineTotal.toFixed(2),
      ].join(','));
    });
    rows.push(['', '', '', t('subtotal'), catTotal.toFixed(2)].join(','));
    rows.push('');

    grandTotal += catTotal;
  });

  // Grand Total
  rows.push([t('grandTotal'), '', '', '', grandTotal.toFixed(2)].join(','));

  // Monthly Invoices
  if (monthlyInvoices.length > 0) {
    // Sort by date for CSV (earliest first, no-date last)
    const sorted = [...monthlyInvoices].sort((a, b) => {
      const da = a.date || '\uffff';
      const db = b.date || '\uffff';
      return da < db ? -1 : da > db ? 1 : 0;
    });
    rows.push('');
    rows.push(t('monthlyInvoicesTitle').toUpperCase());
    rows.push([t('vendor'), t('invoiceDate'), t('amount'), t('status')].map(csvEscape).join(','));
    let invTotal = 0;
    sorted.forEach(inv => {
      invTotal += inv.amount;
      rows.push([
        csvEscape(inv.vendor),
        csvEscape(inv.date || ''),
        inv.amount.toFixed(2),
        inv.paid ? t('paid') : t('unpaid'),
      ].join(','));
    });
    rows.push(['', '', invTotal.toFixed(2), ''].join(','));
  }

  // Notes
  const notesEl = document.getElementById('inv-notes');
  if (notesEl && notesEl.value.trim()) {
    rows.push('');
    rows.push(t('invNotes').toUpperCase());
    rows.push(csvEscape(notesEl.value.trim()));
  }

  // Download
  const bom = '\uFEFF';
  const csv = bom + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.download = `inventory_${ms}_${storeName.replace(/\s+/g, '_')}.csv`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
  showToast(t('csvSaved'));
}

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Load meta
  const meta = getMeta();
  if (meta.lang) currentLang = meta.lang;
  if (meta.storeName) {
    document.getElementById('store-name').textContent = meta.storeName;
  }

  // Default to current month
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  document.getElementById('inv-month').value = defaultMonth;

  // Build inventory UI
  buildInventory();
  applyI18n();
  initSearch();

  // Try to load existing data for this month
  const existing = loadMonthData(defaultMonth);
  if (existing) applyMonthData(existing);
  else updateInvNotesCounter();

  // Lang buttons
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === currentLang);
    b.addEventListener('click', () => setLang(b.dataset.lang));
  });

  // Month picker change — save under previous month before switching
  _prevMonth = document.getElementById('inv-month').value;
  document.getElementById('inv-month').addEventListener('change', () => {
    // Save data under the PREVIOUS month key, not the new one
    const prevMs = _prevMonth;
    if (prevMs) {
      const prevData = { __month: prevMs };
      document.querySelectorAll('.inv-qty').forEach(el => {
        const q = parseFloat(el.value);
        if (q) prevData[el.dataset.itemKey] = q;
      });
      if (monthlyInvoices.length) prevData.__invoices = monthlyInvoices;
      const notesVal = (document.getElementById('inv-notes') || {}).value || '';
      if (notesVal.trim()) prevData.__notes = notesVal;
      localStorage.setItem(invKey(prevMs), JSON.stringify(prevData));
    }
    const ms = document.getElementById('inv-month').value;
    _prevMonth = ms;
    const data = loadMonthData(ms);
    if (data) applyMonthData(data);
    else clearForm();
    renderHistory();
  });
  document.getElementById('inv-month').addEventListener('click', openMonthPicker);
  document.getElementById('inv-month').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openMonthPicker();
    }
  });

  // Snapshot button
  document.getElementById('btn-inv-snapshot').addEventListener('click', generateSnapshot);

  // Upload QR button
  document.getElementById('btn-inv-upload-qr').addEventListener('click', () => {
    document.getElementById('inv-qr-file').click();
  });
  document.getElementById('inv-qr-file').addEventListener('change', handleInventoryQRUpload);

  // Clear all button (bottom)
  document.getElementById('btn-inv-clear-all').addEventListener('click', clearAllQuantities);

  // Export CSV
  document.getElementById('btn-inv-export-csv').addEventListener('click', exportInventoryCSV);

  // Auto-fill invoices button
  document.getElementById('btn-autofill-invoices').addEventListener('click', autoFillInvoices);

  // Add/Delete invoice buttons
  document.getElementById('btn-add-invoice').addEventListener('click', addInvoice);
  document.getElementById('btn-del-invoice').addEventListener('click', deleteInvoices);

  // Load existing invoices for current month
  const invData = loadMonthData(defaultMonth);
  if (invData && Array.isArray(invData.__invoices)) {
    monthlyInvoices = invData.__invoices.map(inv => ({
      vendor: String(inv.vendor || ''),
      amount: parseFloat(inv.amount) || 0,
      paid: !!inv.paid,
      date: inv.date || '',
    }));
  }
  renderInvoicesSection();

  // History sidebar
  document.getElementById('btn-inv-history').addEventListener('click', () => {
    document.getElementById('sidebar-overlay').classList.add('open');
    document.getElementById('history-panel').classList.add('open');
    renderHistory();
  });
  document.getElementById('btn-history-close').addEventListener('click', closeHistory);
  document.getElementById('sidebar-overlay').addEventListener('click', closeHistory);

  renderHistory();

  // Init Lucide
  if (window.lucide) lucide.createIcons();

  // Apply active lang button
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === currentLang);
  });
});

function closeHistory() {
  document.getElementById('sidebar-overlay').classList.remove('open');
  document.getElementById('history-panel').classList.remove('open');
}

/* ═══════════════════════════════════════════
   MONTHLY INVOICES – pull from weekly saves
═══════════════════════════════════════════ */
const WEEK_PREFIX = 'edr_week_';

// Editable invoice rows for the current month
let monthlyInvoices = []; // [{ vendor, amount, paid, date }]

// Tracks the previously-selected month so we save under the correct key
let _prevMonth = '';

/**
 * Find all saved weeks whose 7-day span overlaps the given month.
 */
function getWeeksForMonth(monthStr) {
  const [y, m] = monthStr.split('-').map(Number);
  const monthStart = new Date(y, m - 1, 1);
  const monthEnd = new Date(y, m, 0);

  const weeks = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith(WEEK_PREFIX)) continue;
    const dateStr = k.replace(WEEK_PREFIX, '');
    const weekStart = new Date(dateStr + 'T00:00:00');
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    if (weekEnd >= monthStart && weekStart <= monthEnd) {
      weeks.push({ dateStr, weekStart, weekEnd });
    }
  }
  return weeks.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
}

/**
 * Extract per-vendor invoice entries from a saved week's data.
 * Returns an array of { vendor, amount, date } for each day with data.
 * Only counts days that fall within the given month.
 */
function extractInvoiceEntriesFromWeek(weekData, monthStr) {
  if (!weekData) return [];
  const [y, m] = monthStr.split('-').map(Number);
  const monthStart = new Date(y, m - 1, 1);
  const monthEnd = new Date(y, m, 0);
  const vendors = weekData['__vendors'] || [];
  const weekStartStr = weekData['__weekStart'];
  if (!weekStartStr) return [];
  const weekBase = new Date(weekStartStr + 'T00:00:00');

  const entries = [];
  vendors.forEach(v => {
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(weekBase);
      dayDate.setDate(weekBase.getDate() + i);
      if (dayDate >= monthStart && dayDate <= monthEnd) {
        const val = parseFloat(weekData[`inv_${v}_${i}`]) || 0;
        if (val > 0) {
          const dateStr = dayDate.getFullYear() + '-' +
            String(dayDate.getMonth() + 1).padStart(2, '0') + '-' +
            String(dayDate.getDate()).padStart(2, '0');
          const paid = weekData[`invpaid_${v}_${i}`] === '1';
          entries.push({ vendor: v, amount: val, date: dateStr, paid });
        }
      }
    }
  });
  return entries;
}

/**
 * Auto-fill: pull invoice data from weekly saves.
 * Creates separate entries for each vendor on each day (no merging).
 */
function autoFillInvoices() {
  const ms = document.getElementById('inv-month').value;
  if (!ms) return;

  const weeks = getWeeksForMonth(ms);
  if (!weeks.length) {
    showToast(t('invoicesNoWeeks'));
    return;
  }

  // Collect all individual invoice entries from all weeks
  const newEntries = [];
  weeks.forEach(w => {
    try {
      const data = JSON.parse(localStorage.getItem(WEEK_PREFIX + w.dateStr));
      const entries = extractInvoiceEntriesFromWeek(data, ms);
      newEntries.push(...entries);
    } catch { /* skip corrupted */ }
  });

  // Build a map of existing entries keyed by vendor+date to avoid duplicates.
  // Using vendor+date (not amount) so that manually edited amounts don't
  // cause duplicates when re-running autofill.
  const existingMap = new Map();
  monthlyInvoices.forEach((r, idx) => {
    const key = `${r.vendor}|${r.date || ''}`;
    existingMap.set(key, idx);
  });

  // Add each entry as a separate invoice row (allow same vendor name)
  newEntries.forEach(entry => {
    const key = `${entry.vendor}|${entry.date}`;
    if (existingMap.has(key)) {
      // Update paid status and amount from daily report if entry already exists
      const idx = existingMap.get(key);
      monthlyInvoices[idx].paid = entry.paid;
      monthlyInvoices[idx].amount = entry.amount;
    } else {
      monthlyInvoices.push({
        vendor: entry.vendor,
        amount: entry.amount,
        paid: entry.paid,
        date: entry.date,
      });
      existingMap.set(key, monthlyInvoices.length - 1);
    }
  });

  renderInvoicesSection();
  saveCurrentMonth();
  showToast(t('invoicesAutoFilled').replace('{n}', weeks.length));
}

/**
 * Add a new invoice row manually.
 */
function addInvoice() {
  const name = (prompt(t('invoiceVendorName')) || '').trim();
  if (!name) return;
  const amtStr = (prompt(t('invoiceAmount'), '0') || '').trim();
  const amt = parseFloat(amtStr);
  // Default date to today
  const today = new Date();
  const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

  monthlyInvoices.push({
    vendor: name,
    amount: Number.isFinite(amt) ? amt : 0,
    paid: false,
    date: todayStr,
  });

  renderInvoicesSection();
  saveCurrentMonth();
  showToast(t('invoiceAdded'));
}

/**
 * Delete invoices via a multi-select picker.
 */
async function deleteInvoices() {
  if (!monthlyInvoices.length) return;

  const options = monthlyInvoices.map((inv, idx) => ({
    id: String(idx),
    label: `${inv.vendor} — $${inv.amount.toFixed(2)} (${inv.paid ? t('paid') : t('unpaid')})${inv.date ? ' [' + inv.date + ']' : ''}`,
  }));

  const selected = await showDeletePickerModal(t('selectInvoicesToDelete'), options);
  if (!selected.length) return;
  if (!confirm(t('confirmDeleteInvoices'))) return;

  const idxSet = new Set(selected.map(Number));
  monthlyInvoices = monthlyInvoices.filter((_, i) => !idxSet.has(i));

  renderInvoicesSection();
  saveCurrentMonth();
  showToast(t('invoiceDeleted'));
}

/**
 * Render the monthly invoices editable table.
 */
function renderInvoicesSection() {
  const body = document.getElementById('inv-invoices-body');
  const hint = document.getElementById('inv-invoices-hint');
  const totalEl = document.getElementById('inv-invoices-total');

  if (!monthlyInvoices.length) {
    body.innerHTML = '';
    hint.style.display = '';
    totalEl.textContent = '$0.00';
    return;
  }

  hint.style.display = 'none';

  // Sort invoices by date (earliest first; entries without date go last)
  monthlyInvoices.sort((a, b) => {
    const da = a.date || '\uffff';
    const db = b.date || '\uffff';
    return da < db ? -1 : da > db ? 1 : 0;
  });

  let html = '<div class="table-wrap"><table class="inv-table inv-invoices-table">';
  html += '<thead><tr>';
  html += `<th>${t('vendor')}</th>`;
  html += `<th>${t('invoiceDate')}</th>`;
  html += `<th>${t('amount')}</th>`;
  html += `<th>${t('status')}</th>`;
  html += '</tr></thead><tbody>';

  let grandTotal = 0;
  monthlyInvoices.forEach((inv, idx) => {
    grandTotal += inv.amount;
    const safeName = inv.vendor.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const safeDate = (inv.date || '').replace(/"/g, '&quot;');
    const paidClass = inv.paid ? 'inv-status-paid' : 'inv-status-unpaid';
    const paidLabel = inv.paid ? t('paid') : t('unpaid');
    html += '<tr>';
    html += `<td class="inv-item-name"><input class="inp inv-invoice-vendor" type="text" value="${safeName}" data-idx="${idx}" /></td>`;
    html += `<td><input class="inp inv-invoice-date" type="date" value="${safeDate}" data-idx="${idx}" /></td>`;
    html += `<td><input class="inp inv-invoice-amount" type="number" inputmode="decimal" min="0" step="0.01" value="${inv.amount}" data-idx="${idx}" /></td>`;
    html += `<td class="inv-toggle-cell"><label class="inv-toggle"><input type="checkbox" class="inv-toggle-input" data-idx="${idx}" ${inv.paid ? 'checked' : ''} /><span class="inv-toggle-slider"></span></label><span class="inv-toggle-label-monthly" data-idx="${idx}">${paidLabel}</span></td>`;
    html += '</tr>';
  });

  // Totals row
  html += '<tr class="totals-row">';
  html += `<td>${t('totals')}</td>`;
  html += '<td></td>';
  html += `<td class="tot-cell">$${grandTotal.toFixed(2)}</td>`;
  html += '<td></td>';
  html += '</tr>';

  html += '</tbody></table></div>';
  body.innerHTML = html;
  totalEl.textContent = `$${grandTotal.toFixed(2)}`;

  // Wire up event listeners
  body.querySelectorAll('.inv-invoice-vendor').forEach(inp => {
    inp.addEventListener('change', () => {
      const i = parseInt(inp.dataset.idx);
      if (monthlyInvoices[i]) {
        monthlyInvoices[i].vendor = inp.value.trim() || monthlyInvoices[i].vendor;
        saveCurrentMonth();
      }
    });
  });

  body.querySelectorAll('.inv-invoice-date').forEach(inp => {
    inp.addEventListener('change', () => {
      const i = parseInt(inp.dataset.idx);
      if (monthlyInvoices[i]) {
        monthlyInvoices[i].date = inp.value || '';
        saveCurrentMonth();
        renderInvoicesSection(); // re-render to re-sort by date
      }
    });
  });

  body.querySelectorAll('.inv-invoice-amount').forEach(inp => {
    inp.addEventListener('input', () => {
      const i = parseInt(inp.dataset.idx);
      if (monthlyInvoices[i]) {
        const v = parseFloat(inp.value);
        monthlyInvoices[i].amount = Number.isFinite(v) ? v : 0;
        updateInvoicesTotal();
        saveCurrentMonth();
      }
    });
  });

  body.querySelectorAll('.inv-toggle-input').forEach(cb => {
    cb.addEventListener('change', () => {
      const i = parseInt(cb.dataset.idx);
      if (monthlyInvoices[i]) {
        monthlyInvoices[i].paid = cb.checked;
        const label = body.querySelector(`.inv-toggle-label-monthly[data-idx="${i}"]`);
        if (label) label.textContent = cb.checked ? t('paid') : t('unpaid');
        saveCurrentMonth();
      }
    });
  });
}

/**
 * Recalculate and update just the invoices total (without full re-render).
 */
function updateInvoicesTotal() {
  let total = 0;
  monthlyInvoices.forEach(inv => { total += inv.amount; });
  document.getElementById('inv-invoices-total').textContent = `$${total.toFixed(2)}`;
  // Also update totals row in the table
  const totCell = document.querySelector('.inv-invoices-table .totals-row .tot-cell');
  if (totCell) totCell.textContent = `$${total.toFixed(2)}`;
}

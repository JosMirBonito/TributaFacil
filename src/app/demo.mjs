export const DEMO_DATE = '29/10/2026';
export const DEMO_DNI = '00000001';
export const DEMO_MUNICIPALITY = 'Municipalidad de Miraflores';
export const money = (amount) => `S/ ${amount.toFixed(2)}`;
export const initialDebts = () => [
  { id: 'predial', name: 'Impuesto predial', period: 'Anual 2026', due: '2026-10-15', amount: 420, interest: 0, status: 'Vencido' },
  { id: 'arbitrios-1', name: 'Arbitrios municipales', period: 'Noviembre 2026', due: '2026-11-15', amount: 187.5, interest: 0, status: 'Pendiente' },
  { id: 'arbitrios-2', name: 'Arbitrios municipales', period: 'Diciembre 2026', due: '2026-12-15', amount: 240, interest: 0, status: 'Pendiente' },
  { id: 'licencia', name: 'Licencia de funcionamiento', period: 'Anual 2026', due: '2026-09-30', amount: 350, interest: 0, status: 'Pagado' },
];
export const debtTotal = (debts) => debts.reduce((sum, d) => sum + d.amount + d.interest, 0);
export const outstanding = (debts) => debts.filter(d => d.status !== 'Pagado');
export function visibleDebts(debts, filter = 'Todos') {
  return debts.filter(d => filter === 'Todos' || d.status === filter)
    .sort((a, b) => Number(a.status === 'Pagado') - Number(b.status === 'Pagado') || a.due.localeCompare(b.due));
}
export function confirmPayment(debts, ids, method, sequence = 1) {
  if (!['Tarjeta', 'Yape', 'Plin'].includes(method)) throw new Error('Elige un método de demostración.');
  if (!ids.length || new Set(ids).size !== ids.length || ids.some(id => !debts.some(d => d.id === id && d.status !== 'Pagado'))) {
    throw new Error('Selecciona al menos una obligación pendiente.');
  }
  const items = debts.filter(d => ids.includes(d.id));
  return {
    debts: debts.map(d => ids.includes(d.id) ? { ...d, status: 'Pagado' } : d),
    receipt: { reference: `DEMO-2026-${String(sequence).padStart(4, '0')}`, date: DEMO_DATE, items, method, total: debtTotal(items) },
  };
}
export function receiptHtml(receipt) {
  // Fields come only from the fixed dataset and validated demonstration methods.
  return `<!doctype html><html lang="es"><meta charset="utf-8"><title>Constancia ${receipt.reference}</title><style>body{font:16px Arial;color:#14234b;background:#f4f6fc;margin:0;padding:40px}main{max-width:650px;margin:auto;background:white;padding:48px;border-top:6px solid #c9a227}h1{font-family:Georgia;font-size:36px}small{color:#656c7b}table{width:100%;border-collapse:collapse;margin:32px 0}td,th{padding:14px 0;text-align:left;border-bottom:1px solid #e4e8ef}td:last-child,th:last-child{text-align:right}.total{font-size:28px;font-weight:bold}.notice{padding:16px;background:#fff5d8;line-height:1.6}@media print{body{background:white;padding:0}main{padding:24px}}</style><main><small>TRIBUTAFÁCIL · CONSTANCIA DE DEMOSTRACIÓN</small><h1>Pago registrado (demostración)</h1><p>${receipt.reference} · ${receipt.date}</p><p>Carlos Ramírez · DNI ${DEMO_DNI}<br>${DEMO_MUNICIPALITY}<br>Medio de pago: ${receipt.method}</p><table><tr><th>Obligación</th><th>Importe</th></tr>${receipt.items.map(d => `<tr><td>${d.name}<br><small>${d.period}</small></td><td>${money(d.amount + d.interest)}</td></tr>`).join('')}</table><p>Intereses / mora: ${money(receipt.items.reduce((s,d)=>s+d.interest,0))}</p><p class="total">Total pagado: ${money(receipt.total)}</p><p class="notice">No se realizó ningún cobro. Este documento no tiene validez tributaria y no acredita pagos ante una municipalidad. Los datos son ficticios.</p></main></html>`;
}

// ---------- Mejoras tras el testeo con el profesor (feedback 10/11) ----------
export const DEMO_DATE_ISO = '2026-10-29';
export const SOON_DAYS = 30;
// Tasa de Interés Moratorio de referencia (ficticia) para mostrar cómo crecería la mora.
export const DEMO_TIM_MONTHLY = 0.009;
export const CAMPAIGN = {
  name: 'Campaña “Ponte al día” 2026',
  until: '2026-11-30',
  benefit: '100% de descuento en intereses moratorios del impuesto predial',
  appliesTo: ['predial'],
};
const DAY = 86400000;
export const daysBetween = (fromIso, toIso) => Math.round((Date.parse(toIso) - Date.parse(fromIso)) / DAY);
export const formatDate = (iso) => iso.split('-').reverse().join('/');

/** Información derivada de una deuda: estado visible, días de atraso o restantes y mora. */
export function debtInsight(d, today = DEMO_DATE_ISO) {
  const diff = daysBetween(today, d.due); // positivo = faltan días; negativo = atraso
  const daysLate = Math.max(0, -diff);
  let state = d.status;
  if (d.status === 'Pendiente' && diff >= 0 && diff <= SOON_DAYS) state = 'Por vencer';
  const campaign = d.status === 'Vencido' && CAMPAIGN.appliesTo.includes(d.id) && today <= CAMPAIGN.until ? CAMPAIGN : null;
  const estimatedFee = d.status === 'Vencido' ? Math.round(d.amount * DEMO_TIM_MONTHLY * (daysLate / 30) * 100) / 100 : 0;
  const waived = campaign ? estimatedFee : 0;
  return { state, daysLate, daysLeft: Math.max(0, diff), estimatedFee, waived, campaign, payable: d.amount + d.interest };
}

const RANK = { Vencido: 0, 'Por vencer': 1, Pendiente: 2, Pagado: 3 };
export const SORTS = { urgencia: 'Más urgente primero', fecha: 'Fecha de vencimiento', montoDesc: 'Monto: mayor a menor', montoAsc: 'Monto: menor a mayor' };

/** Lista para la grilla: filtro por estado visible (incluye "Por vencer") y orden elegido. */
export function gridDebts(debts, filter = 'Todos', sort = 'urgencia', today = DEMO_DATE_ISO) {
  const rows = debts.map(d => ({ ...d, info: debtInsight(d, today) }))
    .filter(d => filter === 'Todos' ? d.status !== 'Pagado' : d.info.state === filter);
  const total = d => d.amount + d.interest;
  const cmp = {
    urgencia: (a, b) => RANK[a.info.state] - RANK[b.info.state] || a.due.localeCompare(b.due),
    fecha: (a, b) => a.due.localeCompare(b.due),
    montoDesc: (a, b) => total(b) - total(a),
    montoAsc: (a, b) => total(a) - total(b),
  }[sort] ?? (() => 0);
  return rows.sort(cmp);
}

export function accountSummary(debts, today = DEMO_DATE_ISO) {
  const rows = debts.map(d => ({ ...d, info: debtInsight(d, today) }));
  const sum = s => rows.filter(d => d.info.state === s);
  const pending = rows.filter(d => d.status !== 'Pagado');
  return {
    pending: debtTotal(pending), pendingCount: pending.length,
    late: debtTotal(sum('Vencido')), lateCount: sum('Vencido').length,
    soon: debtTotal(sum('Por vencer')), soonCount: sum('Por vencer').length,
    paid: debtTotal(sum('Pagado')), paidCount: sum('Pagado').length,
    maxDaysLate: Math.max(0, ...sum('Vencido').map(d => d.info.daysLate)),
    nextDue: pending.filter(d => d.info.state !== 'Vencido').sort((a, b) => a.due.localeCompare(b.due))[0] ?? null,
  };
}

/** Planificador: con un presupuesto, sugiere qué pagar primero según urgencia (sin partir deudas). */
export function planBudget(debts, budget, today = DEMO_DATE_ISO) {
  const value = Number(budget);
  if (!Number.isFinite(value) || value <= 0) return { ids: [], total: 0, left: 0, skipped: [] };
  let left = value; const ids = []; const skipped = [];
  for (const d of gridDebts(debts, 'Todos', 'urgencia', today)) {
    const t = d.amount + d.interest;
    if (t <= left + 1e-9) { ids.push(d.id); left -= t; } else skipped.push(d.id);
  }
  return { ids, total: Math.round((value - left) * 100) / 100, left: Math.round(left * 100) / 100, skipped };
}

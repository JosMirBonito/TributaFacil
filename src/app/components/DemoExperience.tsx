import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, Bell, BellRing, CalendarClock, Check, CheckCircle2, ChevronDown, Clock, Download, FileText, HelpCircle, History, Landmark, Megaphone, PiggyBank, RotateCcw, ShieldCheck, Sparkles, Wallet, X } from 'lucide-react';
import { CAMPAIGN, DEMO_DATE, DEMO_DNI, DEMO_MUNICIPALITY, SORTS, accountSummary, confirmPayment, debtInsight, debtTotal, formatDate, gridDebts, initialDebts, money, outstanding, planBudget, receiptHtml } from '../demo.mjs';
import '../../styles/demo.css';

type Debt = ReturnType<typeof initialDebts>[number];
type Receipt = ReturnType<typeof confirmPayment>['receipt'];
type Screen = 'home' | 'debts' | 'review' | 'success';
type Filter = 'Todos' | 'Vencido' | 'Por vencer' | 'Pendiente' | 'Pagado';

const FILTERS: [Filter, string][] = [['Todos', 'Por pagar'], ['Vencido', 'Vencidos'], ['Por vencer', 'Por vencer'], ['Pendiente', 'Pendientes'], ['Pagado', 'Pagados']];
const GLOSSARY: [string, string][] = [
  ['Vencido', 'Ya pasó la fecha límite. Puede generar mora (intereses). Conviene pagarlo primero.'],
  ['Por vencer', `Vence en los próximos 30 días. Planifícalo para no caer en mora.`],
  ['Pendiente', 'Aún falta más de un mes para su vencimiento.'],
  ['Pagado', 'Ya fue cancelado. Lo encuentras en tu historial de pagos.'],
];

function Badge({ status }: { status: string }) {
  return <span className={`tf-badge tf-badge-${status.toLowerCase().replace(' ', '-')}`}><span aria-hidden="true">●</span> {status}</span>;
}
function Situation({ d }: { d: Debt }) {
  const i = debtInsight(d);
  if (d.status === 'Pagado') return <span className="tf-sit tf-sit-ok"><CheckCircle2 size={13} /> Pagado</span>;
  if (i.state === 'Vencido') return <span className="tf-sit tf-sit-late"><AlertTriangle size={13} /> {i.daysLate} días de atraso</span>;
  if (i.state === 'Por vencer') return <span className="tf-sit tf-sit-soon"><Clock size={13} /> Vence en {i.daysLeft} días</span>;
  return <span className="tf-sit"><CalendarClock size={13} /> Faltan {i.daysLeft} días</span>;
}

export function DemoExperience() {
  const [screen, setScreen] = useState<Screen>('home');
  const [debts, setDebts] = useState<Debt[]>(initialDebts);
  const [dni, setDni] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [searched, setSearched] = useState(false);
  const [filter, setFilter] = useState<Filter>('Todos');
  const [sort, setSort] = useState('urgencia');
  const [selected, setSelected] = useState<string[]>([]);
  const [method, setMethod] = useState('');
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [sequence, setSequence] = useState(1);
  const [error, setError] = useState('');
  const [help, setHelp] = useState(false);
  const [glossary, setGlossary] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [budget, setBudget] = useState('');
  const [plan, setPlan] = useState<ReturnType<typeof planBudget> | null>(null);
  const [reminders, setReminders] = useState<string[]>([]);
  const [campaignClosed, setCampaignClosed] = useState(false);
  const resetDialog = useRef<HTMLDialogElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLElement>(null);
  const pending = outstanding(debts);
  const summary = useMemo(() => accountSummary(debts), [debts]);
  const rows = useMemo(() => gridDebts(debts, filter, sort), [debts, filter, sort]);
  const paidRows = useMemo(() => gridDebts(debts, 'Pagado', 'fecha'), [debts]);
  const chosen = debts.filter(d => selected.includes(d.id) && d.status !== 'Pagado');
  const total = debtTotal(chosen);
  const chosenFees = chosen.reduce((s, d) => s + debtInsight(d).estimatedFee, 0);
  const chosenWaived = chosen.reduce((s, d) => s + debtInsight(d).waived, 0);
  const campaignDebts = pending.filter(d => debtInsight(d).campaign);
  useEffect(() => { document.title = 'TributaFácil · Demostración'; }, []);
  useEffect(() => { window.scrollTo({ top: 0 }); title.current?.focus(); }, [screen, searched]);
  const go = (next: Screen) => { setError(''); setScreen(next); };
  const toggle = (id: string) => setSelected(previous => previous.includes(id) ? previous.filter(x => x !== id) : [...previous, id]);
  const showFilter = (f: Filter) => { setFilter(f); listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const toggleReminder = (id: string) => setReminders(r => r.includes(id) ? r.filter(x => x !== id) : [...r, id]);
  const search = (event: React.FormEvent) => {
    event.preventDefault();
    if (dni.trim() !== DEMO_DNI || municipality !== DEMO_MUNICIPALITY) {
      setError('Este prototipo solo consulta el caso ficticio. Usa los datos de prueba indicados abajo.'); setSearched(false); return;
    }
    setError(''); setSearched(true);
  };
  const reset = () => {
    setDebts(initialDebts()); setDni(''); setMunicipality(''); setSearched(false); setFilter('Todos'); setSort('urgencia');
    setSelected([]); setMethod(''); setReceipt(null); setSequence(1); setError(''); setDownloaded(false);
    setBudget(''); setPlan(null); setReminders([]); setCampaignClosed(false); setGlossary(false);
    setHelp(false); setScreen('home'); resetDialog.current?.close();
  };
  const pay = () => {
    try {
      const result = confirmPayment(debts, selected, method, sequence);
      setDebts(result.debts); setReceipt(result.receipt); setSelected([]); setSequence(n => n + 1);
      setDownloaded(false); setPlan(null); setScreen('success');
    } catch (e) { setError((e as Error).message); }
  };
  const download = () => {
    if (!receipt) return;
    const url = URL.createObjectURL(new Blob([receiptHtml(receipt)], { type: 'text/html;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `${receipt.reference}.html`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); setDownloaded(true);
  };
  const suggest = (e: React.FormEvent) => { e.preventDefault(); setPlan(planBudget(debts, budget)); };
  const metric = (f: Filter, label: string, value: number, note: string, cls = '') =>
    <button className={`tf-metric ${cls} ${filter === f ? 'is-on' : ''}`} aria-pressed={filter === f} onClick={() => showFilter(f)}>
      <span>{label}</span><strong>{money(value)}</strong><small>{note}</small><em>Ver detalle <ArrowRight size={12} /></em>
    </button>;
  const next = summary.nextDue;

  return <div className="tf-app">
    <div className="tf-demo-bar"><span><span className="tf-demo-dot" /> Entorno de demostración <span className="tf-demo-description">· Datos ficticios. No se realizan cobros.</span></span><button onClick={() => resetDialog.current?.showModal()}><RotateCcw size={13} /> Reiniciar demo</button></div>
    <header className="tf-header"><div className="tf-wrap tf-header-inner">
      <button className="tf-logo" onClick={() => go('home')} aria-label="TributaFácil, ir al inicio"><span className="tf-logo-icon"><Landmark size={22} /></span><span>Tributa<span className="tf-gold">Fácil</span><small>TRIBUTOS MUNICIPALES</small></span></button>
      <nav aria-label="Navegación principal"><button className={screen === 'home' ? 'active' : ''} onClick={() => go('home')}>Inicio</button><button className={screen !== 'home' ? 'active' : ''} onClick={() => go('debts')}>Mis tributos</button><button onClick={() => setHelp(!help)} aria-expanded={help}><HelpCircle size={16} /> Ayuda</button></nav>
      <span className="tf-header-note"><ShieldCheck size={16} /> Sin pagos reales</span>
    </div></header>
    {help && <aside className="tf-help tf-wrap"><button className="tf-help-close" aria-label="Cerrar ayuda" onClick={() => setHelp(false)}><X size={18} /></button><strong>Acerca de esta demostración</strong><p>Solo se utiliza el contribuyente ficticio Carlos Ramírez, DNI {DEMO_DNI}, de {DEMO_MUNICIPALITY}. La fecha de referencia es {DEMO_DATE}. La mora se estima con una tasa referencial ficticia de 0.9% mensual y la campaña mostrada es de ejemplo. Los cambios duran mientras esta página siga abierta.</p><dl className="tf-glossary">{GLOSSARY.map(([k, v]) => <div key={k}><dt><Badge status={k} /></dt><dd>{v}</dd></div>)}</dl></aside>}
    {screen === 'home' ? <main className="tf-wrap tf-home">
      <section className="tf-hero"><div className="tf-hero-copy"><div className="tf-eyebrow"><span /> TUS TRIBUTOS, CON CLARIDAD</div><h1 ref={title} tabIndex={-1}>Ponte al día.<br /><em>Sin dar vueltas.</em></h1><p>Mira de un vistazo qué está vencido, qué vence pronto y cuánto debes. Planifica según tu presupuesto y paga solo lo que decidas.</p><button className="tf-button tf-primary" onClick={() => go('debts')}>Consultar mis tributos <ArrowRight size={19} /></button><div className="tf-hero-trust"><ShieldCheck size={17} /> Explora el recorrido con datos de prueba</div></div>
      <div className="tf-hero-visual"><div className="tf-orbit" /><div className="tf-account-preview"><div className="tf-preview-heading"><span className="tf-icon-soft"><Wallet size={22} /></span><span>Tu cuenta municipal<small>Una vista más clara de tus obligaciones</small></span></div><span className="tf-caption">TOTAL PENDIENTE · CASO DE EJEMPLO</span><div className="tf-preview-amount">{money(summary.pending)}</div><div className="tf-preview-line"><span>Vencido · {money(summary.late)}</span><AlertTriangle size={19} color="#ac3b3b" /></div><div className="tf-preview-line"><span>Por vencer · {money(summary.soon)}</span><Clock size={19} color="#b07a12" /></div><div className="tf-preview-line"><span>Planifica y paga por partes</span><CheckCircle2 size={19} /></div><div className="tf-preview-footer"><span className="tf-demo-dot" /> Demostración interactiva</div></div><div className="tf-floating-note"><FileText size={20} /><span>Más claridad.<strong>Menos incertidumbre.</strong></span></div></div></section>
      <section className="tf-home-bottom" aria-label="Cómo funciona"><p>Un recorrido sencillo,<br /><strong>de principio a fin.</strong></p>{[['01', 'Consulta', 'Ve lo vencido, lo que vence pronto y tus días de atraso.'], ['02', 'Planifica', 'Indica cuánto puedes pagar y te sugerimos qué priorizar.'], ['03', 'Paga', 'Elige el medio de pago y descarga tu constancia.']].map(([n, t, d]) => <div key={n}><span>{n}</span><h2>{t}</h2><p>{d}</p></div>)}</section>
    </main> : <main className="tf-wrap tf-workspace">
      <div className="tf-page-top"><button className="tf-back" onClick={() => go(screen === 'review' ? 'debts' : 'home')}><ArrowLeft size={16} /> {screen === 'review' ? 'Volver a mis tributos' : 'Volver al inicio'}</button><span>Fecha del caso: {DEMO_DATE}</span></div>
      <ol className="tf-steps" aria-label="Progreso">{['Mis tributos', 'Pago', 'Constancia'].map((label, i) => { const active = screen === 'debts' ? 0 : screen === 'review' ? 1 : 2; return <li key={label} aria-current={i === active ? 'step' : undefined} className={i <= active ? 'is-active' : ''}><span>{i < active ? <Check size={14} /> : i + 1}</span>{label}</li>; })}</ol>
      {screen === 'debts' && <>
        <div className="tf-title-row"><div><div className="tf-eyebrow">MI CUENTA MUNICIPAL</div><h1 ref={title} tabIndex={-1}>Tus tributos, a la vista.</h1><p>Revisa qué está vencido, qué vence pronto y elige qué pagar.</p></div><span className="tf-title-icon"><Landmark size={30} /></span></div>
        {!searched ? <div className="tf-query-layout"><section className="tf-panel tf-query"><h2>Consulta tus obligaciones</h2><p>Ingresa los datos del contribuyente de demostración.</p><form onSubmit={search}><label htmlFor="dni">DNI del contribuyente</label><input id="dni" inputMode="numeric" autoComplete="off" maxLength={8} value={dni} onChange={e => setDni(e.target.value.replace(/\D/g, ''))} placeholder="8 dígitos" required aria-describedby={error ? 'query-error' : 'demo-data'} /><label htmlFor="municipality">Municipalidad</label><div className="tf-select-wrap"><select id="municipality" value={municipality} onChange={e => setMunicipality(e.target.value)} required><option value="">Selecciona una municipalidad</option><option>{DEMO_MUNICIPALITY}</option></select><ChevronDown size={16} /></div>{error && <p id="query-error" className="tf-error" role="alert">{error}</p>}<button className="tf-button tf-primary" type="submit">Consultar tributos <ArrowRight size={18} /></button></form></section><aside className="tf-case-note" id="demo-data"><span className="tf-caption">TU CASO DE PRUEBA</span><div className="tf-avatar">CR</div><h2>Carlos Ramírez</h2><p>Propietario · 38 años · Lima</p><dl><div><dt>DNI ficticio</dt><dd>{DEMO_DNI}</dd></div><div><dt>Municipalidad</dt><dd>Miraflores</dd></div></dl><button className="tf-button tf-secondary" onClick={() => { setDni(DEMO_DNI); setMunicipality(DEMO_MUNICIPALITY); setError(''); }}>Usar datos de prueba <ArrowRight size={16} /></button><small>No ingreses tus datos personales. Esta cuenta no corresponde a un contribuyente real.</small></aside></div> : <>
          <div className="tf-account-line"><div className="tf-avatar small">CR</div><div><strong>Carlos Ramírez</strong><span>DNI {DEMO_DNI} · {DEMO_MUNICIPALITY}</span></div></div>

          {summary.lateCount > 0 ? <div className="tf-alert tf-alert-late" role="alert"><AlertTriangle size={20} /><div><strong>Tienes {summary.lateCount} {summary.lateCount === 1 ? 'obligación vencida' : 'obligaciones vencidas'} por {money(summary.late)}</strong><span>La más antigua lleva {summary.maxDaysLate} días de atraso. Págala primero para evitar más mora.</span></div><button className="tf-button tf-small" onClick={() => showFilter('Vencido')}>Ver vencidos</button></div>
            : <div className="tf-alert tf-alert-ok" role="status"><CheckCircle2 size={20} /><div><strong>¡Estás al día con lo vencido!</strong><span>{next ? `Tu próximo vencimiento es ${next.name} (${next.period}) el ${formatDate(next.due)}.` : 'No tienes obligaciones pendientes.'}</span></div></div>}
          {!campaignClosed && campaignDebts.length > 0 && <div className="tf-alert tf-alert-campaign"><Megaphone size={20} /><div><strong>{CAMPAIGN.name} · hasta el {formatDate(CAMPAIGN.until)}</strong><span>{CAMPAIGN.benefit}. Ya aplicado en tu predial: ahorras {money(campaignDebts.reduce((s, d) => s + debtInsight(d).waived, 0))} de mora.</span></div><button className="tf-icon-button" aria-label="Ocultar aviso de campaña" onClick={() => setCampaignClosed(true)}><X size={16} /></button></div>}

          <section className="tf-metrics tf-metrics-4" aria-label="Resumen de cuenta. Toca una tarjeta para ver su detalle.">
            {metric('Todos', 'Total por pagar', summary.pending, `${summary.pendingCount} obligaciones`, 'tf-metric-main')}
            {metric('Vencido', 'Vencido', summary.late, summary.lateCount ? `${summary.lateCount} · hasta ${summary.maxDaysLate} días de atraso` : 'Nada vencido', summary.late ? 'tf-metric-late' : '')}
            {metric('Por vencer', 'Por vencer (30 días)', summary.soon, summary.soonCount && next ? `${summary.soonCount} · próximo: ${formatDate(next.due)}` : 'Nada en los próximos 30 días', summary.soon ? 'tf-metric-soon' : '')}
            {metric('Pagado', 'Ya pagado', summary.paid, `${summary.paidCount} en tu historial`, 'tf-metric-paid')}
          </section>

          <div className="tf-debts-layout"><section className="tf-panel tf-list-panel" ref={listRef}>
            <div className="tf-list-heading"><div><h2>Detalle de obligaciones</h2><p>Fecha de vencimiento, días de atraso y mora en cada fila.</p></div><button className="tf-link" aria-expanded={glossary} onClick={() => setGlossary(!glossary)}><HelpCircle size={14} /> ¿Qué significa cada estado?</button></div>
            {glossary && <dl className="tf-glossary tf-glossary-inline">{GLOSSARY.map(([k, v]) => <div key={k}><dt><Badge status={k} /></dt><dd>{v}</dd></div>)}</dl>}
            <div className="tf-toolbar"><div className="tf-filters" aria-label="Filtrar obligaciones">{FILTERS.map(([f, label]) => <button key={f} aria-pressed={filter === f} className={filter === f ? 'selected' : ''} onClick={() => setFilter(f)}>{label}</button>)}</div>
              <label className="tf-sort">Ordenar por <select value={sort} onChange={e => setSort(e.target.value)}>{Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label></div>
            {filter !== 'Pagado' && rows.length > 0 && <div className="tf-quick"><button className="tf-chip" onClick={() => setSelected(s => [...new Set([...s, ...pending.filter(d => d.status === 'Vencido').map(d => d.id)])])} disabled={!summary.lateCount}>+ Seleccionar vencidos</button><button className="tf-chip" onClick={() => setSelected(rows.filter(d => d.status !== 'Pagado').map(d => d.id))}>Seleccionar todo lo visible</button>{selected.length > 0 && <button className="tf-chip tf-chip-ghost" onClick={() => setSelected([])}>Limpiar selección</button>}</div>}
            <div className="tf-grid" role="table" aria-label="Obligaciones">
              <div className="tf-grid-head" role="row"><span role="columnheader" /><span role="columnheader">Concepto</span><span role="columnheader">Vencimiento</span><span role="columnheader">Situación</span><span role="columnheader" className="tf-right">Importe</span></div>
              {rows.map(d => { const i = d.info; const paid = d.status === 'Pagado'; return <label role="row" key={d.id} className={`tf-grid-row tf-row-${i.state.toLowerCase().replace(' ', '-')} ${selected.includes(d.id) ? 'checked' : ''} ${paid ? 'paid' : ''}`}>
                <span role="cell"><input type="checkbox" checked={selected.includes(d.id)} disabled={paid} onChange={() => toggle(d.id)} aria-label={`Seleccionar ${d.name}, ${d.period}`} /></span>
                <span role="cell" className="tf-cell-name"><strong>{d.name}</strong><small>{d.period}</small><Badge status={i.state} /></span>
                <span role="cell" className="tf-cell-date"><strong>{formatDate(d.due)}</strong></span>
                <span role="cell"><Situation d={d} />{!paid && i.state !== 'Vencido' && <button type="button" className={`tf-remind ${reminders.includes(d.id) ? 'on' : ''}`} onClick={e => { e.preventDefault(); toggleReminder(d.id); }} aria-pressed={reminders.includes(d.id)}>{reminders.includes(d.id) ? <><BellRing size={12} /> Te avisaremos</> : <><Bell size={12} /> Recordarme</>}</button>}</span>
                <span role="cell" className="tf-right tf-cell-amount"><strong>{money(i.payable)}</strong>{i.estimatedFee > 0 && <small className={i.waived ? 'tf-fee-waived' : 'tf-fee'}>Mora est. {money(i.estimatedFee)}{i.waived ? ' · condonada' : ''}</small>}</span>
              </label>; })}
              {rows.length === 0 && <div className="tf-empty"><CheckCircle2 size={28} /><h3>{filter === 'Vencido' ? '¡No tienes obligaciones vencidas!' : filter === 'Por vencer' ? 'Nada vence en los próximos 30 días.' : 'No hay obligaciones en este estado.'}</h3><button className="tf-link" onClick={() => setFilter('Todos')}>Ver todo lo que tengo por pagar</button></div>}
            </div>
            {filter === 'Todos' && paidRows.length > 0 && <details className="tf-history"><summary><History size={15} /> Historial de pagos ({paidRows.length}) · {money(summary.paid)}</summary>{paidRows.map(d => <div key={d.id}><span>{d.name}<small>{d.period} · venció {formatDate(d.due)}</small></span><span className="tf-right"><strong>{money(d.amount + d.interest)}</strong><Badge status="Pagado" /></span></div>)}</details>}
          </section>

          <div className="tf-side">
            <aside className="tf-panel tf-planner"><div className="tf-planner-head"><span className="tf-icon-soft"><PiggyBank size={20} /></span><div><h2>Planifica tu pago</h2><p>¿No puedes pagar todo? Dinos cuánto tienes y te sugerimos qué priorizar.</p></div></div>
              <form onSubmit={suggest} className="tf-planner-form"><label htmlFor="budget">Mi presupuesto hoy (S/)</label><div><input id="budget" inputMode="decimal" placeholder="Ej. 500" value={budget} onChange={e => { setBudget(e.target.value.replace(/[^\d.]/g, '')); setPlan(null); }} /><button className="tf-button tf-secondary tf-small" type="submit" disabled={!budget}>Sugerir</button></div></form>
              {plan && (plan.ids.length ? <div className="tf-plan-result" aria-live="polite"><Sparkles size={15} /><div><strong>Paga primero: {plan.ids.map(id => debts.find(d => d.id === id)!.name + ' ' + debts.find(d => d.id === id)!.period.replace('Anual ', '')).join(' + ')}</strong><span>Total {money(plan.total)} · te sobran {money(plan.left)}{plan.skipped.length ? `. Lo demás puede esperar a tu próximo pago.` : ''}</span><button className="tf-link" onClick={() => setSelected(plan.ids)}>Aplicar sugerencia <ArrowRight size={13} /></button></div></div>
                : <p className="tf-plan-result tf-plan-none" aria-live="polite">Con ese monto aún no alcanza para ninguna obligación completa. La menor es de {money(Math.min(...pending.map(d => d.amount + d.interest)))}.</p>)}
              {pending.length > 0 && <div className="tf-timeline"><span className="tf-caption">CALENDARIO DE VENCIMIENTOS</span>{gridDebts(debts, 'Todos', 'fecha').map(d => <div key={d.id} className={`tf-tl-${d.info.state.toLowerCase().replace(' ', '-')}`}><i /><span>{formatDate(d.due)}<small>{d.name} · {d.period}</small></span><strong>{money(d.info.payable)}</strong></div>)}</div>}
            </aside>
            <aside className="tf-panel tf-selection"><span className="tf-icon-soft"><Wallet size={22} /></span><h2>Tu selección</h2><p>Marca las obligaciones que quieres pagar ahora. Puedes pagar por partes.</p><div className="tf-selection-items">{chosen.length ? chosen.map(d => <div key={d.id}><span>{d.name}<small>{d.period} · vence {formatDate(d.due)}</small></span><strong>{money(d.amount + d.interest)}</strong></div>) : <p className="tf-selection-empty">Aún no has seleccionado obligaciones.</p>}</div><div className="tf-selection-total" aria-live="polite" aria-atomic="true"><span>Total a pagar</span><strong>{money(total)}</strong><small>{chosen.length} {chosen.length === 1 ? 'obligación' : 'obligaciones'} · quedarían {money(summary.pending - total)} por pagar</small></div><button className="tf-button tf-primary" disabled={!chosen.length} onClick={() => go('review')}>Continuar al pago · {money(total)} <ArrowRight size={17} /></button><p className="tf-safe-note"><ShieldCheck size={14} /> Modo demostración: no se realiza ningún cobro</p></aside>
          </div></div>
          {chosen.length > 0 && <div className="tf-sticky-pay"><div><small>{chosen.length} seleccionada{chosen.length > 1 ? 's' : ''}</small><strong>{money(total)}</strong></div><button className="tf-button tf-primary" onClick={() => go('review')}>Continuar al pago <ArrowRight size={16} /></button></div>}
        </>}
      </>}
      {screen === 'review' && <><div className="tf-title-row"><div><div className="tf-eyebrow">PASO 2 · PAGO</div><h1 ref={title} tabIndex={-1}>Revisa y paga.</h1><p>Confirma los conceptos, el importe y elige cómo pagar.</p></div></div><div className="tf-review-layout"><section className="tf-panel tf-review"><h2>Resumen de tu pago</h2><p className="tf-review-person">Carlos Ramírez · Miraflores</p>{chosen.map(d => <div className="tf-review-item" key={d.id}><div><strong>{d.name}</strong><small>{d.period} · vence {formatDate(d.due)} · <Situation d={d} /></small></div><strong>{money(d.amount)}</strong></div>)}<dl className="tf-breakdown"><div><dt>Monto base</dt><dd>{money(chosen.reduce((s, d) => s + d.amount, 0))}</dd></div>{chosenFees > 0 && <div><dt>Mora estimada</dt><dd>{money(chosenFees)}</dd></div>}{chosenWaived > 0 && <div className="tf-discount"><dt>Descuento {CAMPAIGN.name}</dt><dd>− {money(chosenWaived)}</dd></div>}<div className="tf-breakdown-total"><dt>Total a pagar</dt><dd>{money(total)}</dd></div></dl><dl className="tf-breakdown tf-after"><div><dt>Saldo después de este pago</dt><dd>{money(summary.pending - total)}</dd></div></dl><p className="tf-info-note">Mora calculada con una tasa referencial ficticia (0.9% mensual). En la versión final se usará la tasa oficial de la municipalidad.</p><button className="tf-link" onClick={() => go('debts')}><ArrowLeft size={15} /> Modificar selección</button></section><section className="tf-panel tf-method"><fieldset><legend>Medio de pago</legend><p>En esta demo no pediremos datos de tarjeta ni de billetera.</p>{[['Tarjeta', '💳', 'Visa / Mastercard'], ['Yape', '📱', 'Billetera digital'], ['Plin', '📲', 'Billetera digital']].map(([name, emoji, desc]) => <label key={name} className={`tf-method-option ${method === name ? 'checked' : ''}`}><input type="radio" name="method" value={name} checked={method === name} onChange={() => setMethod(name)} /><span aria-hidden="true">{emoji}</span><div><strong>{name}</strong><small>{desc}</small></div>{method === name && <CheckCircle2 size={18} />}</label>)}</fieldset>{error && <p role="alert" className="tf-error">{error}</p>}<button className="tf-button tf-primary tf-pay" disabled={!method || !chosen.length} onClick={pay}>Pagar {money(total)} <ArrowRight size={16} /></button><p className="tf-safe-note">{method ? <><ShieldCheck size={14} /> Pagarás con {method}. Modo demostración: no se realiza un cobro real.</> : 'Elige un medio de pago para continuar.'}</p></section></div></>}
      {screen === 'success' && receipt && <div className="tf-success-layout"><section className="tf-panel tf-success"><div className="tf-success-icon"><CheckCircle2 size={36} /></div><div className="tf-eyebrow">PAGO REGISTRADO · DEMOSTRACIÓN</div><h1 ref={title} tabIndex={-1}>¡Pago realizado!</h1><p>Tu cuenta ya refleja este pago.</p><div className="tf-receipt-total">{money(receipt.total)}<span>Pagado con {receipt.method}</span></div><div className="tf-receipt-meta"><span>N.º de operación<strong>{receipt.reference}</strong></span><span>Fecha<strong>{receipt.date}</strong></span></div><div className="tf-receipt-items">{receipt.items.map(d => <div key={d.id}><span>{d.name}<small>{d.period}</small></span><CheckCircle2 size={18} /></div>)}</div><p className="tf-info-note">Demostración: no se realizó ningún cobro y esta constancia no tiene validez tributaria.</p><button className="tf-button tf-primary" onClick={download}><Download size={17} /> Descargar constancia</button><span className="tf-download-note" role="status">{downloaded ? 'Constancia descargada. Puedes abrirla e imprimirla.' : 'Archivo para guardar, abrir o imprimir.'}</span></section><aside className="tf-next-card"><span className="tf-icon-soft"><Wallet size={23} /></span><h2>{summary.lateCount ? 'Aún tienes deudas vencidas.' : 'Estás al día con lo vencido.'}</h2><p>{next ? <>Tu próximo vencimiento: <b>{next.name} · {next.period}</b>, el {formatDate(next.due)} (en {debtInsight(next).daysLeft} días).</> : 'No te quedan obligaciones pendientes.'}</p><span className="tf-caption">SALDO PENDIENTE</span><strong className="tf-next-amount">{money(summary.pending)}</strong>{next && <button className={`tf-remind tf-remind-big ${reminders.includes(next.id) ? 'on' : ''}`} onClick={() => toggleReminder(next.id)} aria-pressed={reminders.includes(next.id)}>{reminders.includes(next.id) ? <><BellRing size={14} /> Recordatorio activado (7 días antes)</> : <><Bell size={14} /> Recordarme antes del vencimiento</>}</button>}<button className="tf-button tf-secondary" onClick={() => { setFilter('Todos'); setMethod(''); go('debts'); }}>Ver mi cuenta actualizada <ArrowRight size={17} /></button><small>Los cambios son locales y se borran al recargar o reiniciar la demostración.</small></aside></div>}
    </main>}
    <footer className="tf-footer tf-wrap"><span>TributaFácil <span>·</span> Tu tiempo también cuenta.</span><span>Prototipo académico · Grupo 4</span></footer>
    <dialog ref={resetDialog} className="tf-reset-dialog" aria-labelledby="reset-title"><div className="tf-icon-soft"><RotateCcw size={24} /></div><h2 id="reset-title">¿Empezamos de nuevo?</h2><p>Se restablecerán las deudas y se borrarán la selección y la constancia de esta sesión.</p><div><button className="tf-button tf-secondary" onClick={() => resetDialog.current?.close()}>Conservar sesión</button><button className="tf-button tf-primary" onClick={reset}>Reiniciar demo</button></div></dialog>
  </div>;
}

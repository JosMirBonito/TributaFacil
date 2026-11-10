import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { initialDebts, debtInsight, gridDebts, accountSummary, planBudget, confirmPayment, daysBetween } from '../src/app/demo.mjs';

describe('Feedback del testeo (profesor)', () => {
  it('muestra días de atraso del predial (vence 15/10, caso 29/10 → 14 días)', () => {
    const p = initialDebts().find(d => d.id === 'predial');
    const i = debtInsight(p);
    assert.equal(i.state, 'Vencido'); assert.equal(i.daysLate, 14);
    assert.ok(i.estimatedFee > 0, 'debe estimar mora'); assert.equal(i.waived, i.estimatedFee, 'la campaña condona la mora');
    assert.equal(i.payable, 420, 'el importe a pagar se mantiene en la especificación');
  });
  it('identifica lo que está por vencer (arbitrios de noviembre en 17 días)', () => {
    const a = debtInsight(initialDebts().find(d => d.id === 'arbitrios-1'));
    assert.equal(a.state, 'Por vencer'); assert.equal(a.daysLeft, 17);
    assert.equal(debtInsight(initialDebts().find(d => d.id === 'arbitrios-2')).state, 'Pendiente');
  });
  it('el resumen separa vencido, por vencer y pagado, con los totales de la especificación', () => {
    const s = accountSummary(initialDebts());
    assert.equal(s.pending, 847.5); assert.equal(s.late, 420); assert.equal(s.soon, 187.5); assert.equal(s.paid, 350);
    assert.equal(s.maxDaysLate, 14); assert.equal(s.nextDue.id, 'arbitrios-1');
  });
  it('"Todos" ordena por urgencia y excluye pagados (que van al historial)', () => {
    assert.deepEqual(gridDebts(initialDebts()).map(d => d.id), ['predial', 'arbitrios-1', 'arbitrios-2']);
    assert.deepEqual(gridDebts(initialDebts(), 'Todos', 'montoDesc').map(d => d.id), ['predial', 'arbitrios-2', 'arbitrios-1']);
    assert.deepEqual(gridDebts(initialDebts(), 'Por vencer').map(d => d.id), ['arbitrios-1']);
    assert.deepEqual(gridDebts(initialDebts(), 'Pagado').map(d => d.id), ['licencia']);
  });
  it('planificador: con S/ 500 sugiere pagar primero lo vencido', () => {
    const p = planBudget(initialDebts(), 500);
    assert.deepEqual(p.ids, ['predial']); assert.equal(p.total, 420); assert.equal(p.left, 80);
    assert.deepEqual(planBudget(initialDebts(), 700).ids, ['predial', 'arbitrios-1']);
    assert.deepEqual(planBudget(initialDebts(), -5).ids, []);
  });
  it('tras pagar el predial ya no hay vencidos y el saldo es 427.50', () => {
    const r = confirmPayment(initialDebts(), ['predial'], 'Yape');
    const s = accountSummary(r.debts);
    assert.equal(s.lateCount, 0); assert.equal(s.pending, 427.5);
    assert.equal(daysBetween('2026-10-29', '2026-10-15'), -14);
  });
});

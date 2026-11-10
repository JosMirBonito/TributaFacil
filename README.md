# TributaFácil

Aplicación React + TypeScript con Vite y Tailwind CSS.

## Ejecutar localmente

Requiere Node.js 22 o superior. En una terminal dentro de esta carpeta:

```powershell
npm.cmd ci
npm.cmd start
```

Se abrirá http://127.0.0.1:5173 (o el puerto disponible indicado en consola).
Mantén la terminal abierta. Para detener: Ctrl+C.
En siguientes ocasiones solo necesitas `npm.cmd start`.

## Netlify

Ejecuta `npm.cmd run build` y sube la carpeta `dist` a Netlify.
Para despliegues desde un repositorio, netlify.toml configura el comando
`npm run build`, el directorio público `dist` y Node.js 22.
La aplicación está en la raíz del repositorio; no necesitas configurar
un directorio base en Netlify.
Para revisar la compilación local: `npm.cmd run preview`.

## Alcance

Demostración con datos de ejemplo: no consulta deudas reales, procesa pagos
ni envía notificaciones. No hay backend, autenticación ni persistencia.
La instalación y Google Fonts requieren Internet; las fuentes tienen
respaldo del sistema.

## Caso para la presentación

- Carlos Ramírez, 38 años. DNI ficticio: `00000001`.
- Municipalidad de Miraflores. También puedes pulsar **Usar datos de prueba**.
- Fecha fija del caso: 29/10/2026; no depende del reloj del equipo.
- Por pagar: S/847.50 · vencido: S/420.00 (14 días de atraso) · por vencer: S/187.50 · ya pagado: S/350.00.
- Pagar solo el predial deja S/427.50 pendientes.
- La constancia es HTML descargable e imprimible, sin validez tributaria.
- La selección se conserva al navegar; recargar o reiniciar restaura la sesión.
- **Reiniciar demo** pide confirmación antes de restablecer el caso.
- Las pantallas originales se conservan en src/app/components como referencia;
  la demostración se concentra en el recorrido del contribuyente.

## Versión 2 · cambios tras el testeo en clase (10/11/2026)

El profesor probó el prototipo como usuario. Cada comentario se convirtió en un cambio:

| Feedback | Cambio implementado |
| --- | --- |
| La fecha de vencimiento estaba escondida bajo el concepto | Grilla con columnas Concepto · Vencimiento · Situación · Importe; días de atraso o días restantes en cada fila |
| Clic en «Vencido» del resumen no hacía nada | Tarjetas clicables (Por pagar, Vencido, Por vencer, Ya pagado) que filtran la grilla |
| No se veía lo que está por vencer | Estado «Por vencer» (≤30 días), filtro, tarjeta y botón «Recordarme» |
| No se veía la mora ni campañas | Mora estimada por deuda (tasa ficticia 0.9 % mensual) y aviso de campaña «Ponte al día» que la condona |
| Quería ordenar y planificar según su dinero | Orden por urgencia, fecha o monto; panel «Planifica tu pago» por presupuesto y calendario de vencimientos |
| «¿Revisar o pagar?» y «Simulación» confundían | Botones «Continuar al pago · S/ X» y «Pagar S/ X», con nota de modo demostración |
| «Ya pagado» se mezclaba con las deudas | Historial de pagos separado |

Extras: alertas de vencidos / «estás al día», glosario de estados, selección rápida,
desglose base + mora − descuento, saldo después del pago, próximo vencimiento en la
constancia y barra de pago fija en móvil.

La lógica nueva está en `src/app/demo.mjs` (`debtInsight`, `gridDebts`,
`accountSummary`, `planBudget`) y se prueba en `tests/feedback-profesor.test.mjs`.

## Verificar

```powershell
npm.cmd test        # 58 pruebas
npm.cmd run build
```

## Presentación en clase

- [PPT versión 2 (16 diapositivas, con feedback y cambios)](docs/TributaFacil-presentacion-v2.pptx)
- [PPT original (14 diapositivas)](docs/TributaFacil-presentacion-en-vivo.pptx)
- [Guía del presentador y tabla de observación](docs/GUIA_PRESENTADOR.md)
- [Revisión previa del agente](docs/AUDITORIA_DEMO.md)
- [Vista previa de la web](docs/TributaFacil-web.png)

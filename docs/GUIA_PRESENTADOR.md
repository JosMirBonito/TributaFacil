# Guía del presentador — TributaFácil

## Antes de entrar a clase

1. Abre iniciar-local.bat dentro de Design TributaFácil Web App. Mantén la consola abierta.
2. Abre http://localhost:5173. Si se necesita instalar dependencias, hazlo antes de clase.
3. Abre TributaFacil-presentacion-v2.pptx. Tiene 16 diapositivas y notas para exponer (la 15 resume el feedback y los cambios; la 16, lo que validaremos).
4. Reinicia la demo antes del participante. Usa datos ficticios: DNI 00000001, Miraflores.
5. Designa moderador, observador y compañero participante. Ten una hoja para anotar.

## Orden recomendado (ajustar al tiempo asignado)

- 2–3 minutos: problema, persona, hipótesis, alcance e historias (diapositivas 1–7).
- 1 minuto: flujo, criterios y revisión del agente (8–11). No entrenar al participante con la ruta de clics. Si ya vio la demostración, declarar esa exposición previa.
- 3 minutos: prueba de la diapositiva 12. Cambia al navegador y entrega el control al compañero.
- 2 minutos: evidencia del testeo del profesor, cambios de la versión 2 y próximos pasos (13–16). Mostrar en el navegador cada cambio de la diapositiva 15.

## Consigna literal

“Revisa las obligaciones de este contribuyente ficticio, decide qué pagarías primero según el dinero que tienes y completa el pago. Cuéntanos lo que vas pensando”.

No decirle que toque las tarjetas, use el planificador, elija el predial o pulse un botón específico. No presentarle antes el resultado esperado de S/420. El usuario puede elegir otra deuda: registrar su decisión y su razón.

Antes de confirmar: “¿Qué estás por pagar y cuánto quedaría pendiente?”. Anotar su respuesta, sin corregirla inmediatamente. Si pide ayuda, registrarla y dar solo la necesaria para continuar.

## Comprobación técnica interna (no leer como consigna)

El caso inicia con S/847.50 pendientes: predial420, arbitrios187.50 y240. La licencia350 ya está pagada (aparece en «Historial de pagos»). El predial lleva 14 días de atraso; su mora estimada (S/1.76, tasa ficticia) está condonada por la campaña de ejemplo, por eso sigue costando 420. Los arbitrios de noviembre figuran como «Por vencer» (17 días). Con presupuesto S/500 el planificador sugiere el predial y sobran S/80. Si selecciona solo predial, revisión y constancia deben indicar420 y quedar427.50 pendientes. Si elige otra combinación, la aplicación calcula el saldo correspondiente. Ningún resultado del usuario debe fingirse.

## Hoja de observación

Participante: P1. Experiencia previa con el prototipo: ______. Hora: ______.

| Momento | Acción o frase textual | Ayuda / duda | Resultado |
| --- | --- | --- | --- |
| Consulta e identificación | | | |
| Selección y revisión | | | |
| Confirmación y saldo | | | |

¿Completó sin ayuda? ____.
¿Explicó correctamente selección, importe y saldo? ____.
Observación (hecho): ____.
Interpretación (del equipo): ____.
Mejora concreta: ____.
Qué comprobaríamos al repetir: ____.

## Cierre

“Observamos [acción o frase]. Esto sugiere [interpretación limitada]. Cambiaremos [mejora concreta] y repetiremos la tarea”.

Un caso observado en aula no prueba que todos los contribuyentes se comporten así. La revisión del agente tampoco reemplaza la prueba con personas. Las diapositivas 13 y 14 se completan con lo que ocurra.

## Qué cambió tras el testeo del profesor (10/11)

| Comentario | Dónde se ve ahora |
| --- | --- |
| La fecha de vencimiento estaba abajo | Columna «Vencimiento» y «Situación» (días de atraso / faltan N días) en cada fila |
| Clic en «Vencido» no hacía nada | Las 4 tarjetas del resumen filtran la grilla |
| Ver lo que está por vencer | Estado, filtro y tarjeta «Por vencer (30 días)»; botón «Recordarme» |
| Mora y campañas | «Mora est. … · condonada» en la fila y aviso de campaña arriba |
| Ordenar y planificar según presupuesto | Selector «Ordenar por» y panel «Planifica tu pago» con calendario |
| «¿Revisar o pagar?» / «Simulación» | Botones «Continuar al pago · S/ X» y «Pagar S/ X» (con nota de modo demo) |
| «Ya pagado» se mezclaba | «Historial de pagos» plegable |

Si preguntan por la mora: es una estimación con tasa ficticia de 0.9% mensual; en la versión final se usaría la tasa oficial.

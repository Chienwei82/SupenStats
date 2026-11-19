# Project Brief — SUPEN Stats

## Qué es

SUPEN Stats es un dashboard web educativo que visualiza estadísticas públicas
del sistema de pensiones de Costa Rica, consumiendo la API de la Superintendencia
de Pensiones (SUPEN).

## Por qué existe

Los datos de SUPEN se publican en formatos técnicos y dispersos. El proyecto los
convierte en gráficos claros, contextualizados y accesibles para que cualquier
persona pueda entender cómo funciona el sistema de pensiones y tomar mejores
decisiones.

## Alcance

- SPA con 17 reportes: rendimiento nominal/real, comisiones, portafolio, ISIN,
  afiliados, aportantes, activos, cuentas, beneficios, transferencias, traslados,
  demografía, pirámide y simulador de pensión.
- Filtros por fondo y rango de fechas; selectores de vista en la URL.
- Notas educativas por gráfico y simulador de proyección.
- Tema claro/oscuro, diseño responsive y accesibilidad WCAG.

## No es

- No es un sitio oficial de SUPEN ni está afiliado a entes gubernamentales.
- No es asesoría financiera ni de inversión.
- No inventa datos: los valores ausentes se muestran como "no disponible".

## Objetivos de producto

1. Visualización correcta y honesta de los datos publicados.
2. Aprendizaje: que el usuario entienda qué ve y por qué importa.
3. Interacción: explorar, filtrar, comparar y compartir vistas.
4. Rendimiento: arranque rápido y navegación fluida.
5. Accesibilidad: usable con teclado, lector de pantalla y reduced motion.

## Criterios de éxito

- Datos consistentes con la fuente y sin ceros inventados.
- Cada reporte con explicación y fuente.
- URLs compartibles que reproducen la vista.
- `npm run verify` en verde y build reproducible.
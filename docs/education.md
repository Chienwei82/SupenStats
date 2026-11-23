# Sistema educativo

Documentación de las herramientas de educación financiera en `src/components/education/`.

## Quiz educativo

Componente interactivo con preguntas de selección múltiple sobre pensiones.

**Ubicación:** `src/components/education/Quiz.tsx`

**Flujo:**
1. El usuario responde preguntas seleccionando opciones de radio
2. Al enviar, se evalúa con `evaluateQuiz` de `src/constants/quiz.ts`
3. Se muestra el resultado con puntuación y explicaciones por pregunta
4. Al obtener 100%, se activa animación de confetti
5. La actividad se registra para insignias (`completeQuiz`)

**Características de accesibilidad:**
- Radios nativos con `fieldset`/`legend`
- `aria-live="polite"` en el resultado
- Navegación por teclado completa
- Botón deshabilitado hasta responder todas las preguntas

## Glosario

Glosario de términos clave del sistema de pensiones de Costa Rica.

**Ubicación:** `src/components/education/GlossaryView.tsx`

**Modos:**
| Modo | Descripción |
|------|-------------|
| Normal | Lista de términos con buscador y tarjetas expandidas |
| Estudio 🃏 | Tarjetas volteables tipo flashcard con navegación anterior/siguiente |

**Características:**
- Buscador sin distinción de acentos
- Enlaces cruzados a términos relacionados
- Progreso visual en modo estudio (tarjeta X de Y)
- Registro de actividad para insignias (`visitGlossary`, `studyFlashcard`)

## Simulador de pensión

Herramienta para proyectar el ahorro de pensión basado en datos reales de rentabilidad.

**Ubicación:** `src/components/Simulador.tsx`

**Entradas del usuario:**
- Saldo inicial (₡)
- Aporte mensual (₡)
- Edad actual (18-99)
- Edad de retiro (mayor a edad actual, máximo 99)

**Salidas:**
- Monto final proyectado
- Poder adquisitivo ajustado por inflación (si hay datos del BCCR)
- Gráfico de curva de saldo por edad

**Interactividad:**
- Sliders con entrada numérica paralela
- Métrica nominal/real compartible en URL
- Registro de uso de sliders para insignias (`recordSliderUse`)

## Mini-juego "Adivina la tendencia"

Juego educativo donde el usuario predice si la rentabilidad de una operadora subió o bajó entre dos cortes.

**Ubicación:** `src/components/education/AdivinaTendencia.tsx`

**Flujo:**
1. Se muestran dos cortes de rentabilidad de una operadora
2. El usuario selecciona "Subió" o "Bajó"
3. Feedback inmediato con colores (verde/rojo)
4. Registro de aciertos para insignias (`recordTrendGuess`)

**Integración:** Se muestra en `/aprender` tras el quiz.

## Rutas de aprendizaje

Página `/aprender` que organiza los recursos educativos en una secuencia guiada.

**Ubicación:** `src/routes/aprender.tsx`

Incluye:
- Quiz educativo
- Mini-juego "Adivina la tendencia"
- Enlaces al glosario y metodología

## Metodología

Documentación transparente sobre el origen de los datos, transformaciones aplicadas y limitaciones conocidas.

**Ubicación:** `src/routes/metodologia.tsx` y `src/components/education/MethodologyView.tsx`

**Principios:**
- Datos de la API pública de SUPEN
- Nunca convertir `null` en `0`
- Documentar limitaciones de cada reporte
- Enlaces a la fuente oficial


# ADR 0032 — MC-FOTOS-MVP-3: entrega de imagen diferida al profesional

**Estado:** Aceptado  
**Fecha:** 2026-06-11  
**Microciclo:** MC-FOTOS-MVP-3

## Contexto

El panel profesional (`apps/pulso-nutricional-web`) ahora muestra las fotos de comidas del
paciente — su metadata — y permite al profesional revisarlas/comentarlas (MC-FOTOS-MVP-3).

Sin embargo, mostrar el **binario real de la imagen** requiere un endpoint firmado
o un proxy seguro que:

1. Verifique que el profesional tiene autorización sobre ese paciente.
2. Genere una URL firmada S3-compatible con TTL corto (p. ej. 15 min).
3. O sirva el binario directamente vía streaming desde el backend.

Nada de esto está implementado en este microciclo.

## Decisión

En MC-FOTOS-MVP-3, el panel profesional muestra un **placeholder visual elegante**
(SVG/CSS, con emoji del tipo de comida) en lugar de la imagen real. La metadata
(`mealType`, `patientComment`, `reviewStatus`, `createdAt`, `professionalComment`)
sí se muestra completa.

La `storageKey` se expone únicamente como **metadata interna discreta** (chip
monoespaciado pequeño, no como URL navegable). No se construye ninguna URL pública
permanente a partir de la `storageKey`.

## Consecuencias

- El ciclo demo queda cerrado: paciente sube foto → nutricionista ve registro
  visual/placeholder + metadata → nutricionista revisa/comenta.
- La imagen real no se entrega hasta **MC-FOTOS-MVP-4**, donde se implementará
  el endpoint firmado o proxy de imagen.
- Mantiene el invariante de seguridad: `storageKey` nunca se convierte en URL pública.
- No requiere cambios en el backend de almacenamiento (`LocalFallbackStorage` /
  `S3MealPhotoStorage`) para este microciclo.

## Alternativas descartadas

- **URL pública permanente generada en cliente:** descartada — viola la política
  de no exponer `storageKey` como URL pública.
- **Endpoint `/patients/:id/meal-photos/:photoId/image`:** correcto a largo plazo,
  pero fuera del alcance de MC-FOTOS-MVP-3 (requiere firmado S3 o streaming seguro).
- **Data URL base64 inline:** descartada — `LocalFallbackStorage` descarta el
  binario con advertencia; no hay binario disponible en demo.

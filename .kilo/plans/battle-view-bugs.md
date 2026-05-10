# BattleScreenView Bugs - Refactorización Necesaria

## Bugs Críticos Identificados

### Bug #1: `addDamageNumber` callback - stale closure

**Ubicación:** Líneas 154-218
**Problema:** La dependencia `hitSequence` se usa para calcular `recentHits`, pero el callback actualiza `hitSequence` dentro del mismo callback. Esto causa que `hitSequence.filter` siempre use la versión anterior del array.

```typescript
const recentHits = hitSequence.filter(h => now - h.time < 500); // Siempre usa versión anterior
```

**Impacto:** Los combos y chains no se calculan correctamente, afectando la UI de feedback.

### Bug #2: `runTurn` no es useCallback

**Ubicación:** Líneas 220-243
**Problema:** `runTurn` es una función regular que se recrea en cada render. El useEffect principal (líneas 290-417) la usa pero no la declara como dependencia.
**Impacto:** El useEffect puede usar una versión desactualizada de `runTurn`, causando bugs en el flujo de combate.

### Bug #3: `handleBurst` no es useCallback

**Ubicación:** Líneas 245-268
**Problema:** Similar a `runTurn`, esta función se recrea en cada render y usa `currentActor` que aún no existe cuando se llama.
**Impacto:** El burst puede no ejecutarse correctamente o usar datos desactualizados.

### Bug #4: `handleBattleOver` no es useCallback

**Ubicación:** Líneas 270-288
**Problema:** No es useCallback, causando recreación en cada render.
**Impacto:** El resultado de batalla puede no guardarse correctamente.

### Bug #5: useEffect principal - dependencias y orden incorrectos

**Ubicación:** Líneas 290-417
**Problemas:**

1. `enemyUnits` se usa en la línea 391 pero se define en la línea 410 (fuera del useEffect)
2. `runTurn` y `handleBattleOver` no están en las dependencias
3. `currentActor` se define después del useEffect
   **Impacto:** Errores de scope, renders infinitos potenciales, comportamiento impredecible.

### Bug #6: Tipo `completionData` como `any`

**Ubicación:** Línea 76
**Problema:** `useState<any>` sin tipo específico.
**Impacto:** Pérdida de type safety.

## Refactorización Recomendada

1. Convertir `runTurn`, `handleBurst`, `handleBattleOver` a `useCallback` con dependencias correctas
2. Mover `playerUnits` y `enemyUnits` a `useMemo` antes del useEffect
3. Corregir `addDamageNumber` para usar el estado actualizado de `hitSequence`
4. Agregar tipos correctos para `completionData`
5. Reordenar el código para que las variables derivadas estén disponibles antes del useEffect

## Archivo afectado

- `components/views/BattleScreenView.tsx` (1188 líneas)

## Prioridad: Alta

Estos bugs afectan la jugabilidad y pueden causar comportamientos impredecibles en combate.

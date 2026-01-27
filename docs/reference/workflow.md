---
title: Execution Guardrails & PPRE Checklist
---

# Workflow Guardrails

Use this checklist before and after cada ejecución de story:

1) PRIME: carga solo el story activo en `docs/specs/stories.json`.
2) PLAN: escribe el plan y pide aprobación explícita.
3) RESET: declara el RESET antes de tocar código (limpiar contexto).
4) EXECUTE: modifica solo archivos del story, sin agregar alcance.
5) VERIFY: corre la validación declarada (build/tests) y compara con acceptance_criteria.
6) COMMIT: si todo pasa, marca el story, registra en `logs/progress.txt`, y solo entonces conversa sobre commit/push.

# Si ocurre un fallo de proceso

- Documenta aquí el problema y la corrección aplicada.
- Refuerza el guardrail relevante en `.cursor/rules/global.mdc`.

# Alcance del workspace

- Todas las operaciones deben limitarse al proyecto: `C:\Users\carlo\OneDrive\Documents\Delivery Manager Reporter`.
- No explorar ni modificar carpetas externas (ej. Downloads) salvo petición explícita del usuario.

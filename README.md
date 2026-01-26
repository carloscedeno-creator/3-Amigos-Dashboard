# 🏗️ Delivery Manager Reporter - Strata Dev Framework

Este proyecto utiliza el **AgenticStrataFramework** para desarrollo guiado por especificaciones y ejecución atómica.

## 📚 Framework Documentation

La documentación completa del framework se encuentra en `.AgenticStrataFramework/`:

- **[Core Technical Specification](.AgenticStrataFramework/Core%20Technical%20Specification%2061087d4cd5cd48d2a9a58048d24689d7.md)** - Especificación técnica completa
- **[Quick Start Guide](.AgenticStrataFramework/⚡%20Quick%20Start%20Guide%20(5-Minute%20Guide)%20c2a8f3367ca1495f99da14cf3cfc9baf.md)** - Guía de inicio rápido
- **[Example Repository](.AgenticStrataFramework/📦%20Example%20Repository%2099c1377933a84fbe95aea3cf4b727479.md)** - Ejemplos de implementación

## 🚀 Estructura del Proyecto

```
.
├── .cursor/
│   └── rules/
│       └── global.mdc       # La Constitución: Reglas globales
├── docs/
│   ├── specs/               # Capa de entrada
│   │   ├── prd.md          # Fuente de verdad (Lógica de negocio)
│   │   └── stories.json    # Átomos ejecutables con criterios binarios
│   ├── reference/          # Fragmentación de contexto (Cargado bajo demanda)
│   │   ├── api_guidelines.md
│   │   ├── db_schema.md
│   │   └── ui_patterns.md
│   └── done_specs/         # ARCHIVO: stories.json completados
├── logs/
│   └── progress.txt        # Memoria a corto plazo: Logs del ciclo PPRE activo
├── scripts/
│   └── sdd/
│       └── autopilot.sh    # El Motor: Automatiza el ciclo Plan → Reset → Execute
└── src/
    ├── components/
    │   └── agents.md       # Memoria a largo plazo: Conocimiento tácito
    └── api/
        └── agents.md       # Memoria a largo plazo: Conocimiento tácito
```

## 🔄 El Ciclo PPRE

El framework sigue un ciclo estricto de desarrollo:

1. **PRIME** 🧠 - Cargar solo la historia actual y archivos relevantes
2. **PLAN** 📝 - Generar un plan de implementación específico
3. **RESET** 🛑 - Limpiar el contexto (CRÍTICO: previene "Context Rot")
4. **EXECUTE** 🚀 - Ejecutar el plan siguiendo los criterios binarios
5. **VERIFY** ✅ - Verificar contra los criterios de aceptación
6. **COMMIT** 💾 - Marcar como completado y hacer commit

## 📋 Cómo Usar el Framework

### 1. Verificar el Contrato

Abre `docs/specs/stories.json` y encuentra la primera historia donde `"passes": false`.

### 2. Ejecutar Autopilot (Opcional)

Si tienes `jq` instalado y estás en Linux/Mac/WSL:

```bash
chmod +x scripts/sdd/autopilot.sh
./scripts/sdd/autopilot.sh
```

### 3. Ejecución Manual

Sigue el ciclo PPRE manualmente:

- **PRIME:** Arrastra `stories.json` + `global.mdc` al Chat
- **PLAN:** Solicita un plan de implementación
- **RESET:** Presiona `Cmd+K` (o `/clear`) para limpiar el contexto
- **EXECUTE:** Pega el plan aprobado y ejecuta

## 🧠 Sistema de Memoria

- **Memoria a Corto Plazo:** `logs/progress.txt` - Continuidad entre ciclos PPRE
- **Memoria a Largo Plazo:** `src/**/agents.md` - Conocimiento tácito y lecciones aprendidas
- **Memoria Constitucional:** `.cursor/rules/global.mdc` - Reglas universales
- **Memoria de Referencia:** `docs/reference/*.md` - Cargada solo bajo demanda

## ⚠️ Reglas Críticas

1. **Cero Alucinación:** NO escribas código sin un Plan
2. **Regla de Memoria:** Antes de editar cualquier carpeta, DEBES leer el archivo `agents.md` dentro de ella
3. **Ejecución Atómica:** Ejecuta estrictamente una historia de `stories.json` a la vez
4. **Verificación Binaria:** Solo estás listo cuando los `acceptance_criteria` en `stories.json` se cumplen
5. **Higiene de Contexto:** No cargues archivos de documentación a menos que sean requeridos específicamente por el Plan

## 📖 Documentación Adicional

- Ver `.AgenticStrataFramework/` para documentación completa del framework
- Consultar `docs/reference/` para guías específicas de API, DB, UI, etc.
- Revisar `src/**/agents.md` para conocimiento específico del proyecto

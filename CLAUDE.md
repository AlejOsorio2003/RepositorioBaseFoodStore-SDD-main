# CLAUDE.md

## Propósito
Definir cómo se utiliza la familia de modelos Claude dentro del flujo OpsX del proyecto, incluyendo:
- responsabilidades por etapa,
- uso de skills,
- integración con GPT‑5 mini institucional,
- y sincronización mediante Engram.

Este documento garantiza consistencia, trazabilidad y calidad en todos los artefactos generados por IA.

---

# Modelos utilizados

## Claude Opus
- Razonamiento profundo
- Análisis de riesgos
- Diseño conceptual
- Verificación de calidad
- Validación de arquitectura

## Claude Sonnet
- Redacción profesional
- Propuestas
- Documentación técnica
- Resúmenes y archivado

## GPT‑5 mini institucional
- Generación de código
- Refactorización
- Pruebas
- Automatizaciones
- Implementación técnica

---

# Skills del proyecto

## Backend
- *fastapi-python* → endpoints, routers, servicios, estructura
- *sqlmodel-best-practices* → modelos, relaciones, validaciones
- *alembic-migrations* → migraciones, revisiones, autogenerate
- *auth-security-python* → bcrypt, JWT, OAuth2, slowapi
- *mercadopago-sdk-helper* → pagos, webhooks, preferencias

## Frontend
- *vercel-react-best-practices* → componentes, hooks, estructura
- *react-state-patterns* → Zustand, stores, slices
- *tanstack-query-patterns* → queries, mutations, caching
- *tanstack-form-patterns* → formularios tipados
- *recharts-patterns* → dashboards, gráficos

## Utilidad general
- *vercel-find-skill* → descubrir skills, validar compatibilidad

---

# Reglas de uso de skills

1. *Claude Opus*  
   - Puede usar skills para diseño conceptual, arquitectura y validación.  
   - No genera código ejecutable.

2. *Claude Sonnet*  
   - Usa skills para documentación, propuestas y validación de flujos.  
   - No genera código.

3. *GPT‑5 mini*  
   - Es el único agente autorizado para generar código.  
   - Usa skills de backend y frontend para producir artefactos consistentes.

4. Toda invocación de skill debe registrarse en:  
   /opsx/<etapa>/skills/

5. Los artefactos generados por skills deben guardarse en:  
   /opsx/<etapa>/generated/

---

# Integración con Engram

Engram actúa como *memoria compartida del equipo*.  
Debe sincronizar:

- /opsx/ (todas las etapas)
- /decisions/ (decisiones justificadas)
- /prompts/ (prompts usados por cada agente)
- /generated/ (artefactos generados por skills)
- /context/ (notas, diagramas, definiciones)

### Reglas de Engram
- Ningún archivo se trabaja localmente sin sincronizar antes.  
- Cada cambio significativo debe registrarse como change-XX.  
- Cada etapa OpsX genera un subdirectorio propio.  
- Los agentes deben leer el contexto desde Engram antes de actuar.

---

# Distribución por etapa OpsX

## /opsx:explore → Claude Opus
- análisis del problema  
- riesgos  
- alternativas  
- mapeo conceptual  
- *no se usan skills*

## /opsx:propose → Claude Sonnet
- redacción del plan  
- justificación  
- estructura  
- *usa vercel-find-skill para sugerir skills necesarias*

## /opsx:design → Claude Opus + GPT‑5 mini
- Opus → arquitectura conceptual  
- GPT‑5 mini → prototipos y código  
- Skills:
  - fastapi-python  
  - sqlmodel-best-practices  
  - alembic-migrations  
  - auth-security-python  
  - mercadopago-sdk-helper  
  - vercel-react-best-practices  
  - react-state-patterns  
  - tanstack-query-patterns  
  - tanstack-form-patterns  
  - recharts-patterns  

## /opsx:apply → GPT‑5 mini + Sonnet
- GPT‑5 mini → implementación  
- Sonnet → documentación  
- Skills backend + frontend habilitadas

## /opsx:verify → Claude Opus
- validación  
- revisión de calidad  
- análisis de consistencia  
- *usa vercel-find-skill para validar artefactos*

## /opsx:archive → Claude Sonnet
- documentación final  
- resúmenes  
- registro histórico  
- *no se usan skills*
---
name: commit-changes-reporter
description: >
  Genera un reporte estructurado de los cambios realizados en un commit o en el working tree actual.
  Analiza el git diff, clasifica los cambios por tipo (Conventional Commits: feat, fix, chore, refactor, test, docs) y por módulo del proyecto,
  y produce un changelog claro. También propone el bloque exacto para actualizar docs/CHANGES.md.
  Usar cuando el usuario dice "reportar cambios", "qué cambié", "genera el changelog", "summary del commit", "qué hay en el diff",
  "documentar el commit", o cuando se termina de implementar una feature o fix y se quiere dejar registro.
---

# Commit Changes Reporter

Genera un reporte claro y estructurado de qué cambió en el repositorio, ya sea en el commit más reciente o en los cambios pendientes actuales.

## Paso 1 — Detectar contexto

Antes de analizar nada, determiná qué hay para reportar:

```bash
# Ver si hay cambios en el working tree (staged o unstaged)
git status --short

# Ver el diff de cambios pendientes (staged + unstaged)
git diff HEAD

# Si no hay cambios pendientes, analizar el último commit
git diff HEAD~1 HEAD --stat
git diff HEAD~1 HEAD
```

**Regla de decisión:**
- Si `git status` muestra archivos modificados → analizar `git diff HEAD` (working tree)
- Si el working tree está limpio → analizar `git diff HEAD~1 HEAD` (último commit)
- Si el usuario especificó un hash o rango → usar ese rango explícitamente

Siempre mostrá al usuario cuál modo activaste y por qué.

## Paso 2 — Recopilar metadata del commit (si aplica)

Si se está analizando un commit ya hecho, obtener también:

```bash
git log -1 --format="%H %s %an %ad" --date=short
```

Esto da: hash, mensaje original, autor, fecha.

## Paso 3 — Analizar el diff

Leer el diff completo y extraer:

1. **Archivos modificados** — listado con cantidad de líneas añadidas/eliminadas
2. **Tipo de cambio por archivo** — deducir si es `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style` según:
   - `feat`: archivo nuevo de funcionalidad (router, service, model, componente nuevo)
   - `fix`: corrección en lógica existente, manejo de errores, validación
   - `refactor`: reorganización sin cambio de comportamiento
   - `test`: archivos en `/tests/` o `*.test.ts`
   - `docs`: archivos `.md`, `CHANGES.md`, docstrings
   - `chore`: `requirements.txt`, `package.json`, `alembic/`, configuración, `.env.example`
   - `style`: cambios solo de formato, Tailwind, CSS
3. **Módulo del proyecto** — deducir del path:
   - `backend/app/auth/` → Auth
   - `backend/app/usuarios/` → Usuarios
   - `backend/app/productos/` → Productos
   - `backend/app/pedidos/` → Pedidos
   - `backend/app/pagos/` → Pagos
   - `backend/app/categorias/` → Categorías
   - `backend/app/core/` → Core / Infraestructura
   - `frontend/src/features/` → Frontend – Features
   - `frontend/src/pages/` → Frontend – Pages
   - `frontend/src/shared/` → Frontend – Shared
   - `docs/`, `openspec/` → Documentación

## Paso 4 — Generar el changelog estructurado

Presentá el reporte con este formato exacto:

```
## Changelog — [fecha YYYY-MM-DD]
### Commit: [hash corto] — [mensaje original si aplica]

### feat
- [Módulo] descripción del cambio (`archivo.py`)
- [Módulo] descripción del cambio (`archivo.py`)

### fix
- [Módulo] descripción del cambio

### refactor
- [Módulo] descripción del cambio

### chore
- descripción del cambio

### docs
- descripción del cambio
```

**Reglas de redacción:**
- Cada bullet empieza con verbo en presente: "Agrega", "Corrige", "Elimina", "Actualiza", "Mueve", "Extrae"
- Incluí el nombre del archivo clave entre backticks cuando sea relevante
- Agrupá bullets del mismo módulo juntos dentro de cada sección
- Omití secciones vacías
- Si un cambio es complejo, podés agregar un sub-bullet explicativo indentado

**Ejemplo:**

```
## Changelog — 2026-05-13
### Commit: a1b2c3d — feat(pedidos): implementa FSM de 6 estados

### feat
- [Pedidos] Agrega endpoint `POST /pedidos` con validación de stock (`pedidos/router.py`)
- [Pedidos] Implementa máquina de estados con 6 transiciones en `pedidos/service.py`
- [Pedidos] Agrega modelo `HistorialEstadoPedido` para audit trail (`pedidos/model.py`)

### fix
- [Auth] Corrige validación de expiración en `verify_token()` (`core/security.py`)

### chore
- Agrega `pytest-asyncio` a `requirements.txt`
```

## Paso 5 — Proponer entrada para docs/CHANGES.md

Después del changelog, agregá siempre esta sección:

```
---
### Propuesta para docs/CHANGES.md

Agregá este bloque en la sección correspondiente de `docs/CHANGES.md`:

[bloque markdown listo para pegar, siguiendo el estilo del archivo existente]
```

Para generar el bloque correctamente:
- Leé `docs/CHANGES.md` para entender el formato actual del documento
- Identificá si el cambio pertenece a un CH existente o necesita uno nuevo
- El bloque debe tener checkboxes `- [x]` para cambios completados

**Nunca modifiques `docs/CHANGES.md` directamente.** Solo generá la propuesta en la conversación.

## Notas sobre el proyecto

- Este proyecto usa **Conventional Commits**: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`
- Los commits NO incluyen co-authored-by ni atribución a IA
- La arquitectura backend sigue: `Router → Service → UoW → Repository → Model`
- El frontend sigue Feature-Sliced Design (FSD)
- Referencia del proyecto en `docs/CHANGES.md` para entender el contexto de cada módulo

## Context

El módulo `pedidos/` fue scaffoldeado en CH-00 con modelos completos pero stubs vacíos en todas las capas superiores (schemas, repository, service, router). CH-10 completa la implementación.

**Gap modelo vs spec:** La spec SDD v5.0 define `EstadoPedido.codigo` como PK semántica (VARCHAR(20)) y `Pedido.estado_codigo` como FK. El modelo CH-00 implementó `EstadoPedido.id` (SERIAL PK) y `Pedido.estado_id` (FK a int). **Decisión de diseño:** adaptar schemas y service para trabajar con el modelo existente — `EstadoPedido.nombre` contiene el código semántico (PENDIENTE, CONFIRMADO, etc.) y se expone como `estado_codigo` en los schemas vía eager-loading. No se realizan migraciones.

**Gap forma_pago:** El modelo `Pedido` no tiene `forma_pago_codigo`. Se omite en v1 — el campo quedará disponible para CH-12 (Pagos). `CrearPedidoRequest` no incluirá `forma_pago_codigo` en esta iteración.

**UoW:** `uow.pedidos` ya está wired en `UnitOfWork._init_repositories()` desde CH-00.

## Goals / Non-Goals

**Goals:**
- Implementar FSM de 6 estados con validación de transiciones en Service
- Crear pedido en transacción atómica: validar disponibilidad → snapshot precios → crear detalles → historial inicial
- Audit trail append-only en `HistorialEstadoPedido`
- 6 endpoints REST con RBAC correcto
- Seed de `EstadoPedido` si no existe (idempotente)

**Non-Goals:**
- Integración con pagos (CH-12) — `forma_pago_codigo` queda fuera de v1
- Notificaciones push/email al cambiar estado
- Cancelación por parte de ADMIN/PEDIDOS (solo CLIENT propietario en v1)
- Modificar modelos existentes ni crear migraciones

## Decisions

### D-01: Trabajar con modelo id-based (no migrar a codigo-based)

**Decisión:** Mantener `Pedido.estado_id` (FK a int) y adaptar schemas para exponer `estado_nombre` (el campo `nombre` de `EstadoPedido` que contiene el código semántico). Los schemas de respuesta usan `estado_nombre: str` en lugar de `estado_codigo`.

**Alternativa descartada:** Crear migración Alembic para renombrar columnas. Riesgo alto de breaking change para otros módulos (CH-12, CH-14) que aún no existen.

**Rationale:** El comportamiento observable de la API es idéntico — el valor devuelto es "PENDIENTE", "CONFIRMADO", etc. Solo cambia el nombre del campo en el JSON response (`estado_nombre` vs `estado_codigo`).

### D-02: FSM como lookup table en service (no enum Python)

**Decisión:** Definir las transiciones válidas como dict en `service.py`:

```python
TRANSICIONES_VALIDAS: dict[str, list[str]] = {
    "PENDIENTE":   ["CONFIRMADO", "CANCELADO"],
    "CONFIRMADO":  ["EN_PREP", "CANCELADO"],
    "EN_PREP":     ["EN_CAMINO", "CANCELADO"],
    "EN_CAMINO":   ["ENTREGADO"],
    "ENTREGADO":   [],
    "CANCELADO":   [],
}
```

La validación ocurre en `avanzar_estado` antes de escribir en BD. Los estados terminales (`es_terminal=True`) se verifican vía este dict (lista vacía = terminal).

**Alternativa descartada:** Consultar transiciones desde BD. Más flexible pero innecesariamente complejo para 6 estados fijos en v1.

### D-03: Snapshot de dirección al crear pedido

**Decisión:** Al crear el pedido, serializar los campos relevantes de la dirección (`calle`, `numero`, `ciudad`, etc.) como JSON string en `Pedido.direccion_snapshot`. Esto permite que el usuario cambie o elimine la dirección sin afectar pedidos históricos.

### D-04: Historial append-only garantizado en service

**Decisión:** `HistorialEstadoPedido` nunca se actualiza ni elimina desde ninguna capa. El service solo hace `session.add()` de nuevos registros. El repository no expone métodos `update` ni `delete` para historial.

### D-05: Seed de EstadoPedido en startup

**Decisión:** Agregar función `seed_estados_pedido()` llamada desde `main.py` en el evento `startup`. Inserta los 6 estados si no existen (idempotente con `ON CONFLICT DO NOTHING` o check previo).

## Risks / Trade-offs

- **[Risk] Gap estado_nombre vs estado_codigo en API** → La respuesta usa `estado_nombre` en lugar de `estado_codigo`. El frontend CH-11 deberá usar este nombre de campo. Documentado en spec.
- **[Risk] Sin forma_pago en v1** → CH-12 deberá agregar el campo al modelo vía migración. El diseño deja el campo `forma_pago_codigo` como `None` por ahora — sin impacto en creación de pedidos.
- **[Risk] Seed fallido al startup** → Si el seed falla (BD no disponible), los endpoints de creación de pedidos lanzarán IntegrityError al intentar FK. Mitigación: el seed usa try/except y loguea el error sin crashear el startup.
- **[Trade-off] `personalizacion` como INTEGER[]** → PostgreSQL ARRAY — no compatible con SQLite de testing. Mitigación: el proyecto ya usa PostgreSQL en producción; se acepta el trade-off.

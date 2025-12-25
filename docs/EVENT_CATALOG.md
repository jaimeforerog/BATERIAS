# Event Catalog - Sistema de Control de Baterías

## Información General

**Sistema:** Control de Baterías para Equipos
**Patrón:** Event Sourcing con CQRS
**Event Store:** Marten (PostgreSQL)
**Versión:** 1.0

---

## Eventos del Dominio

### 1. BatteryInstalled

**Descripción:** Se registra cuando una batería nueva es instalada en un equipo.

**Cuándo se dispara:**
- Usuario instala una batería nueva en un equipo
- Endpoint: `POST /api/batteries/install`

**Datos del Evento:**

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `BatteryId` | Guid | ID único de la batería | `ab1a27f4-5091-45b8-bbec-fc90946820b4` |
| `BatterySerialNumber` | string | Número de serie de la batería | `"BAT-2024-001"` |
| `BatteryModel` | string | Modelo de la batería | `"Trojan T-105"` |
| `EquipoId` | int | ID del equipo donde se instala | `106` |
| `EquipoCodigo` | string | Código del equipo | `"EQ-106"` |
| `InstallationDate` | DateTime | Fecha y hora de instalación | `2025-12-23T14:30:00Z` |
| `InitialVoltage` | decimal | Voltaje inicial medido (V) | `12.6` |
| `InstalledBy` | string | Nombre del técnico instalador | `"Juan Pérez"` |

**Efectos:**
- ✅ Batería cambia a estado `Installed`
- ✅ Se vincula al equipo especificado
- ✅ Se registra voltaje inicial
- ✅ Inicia el historial de la batería

**Ejemplo JSON:**
```json
{
  "BatteryId": "ab1a27f4-5091-45b8-bbec-fc90946820b4",
  "BatterySerialNumber": "BAT-2024-001",
  "BatteryModel": "Trojan T-105",
  "EquipoId": 106,
  "EquipoCodigo": "EQ-106",
  "InstallationDate": "2025-12-23T14:30:00Z",
  "InitialVoltage": 12.6,
  "InstalledBy": "Juan Pérez"
}
```

---

### 2. MaintenanceRecorded

**Descripción:** Se registra cuando se realiza un mantenimiento a una batería instalada.

**Cuándo se dispara:**
- Usuario registra mantenimiento preventivo o correctivo
- Endpoint: `POST /api/batteries/{id}/maintenance`

**Datos del Evento:**

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `BatteryId` | Guid | ID de la batería mantenida | `ab1a27f4-5091-45b8-bbec-fc90946820b4` |
| `MaintenanceId` | Guid | ID único del mantenimiento | `c2e4a3b1-9876-4321-abcd-1234567890ab` |
| `MaintenanceDate` | DateTime | Fecha y hora del mantenimiento | `2025-12-23T15:00:00Z` |
| `Type` | MaintenanceType | Tipo de mantenimiento | `VoltageTest` (enum) |
| `VoltageReading` | decimal | Lectura de voltaje (V) | `12.4` |
| `HealthStatus` | HealthStatus | Estado de salud evaluado | `Good` (enum) |
| `Notes` | string | Observaciones del técnico | `"Batería en buen estado"` |
| `PerformedBy` | string | Técnico que realizó el mantenimiento | `"María García"` |

**Tipos de Mantenimiento (MaintenanceType):**
- `Charging` - Carga de batería
- `Inspection` - Inspección visual
- `VoltageTest` - Prueba de voltaje
- `LoadTest` - Prueba de carga

**Estados de Salud (HealthStatus):**
- `Excellent` - Excelente (>95%)
- `Good` - Bueno (80-95%)
- `Fair` - Regular (60-80%)
- `Poor` - Malo (40-60%)
- `Critical` - Crítico (<40%)

**Efectos:**
- ✅ Actualiza voltaje actual de la batería
- ✅ Actualiza estado de salud
- ✅ Incrementa contador de mantenimientos
- ✅ Registra última fecha de mantenimiento

**Ejemplo JSON:**
```json
{
  "BatteryId": "ab1a27f4-5091-45b8-bbec-fc90946820b4",
  "MaintenanceId": "c2e4a3b1-9876-4321-abcd-1234567890ab",
  "MaintenanceDate": "2025-12-23T15:00:00Z",
  "Type": 2,
  "VoltageReading": 12.4,
  "HealthStatus": 1,
  "Notes": "Batería en buen estado",
  "PerformedBy": "María García"
}
```

---

### 3. BatteryReplaced

**Descripción:** Se registra cuando una batería es reemplazada por otra nueva en un equipo.

**Cuándo se dispara:**
- Usuario reemplaza batería vieja por una nueva
- Endpoint: `POST /api/batteries/replace`

**Datos del Evento:**

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `OldBatteryId` | Guid | ID de la batería removida | `ab1a27f4-5091-45b8-bbec-fc90946820b4` |
| `NewBatteryId` | Guid | ID de la nueva batería | `def12345-6789-0abc-def0-123456789abc` |
| `EquipoId` | int | ID del equipo | `106` |
| `ReplacementDate` | DateTime | Fecha y hora del reemplazo | `2025-12-25T10:00:00Z` |
| `Reason` | BatteryRemovalReason | Razón del reemplazo | `EndOfLife` (enum) |
| `FinalVoltage` | decimal | Último voltaje registrado (V) | `10.2` |
| `ReplacedBy` | string | Técnico que realizó el reemplazo | `"Carlos Rodríguez"` |

**Razones de Remoción (BatteryRemovalReason):**
- `EndOfLife` - Fin de vida útil
- `Defective` - Defectuosa
- `Upgrade` - Actualización/mejora
- `VehicleSold` - Vehículo vendido

**Efectos:**
- ✅ Batería vieja cambia a estado `Removed`
- ✅ Se desvincula del equipo
- ✅ Nueva batería se instala automáticamente
- ✅ Registra voltaje final de la batería removida
- ✅ Documenta razón del reemplazo

**Ejemplo JSON:**
```json
{
  "OldBatteryId": "ab1a27f4-5091-45b8-bbec-fc90946820b4",
  "NewBatteryId": "def12345-6789-0abc-def0-123456789abc",
  "EquipoId": 106,
  "ReplacementDate": "2025-12-25T10:00:00Z",
  "Reason": 0,
  "FinalVoltage": 10.2,
  "ReplacedBy": "Carlos Rodríguez"
}
```

---

## Ciclo de Vida de una Batería

```
┌─────────────────────────────────────────────────────────────┐
│                    CICLO DE VIDA                             │
└─────────────────────────────────────────────────────────────┘

1. [NEW] ────────────────────────────────────────────┐
   Batería nueva sin instalar                        │
                                                      │
2. BatteryInstalled Event                            │
   └─> [INSTALLED] ──────────────────────────────────┤
       Batería instalada en equipo                   │
                                                      │
3. MaintenanceRecorded Event (0..N veces)            │
   └─> Actualiza: Voltaje, HealthStatus              │
                                                      │
4. BatteryReplaced Event                             │
   └─> [REMOVED] ────────────────────────────────────┤
       Batería removida del equipo                   │
                                                      │
5. (Futuro: BatteryDisposed Event)                   │
   └─> [DISPOSED] ───────────────────────────────────┘
       Batería desechada
```

---

## Estados de Batería (BatteryStatus)

| Estado | Valor | Descripción |
|--------|-------|-------------|
| `New` | 0 | Batería nueva, nunca instalada |
| `Installed` | 1 | Batería actualmente instalada en un equipo |
| `Removed` | 2 | Batería removida de un equipo |
| `Disposed` | 3 | Batería desechada/descartada |

---

## Proyecciones (Read Models)

### BatteryStatusProjection
**Tabla:** `mt_doc_batterystatusprojection`

Proyección que mantiene el estado actual de cada batería.

**Se actualiza con:**
- ✅ `BatteryInstalled` - Crea nuevo registro
- ✅ `MaintenanceRecorded` - Actualiza voltaje y salud
- ✅ `BatteryReplaced` - Marca como removida

### MaintenanceHistoryProjection
**Tabla:** `mt_doc_maintenancehistoryprojection`

Historial completo de mantenimientos por batería.

**Se actualiza con:**
- ✅ `MaintenanceRecorded` - Añade nuevo registro

### EquipoBatteryProjection
**Tabla:** `mt_doc_equipobatteryprojection`

Estado actual y histórico de baterías por equipo.

**Se actualiza con:**
- ✅ `BatteryInstalled` - Actualiza batería actual
- ✅ `BatteryReplaced` - Cambia batería del equipo

---

## Event Store Schema

### Tabla: mt_events

Almacena todos los eventos del sistema.

```sql
SELECT
    id,                    -- ID del evento
    stream_id,             -- ID del stream (BatteryId)
    version,               -- Versión del evento en el stream
    type,                  -- Tipo de evento (ej: battery_installed)
    data,                  -- JSON con datos del evento
    timestamp,             -- Cuándo ocurrió
    seq_id                 -- Secuencia global
FROM mt_events
ORDER BY timestamp DESC;
```

### Tabla: mt_streams

Metadata de los streams de eventos.

```sql
SELECT
    id,                    -- Stream ID (BatteryId)
    type,                  -- Tipo de stream
    version,               -- Versión actual del stream
    timestamp              -- Última modificación
FROM mt_streams;
```

---

## Comandos vs Eventos

### Comandos (Intención)
```
InstallBattery Command
   └─> BatteryInstalled Event

RecordMaintenance Command
   └─> MaintenanceRecorded Event

ReplaceBattery Command
   └─> BatteryReplaced Event
```

**Diferencia clave:**
- **Comando:** Lo que queremos hacer (puede fallar)
- **Evento:** Lo que ya ocurrió (inmutable, permanente)

---

## Consultas SQL Útiles

### Ver todos los eventos de una batería
```sql
SELECT
    timestamp,
    type,
    data
FROM mt_events
WHERE stream_id = 'ab1a27f4-5091-45b8-bbec-fc90946820b4'
ORDER BY version;
```

### Ver últimas instalaciones
```sql
SELECT
    data->>'BatterySerialNumber' as serial,
    data->>'EquipoId' as equipo,
    timestamp
FROM mt_events
WHERE type = 'battery_installed'
ORDER BY timestamp DESC
LIMIT 10;
```

### Ver mantenimientos por batería
```sql
SELECT
    data->>'MaintenanceDate' as fecha,
    data->>'Type' as tipo,
    data->>'VoltageReading' as voltaje,
    data->>'HealthStatus' as salud
FROM mt_events
WHERE type = 'maintenance_recorded'
  AND stream_id = 'ab1a27f4-5091-45b8-bbec-fc90946820b4'
ORDER BY timestamp;
```

---

## Reglas de Negocio

### BatteryInstalled
- ✅ Batería debe estar en estado `New`
- ✅ Equipo debe existir
- ✅ Voltaje debe ser > 0
- ✅ Serial Number debe ser único

### MaintenanceRecorded
- ✅ Batería debe estar `Installed`
- ✅ Voltaje debe ser > 0
- ✅ Debe tener un tipo válido de mantenimiento

### BatteryReplaced
- ✅ Batería vieja debe estar `Installed`
- ✅ Nueva batería debe estar `New`
- ✅ Debe especificar razón válida

---

## Próximos Eventos (Roadmap)

### Eventos Futuros Propuestos

1. **BatteryDisposed**
   - Marca batería como desechada
   - Registra método de disposición

2. **BatteryTransferred**
   - Transfiere batería entre equipos sin reemplazo

3. **AlertTriggered**
   - Alerta de voltaje bajo
   - Alerta de mantenimiento vencido

4. **BatteryWarrantyRegistered**
   - Registra información de garantía

---

**Fecha de Creación:** 2025-12-23
**Última Actualización:** 2025-12-23
**Versión del Documento:** 1.0

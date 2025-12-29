SELECT 
    data->>'MaintenanceDate' as "Fecha del Mantenimiento",
    data->>'RecordedAt' as "Fecha de Registro",
    data->>'PerformedBy' as "Realizado Por",
    data->>'Notes' as "Observaciones",
    timestamp as "Timestamp del Evento"
FROM mt_events
WHERE type = 'maintenance_recorded'
ORDER BY timestamp DESC
LIMIT 5;

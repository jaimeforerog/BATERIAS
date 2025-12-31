# Configuración de Application Insights

## Descripción
Application Insights es el servicio de monitoreo de Azure que proporciona telemetría completa para tu aplicación.

## Pasos de Configuración

### 1. Crear Application Insights en Azure Portal

1. Ve a [Azure Portal](https://portal.azure.com)
2. Clic en **"+ Create a resource"**
3. Busca **"Application Insights"**
4. Clic en **"Create"**

**Configuración recomendada:**
```
Resource Group: [mismo que tu App Service]
Name: baterias-app-insights
Region: Canada Central
Resource Mode: Workspace-based
```

### 2. Obtener Connection String

1. Ve al recurso creado
2. En **"Properties"** o **"Overview"**
3. Copia el **"Connection String"**
   - Formato: `InstrumentationKey=xxx;IngestionEndpoint=https://...`

### 3. Configurar en Azure App Service

1. Ve a tu App Service: `baterias-api-dwf0a9f0eug5eycz`
2. **Settings → Environment variables**
3. **+ New application setting**:
   ```
   Name: ApplicationInsights__ConnectionString
   Value: [tu Connection String]
   ```
4. **Save** (el servicio se reiniciará)

### 4. Configuración Local (Opcional)

Para desarrollo local, actualiza `appsettings.Development.json`:

```json
{
  "ApplicationInsights": {
    "ConnectionString": "InstrumentationKey=xxx;..."
  }
}
```

⚠️ **Importante**: NO hagas commit del Connection String en git. Usa variables de entorno o User Secrets.

## Qué Monitorea Application Insights

### 📊 Telemetría Automática

1. **Requests**
   - Todas las peticiones HTTP a tu API
   - URLs, métodos, tiempos de respuesta
   - Códigos de estado

2. **Dependencies**
   - Llamadas a PostgreSQL
   - Llamadas HTTP salientes
   - Tiempos de respuesta de dependencias

3. **Exceptions**
   - Stack traces completos
   - Contexto de la excepción
   - Frecuencia de errores

4. **Performance**
   - Tiempos de respuesta (P50, P95, P99)
   - CPU y memoria
   - Throughput (requests/second)

5. **Availability**
   - Uptime del servicio
   - Tests de disponibilidad

### 📈 Métricas Personalizadas

El código ya está configurado para enviar:
- Eventos de batería (registros, instalaciones, mantenimientos)
- Health checks
- Custom events vía código

## Verificar que Funciona

### Método 1: Azure Portal

1. Ve a Application Insights en Azure Portal
2. **Monitoring → Logs**
3. Ejecuta esta query:
   ```kusto
   requests
   | where timestamp > ago(1h)
   | summarize count() by resultCode
   ```

### Método 2: Live Metrics

1. En Application Insights, ve a **Investigate → Live Metrics**
2. Deberías ver tráfico en tiempo real
3. Haz requests a tu API y verás los datos aparecer

### Método 3: Health Check Endpoint

Accede a: `https://baterias-api-dwf0a9f0eug5eycz.canadacentral-01.azurewebsites.net/health`

Deberías ver el JSON con el estado del sistema.

## Dashboards y Alertas

### Dashboard Recomendado

Crear un dashboard con:
1. **Request rate** (requests/min)
2. **Response time** (avg, P95)
3. **Failed requests** (count)
4. **Database dependencies** (PostgreSQL response time)
5. **Exceptions** (count y tipos)

### Alertas Recomendadas

1. **Alta tasa de errores**
   - Condición: Failed requests > 10 en 5 minutos
   - Acción: Email/SMS

2. **Baja disponibilidad**
   - Condición: Availability < 99%
   - Acción: Email/SMS

3. **Respuesta lenta**
   - Condición: Avg response time > 1000ms
   - Acción: Email

4. **Database down**
   - Condición: PostgreSQL dependency failures > 5
   - Acción: Email/SMS (crítico)

## Queries Útiles (KQL)

### Top 10 Endpoints más lentos
```kusto
requests
| where timestamp > ago(24h)
| summarize avg(duration), count() by name
| order by avg_duration desc
| take 10
```

### Errores en las últimas 24h
```kusto
exceptions
| where timestamp > ago(24h)
| summarize count() by type, outerMessage
| order by count_ desc
```

### Dependencias de Base de Datos
```kusto
dependencies
| where type == "SQL"
| where timestamp > ago(1h)
| summarize avg(duration), count() by name
| order by avg_duration desc
```

### Eventos de Baterías
```kusto
customEvents
| where name startswith "Battery"
| where timestamp > ago(24h)
| summarize count() by name
```

## Costos

Application Insights tiene un tier gratuito:
- **Primeros 5 GB/mes**: Gratis
- **Después**: ~$2.30 USD/GB

Para una aplicación pequeña-mediana, los costos suelen ser < $10/mes.

### Optimizar Costos

1. **Adaptive Sampling** (ya configurado): Reduce volumen manteniendo representatividad
2. **Filtrar telemetría**: Excluir health checks muy frecuentes
3. **Retención**: Reducir de 90 a 30 días si no necesitas histórico largo

## Recursos Adicionales

- [Documentación oficial](https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)
- [KQL Quick Reference](https://docs.microsoft.com/en-us/azure/data-explorer/kusto/query/)
- [Best Practices](https://docs.microsoft.com/en-us/azure/azure-monitor/app/performance-counters)

## Soporte

Si tienes problemas:
1. Verifica que el Connection String esté correcto
2. Revisa los logs del App Service
3. Asegúrate que el puerto 443 saliente esté abierto
4. Contacta soporte de Azure si persiste

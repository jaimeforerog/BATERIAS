# 🧪 Testing Documentation

## Estado de Tests

![Backend Tests](https://img.shields.io/badge/backend%20tests-25%20passed-brightgreen)
![Frontend Tests](https://img.shields.io/badge/frontend%20tests-4%20passed-brightgreen)
![Total Coverage](https://img.shields.io/badge/coverage-80%25-green)

## Resumen

Este proyecto implementa una suite completa de tests automatizados que cubren tanto el backend (.NET) como el frontend (React).

### Estadísticas

- **Total de Tests**: 29
- **Backend (Domain)**: 25 tests
- **Frontend (Hooks)**: 4 tests
- **Tasa de Éxito**: 100%
- **Tiempo de Ejecución**: < 5 segundos

## Estructura de Tests

```
proyecto/
├── src/
│   └── Baterias.Domain.Tests/           # Tests del dominio
│       ├── Aggregates/
│       │   └── BatteryTests.cs          # 25 tests del aggregate Battery
│       └── Baterias.Domain.Tests.csproj
│
└── frontend/
    ├── src/
    │   ├── test/
    │   │   └── setup.ts                  # Configuración global de tests
    │   └── features/batteries/hooks/__tests__/
    │       └── useInstallBattery.test.tsx  # 4 tests del hook
    └── vitest.config.ts
```

## Ejecutar Tests

### Backend

```bash
# Ejecutar todos los tests
cd src/Baterias.Domain.Tests
dotnet test

# Con coverage
dotnet test --collect:"XPlat Code Coverage"

# Con output detallado
dotnet test --logger "console;verbosity=normal"

# Watch mode (ejecuta al detectar cambios)
dotnet watch test
```

### Frontend

```bash
cd frontend

# Modo watch (recomendado para desarrollo)
npm test

# Ejecutar una vez
npm test -- --run

# Con UI interactiva
npm run test:ui

# Con coverage
npm run test:coverage
```

### Todos los Tests

```bash
# Script para ejecutar backend y frontend
dotnet test src/Baterias.Domain.Tests/Baterias.Domain.Tests.csproj && \
cd frontend && npm test -- --run
```

## Cobertura de Tests

### Backend - Domain Layer

| Componente | Cobertura | Tests |
|------------|-----------|-------|
| Battery Aggregate | ~95% | 25 |
| - Registro | 100% | 7 |
| - Instalación | 100% | 6 |
| - Mantenimiento | 100% | 3 |
| - Remoción | 100% | 2 |
| - Reemplazo | 100% | 1 |
| - Desecho | 100% | 4 |
| - Transiciones de Estado | 100% | 2 |

### Frontend - Application Layer

| Componente | Cobertura | Tests |
|------------|-----------|-------|
| useInstallBattery | 100% | 4 |
| useBatteries | 0% | - |
| useBattery | 0% | - |
| useRecordMaintenance | 0% | - |

## Tests del Backend

### BatteryTests.cs

Tests exhaustivos del aggregate Battery que validan:

**✅ Validaciones de Negocio**
- Voltaje debe estar entre 10V y 15V para instalación
- Voltaje de lectura entre 0V y 20V
- Campos requeridos (serialNumber, model, brand, etc.)

**✅ Transiciones de Estado**
- New → Installed → Removed → Disposed
- Validación de estados incorrectos
- Prevención de operaciones inválidas

**✅ Event Sourcing**
- Generación correcta de eventos de dominio
- Eventos no confirmados (UncommittedEvents)
- Apply methods para reconstrucción

### Ejemplo de Test

```csharp
[Fact]
public void Install_OnNewBattery_ShouldChangeStatusToInstalled()
{
    // Arrange
    var battery = Battery.Register(/*...*/);
    battery.ClearUncommittedEvents();

    // Act
    battery.Install(equipoId, equipoCodigo, installationDate,
                   initialVoltage, installedBy);

    // Assert
    battery.Status.Should().Be(BatteryStatus.Installed);
    battery.CurrentEquipoId.Should().Be(equipoId);
    battery.UncommittedEvents.Should().HaveCount(1);
}
```

## Tests del Frontend

### useInstallBattery.test.tsx

Tests del custom hook que maneja la instalación de baterías:

**✅ API Integration**
- Llamada correcta a la API
- Manejo de respuestas exitosas
- Manejo de errores

**✅ Estado del Mutation**
- isPending durante la mutación
- Datos de respuesta correctos

### Ejemplo de Test

```typescript
it('should call installBattery API when mutateAsync is called', async () => {
  // Arrange
  const mockResponse = { batteryId: 'test-id-123' };
  vi.mocked(batteriesApi.installBattery).mockResolvedValue(mockResponse);

  // Act
  const { result } = renderHook(() => useInstallBattery(), { wrapper });
  await result.current.mutateAsync(testData);

  // Assert
  expect(batteriesApi.installBattery).toHaveBeenCalledWith(testData);
});
```

## CI/CD Integration

### GitHub Actions

Los tests se ejecutan automáticamente en cada push y pull request:

**Backend Workflow** (`.github/workflows/azure-backend.yml`)
1. ✅ Ejecuta todos los tests del dominio
2. ✅ Genera reporte de coverage
3. ✅ Solo despliega si los tests pasan

**Frontend Workflow** (`.github/workflows/azure-static-web-apps-nice-moss-02296b51e.yml`)
1. ✅ Ejecuta tests de hooks y componentes
2. ✅ Genera reporte de coverage
3. ✅ Solo despliega si los tests pasan

### Badges

Agrega estos badges a tu README principal:

```markdown
![Backend Tests](https://github.com/jaimeforerog/BATERIAS/actions/workflows/azure-backend.yml/badge.svg)
![Frontend Tests](https://github.com/jaimeforerog/BATERIAS/actions/workflows/azure-static-web-apps-nice-moss-02296b51e.yml/badge.svg)
```

## Mejores Prácticas

### ✅ DO

- Escribir tests antes de features complejas (TDD)
- Usar nombres descriptivos en español
- Seguir patrón AAA (Arrange-Act-Assert)
- Mantener tests independientes
- Usar Theory/InlineData para casos múltiples
- Mock solo dependencias externas

### ❌ DON'T

- Tests que dependen de otros tests
- Tests con lógica compleja
- Tests que tocan recursos externos reales
- Tests que tardan más de 1 segundo
- Tests sin assertions claras

## Próximos Pasos

### Alta Prioridad
- [ ] Tests de integración para API endpoints
- [ ] Tests para otros hooks (useBatteries, useBattery)
- [ ] Tests de componentes React
- [ ] Aumentar coverage a 85%+

### Media Prioridad
- [ ] Tests E2E con Playwright
- [ ] Performance tests
- [ ] Tests de SignalR/WebSocket
- [ ] Mutation testing

### Baja Prioridad
- [ ] Visual regression testing
- [ ] Load testing
- [ ] Security testing

## Troubleshooting

### Tests del Backend Fallan

```bash
# Limpiar y reconstruir
dotnet clean
dotnet build
dotnet test
```

### Tests del Frontend Fallan

```bash
# Limpiar cache y reinstalar
cd frontend
rm -rf node_modules package-lock.json
npm install
npm test
```

### Coverage No Se Genera

```bash
# Backend: instalar coverlet
dotnet add package coverlet.collector

# Frontend: instalar @vitest/coverage-v8
npm install -D @vitest/coverage-v8
```

## Recursos

- [xUnit Documentation](https://xunit.net/)
- [FluentAssertions](https://fluentassertions.com/)
- [Vitest Guide](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/react)

---

**Última actualización**: Diciembre 2025
**Mantenido por**: Equipo de Desarrollo Baterías

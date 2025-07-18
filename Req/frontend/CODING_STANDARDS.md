# 📋 Estándares de Desarrollo - Sistema de Gestión #040

## 🚨 Reglas Críticas (OBLIGATORIAS)

### ❌ Prohibición Absoluta de Alertas Nativas

**NUNCA usar `window.alert()` o `window.confirm()` en el proyecto.**

```typescript
// ❌ PROHIBIDO - Será rechazado en code review
window.alert('Mensaje');
window.confirm('¿Confirmar?');
alert('Error');
confirm('¿Continuar?');

// ✅ CORRECTO - Usar componentes de UI
import { toast } from 'react-hot-toast';
import { Dialog } from '@/components/ui/dialog';

// Para notificaciones
toast.success('Operación exitosa');
toast.error('Error en la operación');
toast.loading('Procesando...');

// Para confirmaciones
<ConfirmDialog
  title="Confirmar eliminación"
  message="¿Está seguro de que desea eliminar este registro?"
  onConfirm={handleDelete}
  onCancel={handleCancel}
/>
```

### 📏 Límite de 300 Líneas por Componente

**Los componentes React NO PUEDEN exceder 300 líneas.**

#### ✅ Proceso de Modularización

Cuando un componente exceda 300 líneas, sigue esta estructura:

```typescript
// 1. 🎣 Hook personalizado para lógica
// hooks/use-feature-logic.ts
export function useFeatureLogic() {
  const [state, setState] = useState();
  // Toda la lógica de estado y efectos
  return { state, actions };
}

// 2. 🧩 Componentes especializados
// components/feature-header.tsx
export function FeatureHeader({ title, actions }) {
  return <header>{title}</header>;
}

// components/feature-body.tsx
export function FeatureBody({ data }) {
  return <main>{data}</main>;
}

// 3. 🏗️ Componente principal (máximo 100 líneas)
// index.tsx
export function MainFeature() {
  const { state, actions } = useFeatureLogic();

  return (
    <div>
      <FeatureHeader title={state.title} actions={actions} />
      <FeatureBody data={state.data} />
    </div>
  );
}
```

## 🛠️ Herramientas de Validación

### Validación Automática

```bash
# Validar estándares antes de commit
npm run validate:standards

# Ejecutar todas las validaciones
npm run pre-commit

# Solo lint
npm run lint

# Arreglar problemas automáticamente
npm run lint:fix
```

### Configuración ESLint

Las siguientes reglas están configuradas para hacer cumplir los estándares:

```json
{
  "rules": {
    "no-alert": "error", // ❌ Prohíbe alert()
    "no-confirm": "error", // ❌ Prohíbe confirm()
    "max-lines": ["error", 300], // 📏 Máximo 300 líneas
    "complexity": ["error", 8] // 🧠 Complejidad máxima 8
  }
}
```

## 📁 Estructura de Archivos Recomendada

```
src/
├── components/
│   ├── feature-name/
│   │   ├── hooks/
│   │   │   └── use-feature-logic.ts
│   │   ├── components/
│   │   │   ├── feature-header.tsx
│   │   │   ├── feature-body.tsx
│   │   │   └── feature-footer.tsx
│   │   ├── types/
│   │   │   └── feature.types.ts
│   │   └── index.tsx
│   └── ui/
│       ├── dialog.tsx
│       ├── toast.tsx
│       └── button.tsx
├── hooks/
├── lib/
└── types/
```

## 🎯 Ejemplos Prácticos

### ✅ Componente Bien Modularizado

```typescript
// ✅ CORRECTO - Componente principal limpio
export function UserManagementPage() {
  const {
    users,
    loading,
    error,
    handleCreate,
    handleEdit,
    handleDelete
  } = useUserManagement();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-6">
      <UserHeader onCreateUser={handleCreate} />
      <UserTable
        users={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
```

### ❌ Componente Problemático

```typescript
// ❌ INCORRECTO - Componente monolítico
export function BadUserManagementPage() {
  // 400+ líneas de código
  // Múltiples responsabilidades
  // Lógica mezclada con UI
  // Uso de alert() y confirm()

  const handleDelete = () => {
    if (confirm('¿Eliminar?')) { // ❌ PROHIBIDO
      // lógica de eliminación
      alert('Eliminado'); // ❌ PROHIBIDO
    }
  };

  return (
    <div>
      {/* 300+ líneas de JSX complejo */}
    </div>
  );
}
```

## 🔍 Proceso de Code Review

### Checklist Obligatorio

- [ ] ✅ No usa `alert()` o `confirm()`
- [ ] 📏 Componente < 300 líneas
- [ ] 🧠 Funciones con complejidad < 8
- [ ] 🎣 Lógica extraída a hooks cuando es necesario
- [ ] 🧩 Componentes modulares y reutilizables
- [ ] 📝 Código bien documentado
- [ ] 🧪 Tests incluidos

### Rechazo Automático

Los PRs serán rechazados automáticamente si:

- Contienen `alert()` o `confirm()`
- Tienen componentes > 300 líneas
- No pasan las validaciones de ESLint

## 🚀 Migración de Código Existente

### Plan de Refactorización

1. **Identificar componentes problemáticos**

   ```bash
   npm run validate:standards
   ```

2. **Priorizar por impacto**
   - Componentes críticos primero
   - Componentes más usados
   - Componentes con más bugs

3. **Refactorizar gradualmente**
   - Un componente por PR
   - Mantener funcionalidad existente
   - Agregar tests

### Deuda Técnica

Mantener registro de componentes pendientes:

- [ ] `UserManagementPage` (450 líneas) - Prioridad Alta
- [ ] `ReportGenerator` (380 líneas) - Prioridad Media
- [ ] `DashboardWidget` (320 líneas) - Prioridad Baja

## 📞 Soporte

Si tienes dudas sobre cómo modularizar un componente:

1. Revisa ejemplos en este documento
2. Consulta componentes ya modularizados
3. Pregunta en el canal de desarrollo
4. Solicita code review temprano

---

**Recuerda**: Estos estándares existen para mantener la calidad del código y facilitar el mantenimiento a largo plazo. ¡Gracias por seguirlos! 🙏

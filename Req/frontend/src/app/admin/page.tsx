'use client';

import { ProtectedPage } from '@/components/auth/protected-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@/types';

export default function AdminPage() {
  return (
    <ProtectedPage
      title="Panel de Administración"
      allowedRoles={[UserRole.ADMIN]}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Administración del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Esta sección está restringida solo para administradores del sistema.
              Aquí puede gestionar usuarios, configurar parámetros del sistema y
              revisar logs de auditoría.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Administre usuarios, roles y permisos del sistema.
              </p>
              <a
                href="/admin/users"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Ir a Usuarios →
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Configure parámetros generales del sistema.
              </p>
              <a
                href="/admin/settings"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Ir a Configuración →
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logs de Auditoría</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Revise el historial de actividades y cambios en el sistema.
              </p>
              <a
                href="/admin/audit"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Ir a Auditoría →
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedPage>
  );
}

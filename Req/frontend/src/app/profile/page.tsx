'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/use-profile';
import { ProfileLoading } from '@/components/profile/profile-loading';
import { ProfileField } from '@/components/profile/profile-field';
import { ProfileReadOnlyField } from '@/components/profile/profile-read-only-field';

export default function ProfilePage() {
  const router = useRouter();
  const {
    profile,
    isLoading,
    isEditing,
    isSaving,
    formData,
    setFormData,
    setIsEditing,
    handleSave,
    handleCancel,
  } = useProfile();

  if (isLoading) {
    return <ProfileLoading />;
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600">
            No se pudo cargar el perfil del usuario.
          </p>
          <Button onClick={() => router.push('/dashboard')} className="mt-4">
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>Editar Perfil</Button>
          )}
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <ProfileField
              label="Correo Electrónico"
              value={isEditing ? formData.email : profile.email}
              isEditing={isEditing}
              onChange={value => setFormData({ ...formData, email: value })}
              placeholder="correo@ejemplo.com"
              type="email"
            />

            <ProfileField
              label="Nombre"
              value={isEditing ? formData.firstName : profile.firstName}
              isEditing={isEditing}
              onChange={value => setFormData({ ...formData, firstName: value })}
              placeholder="Nombre"
            />

            <ProfileField
              label="Apellido"
              value={isEditing ? formData.lastName : profile.lastName}
              isEditing={isEditing}
              onChange={value => setFormData({ ...formData, lastName: value })}
              placeholder="Apellido"
            />

            <ProfileReadOnlyField label="Rol">
              {profile.role}
            </ProfileReadOnlyField>

            <ProfileReadOnlyField label="Estado">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  profile.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {profile.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </ProfileReadOnlyField>

            <ProfileReadOnlyField label="Fecha de Registro">
              {new Date(profile.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </ProfileReadOnlyField>

            {/* Action buttons */}
            {isEditing && (
              <div className="flex space-x-4 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

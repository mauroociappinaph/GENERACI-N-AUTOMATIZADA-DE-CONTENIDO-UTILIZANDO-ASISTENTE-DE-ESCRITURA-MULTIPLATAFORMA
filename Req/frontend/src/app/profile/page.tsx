'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/use-profile';
import { ProfileLoading } from '@/components/profile/profile-loading';
import { ProfileErrorState } from '@/components/profile/profile-error-state';
import { ProfileFormFields } from '@/components/profile/profile-form-fields';

export default function ProfilePage() {
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
    return <ProfileErrorState />;
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
          <ProfileFormFields
            profile={profile}
            isEditing={isEditing}
            formData={formData}
            setFormData={setFormData}
          />

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
        </Card>
      </div>
    </div>
  );
}

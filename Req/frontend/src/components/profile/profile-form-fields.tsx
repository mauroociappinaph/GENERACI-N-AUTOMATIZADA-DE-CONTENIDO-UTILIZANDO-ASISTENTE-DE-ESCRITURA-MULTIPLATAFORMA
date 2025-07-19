'use client';

import { ProfileField } from './profile-field';
import { ProfileReadOnlyField } from './profile-read-only-field';
import { UserResponse } from '@/types';

interface ProfileFormFieldsProps {
  profile: UserResponse;
  isEditing: boolean;
  formData: {
    email: string;
    firstName: string;
    lastName: string;
  };
  setFormData: (data: { email: string; firstName: string; lastName: string }) => void;
}

export function ProfileFormFields({
  profile,
  isEditing,
  formData,
  setFormData,
}: ProfileFormFieldsProps) {
  return (
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
    </div>
  );
}

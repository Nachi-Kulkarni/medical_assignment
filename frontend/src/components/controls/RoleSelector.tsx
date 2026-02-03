import { Role } from '../../types'
import { Stethoscope, User } from 'lucide-react'

interface RoleSelectorProps {
  value: Role
  onChange: (role: Role) => void
  disabled?: boolean
}

export function RoleSelector({ value, onChange, disabled = false }: RoleSelectorProps) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onChange('doctor')}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md transition-all
          ${value === 'doctor'
            ? 'bg-nao-navy text-white shadow-sm'
            : 'text-nao-gray hover:bg-gray-200'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <Stethoscope className="w-4 h-4" />
        <span>Doctor</span>
      </button>

      <button
        onClick={() => onChange('patient')}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md transition-all
          ${value === 'patient'
            ? 'bg-nao-green text-nao-navy shadow-sm'
            : 'text-nao-gray hover:bg-gray-200'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <User className="w-4 h-4" />
        <span>Patient</span>
      </button>
    </div>
  )
}

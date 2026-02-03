import { Language } from '../../types'

interface LanguageSelectorProps {
  value: Language
  onChange: (language: Language) => void
  disabled?: boolean
  label?: string
}

const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Spanish', flag: '🇲🇽' },
  { value: 'zh', label: 'Chinese', flag: '🇨🇳' },
  { value: 'vi', label: 'Vietnamese', flag: '🇻🇳' },
  { value: 'ko', label: 'Korean', flag: '🇰🇷' },
  { value: 'ar', label: 'Arabic', flag: '🇸🇦' },
  { value: 'fr', label: 'French', flag: '🇫🇷' },
]

export function LanguageSelector({ value, onChange, disabled = false, label }: LanguageSelectorProps) {
  const selected = LANGUAGES.find((lang) => lang.value === value)

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm text-gray-600">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Language)}
        disabled={disabled}
        className="px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-nao-green disabled:opacity-50"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
    </div>
  )
}

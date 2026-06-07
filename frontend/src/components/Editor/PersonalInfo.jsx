import { User, Upload, X } from 'lucide-react'
import { useRef } from 'react'
import { Accordion } from '../UI/Accordion'
import { Input } from '../UI/Input'
import useCvStore from '../../store/cvStore'

export function PersonalInfo() {
  const { cvData, updatePersonal, updateSetting } = useCvStore()
  const { personal, settings } = cvData
  const fileInputRef = useRef(null)

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => updatePersonal('photoPath', ev.target.result)
    reader.readAsDataURL(file)
  }

  function handleRemovePhoto() {
    updatePersonal('photoPath', '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <Accordion title="Persönliche Daten" icon={User} defaultOpen>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Input
            label="Full Name"
            placeholder="Rohan Shekar Thingalaya"
            value={personal.fullName}
            onChange={(e) => updatePersonal('fullName', e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <Input
            label="Professional Headline"
            placeholder="Senior Software Engineer • Solution Architect • Technical Lead"
            value={personal.headline || ''}
            onChange={(e) => updatePersonal('headline', e.target.value)}
          />
        </div>
        <Input
          label="Email"
          type="email"
          placeholder="rohan@example.com"
          value={personal.email}
          onChange={(e) => updatePersonal('email', e.target.value)}
        />
        <Input
          label="Phone"
          type="tel"
          placeholder="+49 123 456789"
          value={personal.phone}
          onChange={(e) => updatePersonal('phone', e.target.value)}
        />
        <div className="col-span-2">
          <Input
            label="Address / City"
            placeholder="Berlin, Germany"
            value={personal.address}
            onChange={(e) => updatePersonal('address', e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <Input
            label="LinkedIn URL"
            placeholder="linkedin.com/in/rohanthingalaya"
            value={personal.linkedin}
            onChange={(e) => updatePersonal('linkedin', e.target.value)}
          />
        </div>
      </div>

      {/* Optional fields toggles */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-1 space-y-2">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Optional Fields</p>

        {/* Photo upload */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.showPhoto}
            onChange={(e) => updateSetting('showPhoto', e.target.checked)}
            className="rounded border-slate-300"
          />
          <span className="text-xs text-slate-600 dark:text-slate-400">Show Photo (Bewerbungsfoto)</span>
        </label>
        {settings.showPhoto && (
          <div className="flex items-start gap-3 pt-1">
            {personal.photoPath ? (
              <div className="relative flex-shrink-0">
                <img
                  src={personal.photoPath}
                  alt="CV photo"
                  className="w-[66px] h-[85px] object-cover border border-slate-200 dark:border-slate-700 rounded"
                />
                <button
                  onClick={handleRemovePhoto}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center"
                  title="Remove photo"
                >
                  <X size={10} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center w-[66px] h-[85px] border-2 border-dashed border-slate-300 dark:border-slate-600 rounded hover:border-blue-400 dark:hover:border-blue-500 text-slate-400 hover:text-blue-500 transition-colors gap-1"
              >
                <Upload size={16} />
                <span className="text-[10px] text-center leading-tight">Upload photo</span>
              </button>
            )}
            <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
              <p className="font-medium text-slate-600 dark:text-slate-300 mb-0.5">Passport-style photo</p>
              <p>3.5 × 4.5 cm</p>
              <p>JPG or PNG</p>
              {personal.photoPath && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 text-blue-500 hover:text-blue-600 underline"
                >
                  Change
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.showDob}
            onChange={(e) => updateSetting('showDob', e.target.checked)}
            className="rounded border-slate-300"
          />
          <span className="text-xs text-slate-600 dark:text-slate-400">Show Date of Birth</span>
        </label>
        {settings.showDob && (
          <Input
            label="Date of Birth"
            type="date"
            value={personal.dob}
            onChange={(e) => updatePersonal('dob', e.target.value)}
          />
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.showNationality}
            onChange={(e) => updateSetting('showNationality', e.target.checked)}
            className="rounded border-slate-300"
          />
          <span className="text-xs text-slate-600 dark:text-slate-400">Show Place of Birth & Nationality</span>
        </label>
        {settings.showNationality && (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Place of Birth"
              placeholder="Mumbai, India"
              value={personal.placeOfBirth}
              onChange={(e) => updatePersonal('placeOfBirth', e.target.value)}
            />
            <Input
              label="Nationality"
              placeholder="Indian"
              value={personal.nationality}
              onChange={(e) => updatePersonal('nationality', e.target.value)}
            />
          </div>
        )}
      </div>
    </Accordion>
  )
}

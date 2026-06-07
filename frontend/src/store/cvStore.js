import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

const defaultCvData = {
  last_updated: new Date().toISOString(),
  personal: {
    fullName: '',
    headline: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    dob: '',
    placeOfBirth: '',
    nationality: '',
    photoPath: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
  interests: '',
  settings: {
    selectedTemplate: 'classic',
    showPhoto: false,
    showDob: false,
    showNationality: false,
    showInterests: true,
    showCefr: false,
    theme: 'light',
  },
}

const useCvStore = create((set, get) => ({
  // State
  cvData: defaultCvData,
  isDirty: false,
  isSaving: false,
  lastSaved: null,
  saveError: null,
  jdAnalysis: null,
  isAnalyzing: false,

  // Personal info
  updatePersonal: (field, value) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        personal: { ...state.cvData.personal, [field]: value },
        last_updated: new Date().toISOString(),
      },
      isDirty: true,
    })),

  // Summary
  updateSummary: (value) =>
    set((state) => ({
      cvData: { ...state.cvData, summary: value, last_updated: new Date().toISOString() },
      isDirty: true,
    })),

  // Experience
  addExperience: () =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        experience: [
          ...state.cvData.experience,
          {
            id: uuidv4(),
            title: '',
            company: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            bullets: [''],
          },
        ],
        last_updated: new Date().toISOString(),
      },
      isDirty: true,
    })),

  updateExperience: (id, field, value) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        experience: state.cvData.experience.map((exp) =>
          exp.id === id ? { ...exp, [field]: value } : exp
        ),
        last_updated: new Date().toISOString(),
      },
      isDirty: true,
    })),

  removeExperience: (id) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        experience: state.cvData.experience.filter((exp) => exp.id !== id),
        last_updated: new Date().toISOString(),
      },
      isDirty: true,
    })),

  reorderExperience: (newList) =>
    set((state) => ({
      cvData: { ...state.cvData, experience: newList, last_updated: new Date().toISOString() },
      isDirty: true,
    })),

  addExperienceBullet: (expId) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        experience: state.cvData.experience.map((exp) =>
          exp.id === expId ? { ...exp, bullets: [...exp.bullets, ''] } : exp
        ),
        last_updated: new Date().toISOString(),
      },
      isDirty: true,
    })),

  updateExperienceBullet: (expId, bulletIndex, value) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        experience: state.cvData.experience.map((exp) => {
          if (exp.id !== expId) return exp
          const bullets = [...exp.bullets]
          bullets[bulletIndex] = value
          return { ...exp, bullets }
        }),
        last_updated: new Date().toISOString(),
      },
      isDirty: true,
    })),

  removeExperienceBullet: (expId, bulletIndex) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        experience: state.cvData.experience.map((exp) => {
          if (exp.id !== expId) return exp
          const bullets = exp.bullets.filter((_, i) => i !== bulletIndex)
          return { ...exp, bullets: bullets.length > 0 ? bullets : [''] }
        }),
        last_updated: new Date().toISOString(),
      },
      isDirty: true,
    })),

  // Education
  addEducation: () =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        education: [
          ...state.cvData.education,
          { id: uuidv4(), degree: '', institution: '', location: '', startDate: '', endDate: '', details: '' },
        ],
        last_updated: new Date().toISOString(),
      },
      isDirty: true,
    })),

  updateEducation: (id, field, value) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        education: state.cvData.education.map((edu) =>
          edu.id === id ? { ...edu, [field]: value } : edu
        ),
        last_updated: new Date().toISOString(),
      },
      isDirty: true,
    })),

  removeEducation: (id) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        education: state.cvData.education.filter((edu) => edu.id !== id),
        last_updated: new Date().toISOString(),
      },
      isDirty: true,
    })),

  // Skills
  addSkillCategory: () =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        skills: [...state.cvData.skills, { id: uuidv4(), category: '', items: [] }],
        last_updated: new Date().toISOString(),
      },
      isDirty: true,
    })),

  updateSkillCategory: (id, field, value) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        skills: state.cvData.skills.map((skill) =>
          skill.id === id ? { ...skill, [field]: value } : skill
        ),
        last_updated: new Date().toISOString(),
      },
      isDirty: true,
    })),

  removeSkillCategory: (id) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        skills: state.cvData.skills.filter((skill) => skill.id !== id),
        last_updated: new Date().toISOString(),
      },
      isDirty: true,
    })),

  reorderSkills: (newList) =>
    set((state) => ({
      cvData: { ...state.cvData, skills: newList, last_updated: new Date().toISOString() },
      isDirty: true,
    })),

  // Languages
  addLanguage: () =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        languages: [...state.cvData.languages, { id: uuidv4(), language: '', level: '' }],
        last_updated: new Date().toISOString(),
      },
      isDirty: true,
    })),

  updateLanguage: (id, field, value) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        languages: state.cvData.languages.map((lang) =>
          lang.id === id ? { ...lang, [field]: value } : lang
        ),
        last_updated: new Date().toISOString(),
      },
      isDirty: true,
    })),

  removeLanguage: (id) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        languages: state.cvData.languages.filter((lang) => lang.id !== id),
        last_updated: new Date().toISOString(),
      },
      isDirty: true,
    })),

  // Certifications
  addCertification: () =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        certifications: [
          ...state.cvData.certifications,
          { id: uuidv4(), name: '', issuer: '', date: '' },
        ],
        last_updated: new Date().toISOString(),
      },
      isDirty: true,
    })),

  updateCertification: (id, field, value) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        certifications: state.cvData.certifications.map((cert) =>
          cert.id === id ? { ...cert, [field]: value } : cert
        ),
        last_updated: new Date().toISOString(),
      },
      isDirty: true,
    })),

  removeCertification: (id) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        certifications: state.cvData.certifications.filter((cert) => cert.id !== id),
        last_updated: new Date().toISOString(),
      },
      isDirty: true,
    })),

  // Interests
  updateInterests: (value) =>
    set((state) => ({
      cvData: { ...state.cvData, interests: value, last_updated: new Date().toISOString() },
      isDirty: true,
    })),

  // Settings
  updateSetting: (key, value) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        settings: { ...state.cvData.settings, [key]: value },
        last_updated: new Date().toISOString(),
      },
      isDirty: true,
    })),

  // JD Analysis
  setJdAnalysis: (analysis) => set({ jdAnalysis: analysis }),
  setIsAnalyzing: (val) => set({ isAnalyzing: val }),

  // Persistence
  setSaving: (val) => set({ isSaving: val }),
  setLastSaved: (ts) => set({ lastSaved: ts, isDirty: false }),
  setSaveError: (err) => set({ saveError: err }),

  loadCvData: (data) =>
    set({
      cvData: { ...defaultCvData, ...data },
      isDirty: false,
      lastSaved: data.last_updated || null,
    }),

  resetToDefault: () =>
    set({
      cvData: { ...defaultCvData, last_updated: new Date().toISOString() },
      isDirty: false,
      lastSaved: null,
    }),
}))

export default useCvStore

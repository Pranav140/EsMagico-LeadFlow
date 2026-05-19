import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createLead } from '../api/leads'
import { useFocusTrap } from '../hooks/useFocusTrap'
import type { Lead } from '../types'

interface AddLeadModalProps {
  isOpen: boolean
  onClose: () => void
  onLeadAdded: (lead: Lead) => void
}

interface FormState {
  name: string
  company: string
  phone: string
}

const EMPTY_FORM: FormState = { name: '', company: '', phone: '' }

export function AddLeadModal({ isOpen, onClose, onLeadAdded }: AddLeadModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [nameError, setNameError] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const nameRef    = useRef<HTMLInputElement>(null)
  const modalRef   = useRef<HTMLDivElement>(null)

  useFocusTrap(modalRef, isOpen)

  // Focus name input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => nameRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // ESC key to close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') handleClose()
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  const handleClose = () => {
    setForm(EMPTY_FORM)
    setNameError(false)
    setSubmitError(null)
    setLoading(false)
    onClose()
  }

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (field === 'name' && nameError) setNameError(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name.trim()) {
      setNameError(true)
      nameRef.current?.focus()
      return
    }

    setLoading(true)
    setSubmitError(null)

    try {
      const newLead = await createLead({
        name: form.name.trim(),
        company: form.company.trim() || undefined,
        phone: form.phone.trim() || undefined,
      })
      onLeadAdded(newLead)
      handleClose()
    } catch {
      setSubmitError('Failed to add lead. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      {/* Modal Card */}
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 id="modal-title" className="text-xl font-bold text-slate-900">
            Add New Lead
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-6 space-y-5">

            {/* Full Name */}
            <div>
              <label htmlFor="lead-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                ref={nameRef}
                id="lead-name"
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                placeholder="e.g., John Doe"
                disabled={loading}
                className={`w-full px-4 py-2.5 rounded-lg border text-slate-900 placeholder-slate-400 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all
                  disabled:opacity-60 disabled:cursor-not-allowed
                  ${nameError
                    ? 'border-red-400 bg-red-50 focus:ring-red-300/40 focus:border-red-400'
                    : 'border-slate-200 bg-white'
                  }`}
              />
              {nameError && (
                <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                  Name is required
                </p>
              )}
            </div>

            {/* Company */}
            <div>
              <label htmlFor="lead-company" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Company <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                id="lead-company"
                type="text"
                value={form.company}
                onChange={handleChange('company')}
                placeholder="e.g., Stark Industries"
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900
                  placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30
                  focus:border-blue-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="lead-phone" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Phone <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                id="lead-phone"
                type="tel"
                value={form.phone}
                onChange={handleChange('phone')}
                placeholder="e.g., 555-0123"
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900
                  placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30
                  focus:border-blue-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Submit error */}
            {submitError && (
              <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
                {submitError}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900
                hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700
                text-white text-sm font-semibold transition-colors shadow-sm
                disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Lead'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

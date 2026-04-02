import { ref, computed, type Ref } from 'vue'

/**
 * Minimal Zod-compatible schema interface.
 * Avoids hard dependency on Zod while supporting it when available.
 */
export interface FormSchema<T> {
  safeParse: (data: unknown) => {
    success: boolean
    error?: {
      issues: Array<{ path: (string | number)[]; message: string }>
    }
    data?: T
  }
}

export interface UseFormOptions<T extends Record<string, unknown>> {
  initialValues: T
  schema?: FormSchema<T>
}

export interface UseFormReturn<T extends Record<string, unknown>> {
  /** Current form values (reactive) */
  values: Ref<T>
  /** Validation errors per field */
  errors: Ref<Partial<Record<keyof T, string>>>
  /** Tracks which fields have been interacted with */
  touched: Ref<Partial<Record<keyof T, boolean>>>
  /** Whether the form has been modified from initial values */
  dirty: Ref<boolean>
  /** Whether the form is currently valid (no errors) */
  valid: Ref<boolean>
  /** Whether the form is currently submitting */
  submitting: Ref<boolean>
  /** Validate a single field (call on blur) */
  validateField: (field: keyof T) => void
  /** Validate the entire form */
  validate: () => boolean
  /** Submit the form with a handler function */
  submit: (handler: (values: T) => Promise<void> | void) => Promise<void>
  /** Reset form to initial values */
  reset: () => void
  /** Manually set an error on a field */
  setError: (field: keyof T, message: string) => void
  /** Mark a field as touched (call on blur) */
  touch: (field: keyof T) => void
}

/**
 * Generic form state management with optional Zod schema validation.
 *
 * Usage:
 * ```ts
 * const { values, errors, touched, dirty, valid, submit, reset } = useForm({
 *   initialValues: { name: '', email: '' },
 *   schema: myZodSchema, // optional
 * })
 * ```
 */
export function useForm<T extends Record<string, unknown>>(
  options: UseFormOptions<T>,
): UseFormReturn<T> {
  const { initialValues, schema } = options

  const values = ref<T>({ ...initialValues }) as Ref<T>
  const errors = ref<Partial<Record<keyof T, string>>>({}) as Ref<Partial<Record<keyof T, string>>>
  const touched = ref<Partial<Record<keyof T, boolean>>>({}) as Ref<Partial<Record<keyof T, boolean>>>
  const submitting = ref(false)

  const dirty = computed(() => {
    const keys = Object.keys(initialValues) as (keyof T)[]
    return keys.some((key) => values.value[key] !== initialValues[key])
  })

  const valid = computed(() => {
    const errorKeys = Object.keys(errors.value) as (keyof T)[]
    return errorKeys.every((key) => !errors.value[key])
  })

  function runSchemaValidation(): Partial<Record<keyof T, string>> {
    if (!schema) return {}
    const result = schema.safeParse(values.value)
    if (result.success) return {}
    const fieldErrors: Partial<Record<keyof T, string>> = {}
    for (const issue of result.error?.issues ?? []) {
      const field = issue.path[0] as keyof T
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = issue.message
      }
    }
    return fieldErrors
  }

  function validateField(field: keyof T): void {
    if (!schema) {
      // Without a schema, clear any manual error
      const next = { ...errors.value }
      delete next[field]
      errors.value = next
      return
    }
    const allErrors = runSchemaValidation()
    const next = { ...errors.value }
    if (allErrors[field]) {
      next[field] = allErrors[field]
    } else {
      delete next[field]
    }
    errors.value = next
  }

  function validate(): boolean {
    const allErrors = runSchemaValidation()
    errors.value = allErrors
    // Mark all fields as touched
    const allTouched: Partial<Record<keyof T, boolean>> = {}
    for (const key of Object.keys(initialValues) as (keyof T)[]) {
      allTouched[key] = true
    }
    touched.value = allTouched
    return Object.keys(allErrors).length === 0
  }

  async function submit(handler: (values: T) => Promise<void> | void): Promise<void> {
    if (!validate()) return
    submitting.value = true
    try {
      await handler(values.value)
    } finally {
      submitting.value = false
    }
  }

  function reset(): void {
    values.value = { ...initialValues }
    errors.value = {}
    touched.value = {}
  }

  function setError(field: keyof T, message: string): void {
    errors.value = { ...errors.value, [field]: message }
  }

  function touch(field: keyof T): void {
    touched.value = { ...touched.value, [field]: true }
    validateField(field)
  }

  return {
    values,
    errors,
    touched,
    dirty,
    valid,
    submitting,
    validateField,
    validate,
    submit,
    reset,
    setError,
    touch,
  }
}

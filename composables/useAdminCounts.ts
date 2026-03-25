interface AdminCounts {
  pendingPrescripteurs: number
  unreadContacts: number
}

const _counts = ref<AdminCounts>({ pendingPrescripteurs: 0, unreadContacts: 0 })
let _fetched = false

export function useAdminCounts() {
  async function refresh() {
    try {
      const stats = await $fetch<{
        pendingCount: number
        unreadContactsCount: number
      }>('/api/admin/stats')
      _counts.value = {
        pendingPrescripteurs: stats.pendingCount,
        unreadContacts: stats.unreadContactsCount,
      }
    } catch {
      // silently fail — badges are non-critical
    }
  }

  if (!_fetched) {
    _fetched = true
    refresh()
  }

  return { counts: _counts, refresh }
}

import { toast } from 'vue-sonner'

interface ActionMapEntry {
  id: number
  title: string
  date: string | null
}

/**
 * Checks if a jeune already has an inscription on the same date as a target action.
 * Shows a warning toast but does NOT block inscription.
 */
export function useConflictCheck() {
  const { inscriptions } = useAuth()

  function checkConflict(
    jeuneId: string,
    targetActionId: string,
    targetActionDate: string | null,
    actionMap: Map<string, ActionMapEntry>,
  ): boolean {
    if (!targetActionDate) return false

    const targetDate = targetActionDate.split('T')[0]

    const conflicting = inscriptions.value
      .filter(i => i.jeuneId === jeuneId && i.actionId !== targetActionId)
      .map(i => {
        const action = actionMap.get(i.actionId)
        return action ? { title: action.title, date: action.date } : null
      })
      .filter((a): a is { title: string; date: string | null } => a !== null)
      .filter(a => a.date && a.date.split('T')[0] === targetDate)

    if (conflicting.length > 0) {
      const names = conflicting.map(c => `"${c.title}"`).join(', ')
      toast.warning(
        `Attention : ce jeune est deja inscrit a ${names} le meme jour (${new Date(targetDate).toLocaleDateString('fr-FR')}).`,
        { duration: 6000 },
      )
      return true
    }

    return false
  }

  return { checkConflict }
}

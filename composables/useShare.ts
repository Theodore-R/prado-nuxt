import { toast } from 'vue-sonner'

export function usePradoShare() {
  const canNativeShare = computed(() =>
    import.meta.client && typeof navigator !== 'undefined' && !!navigator.share,
  )

  async function share(title: string, text: string, url: string) {
    if (canNativeShare.value) {
      try {
        await navigator.share({ title, text, url })
        return
      } catch {
        // User cancelled or share failed — fall through to copy
      }
    }
    await copyLink(url)
  }

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Lien copie dans le presse-papiers')
    } catch {
      toast.error('Impossible de copier le lien')
    }
  }

  function shareByEmail(title: string, url: string) {
    const subject = encodeURIComponent(`Decouvrez cette action : ${title}`)
    const body = encodeURIComponent(`Bonjour,\n\nJe vous partage cette action de Prado Itineraires :\n\n${title}\n${url}\n\nBonne decouverte !`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  function shareByWhatsApp(title: string, url: string) {
    const text = encodeURIComponent(`${title} — ${url}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return { share, copyLink, shareByEmail, shareByWhatsApp, canNativeShare }
}

import { z } from 'zod'
import { requireAdmin } from '~/server/utils/admin'
import { sendEmail, escapeHtml, formatDateFr } from '~/server/utils/email'

const bodySchema = z.object({
  recipients: z.array(z.string().email('Email invalide')).min(1, 'Au moins un destinataire requis').max(20),
})

export default defineEventHandler(async (event) => {
  const adminClient = await requireAdmin(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'id requis' })
  }

  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '),
    })
  }

  const { recipients } = parsed.data

  // Fetch action
  const { data: action, error: actionError } = await adminClient
    .from('actions')
    .select('*')
    .eq('id', id)
    .single()

  if (actionError || !action) {
    throw createError({ statusCode: 404, message: 'Action introuvable' })
  }

  // Fetch inscriptions with presence data
  const { data: inscriptions, error: inscError } = await adminClient
    .from('inscriptions')
    .select('id, presence, jeunes(first_name, last_name), prescripteurs(name)')
    .eq('action_id', id)
    .is('canceled_at', null)
    .order('created_at', { ascending: true })

  if (inscError) {
    throw createError({ statusCode: 500, message: inscError.message })
  }

  const inscList = inscriptions ?? []
  const totalInscrits = inscList.length
  const totalPresents = inscList.filter(i => i.presence === 'present').length
  const totalAbsents = inscList.filter(i => i.presence === 'absent').length
  const tauxPresence = totalInscrits > 0 ? Math.round((totalPresents / totalInscrits) * 100) : 0

  // Build participants table rows
  const participantRows = inscList.map(i => {
    const jeuneName = `${(i.jeunes as any)?.first_name ?? ''} ${(i.jeunes as any)?.last_name ?? ''}`.trim()
    const prescripteurName = (i.prescripteurs as any)?.name ?? ''
    const presenceLabel = i.presence === 'present' ? 'Present' : i.presence === 'absent' ? 'Absent' : 'En attente'
    const presenceColor = i.presence === 'present' ? '#22c55e' : i.presence === 'absent' ? '#ef4444' : '#f59e0b'
    return `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">${escapeHtml(jeuneName || 'Non renseigne')}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">${escapeHtml(prescripteurName)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;color:${presenceColor};">${presenceLabel}</td>
      </tr>`
  }).join('')

  const formattedDate = formatDateFr(action.date)
  const costDisplay = action.cost != null ? `${action.cost.toFixed(2)} EUR` : 'Non renseigne'

  const html = `
  <div style="background:#f6f5f3;padding:32px 16px;font-family:Arial,sans-serif;color:#1f1f1f;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e1d8;border-radius:12px;padding:24px;">
      <h1 style="margin:0 0 4px;font-size:20px;color:#024266;">Rapport d'action</h1>
      <p style="margin:0 0 20px;font-size:14px;color:#6b6b6b;">Genere le ${escapeHtml(new Date().toLocaleDateString('fr-FR'))}</p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#6b6b6b;width:140px;">Action</td>
          <td style="padding:6px 0;font-size:14px;font-weight:600;">${escapeHtml(action.title)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#6b6b6b;">Categorie</td>
          <td style="padding:6px 0;font-size:14px;">${escapeHtml(action.category ?? '')}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#6b6b6b;">Date</td>
          <td style="padding:6px 0;font-size:14px;">${escapeHtml(formattedDate)}${action.time ? ` a ${escapeHtml(action.time)}` : ''}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#6b6b6b;">Cout</td>
          <td style="padding:6px 0;font-size:14px;">${escapeHtml(costDisplay)}</td>
        </tr>
      </table>

      <div style="display:flex;gap:12px;margin-bottom:20px;">
        <div style="flex:1;background:#f0f9ff;border-radius:8px;padding:12px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:#024266;">${totalInscrits}</div>
          <div style="font-size:12px;color:#6b6b6b;">Inscrits</div>
        </div>
        <div style="flex:1;background:#f0fdf4;border-radius:8px;padding:12px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:#22c55e;">${totalPresents}</div>
          <div style="font-size:12px;color:#6b6b6b;">Presents</div>
        </div>
        <div style="flex:1;background:#fef2f2;border-radius:8px;padding:12px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:#ef4444;">${totalAbsents}</div>
          <div style="font-size:12px;color:#6b6b6b;">Absents</div>
        </div>
        <div style="flex:1;background:#fff7ed;border-radius:8px;padding:12px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:#FB6223;">${tauxPresence}%</div>
          <div style="font-size:12px;color:#6b6b6b;">Taux presence</div>
        </div>
      </div>

      ${totalInscrits > 0 ? `
      <h2 style="font-size:16px;margin:0 0 12px;color:#024266;">Participants</h2>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f8f8f6;">
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b6b6b;text-transform:uppercase;">Jeune</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b6b6b;text-transform:uppercase;">Prescripteur</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b6b6b;text-transform:uppercase;">Presence</th>
          </tr>
        </thead>
        <tbody>
          ${participantRows}
        </tbody>
      </table>
      ` : '<p style="font-size:14px;color:#6b6b6b;">Aucun participant inscrit.</p>'}
    </div>
  </div>`

  await sendEmail(recipients, `Rapport - ${action.title}`, html)

  return { success: true, sentTo: recipients.length }
})

import type { SupabaseClient } from '@supabase/supabase-js';

export async function fetchDashboardStats(client: SupabaseClient) {
  const [prescripteurs, jeunes, inscriptions, pending] = await Promise.all([
    client.from('prescripteurs').select('*', { count: 'exact', head: true }),
    client.from('jeunes').select('*', { count: 'exact', head: true }),
    client.from('inscriptions').select('*', { count: 'exact', head: true }),
    client.from('prescripteurs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);
  return {
    prescripteursCount: prescripteurs.count ?? 0,
    jeunesCount: jeunes.count ?? 0,
    inscriptionsCount: inscriptions.count ?? 0,
    pendingCount: pending.count ?? 0,
  };
}

export interface AdminPrescripteur {
  id: string; name: string; professional_email: string; structure: string;
  phone: string | null; role: string; status: string; created_at: string;
}

export async function fetchAllPrescripteurs(client: SupabaseClient): Promise<AdminPrescripteur[]> {
  const { data, error } = await client.from('prescripteurs').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function updatePrescripteurStatus(client: SupabaseClient, id: string, status: 'approved' | 'rejected') {
  const { error } = await client.from('prescripteurs').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
}

export interface AdminInscription {
  id: string; jeune_id: string; action_id: string; prescripteur_id: string;
  date: string; canceled_at: string | null; created_at: string;
  jeunes: { first_name: string; last_name: string } | null;
  prescripteurs: { name: string; professional_email: string } | null;
}

export async function fetchAllInscriptions(client: SupabaseClient): Promise<AdminInscription[]> {
  const { data, error } = await client.from('inscriptions')
    .select('*, jeunes(first_name, last_name), prescripteurs(name, professional_email)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ─── Actions (admin read-all, for inscription display) ───

export async function fetchAllActions(client: SupabaseClient) {
  const { data, error } = await client.from('actions').select('*').order('id', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

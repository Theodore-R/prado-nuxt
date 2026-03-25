import { fetchPrescripteur, fetchJeunes, fetchInscriptions, createJeune as apiCreateJeune, deleteJeune as apiDeleteJeune, updateJeune as apiUpdateJeune, createInscription as apiCreateInscription, cancelInscription as apiCancelInscription } from '~/lib/api';
import type { Jeune, Inscription, Prescripteur } from '~/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  structure: string;
  role: 'prescripteur' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
}

export function useAuth() {
  const client = useSupabaseClient();
  const supabaseUser = useSupabaseUser();

  const user = useState<User | null>('auth-user', () => null);
  const loading = useState<boolean>('auth-loading', () => true);
  const jeunes = useState<Jeune[]>('auth-jeunes', () => []);
  const jeunesLoading = useState<boolean>('auth-jeunes-loading', () => false);
  const inscriptions = useState<Inscription[]>('auth-inscriptions', () => []);

  const isAdmin = computed(() => user.value?.role === 'admin');

  const loadProfile = async (userId: string, email: string) => {
    const profile = await fetchPrescripteur(client, userId);
    if (profile) {
      user.value = { id: userId, email, name: profile.name, structure: profile.structure, role: profile.role, status: profile.status };
    }
  };

  const loadData = async () => {
    jeunesLoading.value = true;
    try {
      const [j, i] = await Promise.all([fetchJeunes(client), fetchInscriptions(client)]);
      jeunes.value = j;
      inscriptions.value = i;
    } catch { /* RLS returns empty if not authenticated */ }
    finally { jeunesLoading.value = false; }
  };

  const refreshData = async () => { await loadData(); };

  // Watch supabase user state
  watch(supabaseUser, async (newUser) => {
    if (newUser) {
      await loadProfile(newUser.id, newUser.email ?? '');
      await loadData();
    } else {
      user.value = null;
      jeunes.value = [];
      inscriptions.value = [];
    }
    loading.value = false;
  }, { immediate: true });

  const login = async (email: string, password: string) => {
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const logout = async () => {
    await client.auth.signOut();
    user.value = null;
    jeunes.value = [];
    inscriptions.value = [];
  };

  const register = async (data: { email: string; password: string; name: string; structure: string; fonction?: string; phone?: string }) => {
    const { error } = await client.auth.signUp({
      email: data.email, password: data.password,
      options: { data: { name: data.name, structure: data.structure, fonction: data.fonction ?? '', phone: data.phone ?? '' } },
    });
    if (error) return { error: error.message };
    return {};
  };

  const sendMagicLink = async (email: string) => {
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/connexion?step=profile` },
    });
    if (error) return { error: error.message };
    return {};
  };

  const completeProfile = async (data: { name: string; structure: string; fonction?: string; phone?: string }) => {
    if (!supabaseUser.value) return { error: 'Non authentifié' };

    // Update user metadata
    const { error: metaError } = await client.auth.updateUser({
      data: { name: data.name, structure: data.structure, fonction: data.fonction ?? '', phone: data.phone ?? '' },
    });
    if (metaError) return { error: metaError.message };

    // Upsert prescripteur row via server route (bypasses RLS)
    try {
      await $fetch('/api/complete-profile', {
        method: 'POST',
        body: data,
      });
    } catch (err: any) {
      return { error: err.data?.message ?? 'Erreur lors de la création du profil' };
    }

    await loadProfile(supabaseUser.value.id, supabaseUser.value.email ?? '');
    return {};
  };

  const resetPassword = async (email: string) => {
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/connexion?mode=reset`,
    });
    if (error) return { error: error.message };
    return {};
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await client.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    return {};
  };

  const addJeune = async (j: Omit<Jeune, 'id'>) => {
    if (!supabaseUser.value) return;
    const created = await apiCreateJeune(client, supabaseUser.value.id, j);
    jeunes.value = [created, ...jeunes.value];
  };

  const removeJeune = async (id: string) => {
    await apiDeleteJeune(client, id);
    jeunes.value = jeunes.value.filter(j => j.id !== id);
    inscriptions.value = inscriptions.value.filter(i => i.jeuneId !== id);
  };

  const editJeune = async (id: string, data: Partial<Omit<Jeune, 'id'>>) => {
    const updated = await apiUpdateJeune(client, id, data);
    jeunes.value = jeunes.value.map(j => j.id === id ? updated : j);
  };

  const updateProfile = async (data: { name: string; structure: string; fonction?: string; phone?: string }) => {
    if (!supabaseUser.value) return { error: 'Non authentifié' };

    try {
      await $fetch('/api/update-profile', {
        method: 'POST',
        body: data,
      });
    } catch (err: any) {
      return { error: err.data?.message ?? 'Erreur lors de la mise à jour' };
    }

    await loadProfile(supabaseUser.value.id, supabaseUser.value.email ?? '');
    return {};
  };

  const inscrire = async (actionId: string, jeuneId: string) => {
    if (!supabaseUser.value) return;
    const created = await apiCreateInscription(client, supabaseUser.value.id, actionId, jeuneId);
    inscriptions.value = [created, ...inscriptions.value];
  };

  const desinscrire = async (inscriptionId: string) => {
    await apiCancelInscription(client, inscriptionId);
    inscriptions.value = inscriptions.value.filter(i => i.id !== inscriptionId);
  };

  return {
    user, isAdmin, loading, jeunes, jeunesLoading, inscriptions,
    login, logout, register, sendMagicLink, completeProfile, resetPassword, updatePassword,
    addJeune, removeJeune, editJeune, inscrire, desinscrire, updateProfile, refreshData,
  };
}

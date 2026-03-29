export const usePageLegale = (uid: string) => {
  const { client } = usePrismic()
  return useAsyncData(`page-legale-${uid}`, async () => {
    try {
      return await client.getByUID('page_legale', uid)
    } catch {
      console.warn('[usePageLegale] Prismic fetch failed, using fallback data')
      // useAsyncData requires non-null return; empty object signals fetch failure (consumers check .data)
      return {} as Record<string, never>
    }
  }, { server: true, dedupe: 'defer' })
}

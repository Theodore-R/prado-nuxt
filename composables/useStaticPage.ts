export const useStaticPage = (uid: string) => {
  const { client } = usePrismic()
  return useAsyncData(`page-${uid}`, async () => {
    try {
      return await client.getByUID('page', uid)
    } catch {
      console.warn('[useStaticPage] Prismic fetch failed, using fallback data')
      // useAsyncData requires non-null return; empty object signals fetch failure (consumers check .data)
      return {} as Record<string, never>
    }
  }, { server: true, dedupe: 'defer' })
}

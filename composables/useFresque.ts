export const useFresque = () => {
  const { client } = usePrismic()
  return useAsyncData('fresque', async () => {
    try {
      return await client.getSingle('fresque')
    } catch {
      console.warn('[useFresque] Prismic fetch failed, using fallback data')
      // useAsyncData requires non-null return; empty object signals fetch failure (consumers check .data)
      return {} as Record<string, never>
    }
  }, { server: true, dedupe: 'defer' })
}

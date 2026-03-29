export const useFoodtruck = () => {
  const { client } = usePrismic()
  return useAsyncData('foodtruck', async () => {
    try {
      return await client.getSingle('foodtruck')
    } catch {
      console.warn('[useFoodtruck] Prismic fetch failed, using fallback data')
      // useAsyncData requires non-null return; empty object signals fetch failure (consumers check .data)
      return {} as Record<string, never>
    }
  }, { server: true, dedupe: 'defer' })
}

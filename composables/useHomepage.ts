export const useHomepage = () => {
  const { client } = usePrismic()

  return useAsyncData('homepage', async () => {
    try {
      return await client.getSingle('homepage')
    } catch {
      console.warn('[useHomepage] Prismic fetch failed, using fallback data')
      // useAsyncData requires non-null return; empty object signals fetch failure (consumers check .data)
      return {} as Record<string, never>
    }
  }, {
    server: true,
    dedupe: 'defer',
  })
}

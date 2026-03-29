export const useEducolab = () => {
  const { client } = usePrismic()
  return useAsyncData('educolab', async () => {
    try {
      return await client.getSingle('educolab')
    } catch {
      console.warn('[useEducolab] Prismic fetch failed, using fallback data')
      // useAsyncData requires non-null return; empty object signals fetch failure (consumers check .data)
      return {} as Record<string, never>
    }
  }, { server: true, dedupe: 'defer' })
}

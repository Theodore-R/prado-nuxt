export default defineNuxtPlugin(async () => {
  try {
    const settings = await $fetch<{
      clarityEnabled?: boolean
      clarityProjectId?: string
    }>('/api/settings/analytics')

    if (!settings?.clarityEnabled || !settings?.clarityProjectId) return

    const projectId = settings.clarityProjectId

    // Inject Clarity script
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.textContent = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${projectId}");
    `
    document.head.appendChild(script)
  } catch {
    // Silent — analytics is non-critical
  }
})

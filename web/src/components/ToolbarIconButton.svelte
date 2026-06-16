<script>
  /** @type {{
    label: string,
    title?: string,
    onclick: () => void,
    children: import('svelte').Snippet,
  }} */
  let { label, title = label, onclick, children } = $props();
</script>

<button type="button" class="toolbar-icon-btn" aria-label={label} {title} {onclick}>
  {@render children()}
</button>

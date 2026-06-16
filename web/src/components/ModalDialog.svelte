<script>
  /** @type {{
    open: boolean,
    title: string,
    titleId: string,
    onClose: () => void,
    children: import('svelte').Snippet,
  }} */
  let { open, title, titleId, onClose, children } = $props();

  let closeButton = $state(/** @type {HTMLButtonElement | null} */ (null));
  let dialog = $state(/** @type {HTMLDivElement | null} */ (null));
  /** @type {HTMLElement | null} */
  let restoreFocus = null;

  /** @param {KeyboardEvent} event */
  function handleDialogKeydown(event) {
    if (event.key === 'Escape') {
      onClose();
      return;
    }
    if (event.key !== 'Tab' || !dialog) return;

    const focusable = dialog.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable.length) return;

    const first = /** @type {HTMLElement} */ (focusable[0]);
    const last = /** @type {HTMLElement} */ (focusable[focusable.length - 1]);
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  $effect(() => {
    if (!open) return;

    restoreFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    queueMicrotask(() => closeButton?.focus());

    return () => {
      restoreFocus?.focus();
      restoreFocus = null;
    };
  });
</script>

{#if open}
  <div class="modal-backdrop" onclick={onClose} role="presentation" aria-hidden="true"></div>
  <div class="modal-wrap" role="presentation">
    <div
      class="modal-dialog"
      role="dialog"
      aria-labelledby={titleId}
      aria-modal="true"
      tabindex="-1"
      bind:this={dialog}
      onkeydown={handleDialogKeydown}
    >
      <div class="modal-head">
        <h2 id={titleId}>{title}</h2>
        <button type="button" class="modal-close" aria-label="Close" bind:this={closeButton} onclick={onClose}>×</button>
      </div>
      <div class="modal-body">
        {@render children()}
      </div>
    </div>
  </div>
{/if}

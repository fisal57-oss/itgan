// Itgan cross-system integration links
// Kept in a separate file so production links can be changed without touching core app logic.
window.ITGAN_INTEGRATION = Object.freeze({
  version: '1.0.0',
  almasrahUrl: 'https://fisal57-oss.github.io/almasrah/',
  itganUrl: 'https://fisal57-oss.github.io/itgan/',
  openAlmasrah(params = {}) {
    const url = new URL(this.almasrahUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  }
});

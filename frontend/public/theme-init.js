// Apply the saved/device appearance before the app paints.
(function () {
  var preference = 'system';
  try {
    var saved = localStorage.getItem('gamehouse-theme');
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch (_) {}
  var systemDark = Boolean(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  var theme = preference === 'dark' || (preference === 'system' && systemDark) ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#151b17' : '#263c30');
})();

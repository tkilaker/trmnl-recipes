// Passes the /hn.json snapshot through, adding a short Stockholm time label.
function capturedLabel(local) {
  const match = String(local).match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}\.\d{2})$/);
  if (!match) return String(local);
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date()).map(part => [part.type, part.value]));
  const today = `${parts.year}-${parts.month}-${parts.day}`;
  return today === `${match[1]}-${match[2]}-${match[3]}` ? match[4] : `${Number(match[3])}/${Number(match[2])} ${match[4]}`;
}

function transform(input) {
  const items = (input?.items || []).slice(0, 12).map(it => ({
    title: String(it.title || ''),
    domain: String(it.domain || ''),
    score: Number(it.score) || 0,
    comments: Number(it.comments) || 0
  }));
  return { capturedLabel: capturedLabel(input?.capturedAtLocal || ''), items };
}

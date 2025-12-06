// Devuelve la fecha/hora local de Argentina (America/Argentina/Buenos_Aires) en formato 'YYYY-MM-DD HH:mm:ss'
function getFechaArgentina() {
  const now = new Date();
  const options = {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  // Formato: DD/MM/YYYY, HH:MM:SS
  const parts = new Intl.DateTimeFormat('en-GB', options).formatToParts(now);
  const get = (type) => parts.find(p => p.type === type).value;
  // YYYY-MM-DD HH:mm:ss
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
}

module.exports = getFechaArgentina;

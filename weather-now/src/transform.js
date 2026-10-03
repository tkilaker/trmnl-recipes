// Open-Meteo forecast -> what matters today: now, the next hours, and whether
// rain or snow is coming in the next two days.
const TEXT = {
  0: 'Klart', 1: 'Mest klart', 2: 'Halvklart', 3: 'Mulet', 45: 'Dimma', 48: 'Dimma',
  51: 'Lätt duggregn', 53: 'Duggregn', 55: 'Kraftigt duggregn', 56: 'Underkylt duggregn', 57: 'Underkylt duggregn',
  61: 'Lätt regn', 63: 'Regn', 65: 'Kraftigt regn', 66: 'Underkylt regn', 67: 'Underkylt regn',
  71: 'Lätt snöfall', 73: 'Snöfall', 75: 'Kraftigt snöfall', 77: 'Snökorn',
  80: 'Regnskurar', 81: 'Regnskurar', 82: 'Kraftiga skurar', 85: 'Snöbyar', 86: 'Kraftiga snöbyar',
  95: 'Åska', 96: 'Åska med hagel', 99: 'Åska med hagel'
};
const DAYS = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];
const DIRS = ['N', 'NO', 'O', 'SO', 'S', 'SV', 'V', 'NV'];

const round = value => Math.round(Number(value) || 0);
const mm = value => (Math.round((Number(value) || 0) * 10) / 10).toString().replace('.', ',');
const isSnow = code => [71, 73, 75, 77, 85, 86].includes(code);
const dayName = (date, today) => {
  const diff = Math.round((Date.parse(date) - Date.parse(today)) / 86400000);
  return diff === 0 ? 'Idag' : diff === 1 ? 'Imorgon' : DAYS[new Date(`${date}T12:00:00`).getDay()];
};

function outlook(hourly, start, today) {
  const wet = [];
  for (let i = start; i < Math.min(start + 48, hourly.time.length); i++) {
    if (hourly.precipitation[i] >= 0.2 || hourly.precipitation_probability[i] >= 60) wet.push(i);
  }
  if (!wet.length) return 'Inget regn väntas de närmaste två dygnen';
  const first = wet[0];
  let last = first;
  while (wet.includes(last + 1)) last++;
  const total = hourly.precipitation.slice(first, last + 1).reduce((sum, value) => sum + value, 0);
  const kind = hourly.weather_code.slice(first, last + 1).some(isSnow) ? 'Snö' : 'Regn';
  const date = hourly.time[first].slice(0, 10);
  const when = first === start ? 'nu' : `${dayName(date, today).toLowerCase()} från ${hourly.time[first].slice(11, 13)}`;
  return `${kind} ${when}, ${last - first + 1} h${total >= 0.1 ? `, ${mm(total)} mm` : ''}`;
}

function transform(input) {
  const current = input?.current || {};
  const hourly = input?.hourly || { time: [] };
  const daily = input?.daily || { time: [] };
  const today = daily.time[0] || String(current.time || '').slice(0, 10);
  const start = Math.max(0, hourly.time.findIndex(time => time >= String(current.time || '').slice(0, 13)));
  const hours = [];
  for (let i = start + 1; i < hourly.time.length && hours.length < 6; i += 2) {
    hours.push({
      time: hourly.time[i].slice(11, 13),
      temp: round(hourly.temperature_2m[i]),
      precip: mm(hourly.precipitation[i]),
      prob: round(hourly.precipitation_probability[i])
    });
  }
  // 48 hourly bars; 4 mm/h fills the chart, any measurable rain shows at least a sliver.
  const rain = [];
  for (let i = start; i < Math.min(start + 48, hourly.time.length); i++) {
    const amount = Number(hourly.precipitation[i]) || 0;
    const hour = hourly.time[i].slice(11, 13);
    rain.push({
      height: amount > 0 ? Math.max(6, Math.min(100, Math.round(amount / 4 * 100))) : 0,
      likely: hourly.precipitation_probability[i] >= 50,
      tick: i === start ? 'Nu' : i - start < 4 ? '' : hour === '00' ? DAYS[new Date(`${hourly.time[i].slice(0, 10)}T12:00:00`).getDay()] : hour === '12' ? '12' : ''
    });
  }
  return {
    rain,
    rainMax: mm(Math.max(0, ...hourly.precipitation.slice(start, start + 48))),
    updated: String(current.time || '').slice(11, 16).replace(':', '.'),
    now: {
      temp: round(current.temperature_2m),
      feels: round(current.apparent_temperature),
      text: TEXT[current.weather_code] || '',
      precip: mm(current.precipitation),
      wind: round(current.wind_speed_10m),
      gust: round(current.wind_gusts_10m),
      dir: DIRS[Math.round((Number(current.wind_direction_10m) || 0) / 45) % 8]
    },
    outlook: hourly.time.length ? outlook(hourly, start, today) : '',
    hours,
    days: daily.time.map((date, i) => ({
      name: dayName(date, today),
      text: TEXT[daily.weather_code[i]] || '',
      max: round(daily.temperature_2m_max[i]),
      min: round(daily.temperature_2m_min[i]),
      precip: mm(daily.precipitation_sum[i]),
      prob: round(daily.precipitation_probability_max[i])
    }))
  };
}

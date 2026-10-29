const fs = require('fs');
const path = require('path');

const COUNTRY_MAP = {
  ad: { name: 'Andorra', flag: '🇦🇩', region: 'Europe' },
  ae: { name: 'United Arab Emirates', flag: '🇦🇪', region: 'Middle East' },
  af: { name: 'Afghanistan', flag: '🇦🇫', region: 'Asia' },
  ag: { name: 'Antigua and Barbuda', flag: '🇦🇬', region: 'Americas' },
  al: { name: 'Albania', flag: '🇦🇱', region: 'Europe' },
  am: { name: 'Armenia', flag: '🇦🇲', region: 'Asia' },
  ao: { name: 'Angola', flag: '🇦🇴', region: 'Africa' },
  ar: { name: 'Argentina', flag: '🇦🇷', region: 'Americas' },
  at: { name: 'Austria', flag: '🇦🇹', region: 'Europe' },
  au: { name: 'Australia', flag: '🇦🇺', region: 'Oceania' },
  aw: { name: 'Aruba', flag: '🇦🇼', region: 'Americas' },
  az: { name: 'Azerbaijan', flag: '🇦🇿', region: 'Asia' },
  ba: { name: 'Bosnia and Herzegovina', flag: '🇧🇦', region: 'Europe' },
  bb: { name: 'Barbados', flag: '🇧🇧', region: 'Americas' },
  bd: { name: 'Bangladesh', flag: '🇧🇩', region: 'Asia' },
  be: { name: 'Belgium', flag: '🇧🇪', region: 'Europe' },
  bf: { name: 'Burkina Faso', flag: '🇧🇫', region: 'Africa' },
  bg: { name: 'Bulgaria', flag: '🇧🇬', region: 'Europe' },
  bh: { name: 'Bahrain', flag: '🇧🇭', region: 'Middle East' },
  bi: { name: 'Burundi', flag: '🇧🇮', region: 'Africa' },
  bj: { name: 'Benin', flag: '🇧🇯', region: 'Africa' },
  bm: { name: 'Bermuda', flag: '🇧🇲', region: 'Americas' },
  bn: { name: 'Brunei', flag: '🇧🇳', region: 'Asia' },
  bo: { name: 'Bolivia', flag: '🇧🇴', region: 'Americas' },
  bq: { name: 'Bonaire', flag: '🇧🇶', region: 'Americas' },
  br: { name: 'Brazil', flag: '🇧🇷', region: 'Americas' },
  bs: { name: 'Bahamas', flag: '🇧🇸', region: 'Americas' },
  bw: { name: 'Botswana', flag: '🇧🇼', region: 'Africa' },
  by: { name: 'Belarus', flag: '🇧🇾', region: 'Europe' },
  bz: { name: 'Belize', flag: '🇧🇿', region: 'Americas' },
  ca: { name: 'Canada', flag: '🇨🇦', region: 'Americas' },
  cd: { name: 'DR Congo', flag: '🇨🇩', region: 'Africa' },
  cf: { name: 'Central African Republic', flag: '🇨🇫', region: 'Africa' },
  cg: { name: 'Republic of the Congo', flag: '🇨🇬', region: 'Africa' },
  ch: { name: 'Switzerland', flag: '🇨🇭', region: 'Europe' },
  ci: { name: 'Ivory Coast', flag: '🇨🇮', region: 'Africa' },
  cl: { name: 'Chile', flag: '🇨🇱', region: 'Americas' },
  cm: { name: 'Cameroon', flag: '🇨🇲', region: 'Africa' },
  cn: { name: 'China', flag: '🇨🇳', region: 'Asia' },
  co: { name: 'Colombia', flag: '🇨🇴', region: 'Americas' },
  cr: { name: 'Costa Rica', flag: '🇨🇷', region: 'Americas' },
  cu: { name: 'Cuba', flag: '🇨🇺', region: 'Americas' },
  cv: { name: 'Cape Verde', flag: '🇨🇻', region: 'Africa' },
  cw: { name: 'Curaçao', flag: '🇨🇼', region: 'Americas' },
  cy: { name: 'Cyprus', flag: '🇨🇾', region: 'Europe' },
  cz: { name: 'Czech Republic', flag: '🇨🇿', region: 'Europe' },
  de: { name: 'Germany', flag: '🇩🇪', region: 'Europe' },
  dj: { name: 'Djibouti', flag: '🇩🇯', region: 'Africa' },
  dk: { name: 'Denmark', flag: '🇩🇰', region: 'Europe' },
  dm: { name: 'Dominica', flag: '🇩🇲', region: 'Americas' },
  do: { name: 'Dominican Republic', flag: '🇩🇴', region: 'Americas' },
  dz: { name: 'Algeria', flag: '🇩🇿', region: 'Africa' },
  ec: { name: 'Ecuador', flag: '🇪🇨', region: 'Americas' },
  ee: { name: 'Estonia', flag: '🇪🇪', region: 'Europe' },
  eg: { name: 'Egypt', flag: '🇪🇬', region: 'Middle East' },
  eh: { name: 'Western Sahara', flag: '🇪🇭', region: 'Africa' },
  er: { name: 'Eritrea', flag: '🇪🇷', region: 'Africa' },
  es: { name: 'Spain', flag: '🇪🇸', region: 'Europe' },
  et: { name: 'Ethiopia', flag: '🇪🇹', region: 'Africa' },
  fi: { name: 'Finland', flag: '🇫🇮', region: 'Europe' },
  fj: { name: 'Fiji', flag: '🇫🇯', region: 'Oceania' },
  fm: { name: 'Micronesia', flag: '🇫🇲', region: 'Oceania' },
  fo: { name: 'Faroe Islands', flag: '🇫🇴', region: 'Europe' },
  fr: { name: 'France', flag: '🇫🇷', region: 'Europe' },
  ga: { name: 'Gabon', flag: '🇬🇦', region: 'Africa' },
  ge: { name: 'Georgia', flag: '🇬🇪', region: 'Asia' },
  gf: { name: 'French Guiana', flag: '🇬🇫', region: 'Americas' },
  gh: { name: 'Ghana', flag: '🇬🇭', region: 'Africa' },
  gl: { name: 'Greenland', flag: '🇬🇱', region: 'Americas' },
  gm: { name: 'Gambia', flag: '🇬🇲', region: 'Africa' },
  gn: { name: 'Guinea', flag: '🇬🇳', region: 'Africa' },
  gp: { name: 'Guadeloupe', flag: '🇬🇵', region: 'Americas' },
  gq: { name: 'Equatorial Guinea', flag: '🇬🇶', region: 'Africa' },
  gr: { name: 'Greece', flag: '🇬🇷', region: 'Europe' },
  gt: { name: 'Guatemala', flag: '🇬🇹', region: 'Americas' },
  gu: { name: 'Guam', flag: '🇬🇺', region: 'Oceania' },
  gy: { name: 'Guyana', flag: '🇬🇾', region: 'Americas' },
  hk: { name: 'Hong Kong', flag: '🇭🇰', region: 'Asia' },
  hn: { name: 'Honduras', flag: '🇭🇳', region: 'Americas' },
  hr: { name: 'Croatia', flag: '🇭🇷', region: 'Europe' },
  ht: { name: 'Haiti', flag: '🇭🇹', region: 'Americas' },
  hu: { name: 'Hungary', flag: '🇭🇺', region: 'Europe' },
  id: { name: 'Indonesia', flag: '🇮🇩', region: 'Asia' },
  ie: { name: 'Ireland', flag: '🇮🇪', region: 'Europe' },
  il: { name: 'Israel', flag: '🇮🇱', region: 'Middle East' },
  in: { name: 'India', flag: '🇮🇳', region: 'Asia' },
  iq: { name: 'Iraq', flag: '🇮🇶', region: 'Middle East' },
  ir: { name: 'Iran', flag: '🇮🇷', region: 'Middle East' },
  is: { name: 'Iceland', flag: '🇮🇸', region: 'Europe' },
  it: { name: 'Italy', flag: '🇮🇹', region: 'Europe' },
  jm: { name: 'Jamaica', flag: '🇯🇲', region: 'Americas' },
  jo: { name: 'Jordan', flag: '🇯🇴', region: 'Middle East' },
  jp: { name: 'Japan', flag: '🇯🇵', region: 'Asia' },
  ke: { name: 'Kenya', flag: '🇰🇪', region: 'Africa' },
  kg: { name: 'Kyrgyzstan', flag: '🇰🇬', region: 'Asia' },
  kh: { name: 'Cambodia', flag: '🇰🇭', region: 'Asia' },
  km: { name: 'Comoros', flag: '🇰🇲', region: 'Africa' },
  kn: { name: 'Saint Kitts and Nevis', flag: '🇰🇳', region: 'Americas' },
  kp: { name: 'North Korea', flag: '🇰🇵', region: 'Asia' },
  kr: { name: 'South Korea', flag: '🇰🇷', region: 'Asia' },
  kw: { name: 'Kuwait', flag: '🇰🇼', region: 'Middle East' },
  kz: { name: 'Kazakhstan', flag: '🇰🇿', region: 'Asia' },
  la: { name: 'Laos', flag: '🇱🇦', region: 'Asia' },
  lb: { name: 'Lebanon', flag: '🇱🇧', region: 'Middle East' },
  lc: { name: 'Saint Lucia', flag: '🇱🇨', region: 'Americas' },
  li: { name: 'Liechtenstein', flag: '🇱🇮', region: 'Europe' },
  lk: { name: 'Sri Lanka', flag: '🇱🇰', region: 'Asia' },
  lr: { name: 'Liberia', flag: '🇱🇷', region: 'Africa' },
  lu: { name: 'Luxembourg', flag: '🇱🇺', region: 'Europe' },
  lv: { name: 'Latvia', flag: '🇱🇻', region: 'Europe' },
  ly: { name: 'Libya', flag: '🇱🇾', region: 'Africa' },
  ma: { name: 'Morocco', flag: '🇲🇦', region: 'Africa' },
  mc: { name: 'Monaco', flag: '🇲🇨', region: 'Europe' },
  md: { name: 'Moldova', flag: '🇲🇩', region: 'Europe' },
  me: { name: 'Montenegro', flag: '🇲🇪', region: 'Europe' },
  mg: { name: 'Madagascar', flag: '🇲🇬', region: 'Africa' },
  mk: { name: 'North Macedonia', flag: '🇲🇰', region: 'Europe' },
  ml: { name: 'Mali', flag: '🇲🇱', region: 'Africa' },
  mm: { name: 'Myanmar', flag: '🇲🇲', region: 'Asia' },
  mn: { name: 'Mongolia', flag: '🇲🇳', region: 'Asia' },
  mo: { name: 'Macau', flag: '🇲🇴', region: 'Asia' },
  mq: { name: 'Martinique', flag: '🇲🇶', region: 'Americas' },
  mr: { name: 'Mauritania', flag: '🇲🇷', region: 'Africa' },
  mt: { name: 'Malta', flag: '🇲🇹', region: 'Europe' },
  mu: { name: 'Mauritius', flag: '🇲🇺', region: 'Africa' },
  mv: { name: 'Maldives', flag: '🇲🇻', region: 'Asia' },
  mw: { name: 'Malawi', flag: '🇲🇼', region: 'Africa' },
  mx: { name: 'Mexico', flag: '🇲🇽', region: 'Americas' },
  my: { name: 'Malaysia', flag: '🇲🇾', region: 'Asia' },
  mz: { name: 'Mozambique', flag: '🇲🇿', region: 'Africa' },
  na: { name: 'Namibia', flag: '🇳🇦', region: 'Africa' },
  nc: { name: 'New Caledonia', flag: '🇳🇨', region: 'Oceania' },
  ne: { name: 'Niger', flag: '🇳🇪', region: 'Africa' },
  ng: { name: 'Nigeria', flag: '🇳🇬', region: 'Africa' },
  ni: { name: 'Nicaragua', flag: '🇳🇮', region: 'Americas' },
  nl: { name: 'Netherlands', flag: '🇳🇱', region: 'Europe' },
  no: { name: 'Norway', flag: '🇳🇴', region: 'Europe' },
  np: { name: 'Nepal', flag: '🇳🇵', region: 'Asia' },
  nz: { name: 'New Zealand', flag: '🇳🇿', region: 'Oceania' },
  om: { name: 'Oman', flag: '🇴🇲', region: 'Middle East' },
  pa: { name: 'Panama', flag: '🇵🇦', region: 'Americas' },
  pe: { name: 'Peru', flag: '🇵🇪', region: 'Americas' },
  pf: { name: 'French Polynesia', flag: '🇵🇫', region: 'Oceania' },
  pg: { name: 'Papua New Guinea', flag: '🇵🇬', region: 'Oceania' },
  ph: { name: 'Philippines', flag: '🇵🇭', region: 'Asia' },
  pk: { name: 'Pakistan', flag: '🇵🇰', region: 'Asia' },
  pl: { name: 'Poland', flag: '🇵🇱', region: 'Europe' },
  pr: { name: 'Puerto Rico', flag: '🇵🇷', region: 'Americas' },
  ps: { name: 'Palestine', flag: '🇵🇸', region: 'Middle East' },
  pt: { name: 'Portugal', flag: '🇵🇹', region: 'Europe' },
  py: { name: 'Paraguay', flag: '🇵🇾', region: 'Americas' },
  qa: { name: 'Qatar', flag: '🇶🇦', region: 'Middle East' },
  ro: { name: 'Romania', flag: '🇷🇴', region: 'Europe' },
  rs: { name: 'Serbia', flag: '🇷🇸', region: 'Europe' },
  ru: { name: 'Russia', flag: '🇷🇺', region: 'Europe' },
  rw: { name: 'Rwanda', flag: '🇷🇼', region: 'Africa' },
  sa: { name: 'Saudi Arabia', flag: '🇸🇦', region: 'Middle East' },
  sd: { name: 'Sudan', flag: '🇸🇩', region: 'Africa' },
  se: { name: 'Sweden', flag: '🇸🇪', region: 'Europe' },
  sg: { name: 'Singapore', flag: '🇸🇬', region: 'Asia' },
  si: { name: 'Slovenia', flag: '🇸🇮', region: 'Europe' },
  sk: { name: 'Slovakia', flag: '🇸🇰', region: 'Europe' },
  sl: { name: 'Sierra Leone', flag: '🇸🇱', region: 'Africa' },
  sm: { name: 'San Marino', flag: '🇸🇲', region: 'Europe' },
  sn: { name: 'Senegal', flag: '🇸🇳', region: 'Africa' },
  so: { name: 'Somalia', flag: '🇸🇴', region: 'Africa' },
  sr: { name: 'Suriname', flag: '🇸🇷', region: 'Americas' },
  st: { name: 'São Tomé and Príncipe', flag: '🇸🇹', region: 'Africa' },
  sv: { name: 'El Salvador', flag: '🇸🇻', region: 'Americas' },
  sx: { name: 'Sint Maarten', flag: '🇸🇽', region: 'Americas' },
  sy: { name: 'Syria', flag: '🇸🇾', region: 'Middle East' },
  td: { name: 'Chad', flag: '🇹🇩', region: 'Africa' },
  tg: { name: 'Togo', flag: '🇹🇬', region: 'Africa' },
  th: { name: 'Thailand', flag: '🇹🇭', region: 'Asia' },
  tj: { name: 'Tajikistan', flag: '🇹🇯', region: 'Asia' },
  tl: { name: 'Timor-Leste', flag: '🇹🇱', region: 'Asia' },
  tm: { name: 'Turkmenistan', flag: '🇹🇲', region: 'Asia' },
  tn: { name: 'Tunisia', flag: '🇹🇳', region: 'Africa' },
  tr: { name: 'Turkey', flag: '🇹🇷', region: 'Europe' },
  tt: { name: 'Trinidad and Tobago', flag: '🇹🇹', region: 'Americas' },
  tw: { name: 'Taiwan', flag: '🇹🇼', region: 'Asia' },
  tz: { name: 'Tanzania', flag: '🇹🇿', region: 'Africa' },
  ua: { name: 'Ukraine', flag: '🇺🇦', region: 'Europe' },
  ug: { name: 'Uganda', flag: '🇺🇬', region: 'Africa' },
  uk: { name: 'United Kingdom', flag: '🇬🇧', region: 'Europe' },
  us: { name: 'United States', flag: '🇺🇸', region: 'Americas' },
  uy: { name: 'Uruguay', flag: '🇺🇾', region: 'Americas' },
  uz: { name: 'Uzbekistan', flag: '🇺🇿', region: 'Asia' },
  va: { name: 'Vatican City', flag: '🇻🇦', region: 'Europe' },
  vc: { name: 'Saint Vincent', flag: '🇻🇨', region: 'Americas' },
  ve: { name: 'Venezuela', flag: '🇻🇪', region: 'Americas' },
  vg: { name: 'British Virgin Islands', flag: '🇻🇬', region: 'Americas' },
  vi: { name: 'U.S. Virgin Islands', flag: '🇻🇮', region: 'Americas' },
  vn: { name: 'Vietnam', flag: '🇻🇳', region: 'Asia' },
  ws: { name: 'Samoa', flag: '🇼🇸', region: 'Oceania' },
  xk: { name: 'Kosovo', flag: '🇽🇰', region: 'Europe' },
  ye: { name: 'Yemen', flag: '🇾🇪', region: 'Middle East' },
  yt: { name: 'Mayotte', flag: '🇾🇹', region: 'Africa' },
  za: { name: 'South Africa', flag: '🇿🇦', region: 'Africa' },
  zm: { name: 'Zambia', flag: '🇿🇲', region: 'Africa' },
  zw: { name: 'Zimbabwe', flag: '🇿🇼', region: 'Africa' }
};

function detectCategory(name, tvgId) {
  const n = (name + ' ' + (tvgId || '')).toLowerCase();
  if (n.includes('news') || n.includes('noticias') || n.includes('nachrichten') || n.includes('journal') || n.includes('tak') || n.includes('samachar') || n.includes('khabar') || n.includes('wion') || n.includes('republic') || n.includes('abp') || n.includes('ndtv') || n.includes('cnn') || n.includes('bbc') || n.includes('cbs') || n.includes('nbc') || n.includes('abc') || n.includes('fox') || n.includes('sky')) {
    return 'News';
  }
  if (n.includes('music') || n.includes('mtv') || n.includes('musica') || n.includes('musik') || n.includes('9xm') || n.includes('sangeet') || n.includes('hit') || n.includes('radio') || n.includes('tunes')) {
    return 'Music';
  }
  if (n.includes('sport') || n.includes('deporte') || n.includes('espn') || n.includes('futbol') || n.includes('cricket') || n.includes('tennis') || n.includes('racing') || n.includes('motor') || n.includes('fight') || n.includes('golf') || n.includes('euro')) {
    return 'Sports';
  }
  if (n.includes('movie') || n.includes('cinema') || n.includes('cine') || n.includes('film') || n.includes('kino') || n.includes('pelicula') || n.includes('flix') || n.includes('action') || n.includes('comedy') || n.includes('drama')) {
    return 'Movies';
  }
  if (n.includes('kid') || n.includes('cartoon') || n.includes('toon') || n.includes('disney') || n.includes('nickelodeon') || n.includes('nick') || n.includes('pogo') || n.includes('infantil') || n.includes('enfant') || n.includes('baby') || n.includes('junior')) {
    return 'Kids';
  }
  if (n.includes('relig') || n.includes('church') || n.includes('faith') || n.includes('gospel') || n.includes('bible') || n.includes('god') || n.includes('jesus') || n.includes('quran') || n.includes('islam') || n.includes('aastha') || n.includes('bhakti') || n.includes('bhajan') || n.includes('sanskar') || n.includes('satsang') || n.includes('krishna') || n.includes('spiritual')) {
    return 'Devotional';
  }
  if (n.includes('docu') || n.includes('discovery') || n.includes('history') || n.includes('geo') || n.includes('planet') || n.includes('animal') || n.includes('travel') || n.includes('nature') || n.includes('wild') || n.includes('science') || n.includes('cook') || n.includes('food')) {
    return 'Infotainment';
  }
  return 'Entertainment';
}

function cleanChannelName(rawName) {
  return rawName
    .replace(/\s*\(\d+p\)/gi, '')
    .replace(/\s*\(\d+i\)/gi, '')
    .replace(/\s*\(Adaptive\)/gi, '')
    .replace(/\s*\[Geo-blocked\]/gi, '')
    .replace(/\s*\[Not 24\/7\]/gi, '')
    .trim();
}

function extractResolution(rawName) {
  const match = rawName.match(/\((\d+[pi]|Adaptive)\)/i);
  return match ? match[1] : 'HD';
}

function parseM3UContent(content, countryCode, countryName) {
  const lines = content.split('\n');
  const rawChannels = [];
  let currentInfo = null;
  let currentOpts = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      currentOpts = {};
      const tvgIdMatch = line.match(/tvg-id="([^"]+)"/);
      const tvgId = tvgIdMatch ? tvgIdMatch[1] : '';

      const commaIndex = line.lastIndexOf(',');
      const title = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : 'Channel';

      currentInfo = {
        tvgId,
        rawTitle: title,
      };
    } else if (line.startsWith('#EXTVLCOPT:')) {
      if (line.includes('http-referrer=')) {
        currentOpts.referrer = line.split('http-referrer=')[1];
      }
      if (line.includes('http-user-agent=')) {
        currentOpts.userAgent = line.split('http-user-agent=')[1];
      }
    } else if (!line.startsWith('#') && currentInfo) {
      const url = line;
      const isGeoBlocked = currentInfo.rawTitle.includes('[Geo-blocked]');
      const isNot247 = currentInfo.rawTitle.includes('[Not 24/7]');
      const cleanName = cleanChannelName(currentInfo.rawTitle);
      const resolution = extractResolution(currentInfo.rawTitle);
      const category = detectCategory(cleanName, currentInfo.tvgId);

      rawChannels.push({
        tvgId: currentInfo.tvgId,
        rawTitle: currentInfo.rawTitle,
        name: cleanName,
        resolution,
        url,
        isGeoBlocked,
        isNot247,
        category,
        language: countryName,
        referrer: currentOpts.referrer,
        userAgent: currentOpts.userAgent
      });

      currentInfo = null;
      currentOpts = {};
    }
  }

  // Deduplicate and group into channels
  const channelMap = new Map();
  rawChannels.forEach(item => {
    const key = item.name.toLowerCase();
    if (!channelMap.has(key)) {
      channelMap.set(key, {
        id: item.tvgId || `${countryCode}_${key.replace(/[^a-z0-9]/g, '_')}`,
        name: item.name,
        category: item.category,
        language: countryName,
        streams: []
      });
    }

    const ch = channelMap.get(key);
    if (!ch.streams.some(s => s.url === item.url)) {
      ch.streams.push({
        url: item.url,
        resolution: item.resolution,
        rawTitle: item.rawTitle,
        isGeoBlocked: item.isGeoBlocked,
        isNot247: item.isNot247,
        referrer: item.referrer,
        userAgent: item.userAgent
      });
    }
  });

  return Array.from(channelMap.values());
}

// Ensure output directories
const publicCountriesDir = path.resolve(__dirname, '../public/data/countries');
if (!fs.existsSync(publicCountriesDir)) {
  fs.mkdirSync(publicCountriesDir, { recursive: true });
}

const rootFiles = fs.readdirSync(path.resolve(__dirname, '..'))
  .filter(f => f.endsWith('.m3u') && !f.startsWith('.'));

console.log(`Found ${rootFiles.length} .m3u files in root.`);

// Group files by base country code (e.g. us.m3u, us_pluto.m3u -> us)
const countryFileGroups = new Map();

rootFiles.forEach(file => {
  const baseName = file.replace('.m3u', '');
  const code = baseName.includes('_') ? baseName.split('_')[0] : baseName;
  if (!countryFileGroups.has(code)) {
    countryFileGroups.set(code, []);
  }
  countryFileGroups.get(code).push(file);
});

const countriesList = [];

// Popular country ordering priority
const POPULAR_CODES = ['in', 'us', 'uk', 'ca', 'au', 'de', 'fr', 'es', 'it', 'br', 'ru', 'jp', 'kr', 'pk', 'bd', 'ae', 'sa', 'sg', 'my', 'nl', 'tr', 'mx'];

for (const [code, files] of countryFileGroups.entries()) {
  const meta = COUNTRY_MAP[code] || {
    name: code.toUpperCase(),
    flag: '🌐',
    region: 'Global'
  };

  let allChannels = [];
  const channelMap = new Map();

  files.forEach(file => {
    try {
      const content = fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
      const channels = parseM3UContent(content, code, meta.name);
      channels.forEach(ch => {
        const key = ch.name.toLowerCase();
        if (!channelMap.has(key)) {
          channelMap.set(key, ch);
        } else {
          // Merge alternate streams
          const existing = channelMap.get(key);
          ch.streams.forEach(s => {
            if (!existing.streams.some(es => es.url === s.url)) {
              existing.streams.push(s);
            }
          });
        }
      });
    } catch (e) {
      console.error(`Error reading ${file}:`, e.message);
    }
  });

  const finalChannels = Array.from(channelMap.values());

  if (finalChannels.length > 0) {
    const countryData = {
      code,
      name: meta.name,
      flag: meta.flag,
      region: meta.region,
      channelCount: finalChannels.length,
      channels: finalChannels
    };

    // Write to public/data/countries/{code}.json
    fs.writeFileSync(
      path.join(publicCountriesDir, `${code}.json`),
      JSON.stringify(countryData),
      'utf8'
    );

    countriesList.push({
      code,
      name: meta.name,
      flag: meta.flag,
      region: meta.region,
      channelCount: finalChannels.length
    });
  }
}

// Sort countries: Popular ones first, then alphabetically
countriesList.sort((a, b) => {
  const popA = POPULAR_CODES.indexOf(a.code);
  const popB = POPULAR_CODES.indexOf(b.code);
  if (popA !== -1 && popB !== -1) return popA - popB;
  if (popA !== -1) return -1;
  if (popB !== -1) return 1;
  return a.name.localeCompare(b.name);
});

// Write countriesList.json to src/data
const srcDataDir = path.resolve(__dirname, '../src/data');
if (!fs.existsSync(srcDataDir)) fs.mkdirSync(srcDataDir, { recursive: true });

fs.writeFileSync(
  path.join(srcDataDir, 'countriesList.json'),
  JSON.stringify(countriesList, null, 2),
  'utf8'
);

// Generate lightweight Search Index for all channels
const searchIndex = [];
for (const [code, files] of countryFileGroups.entries()) {
  const meta = COUNTRY_MAP[code] || { name: code.toUpperCase() };
  files.forEach(file => {
    try {
      const content = fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
      const channels = parseM3UContent(content, code, meta.name);
      channels.forEach(ch => {
        searchIndex.push({
          n: ch.name,
          c: code,
          i: ch.id,
          f: meta.flag || '🌐'
        });
      });
    } catch (e) {}
  });
}

// Deduplicate index by name + country
const uniqueIndex = Array.from(new Map(searchIndex.map(item => [`${item.n}-${item.c}`, item])).values());

fs.writeFileSync(
  path.join(srcDataDir, 'searchIndex.json'),
  JSON.stringify(uniqueIndex),
  'utf8'
);

console.log(`Generated JSON for ${countriesList.length} countries!`);
console.log(`Generated Search Index with ${uniqueIndex.length} channels.`);

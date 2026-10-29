const fs = require('fs');
const path = require('path');

const m3uPath = path.resolve(__dirname, '../public/assets/aistudio/Paste_October_29__2026_-_3_49PM_8f392ea4');
const content = fs.readFileSync(m3uPath, 'utf8');

const lines = content.split('\n');

function detectLanguage(name, tvgId) {
  const n = (name + ' ' + (tvgId || '')).toLowerCase();
  if (n.includes('tamil') || n.includes('thanthi') || n.includes('polimer') || n.includes('puthiya') || n.includes('kalaignar') || n.includes('sun tv') || n.includes('makkal') || n.includes('sathiyam') || n.includes('captain') || n.includes('raj musix tamil') || n.includes('raj tv') || n.includes('isai')) return 'Tamil';
  if (n.includes('telugu') || n.includes('tv9 telugu') || n.includes('sakshi') || n.includes('v6') || n.includes('t news') || n.includes('hmtv') || n.includes('etv') || n.includes('ntv') || n.includes('bhakthi') || n.includes('cvr') || n.includes('mahaa') || n.includes('star maa')) return 'Telugu';
  if (n.includes('malayalam') || n.includes('asianet') || n.includes('manorama') || n.includes('mathrubhumi') || n.includes('kairali') || n.includes('reporter') || n.includes('mediaone') || n.includes('mazhavil') || n.includes('amrita') || n.includes('kerala')) return 'Malayalam';
  if (n.includes('kannada') || n.includes('suvarna') || n.includes('public tv') || n.includes('chandana') || n.includes('siri') || n.includes('power tv') || n.includes('ayush')) return 'Kannada';
  if (n.includes('bangla') || n.includes('bengali') || n.includes('kolkata') || n.includes('ananda') || n.includes('aakaash') || n.includes('rongeen') || n.includes('khushboo') || n.includes('sangeet bangla') || n.includes('star jalsha') || n.includes('jalsha')) return 'Bengali';
  if (n.includes('punjabi') || n.includes('ptc') || n.includes('chardikla') || n.includes('mh1') || n.includes('pitaara') || n.includes('balle') || n.includes('tashan') || n.includes('hamdard') || n.includes('tabbar')) return 'Punjabi';
  if (n.includes('marathi') || n.includes('majha') || n.includes('taas') || n.includes('fakt') || n.includes('saam') || n.includes('star pravah') || n.includes('sangeet marathi')) return 'Marathi';
  if (n.includes('gujarati') || n.includes('asmita') || n.includes('kalak') || n.includes('gstv') || n.includes('mantavya') || n.includes('valam')) return 'Gujarati';
  if (n.includes('bhojpuri') || n.includes('b4u bhojpuri') || n.includes('sangeet bhojpuri') || n.includes('bhojpuri cinema')) return 'Bhojpuri';
  if (n.includes('odia') || n.includes('odisha') || n.includes('kalinga') || n.includes('tarang') || n.includes('argus') || n.includes('prameya') || n.includes('nandighosha')) return 'Odia';
  if (n.includes('assam') || n.includes('prag') || n.includes('pratidin') || n.includes('dy365') || n.includes('rengoni') || n.includes('ramdhenu') || n.includes('jonack') || n.includes('northeast')) return 'Assamese / NE';
  if (n.includes('wion') || n.includes('cnn news18') || n.includes('india today') || n.includes('ndtv 24x7') || n.includes('newsx') || n.includes('dd india') || n.includes('travelxp') || n.includes('discovery') || n.includes('animal planet') || n.includes('tlc')) return 'English';
  return 'Hindi';
}

function detectCategory(name, tvgId) {
  const n = (name + ' ' + (tvgId || '')).toLowerCase();
  if (n.includes('news') || n.includes('tak') || n.includes('samachar') || n.includes('khabar') || n.includes('today') || n.includes('wion') || n.includes('republic') || n.includes('abp') || n.includes('ndtv') || n.includes('times') || n.includes('bharat') || n.includes('sansad') || n.includes('seithigal') || n.includes('live')) {
    return 'News';
  }
  if (n.includes('music') || n.includes('9xm') || n.includes('tashan') || n.includes('jalwa') || n.includes('jhakaas') || n.includes('sangeet') || n.includes('tunes') || n.includes('hits') || n.includes('gaane') || n.includes('beats') || n.includes('insync')) {
    return 'Music';
  }
  if (n.includes('sports') || n.includes('cricket') || n.includes('kabaddi') || n.includes('eurosport') || n.includes('ten')) {
    return 'Sports';
  }
  if (n.includes('cinema') || n.includes('movie') || n.includes('filmi') || n.includes('goldmines') || n.includes('b4u') || n.includes('talkies') || n.includes('flix') || n.includes('cineplex') || n.includes('dangal') || n.includes('sony pix') || n.includes('star gold')) {
    return 'Movies';
  }
  if (n.includes('kids') || n.includes('cartoon') || n.includes('pogo') || n.includes('nickelodeon') || n.includes('nick') || n.includes('disney') || n.includes('sonic') || n.includes('hungama') || n.includes('yay')) {
    return 'Kids';
  }
  if (n.includes('aastha') || n.includes('bhakti') || n.includes('bhajan') || n.includes('sadhna') || n.includes('sanskar') || n.includes('satsang') || n.includes('hare krsna') || n.includes('svbc') || n.includes('darshan') || n.includes('peace of mind') || n.includes('spiritual') || n.includes('gurbani') || n.includes('simran') || n.includes('jinvani') || n.includes('jesus') || n.includes('shalom') || n.includes('angel') || n.includes('divya') || n.includes('dharma')) {
    return 'Devotional';
  }
  if (n.includes('discovery') || n.includes('planet') || n.includes('history') || n.includes('travel') || n.includes('food') || n.includes('tlc') || n.includes('science') || n.includes('docubay') || n.includes('safari') || n.includes('vidya')) {
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
    const language = detectLanguage(cleanName, currentInfo.tvgId);

    rawChannels.push({
      tvgId: currentInfo.tvgId,
      rawTitle: currentInfo.rawTitle,
      name: cleanName,
      resolution,
      url,
      isGeoBlocked,
      isNot247,
      category,
      language,
      referrer: currentOpts.referrer,
      userAgent: currentOpts.userAgent
    });

    currentInfo = null;
    currentOpts = {};
  }
}

// Group into channels with alternate streams
const channelMap = new Map();

rawChannels.forEach(item => {
  const key = item.name.toLowerCase();
  if (!channelMap.has(key)) {
    channelMap.set(key, {
      id: item.tvgId || key.replace(/[^a-z0-9]/g, '_'),
      name: item.name,
      category: item.category,
      language: item.language,
      streams: []
    });
  }

  const ch = channelMap.get(key);
  // Avoid duplicate stream URLs
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

const channelList = Array.from(channelMap.values());

console.log(`Parsed ${rawChannels.length} raw streams into ${channelList.length} distinct channels.`);

// Ensure output dir exists
const outDir = path.resolve(__dirname, '../src/data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'channels.json'), JSON.stringify(channelList, null, 2), 'utf8');
console.log('Saved channels to src/data/channels.json');

require('dotenv').config()

const fetch = require('node-fetch')
const {
  getDbConnection,
  getPlayersCollection,
  getDb,
  sleep,
} = require('./shared')

const playersUrl = () => `http://localhost:3000/players`
const ggscorePlayerUrl = (id) => `https://ggscore.com/en/dota-2/player/${id}`

const nameToGgscoreId = {
  'LIMMP': 'LIMMP',
  'Handsken': 'Handsken',
  'N0tail': 'N0tail',
  'Cr1t-': 'Cr1t',
  'Mariano': '',
  'MoonMeander': 'MoonMeander',
  's4': 's4',
  'LoA': 'svg',
  'DM': 'stockholm',
  'Leostyle- ': 'Leostyle',
  'MATUMBAMAN': 'MATUMBAMAN',
  'zai': 'zai',
  'KJ': 'KJ',
  'iceiceice': 'iceiceice',
  '4dr ♥ Deia': '4dr',
  'MSS': 'MSS',
  'Arteezy': 'Arteezy',
  'Costabile': 'Costabile',
  'LESLÃO': 'liposa',
  'Puppey': 'Puppey',
  'Ceb': '7ckngmad',
  'YapzOr': 'YapzOr',
  'LaNm': 'LaNm',
  'Super！': 'Super',
  'Fng': 'Fng',
  'Topson': 'Topson',
  'Fly': 'Fly',
  'Karl': 'Karl',
  'MNZ': 'MNZ',
  'Timado': 'Timado',
  'Deth': 'Deth',
  'jabz': 'jabz',
  'Oli~': 'Oli',
  'fy': 'fy',
  'DJ': 'DJ',
  'Saksa': 'Saksa',
  'Thiolicor': 'Thiolicor',
  'Somnus丶M': 'maybe',
  '曾焦阳': 'ori',
  'YS': 'YawaR',
  'y`': 'y',
  'SumaiL': 'SumaiL',
  'Miposhka': 'Miposhka',
  'ChYuaN': 'ChYuaN',
  'tavo': 'tavo',
  'Faith_bian': 'bian',
  'ST!NG3R': 'stinger',
  'Xepher': 'Xepher',
  'Nisha': 'Nisha',
  'Nightfall': 'epileptick1d',
  'SabeRLighT': 'SabeRLighT',
  'Xxs': 'Xxs',
  'Raven': 'Raven',
  'old eLeVeN': 'eleven',
  'Whitemon': 'Whitemon',
  'eurus': 'paparazi',
  'Pyw': 'Pyw',
  'JT-': 'jt-',
  'kaka': 'kaka-2',
  'Yang': 'Yang',
  'Dy': 'mc-zi-long',
  'DuBu': 'dubu',
  'Monet': 'Monet',
  'Chris luck': 'chris-brown',
  'Abed': 'Abed',
  'XinQ': 'XinQ',
  'Scofield:❤KAT': 'aczino',
  'k1  ': 'k1',
  'flyfly': 'flyfly',
  'NothingToSay': 'NothingToSay',
  'Ku': 'kuku',
  'Mjz': 'Mjz',
  'Kingslayer': 'illias',
  'Emo': 'Emo',
  'Borax': 'BoBoKa',
  'Quinn': 'cc-c',
  'Bryle': 'Bryle',
  'Mira': 'miroslaw',
  'poyoyo': 'poyoyo',
  'Wisper': 'Wisper',
  'Collapse': 'Collapse',
  'Save-': 'Save',
  'Yatoro': 'Yatoro',
  'MoOz': 'MoOz',
  'White丶Album_白学家': 'White-Album',
  '23': '23savage',
  'Frank': 'Frank',
  'Nikobaby龙的传人': 'Nikobaby',
  'TORONTOTOKYO': 'TORONTOTOKYO',
  'gpk~': 'gpk',
  '萧瑟': 'ame',
}

const getPos = (role, line) => {
  try {
    const sup = { 'Safe': 5, 'Hard': 4 }
    const h = {
      'Carry': () => 1,
      'Mid': () => 2,
      'Offlane': () => 3,
      'Support': (line) => sup[line]
    }
    return h[role](line)
  } catch(e) { return 0 }
}

async function main() {
  const client = await getDbConnection()
  const db = getDb(client)
  const playersModel = getPlayersCollection(db)

  const players = await getPlayers(playersModel)

  for (let i = 0; i < players.length; ++i) {
    await playersModel.updateOne({ name: players[i].name }, { $set: { position: players[i].pos } })
  }

  await client.close()
}

async function getPlayers() {
  const players = await fetch(playersUrl()).then((data) => data.json())

  for (let i = 0; i < players.length; ++i) {
    const name = nameToGgscoreId[players[i].name]
    const html = await fetch(ggscorePlayerUrl(name)).then((data) => data.text())

    const role = new RegExp(`matches on the (.*?) position`).exec(html)
    const lane = new RegExp(`<td>Lane</td><td><iclass="gti-question-circletippull-right"title="(.*?)"></i>(.*?)</td>`).exec(html.replace(/ /g, '').replace(/\n/g, '').replace(/\t/g, '').trim())

    players[i].pos = getPos(role[1], lane[2])

    await sleep(.01)
  }

  console.log('Players parsed:', players.length)

  return players
}

main()

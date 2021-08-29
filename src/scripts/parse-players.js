require('dotenv').config()

const fetch = require('node-fetch')
const {
  getDbConnection,
  getPlayersCollection,
  getDb,
  sleep,
} = require('./shared')

const opendotaPlayersUrl = () => `https://api.opendota.com/api/proPlayers`
const teamsUrl = () => `http://localhost:3000/teams`
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

async function main() {
  const client = await getDbConnection()
  const db = getDb(client)
  const playersModel = getPlayersCollection(db)

  const players = await getPlayers()

  await playersModel.insertMany(players, {})

  await client.close()
}

async function getPlayers() {
  const teams = new Set(
    (await fetch(teamsUrl()).then((data) => data.json())).map(
      ({ team_id }) => team_id,
    ),
  )
  const opendotaAllPlayers = await fetch(opendotaPlayersUrl()).then((data) =>
    data.json(),
  )

  const players = opendotaAllPlayers
    .filter((player) => teams.has(player.team_id))
    .map((player) => ({
      account_id: player.account_id,
      steamid: player.steamid,
      profileurl: player.profileurl,
      real_name: '',
      name: player.name,
      country_code: player.country_code,
      fantasy_role: player.fantasy_role,
      team_id: player.team_id,
    }))

  // add pictures and real name
  for (let i = 0; i < players.length; ++i) {
    const name = nameToGgscoreId[players[i].name]
    const html = await fetch(ggscorePlayerUrl(name)).then((data) => data.text())

    const img = new RegExp(`<meta property="og:image" content="(.*?)" />`).exec(html)
    const realName = new RegExp(`"name":"(.*?)",`).exec(html)
    const prize = new RegExp(`title="[$](.*?)"`).exec(html)

    players[i].img = img ? img[1] : ''
    players[i].real_name = realName ? realName[1] : ''
    players[i].prize = prize && prize[1] ? parseInt(prize[1].replace(/,/g, '')) : 0,

    await sleep(.05)
  }

  console.log('Players parsed:', players.length)

  return players
}

main()

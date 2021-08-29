require('dotenv').config()

const fetch = require('node-fetch')
const { getDbConnection, getTeamsCollection, getDb } = require('./shared')

const liqpediaTeamUrl = id => `https://liquipedia.net/dota2/${id}`
const opendotaTeamsUrl = () => `https://api.opendota.com/api/teams`
const opendotaTeamUrl = id => `https://api.opendota.com/api/teams/${id}`

const invitedTeams = [
  'Evil Geniuses',
  'PSG.LGD',
  'Virtus.pro',
  'Quincy Crew',
  'Invictus Gaming',
  'T1',
  'Vici Gaming',
  'Team Secret',
  'Team Aster',
  'Alliance',
  'beastcoast',
  'Thunder Predator',
  'Team Undying',
  'SG esports',
  'OG',
  'Team Spirit',
  'Elephant',
  'Fnatic',
]
const invitedTeamsSet = new Set(invitedTeams.map(t => t.toLowerCase()))

async function main() {
  const client = await getDbConnection()
  const db = getDb(client)
  const teamsModel = getTeamsCollection(db)

  const teams = await getTeams()

  await teamsModel.insertMany(teams, {})

  await client.close()
}

async function getTeams() {
  const teamsLiquidpedia = await Promise.all(invitedTeams.map(async team => {
    const html = await fetch(liqpediaTeamUrl(team.split(' ').join('_'))).then(res => res.text())
    const prize = new RegExp(`<div class="infobox-cell-2">[$](.*?)</div>`).exec(html)
    const image = new RegExp(`<img alt="${team}" src="(.*?)"`).exec(html)

    return {
      name: team,
      prize_money_overall: prize && prize[1] ? parseInt(prize[1].replace(/,/g, '')) : 0,
      alt_image: image ? `https://liquipedia.net${image[1]}` : '',
    }
  }))

  const allTeams = await fetch(opendotaTeamsUrl()).then(data => data.json())
  const teams = allTeams
    .filter(({ name }) => invitedTeamsSet.has(name.toLowerCase()) || name === 'Undying')
    .filter(({ last_match_time }) => new Date(last_match_time * 1000).getFullYear() === 2021)
    .map(team => {
      const match = teamsLiquidpedia.find(t => t.name.toLowerCase() === team.name.toLowerCase() || (team.name === 'Undying' && t.name === 'Team Undying'))

      return {
        ...match,
        ...team,
      }
    })
  
  console.log('Teams parsed:', teams.length)
  console.log(teams)

  return teams
}

main()

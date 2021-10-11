require('dotenv').config()
const fetch = require('node-fetch')
const { getDbConnection, getMatchesCollection, getDb } = require('./shared')

const opendotaLeagueMatchesURL = (id) =>
  `https://api.opendota.com/api/leagues/${id}/matches?api_key=447d4718-d5b1-4840-b5d7-e7fccfcf0570`

async function main() {
  const params = process.argv.slice(2)

  if (params.length !== 1) {
    console.error(
      'Provide league id (or list) as a parameter. Example: node parse-league-matches.js 1233312,321312,312312',
    )
    return
  }

  const connection = await getDbConnection()
  const db = getDb(connection)
  const matchesModel = getMatchesCollection(db)

  const leaguesIds = params.pop().split(',')

  for (const leagueId of leaguesIds) {
    const matches = await getLeagueMatches(leagueId)

    for (const match of matches) {
      await matchesModel.updateOne(
        { match_id: match.match_id },
        { $set: { match_id: match.match_id, ...match } },
        { upsert: true },
      )
    }
  }

  connection.close()
}

async function getLeagueMatches(leagueId) {
  const matchesData = await fetch(opendotaLeagueMatchesURL(leagueId)).then(
    (data) => data.json(),
  )

  for (const match of matchesData) {
    match.teamfights = undefined
    match.cosmetics = undefined
  }

  return matchesData
}

main()

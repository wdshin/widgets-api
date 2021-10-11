const { MongoClient } = require('mongodb')

const getDbConnection = async () => {
  const client = new MongoClient(process.env.DB_CONNECTION)
  await client.connect()

  return client
}

const getDb = client => client.db('dota_stat')

const getTeamsCollection = db => db.collection('teams')

const getHeroesCollection = db => db.collection('heroes')

const getPlayersCollection = db => db.collection('players')

const getMatchupsCollection = db => db.collection('matchups')

const getMatchesCollection = db => db.collection('matches')

const sleep = s => new Promise(res => setTimeout(res, s * 1000))

module.exports = {
  sleep,
  getDb,
  getDbConnection,
  getTeamsCollection,
  getHeroesCollection,
  getPlayersCollection,
  getMatchupsCollection,
  getMatchesCollection,
}

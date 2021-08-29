require('dotenv').config()

const fetch = require('node-fetch')
const { getDbConnection, getHeroesCollection, getDb } = require('./shared')

const opendotaHeroesUrl = () => `https://api.opendota.com/api/heroStats`

async function main() {
  const client = await getDbConnection()
  const db = getDb(client)
  const heroesModel = getHeroesCollection(db)

  const heroes = await getHeroes()

  await heroesModel.insertMany(heroes, {})

  await client.close()
}

async function getHeroes() {

  const data = await fetch(opendotaHeroesUrl()).then(data => data.json())
  const heroes = data.map(hero => ({
    id: hero.id,
    name: hero.name,
    localized_name: hero.localized_name,
    img: `https://steamcdn-a.akamaihd.net${hero.img}`,
    icon: `https://steamcdn-a.akamaihd.net${hero.icon}`,
  }))
  
  console.log('Heroes parsed:', heroes.length)
  console.log(heroes)

  return heroes
}

main()

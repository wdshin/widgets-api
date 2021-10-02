require('dotenv').config()
const fs = require('fs');
const fetch = require('node-fetch')
const {
  getDbConnection,
  getPlayersCollection,
  getDb,
  sleep,
} = require('./shared')

let position_store = new Map()
const opendotaLeagueMatchesURL = (id) => `https://api.opendota.com/api/leagues/${id}/matches`
const opendotaMatchById = (id) => `https://api.opendota.com/api/matches/${id}`

async function main() {
    const params = process.argv.slice(2)
    if (params.length == 1) {
        const league_id = params.pop()
        console.log(league_id)
        await get_player_positions()
        const stats = await getParsedStatsForLeague(league_id)
        
        try {
            const data = fs.writeFileSync('matchups.json',JSON.stringify(stats, null, '\t'))
            console.log("Written to a file")
        } catch (err) {
            console.error(err)
        }
    }
}

async function get_player_positions() {
    const connection = await getDbConnection()
    const db = getDb(connection)
    const playersModel = getPlayersCollection(db)
    const players = await playersModel.find({}).toArray()
    players.forEach( (player) => {
        position_store.set(player.account_id, player.position)
    })
    await connection.close()
}

async function getParsedStatsForLeague(league_id) {
    const league_matches_url = opendotaLeagueMatchesURL(league_id)
    const league_matches_json = await fetch(league_matches_url).then((data) => data.json())
    const league_match_ids = league_matches_json.map((match) => match.match_id)
    const all_stats = new Array()
    const length = league_match_ids.length
    for (let i = 0; i < length; ++i) {
        const match_id = league_match_ids[i]
        const match = await get_match_data(match_id)
        const stats = parse_match_stats(match)
        all_stats.push(...stats)
        console.log("Matches left: ", length - 1 - i)
        await sleep(.5)
    }
    return all_stats
}

async function get_match_data(id) {
    const match_by_id_url = opendotaMatchById(id)
    const match = await fetch(match_by_id_url).then((data) => data.json())
    return match
}

function parse_match_stats(match) {
    const radiant_team = assign_team_and_position(match, true)
    const dire_team = assign_team_and_position(match, false)
    const stats = match.players.map((player) => {
        return make_player_stats(player, player.isRadiant ? dire_team : radiant_team)
    })
    return stats
}

function assign_team_and_position(match, isRadiant) { 
    if (match_positions_are_in_db(match)) {
        return match.players
            .filter((player) => player.isRadiant == isRadiant)
            .map((player) => {
                player.position = position_store.get(player.account_id)
                return player
            })
    } else {
        return match.players
            .filter((player) => player.isRadiant == isRadiant)
            .sort((left, right) => right.net_worth - left.net_worth)
            .map((player, index) => {
                player.position = index + 1
                return player
            })
    }
}

function match_positions_are_in_db(match) {
    for (let i = 0; i < match.players.length; ++i) {
        const player = match.players[i]
        const position = position_store.get(player.account_id)
        if (position == null) {
            console.log(player.account_id, "Missing in db")
            return false
        }
    }
    return true
}

function make_player_stats(player, enemy_team) {
    const enemy = enemy_team[player.position - 1]
    return {
        player_id: make_stat_matchup(player, enemy, "account_id"),
        match_id: player.match_id,
        position: player.position,
        win: player.win,
        hero: make_stat_matchup(player, enemy, "hero_id"),
        efficiency: make_stat_matchup(player, enemy, "lane_efficiency"),
        totals: {
            level: make_stat_matchup(player, enemy, "level"),
            gold: make_stat_matchup(player, enemy, "total_gold"),
            net_worth: make_stat_matchup(player, enemy, "net_worth"),
            kills: make_stat_matchup(player, enemy, "kills"),
            deaths: make_stat_matchup(player, enemy, "deaths"),
            assists: make_stat_matchup(player, enemy, "assists"),
            kda: make_stat_matchup(player, enemy, "kda"),
            last_hits: make_stat_matchup(player, enemy, "last_hits"),
            denies: make_stat_matchup(player, enemy, "denies")
        },
        items: {
            me: [player.item_0, player.item_1, player.item_2, player.item_3, player.item_4, player.item_5],
            enemy: [enemy.item_0, enemy.item_1, enemy.item_2, enemy.item_3, enemy.item_4, enemy.item_5]
        },
        neutral_item: make_stat_matchup(player, enemy, "item_neutral"),
        per_minute: {
            actions:  make_stat_matchup(player, enemy, "actions_per_min"),
            gold: make_stat_matchup(player, enemy, "gold_per_min"),
            xp: make_stat_matchup(player, enemy, "xp_per_min"),
            kills: make_stat_matchup(player, enemy, "kills_per_min")
        },
        camps: {
            stacked: make_stat_matchup(player, enemy, "camps_stacked"),
            creeps: make_stat_matchup(player, enemy, "creeps_stacked"),
            neutrals_killed: make_stat_matchup(player, enemy, "neutral_kills"),
            ancient_kills: make_stat_matchup(player, enemy, "ancient_kills")
        },
        wards: {
            observer: {
                placed: make_stat_matchup(player, enemy, "obs_placed"),
                used: make_stat_matchup(player, enemy, "observer_uses"),
                killed: make_stat_matchup(player, enemy, "observer_kills")
            },
            sentry: {
                placed: make_stat_matchup(player, enemy, "sen_placed"),
                used: make_stat_matchup(player, enemy, "sentry_uses"),
                killed: make_stat_matchup(player, enemy, "sentry_kills")
            }
        },
        creeps: {
            killed: make_stat_matchup(player, enemy, "lane_kills"),
            denied: make_stat_matchup(player, enemy, "denies")
        },
        tower: {
            damage: make_stat_matchup(player, enemy, "tower_damage"),
            killed: make_stat_matchup(player, enemy, "towers_killed"),
            kills: make_stat_matchup(player, enemy, "tower_kills")
        }
    }  
}

function make_stat_matchup(player, enemy, property) {
    return {
        me: player[property],
        enemy: enemy[property]
    }
}

main()

/*
- Sum up stats
- Saving stats to db
- Adding facts
*/

/*
    Player on Hero vs Enemy Hero in match
    Player on Hero vs Enemy Hero in tournament
    Player on Hero vs avg on this Position in tournament
    Player on Hero vs avg on this Hero in tournament
    Player on Hero vs avg on this Hero for this player in tournament
    Player on Hero vs Enemy (any Hero) player in torunament
*/

/*
    We get league id.
    Find all matches for this league.
    For each match we distribute player positions according to their networth.
    Using player positions we match the stats of two oposing players to create a matchup.
    Every matchup will be recording the stats for
    - the Player
    - the Hero
    Having matchups accumulated we can easily pick and compare any of them for both hero & player
*/
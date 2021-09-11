require('dotenv').config()

const fetch = require('node-fetch')
const {
  getDbConnection,
  getPlayersCollection,
  getDb,
  sleep,
} = require('./shared')

const opendotaLeagueMatchesURL = (id) => `https://api.opendota.com/api/leagues/${id}/matches`
const opendotaMatchById = (id) => `https://api.opendota.com/api/matches/${id}`

async function main() {
    const stats = await getParsedStatsForLeague('13404')
    console.log(stats)
}

async function getParsedStatsForLeague(league_id) {
    const league_matches_url = opendotaLeagueMatchesURL(league_id)
    const league_matches_json = await fetch(league_matches_url).then((data) => data.json())
    const league_match_ids = league_matches_json.map((match) => match.match_id)
    
    //TODO: Add a timeout
    // const fetch_match_data = league_match_ids.map((id) => {
    //     const match_by_id_url = opendotaMatchById(id)
    //     return fetch(match_by_id_url)
    // })
    // const matches_data = await Promise.all(fetch_match_data)
    // const stats = matches_data.map( (match) => parse_match_stats(match))

    const match_id = league_match_ids[0]
    const match = await get_match_data(match_id)
    const stats = parse_match_stats(match)
    
    return stats
}

async function get_match_data(id) {
    const match_by_id_url = opendotaMatchById(id)
    const match = await fetch(match_by_id_url).then((data) => data.json())
    return match
}

function parse_match_stats(match) {
    const players = match.players
    players.forEach((player) => {
        const isSupport = is_support(match.players, player)
        const position = lane_position(player.lane_role, isSupport)
        player.position = position
    })
    
    const dire_team = players.filter((player) => player.isRadiant == false)
    const radiant_team = players.filter((player) => player.isRadiant)
    const stats = new Map() 
    players.forEach((player) => {
        const player_stats = make_player_stats(
            player,
            player.isRadiant ? radiant_team : dire_team,
            player.isRadiant ? dire_team : radiant_team
        )
        stats.set(player.account_id, player_stats)
    })
    return stats
}

function vision_score(player) {
    const obs_score = player.obs_placed + player.observer_uses
    const sen_score = player.sen_placed + player.sentry_uses
    const vision_score = obs_score + sen_score
    return vision_score
}

function is_support(all, target) {
    const same_team_players = all.filter((player) => player.isRadiant == target.isRadiant)
    const same_lane_players = same_team_players.filter((player) => player.lane_role == target.lane_role && player.account_id != target.account_id)
    if (same_lane_players.length == 1) {
        const laner = same_lane_players.pop()
        const is_support = vision_score(target) > vision_score(laner)
        return is_support
    } else {
        return false
    }
}

function lane_position(lane, isSupport) {
    if (lane == 2) {
        return 2
    } else if (lane == 1) {
        return isSupport ? 5 : 1
    } else {
        return isSupport ? 3 : 4
    }
}

function make_player_stats(player, ally_team, enemy_team) {
    const enemy = enemy_team.filter((enemy) => enemy.position == player.position).pop()
    return {
        win: player.win,
        lose: player.lose,
        against: enemy.hero_id,
        hero: player.hero_id,
        role: player.lane_role,
        efficiency: player.lane_efficiency,
        match_id: player.match_id,
        totals: {
            level: player.level,
            gold:  player.total_gold,
            kills: player.kills,
            deaths: player.deaths,
            assists: player.assists,
            kda: player.kda,
            last_hits: player.last_hits,
            denies: player.denies
        },
        items: [
            player.item_0,
            player.item_1,
            player.item_2,
            player.item_3,
            player.item_4,
            player.item_5
        ],
        neutral_item: player.item_neutral,
        per_minute: {
            actions:  player.actions_per_min,
            gold: player.gold_per_min,
            xp: player.xp_per_min,
            kills: player.kills_per_min
        },
        camps: {
            stacked: player.camps_stacked,
            creeps: player.creeps_stacked,
            neutrals_killed: player.neutral_kills,
            ancient_kills: player.ancient_kills
        },
        wards: {
            observer: {
                placed: player.obs_placed,
                used: player.observer_uses,
                killed: player.observer_kills
            },
            sentry: {
                placed: player.sen_placed,
                used: player.sentry_uses,
                killed: player.sentry_kills
            }
        },
        creeps: {
            killed: player.lane_kills,
            denied: player.denies
        },
        tower: {
            damage: player.tower_damage,
            killed: player.towers_killed,
            kills: player.tower_kills
        }
    }
}

main()


/*
- Add league id to script params
- Add wait before sending the match details request
- Sum up stats
- Saving stats to db
- Adding facts
*/
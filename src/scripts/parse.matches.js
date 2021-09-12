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
    const params = process.argv.slice(2)
    if (params.length == 1) {
        const league_id = params.pop()
        const stats = await getParsedStatsForLeague(league_id)
        console.log(stats)
    }
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

function assign_team_and_position(players, isRadiant) {
    return players.filter((player) => {
        return player.isRadiant == isRadiant
    }).sort((left, right) => {
        return right.net_worth - left.net_worth
    }).map((player, index) => {
        player.position = index + 1
        return player
    })
}

function parse_match_stats(match) {
    const players = match.players
    const radiant_team = assign_team_and_position(players, true)
    const dire_team = assign_team_and_position(players, false)

    const player_stats = new Map() 
    const hero_stats = new Map()
    players.forEach((player) => {
        const stats = make_player_stats(player, player.isRadiant ? dire_team : radiant_team)
        player_stats.set(player.account_id, stats)
        hero_stats.set(player.hero_id, stats)
    })
    
    return {
        players: player_stats,
        heroes: hero_stats
    }
}

function make_player_stats(player, enemy_team) {
    const enemy = enemy_team[player.position - 1]
    return {
        player_id: make_stat_matchup(player, enemy, "account_id"),
        win: make_stat_matchup(player, enemy, "win"),
        lose: make_stat_matchup(player, enemy, "lose"),
        hero: make_stat_matchup(player, enemy, "hero_id"),
        position: make_stat_matchup(player, enemy, "position"),
        efficiency: make_stat_matchup(player, enemy, "lane_efficiency"),
        match_id: make_stat_matchup(player, enemy, "match_id"),
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
- Add wait before sending the match details request
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
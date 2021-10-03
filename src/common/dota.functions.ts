export const getWinrate = (win: number, lose: number) => (win / (win + lose)) * 100

export const getWinrateByMatchDuration = teamMatches => {
    const lastYear = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365)
  const _40min = 40 * 60, longer = [], shorter = []

  for (let i = 0; i < teamMatches.length; ++i) {
    const match = teamMatches[i]

    if (new Date(match.start_time * 1000) < lastYear) continue

    if (match.duration > _40min) {
      longer.push(match)
    } else {
      shorter.push(match)
    }
  }

  const winShorter = shorter.filter(match => match.radiant === match.radiant_win)
  const winLonger = longer.filter(match => match.radiant === match.radiant_win)

  return {
    games_longer: longer.length,
    games_shorter: shorter.length,
    winrate_longer: getWinrate(winLonger.length, longer.length - winLonger.length),
    winrate_shorter: getWinrate(winShorter.length, shorter.length - winShorter.length)
  }
}

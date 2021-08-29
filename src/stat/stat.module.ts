import { Module } from '@nestjs/common'
import { HeroesModule } from 'src/heroes/heroes.module'
import { PlayersModule } from 'src/players/players.module'
import { TeamsModule } from 'src/teams/teams.module'
import { StatController } from './stat.controller'
import { StatService } from './stat.service'

@Module({
  imports: [
    PlayersModule,
    HeroesModule,
    TeamsModule,
  ],
  controllers: [StatController],
  providers: [StatService],
})
export class StatModule {
}

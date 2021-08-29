import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { HeroesModule } from 'src/heroes/heroes.module'
import { OverlaysModule } from 'src/overlays/overlays.module'
import { PlayersModule } from 'src/players/players.module'
import { StatModule } from 'src/stat/stat.module'
import { TeamsModule } from 'src/teams/teams.module'
import { AppController } from './app.controller'

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DB_CONNECTION),
    OverlaysModule,
    TeamsModule,
    HeroesModule,
    PlayersModule,
    StatModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

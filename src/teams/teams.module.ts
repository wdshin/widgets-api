import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamsController } from './teams.controller';
import { Teams, TeamsSchema } from './teams.schema';
import { TeamsService } from './teams.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Teams.name, schema: TeamsSchema }]),
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {
}

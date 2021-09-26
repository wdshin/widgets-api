import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateDto } from 'src/common/dto/update.dto';
import { Players } from 'src/players/players.schema';
import { PlayersService } from 'src/players/players.service';
import { Teams, TeamsDocument } from './teams.schema';

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Teams.name) private readonly teamsModel: Model<TeamsDocument>,
    private readonly playersService: PlayersService,
    ) {}

  async getTeams(): Promise<Teams[]> {
    const teams = await this.teamsModel.find();
    return teams;
  }

  async getTeamById(id: number): Promise<Teams> {
    const team = await this.teamsModel.findOne({ team_id: id });
    return team;
  }

  async getTeamPlayers(id: number): Promise<Players[]> {
    return this.playersService.getPlayersByTeamId(id)
  }

  async createTeam(data: Teams): Promise<TeamsDocument> {
    const team = await this.teamsModel.create(data);
    await team.save();
    return team;
  }

  async updateOneTeam(id: number, data): Promise<UpdateDto> {
    const res = await this.teamsModel.updateOne({ id }, data);

    return {
      ok: Boolean(res.acknowledged)
    };
  }
}

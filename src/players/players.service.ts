import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateDto } from 'src/common/dto/update.dto';
import { Players } from './players.schema';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(Players.name) private readonly playersModel: Model<Players>,
    ) {}

  async getPlayers(): Promise<Players[]> {
    const players = await this.playersModel.find();
    return players;
  }

  async getPlayerById(id: number): Promise<Players> {
    const player = await this.playersModel.findOne({ account_id: id });
    return player;
  }

  async updateOnePlayer(id: number, data): Promise<UpdateDto> {
    const res = await this.playersModel.updateOne({ id }, data);

    return {
      ok: Boolean(res.acknowledged)
    };
  }
}

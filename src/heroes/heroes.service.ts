import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateDto } from 'src/common/dto/update.dto';
import { Heroes, HeroesDocument } from './heroes.schema';

@Injectable()
export class HeroesService {
  constructor(
    @InjectModel(Heroes.name) private readonly heroesModel: Model<HeroesDocument>,
    ) {}

  async getHeroes(): Promise<Heroes[]> {
    const heroes = await this.heroesModel.find();
    return heroes;
  }

  async getHeroById(id: number): Promise<Heroes> {
    const hero = await this.heroesModel.findOne({ id });
    return hero;
  }

  async updateOneHero(id: string, data): Promise<UpdateDto> {
    const res = await this.heroesModel.updateOne({ id }, data);

    return {
      ok: Boolean(res.acknowledged)
    };
  }
}

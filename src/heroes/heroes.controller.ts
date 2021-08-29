import { Controller, Get, Param } from '@nestjs/common';
import { Heroes } from './heroes.schema';
import { HeroesService } from './heroes.service';

@Controller('heroes')
export class HeroesController {
  constructor(
    private readonly heroesService: HeroesService,
  ) {
  }

  @Get('/:hero_id')
  async getHero(
    @Param('hero_id') heroId: number,
  ): Promise<Heroes> {
    return this.heroesService.getHeroById(heroId);
  }

  @Get('/')
  async getHeroes(): Promise<Heroes[]> {
    return this.heroesService.getHeroes();
  }
}

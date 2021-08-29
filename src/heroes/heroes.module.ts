import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HeroesController } from './heroes.controller';
import { Heroes, HeroesSchema } from './heroes.schema';
import { HeroesService } from './heroes.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Heroes.name, schema: HeroesSchema }]),
  ],
  controllers: [HeroesController],
  providers: [HeroesService],
  exports: [HeroesService],
})
export class HeroesModule {
}

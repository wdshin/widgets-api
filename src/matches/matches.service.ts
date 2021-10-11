import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Matches, MatchesDocument } from './matches.schema';

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(Matches.name) private readonly matchesModel: Model<MatchesDocument>,
    ) {}

  async getMatches(): Promise<Matches[]> {
    const matches = await this.matchesModel.find({ start_time: { $gte: 1633471200 } }); // after TI10 start
    return matches;
  }
}

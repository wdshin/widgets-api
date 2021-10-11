import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type MatchesDocument = Matches & Document

class PickBansDto {
  is_pick: boolean
  hero_id: number
  team: number
  order: number
}

@Schema()
export class Matches {
  @Prop({ required: true })
  readonly match_id: number

  @Prop({ required: true })
  readonly picks_bans: Array<PickBansDto>

  @Prop({ required: true })
  readonly start_time: number

  @Prop({ required: true })
  readonly radiant_win: boolean
}

export const MatchesSchema = SchemaFactory.createForClass(Matches)

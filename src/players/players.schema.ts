import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type PlayersDocument = Players & Document

@Schema()
export class Players {
  @Prop({ required: true })
  readonly team_id: number

  @Prop({ required: true })
  readonly account_id: number
  
  @Prop({ default: "" })
  readonly name: string

  @Prop({ default: "" })
  readonly real_name: string

  @Prop({ default: 0 })
  readonly prize: number

  @Prop({ default: "" })
  readonly img: string

  @Prop({ default: "" })
  readonly country_code: string
}

export const PlayersSchema = SchemaFactory.createForClass(Players)

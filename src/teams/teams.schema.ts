import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type TeamsDocument = Teams & Document

@Schema()
export class Teams {
  @Prop({ required: true })
  readonly team_id: number

  @Prop({ required: true })
  readonly name: string
  
  @Prop({ default: "" })
  readonly logo_url: string

  @Prop({ default: 0 })
  readonly prize_money_overall: number

  @Prop({ default: 0 })
  readonly wins: number

  @Prop({ default: 0 })
  readonly losses: number
}

export const TeamsSchema = SchemaFactory.createForClass(Teams)

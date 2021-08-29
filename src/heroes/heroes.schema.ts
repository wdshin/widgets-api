import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type HeroesDocument = Heroes & Document

@Schema()
export class Heroes {
  @Prop({ required: true })
  readonly id: number

  @Prop({ required: true })
  readonly name: string

  @Prop({ default: "" })
  readonly localized_name: string
  
  @Prop({ default: "" })
  readonly img: string

  @Prop({ default: "" })
  readonly icon: string
}

export const HeroesSchema = SchemaFactory.createForClass(Heroes)

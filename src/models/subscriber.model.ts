import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

export interface SubscriberModel extends Base {}

export class SubscriberModel extends TimeStamps {
	@prop({ unique: true })
	userId: number

	@prop({ unique: true })
	userName: string

	@prop()
	expireDate: Date

	@prop()
	locale: string

	@prop({ unique: true })
	orderId: number

	@prop({ unique: true })
	paymentId: number

	@prop({ unique: true })
	rectoken: string

	@prop({ unique: true })
	email: string

	@prop({ default: true })
	isSubscribed: boolean
}

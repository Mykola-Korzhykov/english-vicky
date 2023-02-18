import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

export interface SubscriberModel extends Base {}

export class SubscriberModel extends TimeStamps {
	@prop({ unique: true })
	userId: string

	@prop({ unique: true })
	userName: string

	@prop()
	expireDate: Date

	@prop({ unique: true })
	orderId: string

	@prop({ unique: true })
	paymentId: string

	@prop({ unique: true })
	rectoken: string

	@prop({ unique: true })
	email: string

	@prop({ default: true })
	isSubscribed: boolean
}

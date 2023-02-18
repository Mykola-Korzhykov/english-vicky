import { Module } from '@nestjs/common'
import { PaymentController } from './payment.controller'
import { PaymentService } from './payment.service'
import { TypegooseModule } from 'nestjs-typegoose/dist/typegoose.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { getMongoConfig } from 'src/config/mongo.config'
import { HelpersService } from 'src/helpers/helpers.service'
import { InvitesService } from 'src/invites/invites.service'
import { HelpersModule } from 'src/helpers/helpers.module'
import { InvitesModule } from 'src/invites/invites.module'
import { SubscriberModel } from 'src/models/subscriber.model'

@Module({
	imports: [
		TypegooseModule.forFeature([
			{
				typegooseClass: SubscriberModel,
				schemaOptions: {
					collection: 'Subscriber'
				}
			}
		]),
		HelpersModule,
		InvitesModule
	],
	controllers: [PaymentController],
	providers: [PaymentService, HelpersService, InvitesService]
})
export class PaymentModule {}

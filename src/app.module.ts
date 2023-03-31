import { Module } from '@nestjs/common'
import { AppUpdate } from './app.update'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TelegrafModule } from 'nestjs-telegraf'
import { InvitesModule } from './invites/invites.module'
import { InvitesService } from './invites/invites.service'
import { HelpersModule } from './helpers/helpers.module'
import { HelpersService } from './helpers/helpers.service'
import { PaymentModule } from './payment/payment.module'
import getTelegrafConfig from './config/telegraf.config'
import { getMongoConfig } from './config/mongo.config'
import { PaymentService } from './payment/payment.service'
import { TypegooseModule } from 'nestjs-typegoose/dist/typegoose.module'
import { SubscriberModel } from './models/subscriber.model'
import { AppController } from './app.controller'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypegooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getMongoConfig
		}),
		TelegrafModule.forRootAsync({
			imports: [],
			useFactory: getTelegrafConfig,
			inject: [ConfigService]
		}),
		TypegooseModule.forFeature([
			{
				typegooseClass: SubscriberModel,
				schemaOptions: {
					collection: 'Subscriber'
				}
			}
		]),
		InvitesModule,
		HelpersModule,
		PaymentModule
	],
	controllers: [AppController],
	providers: [
		AppService,
		AppUpdate,
		HelpersService,
		InvitesService,
		PaymentService
	]
})
export class AppModule {}

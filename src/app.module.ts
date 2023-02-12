import { Module } from '@nestjs/common'
import { AppUpdate } from './app.update'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TelegrafModule } from 'nestjs-telegraf'
import { InvitesModule } from './invites/invites.module'
import { InvitesService } from './invites/invites.service'
import { HelpersModule } from './helpers/helpers.module'
import { HelpersService } from './helpers/helpers.service'
import { PaymentModule } from './payment/payment.module';
import getTelegrafConfig from './config/getTelegrafConfig'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TelegrafModule.forRootAsync({
			imports: [],
			useFactory: getTelegrafConfig,
			inject: [ConfigService]
		}),
		InvitesModule,
		HelpersModule,
		PaymentModule
	],
	controllers: [],
	providers: [AppService, AppUpdate, HelpersService, InvitesService]
})
export class AppModule {}

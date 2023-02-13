import { Controller, Get } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Action, Hears, InjectBot, Start, Update } from 'nestjs-telegraf'
import { Telegraf } from 'telegraf'
import { mainMenu, selectLanguage } from './app.buttons'
import { AppService } from './app.service'
import { getLocales } from './config/languages'
import { menuMessages } from './config/messages'
import Context from './interfaces/context.interface'

@Update()
export class AppUpdate {
	constructor(
		@InjectBot() private readonly bot: Telegraf<Context>,
		private readonly configService: ConfigService,
		private readonly appService: AppService
	) {}

	@Start()
	async startCommand(ctx: Context) {
		if (!ctx.session.locale) {
			ctx.session.locale = await this.configService.get('DEFAULT_LOCALE')
		}

		this.appService.startCommand(ctx)
	}

	@Hears(Object.values(menuMessages.accessChannel))
	async getChannelAccess(ctx: Context) {
		this.appService.getChannelAccess(ctx)
	}

	@Hears(Object.values(menuMessages.aboutChannel))
	async aboutChannel(ctx: Context) {
		this.appService.aboutChannel(ctx)
	}

	@Hears(Object.values(menuMessages.aboutChat))
	async aboutChat(ctx: Context) {
		this.appService.aboutChat(ctx)
	}

	@Hears(Object.values(menuMessages.support))
	async getSupport(ctx: Context) {
		this.appService.getSupport(ctx)
	}

	@Action(getLocales())
	async selectLocale(ctx: Context) {
		this.appService.selectLocale(ctx)
	}

	@Hears(Object.values(menuMessages.changeLocale))
	async changeLocale(ctx: Context) {
		this.appService.changeLocale(ctx)
	}

	/* @Action('main_menu')
	async toMenu(ctx: Context) {
		this.appService.toMenu(ctx)
	} */
}

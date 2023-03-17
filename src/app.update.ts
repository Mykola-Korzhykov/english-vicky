import { Controller, Get, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { Action, Hears, InjectBot, Start, Update } from 'nestjs-telegraf'
import { InjectModel } from 'nestjs-typegoose'
import { Telegraf } from 'telegraf'
import { selectLanguage } from './app.buttons'
import { AppService } from './app.service'
import { getLocales } from './config/languages'
import { menuMessages, paymentMessages, subscribeMessages } from './config/messages'
import Context from './interfaces/context.interface'

@Update()
export class AppUpdate implements OnModuleInit {
	constructor(
		@InjectBot() private readonly bot: Telegraf<Context>,
		private readonly configService: ConfigService,
		private readonly appService: AppService
	) {}

	private readonly CHANNEL_ID = this.configService.get<string>('CHANNEL_ID')
	private readonly CHAT_ID = this.configService.get<string>('CHAT_ID')

	onModuleInit() {
		this.appService.runCheckSubscribers(this.bot);
	}

	@Start()
	async startCommand(ctx: Context) {
		const currentChatId = String(ctx.chat.id)
		if (currentChatId !== this.CHAT_ID && currentChatId !== this.CHANNEL_ID) {
			ctx.session.userId = Number(ctx.from.id)

			if (!ctx.session.locale) {
				ctx.session.locale = await this.configService.get('DEFAULT_LOCALE')
			}

			this.appService.startCommand(ctx)
		}
	}

	@Hears(Object.values(menuMessages.accessChannel))
	async getChannelAccess(ctx: Context) {
		const currentChatId = String(ctx.chat.id)
		if (currentChatId !== this.CHAT_ID && currentChatId !== this.CHANNEL_ID) {
			this.appService.getChannelAccess(ctx)
		}
	}

	@Hears(Object.values(menuMessages.aboutChannel))
	async aboutChannel(ctx: Context) {
		const currentChatId = String(ctx.chat.id)
		if (currentChatId !== this.CHAT_ID && currentChatId !== this.CHANNEL_ID) {
			this.appService.aboutChannel(ctx)
		}
	}

	@Hears(Object.values(menuMessages.aboutChat))
	async aboutChat(ctx: Context) {
		const currentChatId = String(ctx.chat.id)
		if (currentChatId !== this.CHAT_ID && currentChatId !== this.CHANNEL_ID) {
			this.appService.aboutChat(ctx)
		}
	}

	@Hears(Object.values(menuMessages.support))
	async getSupport(ctx: Context) {
		const currentChatId = String(ctx.chat.id)
		if (currentChatId !== this.CHAT_ID && currentChatId !== this.CHANNEL_ID) {
			this.appService.getSupport(ctx)
		}
	}

	@Action(getLocales())
	async selectLocale(ctx: Context) {
		const currentChatId = String(ctx.chat.id)
		if (currentChatId !== this.CHAT_ID && currentChatId !== this.CHANNEL_ID) {
			this.appService.selectLocale(ctx)
		}
	}

	@Hears(Object.values(menuMessages.changeLocale))
	async changeLocale(ctx: Context) {
		const currentChatId = String(ctx.chat.id)
		if (currentChatId !== this.CHAT_ID && currentChatId !== this.CHANNEL_ID) {
			this.appService.changeLocale(ctx)
		}
	}

	@Hears(Object.values(paymentMessages.checkPayment))
	async checkPayment(ctx: Context) {
		const currentChatId = String(ctx.chat.id)
		if (currentChatId !== this.CHAT_ID && currentChatId !== this.CHANNEL_ID) {
			this.appService.checkPayment(ctx)
		}
	}

	@Hears(Object.values(paymentMessages.cancelPayment))
	async cancelPayment(ctx: Context) {
		const currentChatId = String(ctx.chat.id)
		if (currentChatId !== this.CHAT_ID && currentChatId !== this.CHANNEL_ID) {
			this.appService.cancelPayment(ctx)
		}
	}

	/* @Hears('/check_subscribe')
	async checkSubscribers(ctx: Context) {
		const currentChatId = String(ctx.chat.id)
		if (currentChatId !== this.CHAT_ID && currentChatId !== this.CHANNEL_ID) {
			this.appService.checkSubscribers(this.bot)
		}
	} */

	@Hears(Object.values(menuMessages.extendSubscribe))
	async extendSubscribe(ctx: Context) {
		const currentChatId = String(ctx.chat.id)
		if (currentChatId !== this.CHAT_ID && currentChatId !== this.CHANNEL_ID) {
			this.appService.extendSubscribe(ctx)
		}
	}

	@Hears(Object.values(menuMessages.subscribeInfo))
	async checkSubscribe(ctx: Context) {
		const currentChatId = String(ctx.chat.id)
		if (currentChatId !== this.CHAT_ID && currentChatId !== this.CHANNEL_ID) {
			this.appService.checkSubscribe(ctx)
		}
	}

	@Hears(Object.values(menuMessages.cancelSubscribe))
	async cancelSubscribe(ctx: Context) {
		const currentChatId = String(ctx.chat.id)
		if (currentChatId !== this.CHAT_ID && currentChatId !== this.CHANNEL_ID) {
			this.appService.cancelSubscribe(ctx)
		}
	}

	async runCheckSubscribers() {
		const midnight = new Date();
		midnight.setHours(24, 0, 0, 0);
	
		const timeUntilMidnight = midnight.getTime() - new Date().getTime() + (60 * 60 * 1000);
	  
		setTimeout(() => {
		  this.appService.checkSubscribers(this.bot)
	  
		  setInterval(() => {
			this.appService.checkSubscribers(this.bot);
		  }, 25 * 60 * 60 * 1000); // 25 * 60 * 60 * 1000 | 60000
		}, timeUntilMidnight); // timeUntilMidnight | 60000
	}
}

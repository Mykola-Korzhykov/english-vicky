import { Injectable } from '@nestjs/common'
import Context from './interfaces/context.interface'
import { InvitesService } from './invites/invites.service'
import { selectLanguage, mainMenu, backMenu } from './app.buttons'
import { HelpersService } from './helpers/helpers.service'
import { globalMessages } from './config/messages'
import { languages } from './config/languages'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AppService {
	constructor(
		private readonly configService: ConfigService,
		private readonly helperService: HelpersService,
		private readonly inviteService: InvitesService
	) {}

	async startCommand(ctx: Context) {
		const locale = ctx.session.locale
		const message = await this.helperService.replacePlaceholders(
			globalMessages.greeting[locale],
			{ userName: ctx.from.first_name }
		)

		await ctx.reply(message, await selectLanguage(ctx.session.locale))
	}

	async getChannelAccess(ctx: Context) {
		const locale = ctx.session.locale
		const linkMessage = await this.helperService.replacePlaceholders(
			globalMessages.givePayLink[locale],
			{ payLink: '*** Link for pay from Fondy ***' }
		)

		await ctx.reply(linkMessage)

		const inviteLink = await this.inviteService.generateInviteLink(ctx)
		const successMessage = await this.helperService.replacePlaceholders(
			globalMessages.successPay[locale],
			{ inviteLink }
		)

		await ctx.reply(successMessage)
		await ctx.deleteMessage()
		ctx.session.isPaid = true
	}

	async aboutChannel(ctx: Context) {
		const locale = ctx.session.locale

		await ctx.reply(globalMessages.aboutChannel[locale], await backMenu(locale))
		await ctx.deleteMessage()
	}

	async aboutChat(ctx: Context) {
		const locale = ctx.session.locale

		await ctx.reply(globalMessages.aboutChat[locale], await backMenu(locale))
		await ctx.deleteMessage()
	}

	async getSupport(ctx: Context) {
		const locale = ctx.session.locale
		const supportLink = await this.configService.get('SUPPORT_LINK')

		const message = await this.helperService.replacePlaceholders(
			globalMessages.getSupport[locale],
			{ supportLink }
		)

		await ctx.reply(message, await backMenu(locale))
		await ctx.deleteMessage()
	}

	async selectLocale(ctx: Context, changeLocale: boolean = true) {
		if (changeLocale === true) {
			ctx.session.locale = await ctx.callbackQuery.data
		}

		const locale = ctx.session.locale
		const localeObject = await this.helperService.getObjectByProperty(
			languages,
			'locale',
			locale
		)

		const message = globalMessages.whatInteresting[locale]

		await ctx.reply(message, await mainMenu(localeObject))
		await ctx.deleteMessage()
	}

	async changeLocale(ctx: Context) {
		const locale = ctx.session.locale
		const message = await this.helperService.replacePlaceholders(
			globalMessages.greeting[locale],
			{ userName: ctx.from.first_name }
		)

		await ctx.reply(message, await selectLanguage(ctx.session.locale))
		await ctx.deleteMessage()
	}

	async toMenu(ctx: Context) {
		await this.selectLocale(ctx, false)
	}
}

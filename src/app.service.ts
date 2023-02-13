import { Injectable } from '@nestjs/common'
import Context from './interfaces/context.interface'
import { InvitesService } from './invites/invites.service'
import { selectLanguage, mainMenu } from './app.buttons'
import { HelpersService } from './helpers/helpers.service'
import { globalMessages, menuMessages } from './config/messages'
import { languages } from './config/languages'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AppService {
	constructor(
		private readonly configService: ConfigService,
		private readonly helperService: HelpersService,
		private readonly inviteService: InvitesService
	) {}

	private readonly CHANNEL_ID = this.configService.get<string>('CHANNEL_ID')
	private readonly CHAT_ID = this.configService.get<string>('CHAT_ID')
	private readonly TG_LINK: string = this.configService.get('TG_LINK')
	private readonly INSTA_LINK: string = this.configService.get('INSTA_LINK')
	private readonly EMAIL: string = this.configService.get('EMAIL')

	async startCommand(ctx: Context) {
		const currentChatId = String(ctx.chat.id)
		if (currentChatId !== this.CHAT_ID && currentChatId !== this.CHANNEL_ID) {
			const locale = ctx.session.locale
			const message = globalMessages.start.en

			await ctx.reply(message, await selectLanguage(ctx.session.locale))
		}
	}

	async getChannelAccess(ctx: Context) {
		const locale = ctx.session.locale
		const linkMessage = await this.helperService.replacePlaceholders(
			globalMessages.givePayLink[locale],
			{ payLink: '*** Link for pay from Fondy ***' }
		)

		await ctx.reply(linkMessage)

		const channelInviteLink = await this.inviteService.generateInviteLink(
			ctx,
			'channel'
		)
		const chatInviteLink = await this.inviteService.generateInviteLink(
			ctx,
			'chat'
		)

		const successMessage = await this.helperService.replacePlaceholders(
			globalMessages.successPay[locale],
			{ channelInviteLink, chatInviteLink }
		)

		await ctx.reply(successMessage)
	}

	async aboutChannel(ctx: Context) {
		const locale = ctx.session.locale

		await ctx.reply(globalMessages.aboutChannel[locale], {
			parse_mode: 'Markdown'
		})
	}

	async aboutChat(ctx: Context) {
		const locale = ctx.session.locale

		await ctx.reply(globalMessages.aboutChat[locale], {
			parse_mode: 'Markdown'
		})
	}

	async getSupport(ctx: Context) {
		const locale = ctx.session.locale

		const message = await this.helperService.replacePlaceholders(
			globalMessages.getSupport[locale],
			{
				telegram: this.TG_LINK,
				instagram: this.INSTA_LINK,
				email: this.EMAIL
			}
		)

		await ctx.reply(message)
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

		const message = globalMessages.greeting[locale]

		ctx.reply(message, await mainMenu(localeObject))
		await ctx.deleteMessage()
	}

	async changeLocale(ctx: Context) {
		const locale = ctx.session.locale
		const message = await this.helperService.replacePlaceholders(
			globalMessages.start.en,
			{ userName: ctx.from.first_name }
		)

		await ctx.reply(message, await selectLanguage(ctx.session.locale))
	}

	async toMenu(ctx: Context) {
		await this.selectLocale(ctx, false)
	}
}

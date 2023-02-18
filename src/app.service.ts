import { Injectable } from '@nestjs/common'
import Context from './interfaces/context.interface'
import { InvitesService } from './invites/invites.service'
import { selectLanguage, mainMenu, paymentMenu } from './app.buttons'
import { HelpersService } from './helpers/helpers.service'
import {
	globalMessages,
	menuMessages,
	paymentMessages
} from './config/messages'
import { languages } from './config/languages'
import { ConfigService } from '@nestjs/config'
import { PaymentService } from './payment/payment.service'

@Injectable()
export class AppService {
	constructor(
		private readonly configService: ConfigService,
		private readonly helperService: HelpersService,
		private readonly inviteService: InvitesService,
		private readonly paymentService: PaymentService
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

		const payLink = await this.paymentService.createPaymentLink(ctx)

		const linkMessage = await this.helperService.replacePlaceholders(
			globalMessages.givePayLink[locale],
			{ payLink }
		)

		await ctx.reply(linkMessage, await paymentMenu(locale))
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

		const message = globalMessages.greeting[locale]

		ctx.reply(message, await mainMenu(locale))
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

	async checkPayment(ctx: Context) {
		const locale = ctx.session.locale

		const orderId = ctx.session.orderId
		const paymentId = ctx.session.paymentId

		const { order_status, amount, currency, rectoken, sender_email } =
			await this.paymentService.checkPayment(orderId)

		const text = paymentMessages.checkPaymentResult[locale]
		const statusText = paymentMessages[order_status][locale]

		const message = await this.helperService.replacePlaceholders(text, {
			orderId,
			statusText,
			amount: amount / 100,
			currency
		})

		await ctx.reply(message, { parse_mode: 'Markdown' })

		if (order_status === 'approved') {
			await this.paymentService.successPayment(
				ctx.from.id,
				ctx.from.username,
				orderId,
				paymentId,
				rectoken,
				sender_email,
				locale
			)
		}
	}
}

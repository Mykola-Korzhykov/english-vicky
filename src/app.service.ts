import { Injectable } from '@nestjs/common'
import Context from './interfaces/context.interface'
import { InvitesService } from './invites/invites.service'
import { selectLanguage, mainMenu, paymentMenu } from './app.buttons'
import { HelpersService } from './helpers/helpers.service'
import { globalMessages, menuMessages, paymentMessages, subscribeMessages } from './config/messages'
import { languages } from './config/languages'
import { ConfigService } from '@nestjs/config'
import { PaymentService } from './payment/payment.service'
import { InjectModel } from 'nestjs-typegoose'
import { SubscriberModel } from './models/subscriber.model'
import { ModelType } from '@typegoose/typegoose/lib/types'

@Injectable()
export class AppService {
	constructor(
		private readonly configService: ConfigService,
		private readonly helperService: HelpersService,
		private readonly inviteService: InvitesService,
		private readonly paymentService: PaymentService,
		@InjectModel(SubscriberModel)
		private readonly subscriberModel: ModelType<SubscriberModel>
	) {}

	private readonly CHANNEL_ID = this.configService.get<string>('CHANNEL_ID')
	private readonly CHAT_ID = this.configService.get<string>('CHAT_ID')
	private readonly TG_LINK: string = this.configService.get('TG_LINK')
	private readonly INSTA_LINK: string = this.configService.get('INSTA_LINK')
	private readonly EMAIL: string = this.configService.get('EMAIL')

	async startCommand(ctx: Context) {
		const locale = ctx.session.locale
		const message = globalMessages.start.en

		await ctx.reply(message, await selectLanguage(ctx.session.locale))
	}

	async getChannelAccess(ctx: Context) {
		const locale = ctx.session.locale

		const userId = ctx.session.userId
		const user = await this.subscriberModel.findOne({ userId })
		if (user) {
			await ctx.reply(subscribeMessages.exists[locale], await mainMenu(locale, true))
			return
		}

		const payLink = await this.paymentService.createPaymentLink(ctx)
		const linkMessage = await this.helperService.replacePlaceholders(globalMessages.givePayLink[locale], { payLink })

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

		const message = await this.helperService.replacePlaceholders(globalMessages.getSupport[locale], {
			telegram: this.TG_LINK,
			instagram: this.INSTA_LINK,
			email: this.EMAIL
		})

		await ctx.reply(message)
	}

	async selectLocale(ctx: Context, changeLocale: boolean = true) {
		if (changeLocale === true) {
			const locale = await ctx.callbackQuery.data
			ctx.session.locale = locale
		}

		const locale = ctx.session.locale

		const userId = ctx.session.userId
		const user = await this.subscriberModel.findOne({ userId })

		if (user) {
			await user.update({ locale }).exec()
		}

		const message = globalMessages.greeting[locale]

		const isSubscribe = !user ? false : true
		const isAutoPay = !user ? false : user.isSubscribed

		ctx.reply(message, await mainMenu(locale, isSubscribe, isAutoPay))
		await ctx.deleteMessage()
	}

	async changeLocale(ctx: Context) {
		const locale = ctx.session.locale
		const message = await this.helperService.replacePlaceholders(globalMessages.start.en, {
			userName: ctx.from.first_name
		})

		await ctx.reply(message, await selectLanguage(ctx.session.locale))
	}

	async checkPayment(ctx: Context) {
		const locale = ctx.session.locale

		const userId = ctx.session.userId
		const user = await this.subscriberModel.findOne({ userId })
		const isExtend = !user ? false : !user.isSubscribed

		const orderId = ctx.session.orderId
		const paymentId = ctx.session.paymentId

		const { order_status, amount, currency, rectoken, sender_email } = await this.paymentService.checkPayment(orderId)

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
			await this.paymentService.successPayment(ctx.from.id, ctx.from.username, orderId, paymentId, rectoken, sender_email, locale, isExtend)
		}
	}

	async cancelPayment(ctx: Context) {
		const locale = ctx.session.locale
		await ctx.reply(globalMessages.greeting[locale], await mainMenu(locale, false))
	}

	async checkSubscribers(bot) {
		const subscribers = await this.subscriberModel.find()
		subscribers.forEach(async ({ userId, userName, expireDate, locale, rectoken, isSubscribed }) => {
			if ((await this.helperService.isYesterdayISO(expireDate, 3))) {
				bot.telegram.sendMessage(userId, subscribeMessages.soonAutoPay[locale], await mainMenu(locale, true, true))
				return
			}

			if ((await this.helperService.isYesterdayISO(expireDate, 2))) {
				const { order_status } = await this.paymentService.recurring(rectoken, locale)

				if (order_status === 'approved') {
					bot.telegram.sendMessage(userId, subscribeMessages.autoPayApproved[locale], await mainMenu(locale, true, true))
					await this.subscriberModel.findOneAndUpdate({ userId }, { expireDate: await this.helperService.getNextMonth(expireDate) }).exec()
				} else {
					bot.telegram.sendMessage(userId, subscribeMessages.autoPayFailed[locale], await mainMenu(locale, true, false))
					await this.subscriberModel.findOneAndUpdate({ userId }, { isSubscribed: false }).exec()
				}

				return
			}

			/* if (!isSubscribed && (await this.helperService.isYesterdayISO(expireDate))) {
				bot.telegram.sendMessage(userId, subscribeMessages.soonExpired[locale], await mainMenu(locale, true, false))
				return
			} */

			if (new Date() > expireDate) {
				bot.telegram.kickChatMember(this.CHANNEL_ID, userId, await this.helperService.getCurrentUnixTime())
				bot.telegram.kickChatMember(this.CHAT_ID, userId, await this.helperService.getCurrentUnixTime())
				bot.telegram.sendMessage(userId, subscribeMessages.expired[locale], await mainMenu(locale, false))
				await this.subscriberModel.findOneAndDelete({ userId }).exec()

				return
			}
		})
	}

	async checkSubscribe(ctx: Context) {
		const locale = ctx.session.locale
		const userId = ctx.session.userId

		const user = await this.subscriberModel.findOne({ userId })
		const isSubscribe = !user ? false : true
		const isExtend = !user ? false : user.isSubscribed

		const autoPay = user.isSubscribed ? globalMessages.on[locale] : globalMessages.off[locale]

		const message = await this.helperService.replacePlaceholders(subscribeMessages.check[locale], {
			amount: (await this.configService.get('PAYMENT_AMOUNT')) / 100,
			currency: await this.configService.get('PAYMENT_CURRENCY'),
			autoPay,
			expireDate: await this.helperService.convertDateToCustomFormat(user.expireDate)
		})

		await ctx.reply(message, {
			parse_mode: 'Markdown',
			reply_markup: await (await mainMenu(locale, isSubscribe, isExtend)).reply_markup
		})
	}

	async extendSubscribe(ctx: Context) {
		const locale = ctx.session.locale

		const payLink = await this.paymentService.createPaymentLink(ctx, true)
		const linkMessage = await this.helperService.replacePlaceholders(globalMessages.givePayLink[locale], { payLink })

		await ctx.reply(linkMessage, await paymentMenu(locale))
	}

	async cancelSubscribe(ctx: Context) {
		const locale = ctx.session.locale
		const userId = ctx.session.userId

		const user = await this.subscriberModel.findOne({ userId })
		await user.update({ isSubscribed: false }).exec()

		await ctx.reply(subscribeMessages.cancel[locale], await mainMenu(locale, true, false))
	}

	async runCheckSubscribers(bot) {
		const midnight = new Date();
		midnight.setHours(24, 0, 0, 0);
	  
		const timeUntilMidnight = midnight.getTime() - new Date().getTime();
	  
		setTimeout(() => {
		  this.checkSubscribers(bot)
	  
		  setInterval(() => {
			this.checkSubscribers(bot)
		  }, 60000); // 24 * 60 * 60 * 1000
		}, 60000); // timeUntilMidnight
	}
}

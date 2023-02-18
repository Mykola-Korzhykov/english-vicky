import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
	globalMessages,
	merchantMessages,
	paymentMessages
} from 'src/config/messages'
import { CallbackDto } from './dto/callback.dto'
import { BadRequestException } from '@nestjs/common'
import { InjectBot } from 'nestjs-telegraf'
import { Telegraf } from 'telegraf'
import Context from '../interfaces/context.interface'
import getFondyConfig from 'src/config/fondy.config'
import { mainMenu } from 'src/app.buttons'
import { InvitesService } from 'src/invites/invites.service'
import { HelpersService } from 'src/helpers/helpers.service'
import { InjectModel } from 'nestjs-typegoose'
import { SubscriberModel } from 'src/models/subscriber.model'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { genSalt, hash, compare } from 'bcrypt'

@Injectable()
export class PaymentService {
	constructor(
		@InjectBot() private readonly bot: Telegraf<Context>,
		@InjectModel(SubscriberModel)
		private readonly subscriberModel: ModelType<SubscriberModel>,
		private readonly configService: ConfigService,
		private readonly helperService: HelpersService,
		private readonly inviteService: InvitesService
	) {}

	private readonly fondyService = getFondyConfig(this.configService)
	private readonly digits = '0123456789'

	private async generateOrderId(length: number = 8) {
		let orderId = ''
		for (let i = 0; i < length; i++) {
			orderId += this.digits[Math.floor(Math.random() * 10)]
		}
		return orderId
	}

	async createPaymentLink(ctx: Context) {
		const locale = ctx.session.locale
		const lang = locale === 'ua' ? 'uk' : locale

		const secretKey = await this.configService.get('SECRET_KEY')

		const orderId = await this.generateOrderId()

		const userId = ctx.from.id
		const userName = ctx.from.username

		try {
			const response = await this.fondyService.Checkout({
				order_id: orderId,
				order_desc: merchantMessages.orderDesc[locale],
				currency: this.configService.get('PAYMENT_CURRENCY'),
				amount: this.configService.get('PAYMENT_AMOUNT'),
				required_rectoken: 'Y',
				merchant_data: JSON.stringify({ secretKey, userId, userName, locale }),
				server_callback_url: this.configService.get('CALLBACK_URL'),
				lang
			})

			ctx.session.orderId = orderId
			ctx.session.paymentId = response.payment_id

			return response.checkout_url
		} catch (e) {
			console.log(e)
		}
	}

	async checkPayment(orderId) {
		try {
			const { order_status, sender_email, amount, currency, rectoken } =
				await this.fondyService.Status({
					order_id: orderId
				})

			return { order_status, sender_email, amount, currency, rectoken }
		} catch (e) {
			console.log(e)
		}
	}

	async paymentCallback({
		order_status,
		order_id,
		payment_id,
		rectoken,
		sender_email,
		merchant_data
	}: CallbackDto) {
		if (!order_status || !merchant_data) {
			throw new BadRequestException('Some fields is empty')
		}

		const hashSecret = await hash(
			await this.configService.get('SECRET_KEY'),
			await genSalt(10)
		)

		const { secretKey, userId, userName, locale } = merchant_data
		const compareResult = await compare(secretKey, hashSecret)

		if (!compareResult) throw new BadRequestException('Invalid secret key')

		const orderId = order_id
		const paymentId = payment_id
		const senderEmail = sender_email

		if (order_status !== 'approved') {
			this.bot.telegram.sendMessage(
				userId,
				paymentMessages[order_status][locale],
				await mainMenu(locale)
			)
		}

		if (order_status === 'approved') {
			await this.successPayment(
				userId,
				userName,
				orderId,
				paymentId,
				rectoken,
				senderEmail,
				locale
			)
		}

		return await paymentMessages[order_status][locale]
	}

	async successPayment(
		userId,
		userName,
		orderId,
		paymentId,
		rectoken,
		email,
		locale
	) {
		const channelInviteLink = await this.inviteService.generateInviteLink(
			this.bot,
			userName,
			'channel'
		)
		const chatInviteLink = await this.inviteService.generateInviteLink(
			this.bot,
			userName,
			'chat'
		)

		const successMessage = await this.helperService.replacePlaceholders(
			globalMessages.successPay[locale],
			{ channelInviteLink, chatInviteLink }
		)

		const isExists = await this.subscriberModel.findOne({ userId })
		if (!isExists) {
			const expireDate = await this.helperService.getNextMonth(new Date())
			await this.subscriberModel.create({
				userId,
				userName,
				orderId,
				paymentId,
				expireDate,
				rectoken,
				email
			})
		}

		await this.bot.telegram.sendMessage(
			userId,
			successMessage,
			await mainMenu(locale, true)
		)
	}
}

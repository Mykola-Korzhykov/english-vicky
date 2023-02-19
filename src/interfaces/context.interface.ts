import { Context as ContextTelegraf } from 'telegraf'
import { Callback } from './callbackQuery.interface'

export default interface Context extends ContextTelegraf {
	session: {
		userId?: number
		locale?: string
		orderId?: string
		paymentId?: string
	}
	callbackQuery: Callback
}

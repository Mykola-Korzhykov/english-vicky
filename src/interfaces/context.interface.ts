import { Context as ContextTelegraf } from 'telegraf'
import { Callback } from './callbackQuery.interface'

export default interface Context extends ContextTelegraf {
	session: {
		locale?: 'en' | 'ua' | 'ru'
		isPaid?: boolean
		isGreeting: boolean
	}
	callbackQuery: Callback
}

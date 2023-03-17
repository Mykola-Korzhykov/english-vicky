import { Markup } from 'telegraf'
import { languages } from './config/languages'
import { globalMessages, menuMessages, paymentMessages, subscribeMessages } from './config/messages'
import { HelpersService } from './helpers/helpers.service'
import ILanguage from './interfaces/lanugage.interface'

const helperService = new HelpersService()

export const selectLanguage = async (currentLocale) => {
	const buttons = languages.map(({ flag, translate, locale }) => {
		const text = `${flag} ${translate.en}`
		return Markup.button.callback(text, locale)
	})

	return Markup.inlineKeyboard(buttons)
}

export const mainMenu = async (locale: string, isSubscribe: boolean = false, autoPay: boolean = false) => {
	const getSubscribeButton = () => {
		if (!isSubscribe) {
			return Markup.button.callback(menuMessages.accessChannel[locale], 'get_channel_access')
		} else {
			return Markup.button.callback(menuMessages.subscribeInfo[locale], 'get_subscribe_info')
		}
	}

	const getCancelButton = () => {
		const aboutChannel = Markup.button.callback(menuMessages.aboutChannel[locale], 'about_channel')

		if (autoPay) {
			return [Markup.button.callback(menuMessages.cancelSubscribe[locale], 'cancel_subscribe'), aboutChannel]
		}

		/* if (isSubscribe && !autoPay) {
			return [Markup.button.callback(menuMessages.extendSubscribe[locale], 'extend_subscribe'), aboutChannel]
		} */

		return [aboutChannel]
	}

	return Markup.keyboard(
		[
			getSubscribeButton(),
			...getCancelButton(),
			Markup.button.callback(menuMessages.aboutChat[locale], 'about_chat'),
			Markup.button.callback(menuMessages.support[locale], 'support'),
			Markup.button.callback(menuMessages.changeLocale[locale], 'change_locale')
		],
		{ columns: 2 }
	)
}

export const paymentMenu = async (locale: string) => {
	return Markup.keyboard(
		[
			Markup.button.callback(paymentMessages.checkPayment[locale], 'check_payment'),
			Markup.button.callback(paymentMessages.cancelPayment[locale], 'cancel_payment')
		],
		{ columns: 1 }
	)
}

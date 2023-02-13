import { Markup } from 'telegraf'
import { languages } from './config/languages'
import { globalMessages, menuMessages } from './config/messages'
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

export const mainMenu = async ({ locale }: ILanguage) => {
	return Markup.keyboard(
		[
			Markup.button.callback(
				menuMessages.accessChannel[locale],
				'get_channel_access'
			),
			Markup.button.callback(
				menuMessages.aboutChannel[locale],
				'about_channel'
			),
			Markup.button.callback(menuMessages.aboutChat[locale], 'about_chat'),
			Markup.button.callback(menuMessages.support[locale], 'support'),
			Markup.button.callback(menuMessages.changeLocale[locale], 'change_locale')
		],
		{ columns: 2 }
	)
}

/* export const backMenu = async (locale) => {
	return Markup.keyboard(
		[Markup.button.callback(globalMessages.backButton[locale], 'main_menu')],
		{ columns: 2 }
	)
} */

/* export const aboutChannelMenu = async (locale) => {
	return Markup.keyboard(
		[
			Markup.button.callback(globalMessages.backButton[locale], 'main_menu'),
			Markup.button.callback(menuMessages.aboutChat[locale], 'about_chat')
		],
		{ columns: 2 }
	).reply_markup
} */

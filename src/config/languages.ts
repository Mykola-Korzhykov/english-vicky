import ILanguage from '../interfaces/lanugage.interface'

const languages: ILanguage[] = [
	{
		id: 'english',
		locale: 'en',
		flag: '🇬🇧',
		translate: {
			en: 'English',
			ua: 'Англійська',
			ru: 'Английский'
		}
	},
	{
		id: 'ukrainian',
		locale: 'ua',
		flag: '🇺🇦',
		translate: {
			en: 'Ukrainian',
			ua: 'Українська',
			ru: 'Украинский'
		}
	},
	{
		id: 'russian',
		locale: 'ru',
		flag: '🇷🇺',
		translate: {
			en: 'Russian',
			ua: 'Російська',
			ru: 'Русский'
		}
	}
]

const getLocales = () => languages.map(({ locale }) => locale)

export { languages, getLocales }

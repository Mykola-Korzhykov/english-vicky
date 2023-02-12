export default interface ILanguage {
	id: string
	locale: string
	flag: string
	translate: {
		[key: string]: string
	}
}

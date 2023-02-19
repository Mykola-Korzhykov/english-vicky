import { Injectable } from '@nestjs/common'

@Injectable()
export class HelpersService {
	async replacePlaceholders(string, values) {
		let result = string
		Object.keys(values).forEach((key) => {
			const pattern = new RegExp(`%${key}%`, 'g')
			result = result.replace(pattern, values[key])
		})
		return result
	}

	async getObjectByProperty(array, property, value) {
		return array.find((obj) => obj[property] === value)
	}

	async formatDate(dateString) {
		return new Date(dateString).toISOString()
	}

	async getNextMonth(date) {
		const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate())

		return this.formatDate(nextMonth)
	}

	async isJsonString(string) {
		try {
			JSON.parse(string)
		} catch (e) {
			return false
		}
		return true
	}

	async isYesterdayISO(dateISO) {
		const date = new Date()
		const yesterday = new Date(dateISO)
		yesterday.setDate(yesterday.getDate() - 2)

		return (
			date.getFullYear() === yesterday.getFullYear() &&
			date.getMonth() === yesterday.getMonth() &&
			date.getDate() === yesterday.getDate()
		)
	}

	async isCurrentDateThanISO(dateISO) {
		const currentDate = new Date()
		const inputDate = new Date(dateISO)

		return currentDate.getTime() > inputDate.getTime()
	}

	async getCurrentUnixTime() {
		return Math.floor(Date.now() / 1000) + 10
	}

	async convertDateToCustomFormat(dateString) {
		const date = new Date(dateString);
		const day = date.getDate().toString().padStart(2, '0');
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const year = date.getFullYear();
		return `${day}.${month}.${year}`;
	}
}

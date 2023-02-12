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
}

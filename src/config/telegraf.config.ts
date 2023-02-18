import { ConfigService } from '@nestjs/config'
import * as PostgresSession from 'telegraf-postgres-session'

const getTelegrafConfig = async (configService: ConfigService) => ({
	middlewares: [
		new PostgresSession({
			connectionString: configService.get('DATABASE_URL'),
			ssl: {
				rejectUnauthorized: false
			}
		}).middleware()
	],
	token: configService.get<string>('BOT_TOKEN')
})

export default getTelegrafConfig

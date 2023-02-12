import { ConfigService } from '@nestjs/config'
import * as LocalSession from 'telegraf-session-local'

const sessions = new LocalSession({
	database: 'session_db.json'
})

const getTelegrafConfig = async (configService: ConfigService) => ({
	middlewares: [sessions.middleware()],
	token: configService.get<string>('BOT_TOKEN')
})

export default getTelegrafConfig

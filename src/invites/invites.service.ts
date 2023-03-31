import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Telegraf from 'telegraf'
import Context from '../interfaces/context.interface'

@Injectable()
export class InvitesService {
	constructor(private readonly configService: ConfigService) {}

	private readonly channelId = this.configService.get<string>('CHANNEL_ID')
	private readonly chatId = this.configService.get<string>('CHAT_ID')

	private async getExpireDate() {
		const currentDate = new Date()
		const newDate = new Date(currentDate.getTime() + 1000 * 60 * 60 * 24) // 60 * 60 * 1000

		return newDate.getTime() / 1000
	}

	async generateInviteLink(ctx, userName, type: 'channel' | 'chat') {
		const linkName = await `${userName} | Invite Link`

		const link = await ctx.telegram.createChatInviteLink(this[`${type}Id`], {
			name: linkName,
			expire_date: await this.getExpireDate(),
			member_limit: 1
		})

		return link.invite_link
	}
}

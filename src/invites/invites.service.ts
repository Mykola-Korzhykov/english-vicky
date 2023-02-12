import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Context from '../interfaces/context.interface'

@Injectable()
export class InvitesService {
	constructor(private readonly configService: ConfigService) {}

	private readonly chatId = this.configService.get<string>('CHAT_ID')

	private async getExpireDate() {
		const currentDate = new Date()
		const newDate = new Date(currentDate.getTime() + 60 * 60 * 1000)

		return newDate.getTime() / 1000
	}

	async generateInviteLink(ctx: Context) {
		const linkName = await `${ctx.from.username} | Invite Link`

		const link = await ctx.telegram.createChatInviteLink(this.chatId, {
			name: linkName,
			expire_date: await this.getExpireDate(),
			member_limit: 1
		})

		return link.invite_link
	}
}

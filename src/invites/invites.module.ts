import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InvitesService } from './invites.service'

@Module({
	providers: [InvitesService, ConfigService]
})
export class InvitesModule {}

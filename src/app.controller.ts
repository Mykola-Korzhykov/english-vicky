import { Body, Controller, Post, Req } from '@nestjs/common'
import { HttpCode } from '@nestjs/common/decorators'
import { AppService } from './app.service'

interface KickDto {
    userId: string;
    locale: string;
}

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Post('kick')
	@HttpCode(200)
	async paymentCallback(@Body() data: KickDto, @Req() req: Request) {
        return await this.appService.kickMember(data);
	}
}
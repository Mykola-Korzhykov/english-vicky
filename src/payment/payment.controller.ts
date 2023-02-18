import { Body, Controller, Post } from '@nestjs/common'
import { HttpCode } from '@nestjs/common/decorators'
import { CallbackDto } from './dto/callback.dto'
import { PaymentService } from './payment.service'

@Controller('payment')
export class PaymentController {
	constructor(private readonly paymentService: PaymentService) {}

	@Post('callback')
	@HttpCode(200)
	async paymentCallback(@Body() data: CallbackDto) {
		return await this.paymentService.paymentCallback(data)
	}
}

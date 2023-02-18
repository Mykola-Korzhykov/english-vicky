import { ConfigService } from '@nestjs/config'
import * as CloudIpsp from 'cloudipsp-node-js-sdk'

const getFondyConfig = (configService: ConfigService) => {
	return new CloudIpsp({
		merchantId: configService.get<string>('MERCHANT_ID'),
		secretKey: configService.get<string>('MERCHANT_SECRET')
	})
}

export default getFondyConfig

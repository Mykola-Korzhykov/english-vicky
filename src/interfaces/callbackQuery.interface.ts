import { CallbackQuery } from 'telegraf/typings/core/types/typegram'

export type Callback = CallbackQuery & { data: any }

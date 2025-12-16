import { ConfigService } from '@nestjs/config';
import { TypeOptions } from '../auth/provider/provider.constants';
import { GoogleProvider } from '../auth/provider/services/google.provider';
import { YandexProvider } from '../auth/provider/services/yandex.provider';

export const getProvidersConfig = (
  configService: ConfigService,
): TypeOptions => ({
  baseUrl: configService.getOrThrow<string>('APPLICATION_URL'),
  services: [
    new GoogleProvider({
      scopes: ['profile', 'email'],
      client_id: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      client_secret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
    }),

    new YandexProvider({
      scopes: ['login:email', 'login:avatar', 'login:info'],
      client_id: configService.getOrThrow<string>('YANDEX_CLIENT_ID'),
      client_secret: configService.getOrThrow<string>('YANDEX_CLIENT_SECRET'),
    }),
  ],
});

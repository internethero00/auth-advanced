import { YandexProfile } from './yandexProfile';
import { AuthMethod } from '@prisma/client';

export const userCreateYandexChanger = (profile: YandexProfile) => ({
  email: profile.default_email,
  password: '',
  displayName: profile.display_name,
  picture: profile.default_avatar_id,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  method: AuthMethod[profile.provider.toUpperCase()],
  isVerified: true,
});

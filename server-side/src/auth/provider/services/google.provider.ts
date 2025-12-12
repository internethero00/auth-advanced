import { BaseOAuthService } from './base-oauth.service';
import { TypeProviderOptions } from './types/provider-options.types';
import { GoogleProfile } from './types/googleProfile';
import { TypeUserInfo } from './types/user-info.types';

export class GoogleProvider extends BaseOAuthService {
  public constructor(options: TypeProviderOptions) {
    super({
      name: 'google',
      authorize_url: 'https://accounts.google.com/o/oauth2/v2/auth',
      access_url: 'https://www.googleapis.com/oauth2/v4/token',
      profile_url: 'https://www.googleapis.com/oauth2/v3/userinfo',
      scopes: options.scopes,
      client_id: options.client_id,
      client_secret: options.client_secret,
    });
  }

  public extendProfile(data: GoogleProfile): TypeUserInfo {
    return this.extractUserInfo({
      email: data.email,
      name: data.name,
      picture: data.picture,
    });
  }
}

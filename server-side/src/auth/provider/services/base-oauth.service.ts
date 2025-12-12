import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { TypeBaseProviderOptions } from './types/base-provider-options.types';
import { TypeUserInfo } from './types/user-info.types';

@Injectable()
export class BaseOAuthService {
  private BASE_URL: string;

  public constructor(private readonly options: TypeBaseProviderOptions) {}

  protected extractUserInfo(data: TypeUserInfo): TypeUserInfo {
    return {
      ...data,
      provider: this.options.name,
    };
  }

  public getAuthUrl() {
    const query = new URLSearchParams({
      response_type: 'code',
      client_id: this.options.client_id,
      redirect_uri: this.getRedirectUrl(),
      scope: (this.options.scopes ?? []).join(' '),
      access_type: 'offline',
      prompt: 'select_account',
    });
    return `${this.options.authorize_url}?${query}`;
  }

  public async findUserByCode(code: string): Promise<TypeUserInfo | null> {
    const client_id = this.options.client_id;
    const client_secret = this.options.client_secret;
    const tokenQuery = new URLSearchParams({
      code,
      client_id,
      client_secret,
      redirect_uri: this.getRedirectUrl(),
      grant_type: 'authorization_code',
    });
    const tokenRequest = await fetch(this.options.access_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: tokenQuery,
    });
    const tokenResponse = (await tokenRequest.json()) as TypeUserInfo;
    if (!tokenRequest.ok) {
      throw new BadRequestException('token request failed');
    }

    if (!tokenResponse.access_token) {
      throw new BadRequestException('token response failed');
    }

    const userRequest = await fetch(this.options.profile_url, {
      headers: {
        Authorization: `Bearer ${tokenResponse.access_token}`,
      },
    });

    if (!userRequest.ok) {
      throw new UnauthorizedException('user request failed');
    }
    const user = (await userRequest.json()) as TypeUserInfo;
    const userData = this.extractUserInfo(user);

    return {
      ...userData,
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      expires_at: tokenResponse.expires_at,
      provider: this.options.name,
    };
  }

  public getRedirectUrl(): string {
    return `${this.BASE_URL}/auth/oauth/callback/${this.options.name}`;
  }

  set baseUrl(value: string) {
    this.BASE_URL = value;
  }

  get name(): string {
    return this.options.name;
  }

  get access_url(): string {
    return this.options.access_url;
  }

  get profile_url(): string {
    return this.options.profile_url;
  }

  get scopes(): string[] {
    return this.options.scopes;
  }
}

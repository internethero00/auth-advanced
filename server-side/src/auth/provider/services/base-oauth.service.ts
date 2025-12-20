import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { TypeBaseProviderOptions } from './types/base-provider-options.types';
import { GoogleTokenResponse, TypeUserInfo } from './types/user-info.types';
import { extractUserInfoTypes } from './types/googleProfile';

@Injectable()
export class BaseOAuthService {
  private BASE_URL: string;

  public constructor(private readonly options: TypeBaseProviderOptions) {}

  protected extractUserInfo(data: extractUserInfoTypes): any {
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
      prompt: 'consent',
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
    if (!tokenRequest.ok) {
      throw new BadRequestException('token request failed');
    }
    const tokens = (await tokenRequest.json()) as GoogleTokenResponse;
    // console.log(tokens);

    if (!tokens.access_token) {
      throw new BadRequestException('token response failed');
    }

    const userRequest = await fetch(this.options.profile_url, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userRequest.ok) {
      throw new UnauthorizedException('user request failed');
    }
    const user = (await userRequest.json()) as extractUserInfoTypes;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userData = this.extractUserInfo(user);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
      ...userData,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_in,
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

export interface GoogleProfile extends Record<string, any> {
  aud: string;
  azp: string;
  email: string;
  email_verified: boolean;
  exp: number;
  family_name?: string;
  given_name?: string;
  hd?: string;
  iat: number;
  iss: string;
  jti?: string;
  locale?: string;
  name: string;
  nbf?: number;
  picture: string;
  sub: string;
  access_token: string;
  refresh_token?: string;
}

export type extractUserInfoTypes = Pick<GoogleProfile, 'email'> & {
  picture?: string | undefined;
  name?: string | undefined;
  provider?: string;
  id?: number;
  access_token?: string;
  refresh_token?: string | undefined;
  expires_at?: number | undefined;
};

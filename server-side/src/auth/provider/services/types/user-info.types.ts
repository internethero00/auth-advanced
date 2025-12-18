export type TypeUserInfo = {
  id: number;
  name?: string | undefined;
  email: string;
  picture?: string | undefined;
  access_token?: string | null;
  refresh_token?: string;
  expires_at?: number;
  provider: string;
};

export type GoogleTokenResponse = {
  access_token: string;
  expires_in?: number;
  refresh_token?: string;
  token_type?: string;
  scope?: string;
  id_token?: string;
};

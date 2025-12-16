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

export interface IPayload {
  email: string;
  password: string;
}

export interface IRefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  needPasswordChange: boolean;
}

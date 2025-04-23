export interface JwtPayload {
  sub: number;
  email: string;
  nickName: string;
}

export interface AuthRequest extends Request {
  user: Omit<JwtPayload, 'sub'>;
}

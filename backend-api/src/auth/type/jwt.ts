export interface JwtPayload {
  id: number;
  email: string;
  nickName: string;
}

export interface AuthRequest extends Request {
  user: JwtPayload;
}

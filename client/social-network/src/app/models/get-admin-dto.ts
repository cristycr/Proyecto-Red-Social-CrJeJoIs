export type UserRole = 'admin' | 'user';

export interface GetAdminDto {
  id: number;
  nickname: string;
  avatarPath: string | null;
  email: string;
  role: string;
}

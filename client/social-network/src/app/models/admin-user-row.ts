import { UserRole } from './get-admin-dto';

export type AdminUserRow = {
  id: number;
  nickname: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
};
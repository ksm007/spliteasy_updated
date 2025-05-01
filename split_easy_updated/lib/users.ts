import { hash, compare } from "bcryptjs";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
}

const users: UserRecord[] = [];

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  return users.find((u) => u.email === email);
}

export async function createUser(data: { name: string; email: string; password: string }): Promise<UserRecord> {
  const existing = await findUserByEmail(data.email);
  if (existing) throw new Error("User already exists");
  const passwordHash = await hash(data.password, 10);
  const id = "user-" + Math.random().toString(36).substring(2, 9);
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`;
  const user: UserRecord = { id, name: data.name, email: data.email, passwordHash, avatar };
  users.push(user);
  return user;
}

export async function verifyUser(email: string, password: string): Promise<UserRecord | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const isValid = await compare(password, user.passwordHash);
  if (!isValid) return null;
  return user;
}

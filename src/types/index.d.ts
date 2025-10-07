export interface VaultEntry {
  id: string;
  title?: string;
  name?: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  tags?: string[] | string;
  folder?: string;
}
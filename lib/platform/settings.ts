import { getDb } from '@/lib/db';

export type UserSettings = {
  wallet: string;
  display_name: string | null;
  email: string | null;
  notify_orders: boolean;
  notify_resolves: boolean;
  notify_agents: boolean;
  notify_deposits: boolean;
  theme: string;
};

function rowToSettings(row: Record<string, unknown>): UserSettings {
  return {
    wallet: row.wallet as string,
    display_name: (row.display_name as string | null) ?? null,
    email: (row.email as string | null) ?? null,
    notify_orders: row.notify_orders as boolean,
    notify_resolves: row.notify_resolves as boolean,
    notify_agents: row.notify_agents as boolean,
    notify_deposits: row.notify_deposits as boolean,
    theme: row.theme as string
  };
}

export async function getSettings(wallet: string): Promise<UserSettings> {
  const db = getDb();
  const w = wallet.toLowerCase();
  const { rows } = await db.query('SELECT * FROM user_settings WHERE wallet = $1', [w]);
  if (rows[0]) return rowToSettings(rows[0]);

  const { rows: created } = await db.query(
    `INSERT INTO user_settings (wallet) VALUES ($1) ON CONFLICT DO NOTHING RETURNING *`,
    [w]
  );
  if (created[0]) return rowToSettings(created[0]);

  const { rows: again } = await db.query('SELECT * FROM user_settings WHERE wallet = $1', [w]);
  return rowToSettings(again[0]);
}

export async function updateSettings(
  wallet: string,
  patch: Partial<Omit<UserSettings, 'wallet'>>
): Promise<UserSettings> {
  await getSettings(wallet);
  const db = getDb();
  const w = wallet.toLowerCase();

  const { rows } = await db.query(
    `UPDATE user_settings SET
       display_name = COALESCE($2, display_name),
       email = COALESCE($3, email),
       notify_orders = COALESCE($4, notify_orders),
       notify_resolves = COALESCE($5, notify_resolves),
       notify_agents = COALESCE($6, notify_agents),
       notify_deposits = COALESCE($7, notify_deposits),
       theme = COALESCE($8, theme),
       updated_at = NOW()
     WHERE wallet = $1
     RETURNING *`,
    [
      w,
      patch.display_name ?? null,
      patch.email ?? null,
      patch.notify_orders ?? null,
      patch.notify_resolves ?? null,
      patch.notify_agents ?? null,
      patch.notify_deposits ?? null,
      patch.theme ?? null
    ]
  );
  return rowToSettings(rows[0]);
}

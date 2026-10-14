// What the export holds: October 2026 in the Keluarga workspace, 20 transactions, newest first (the order the
// app exports). The figures match video 1's Home: out Rp 3.938.000 = Makan 1.420.000 + Belanja 1.088.000 +
// Tagihan 750.000 + Transport 680.000; in Rp 5.200.000. Columns and formats from src/features/transactions/export.ts.
export type Tx = {date: string; type: 'expense' | 'income' | 'transfer'; amount: number; account: string; to?: string; category?: string; payee?: string; note?: string; created: string};

export const ROWS: Tx[] = [
  {date: '2026-10-14', type: 'expense', amount: 48_000, account: 'E-wallet', category: 'Makan', payee: 'WARUNG BU SRI', created: '2026-10-14 05:12'},
  {date: '2026-10-13', type: 'expense', amount: 95_500, account: 'E-wallet', category: 'Makan', payee: 'MIE AYAM', created: '2026-10-13 11:40'},
  {date: '2026-10-12', type: 'expense', amount: 588_000, account: 'BCA', category: 'Belanja', payee: 'SUPERMARKET', created: '2026-10-12 09:03'},
  {date: '2026-10-12', type: 'transfer', amount: 100_000, account: 'BCA', to: 'E-wallet', created: '2026-10-12 08:51'},
  {date: '2026-10-11', type: 'expense', amount: 380_000, account: 'BCA', category: 'Makan', payee: 'RESTORAN PADANG', created: '2026-10-11 12:27'},
  {date: '2026-10-10', type: 'expense', amount: 180_000, account: 'Tunai', category: 'Transport', payee: 'Bensin', created: '2026-10-10 01:15'},
  {date: '2026-10-09', type: 'expense', amount: 210_000, account: 'BCA', category: 'Makan', payee: 'SATE MADURA', created: '2026-10-09 13:02'},
  {date: '2026-10-08', type: 'expense', amount: 300_000, account: 'Tunai', category: 'Belanja', payee: 'PASAR', created: '2026-10-08 00:44'},
  {date: '2026-10-08', type: 'expense', amount: 150_000, account: 'E-wallet', category: 'Transport', payee: 'Parkir', created: '2026-10-08 00:20'},
  {date: '2026-10-07', type: 'expense', amount: 152_500, account: 'BCA', category: 'Makan', payee: 'KEDAI KOPI', created: '2026-10-07 02:31'},
  {date: '2026-10-07', type: 'transfer', amount: 150_000, account: 'BCA', to: 'E-wallet', created: '2026-10-07 02:05'},
  {date: '2026-10-06', type: 'expense', amount: 400_000, account: 'BCA', category: 'Tagihan', payee: 'Internet', created: '2026-10-06 03:00'},
  {date: '2026-10-05', type: 'expense', amount: 350_000, account: 'BCA', category: 'Tagihan', payee: 'Listrik', created: '2026-10-05 03:10'},
  {date: '2026-10-05', type: 'expense', amount: 200_000, account: 'BCA', category: 'Belanja', payee: 'TOKO ONLINE', created: '2026-10-05 02:48'},
  {date: '2026-10-04', type: 'expense', amount: 134_000, account: 'E-wallet', category: 'Makan', payee: 'MARTABAK', note: '=HYPERLINK("bit.ly/promo")', created: '2026-10-04 13:22'},
  {date: '2026-10-04', type: 'expense', amount: 100_000, account: 'Tunai', category: 'Transport', payee: 'Bensin', created: '2026-10-04 01:30'},
  {date: '2026-10-03', type: 'expense', amount: 250_000, account: 'E-wallet', category: 'Transport', payee: 'Ojek', created: '2026-10-03 10:05'},
  {date: '2026-10-03', type: 'transfer', amount: 500_000, account: 'BCA', to: 'Tunai', created: '2026-10-03 04:16'},
  {date: '2026-10-02', type: 'expense', amount: 400_000, account: 'BCA', category: 'Makan', payee: 'CATERING', created: '2026-10-02 06:58'},
  {date: '2026-10-01', type: 'income', amount: 5_200_000, account: 'BCA', category: 'Gaji', payee: 'Gaji Oktober', created: '2026-10-01 02:00'},
];

export const direction = (t: Tx) => (t.type === 'income' ? 'in' : t.type === 'expense' ? 'out' : 'move');
export const sumOut = (rows: Tx[]) => rows.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
export const OUT_TOTAL = sumOut(ROWS); // 3,938,000
export const MAKAN_TOTAL = sumOut(ROWS.filter((t) => t.category === 'Makan')); // 1,420,000
export const FILE = 'arus-keluarga-2026-10-14';

/** The xlsx shows Amount as `#,##0`. */
export const grouped = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** One CSV line as the app writes it: amounts plain, a cell starting with `=` guarded by an apostrophe. */
const csvCell = (v: string) => {
  const guarded = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return /[",\r\n]/.test(guarded) ? `"${guarded.replace(/"/g, '""')}"` : guarded;
};
export const CSV_HEADER = ['Date', 'Type', 'Amount', 'Direction', 'Account', 'To account', 'Category', 'Payee', 'Note', 'Created at (UTC)'];
export const csvCells = (t: Tx) => [t.date, t.type, String(t.amount), direction(t), t.account, t.to ?? '', t.category ?? '', t.payee ?? '', t.note ?? '', `${t.date}T${t.created.slice(11)}:00+00:00`].map(csvCell);

/**
 * Refuses to let a development-only Prisma command touch a remote database.
 *
 * `prisma migrate dev` and `prisma db push` are the two commands that can
 * destroy a database: `dev` offers to reset the schema when it finds drift it
 * cannot reconcile, and `push` rewrites the schema with no migration history at
 * all. Both are correct locally and catastrophic against production.
 *
 * The protection cannot be "remember not to run it", because the failure mode
 * is a y/N prompt at the end of a command that has already been typed, that
 * says "All data will be lost", and that appears when someone is already
 * frustrated. So the guard is mechanical: if the connection string does not
 * point at this machine, the command does not run.
 *
 * Set ALLOW_REMOTE_DB_MIGRATE=yes-i-am-sure to override, which exists so the
 * escape hatch is a deliberate sentence rather than a flag someone adds by
 * reflex.
 */

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0", "host.docker.internal"]);

const OVERRIDE = "yes-i-am-sure";

interface Checked {
  name: string;
  host: string;
  isLocal: boolean;
}

function hostOf(name: string, raw: string | undefined): Checked | null {
  if (!raw) return null;
  try {
    // Mongo's mongodb+srv:// and Postgres' postgresql:// both parse as URLs.
    const parsed = new URL(raw);
    return { name, host: parsed.hostname, isLocal: LOCAL_HOSTS.has(parsed.hostname) };
  } catch {
    // An unparseable string is not demonstrably local, so it is treated as
    // remote. Failing closed is the whole point of this file.
    return { name, host: "<unparseable>", isLocal: false };
  }
}

const checked = [
  hostOf("POSTGRES_URL", process.env.POSTGRES_URL),
  hostOf("MONGO_URL", process.env.MONGO_URL),
].filter((entry): entry is Checked => entry !== null);

if (checked.length === 0) {
  console.error(
    "\n  ✖ Neither POSTGRES_URL nor MONGO_URL is set, so this command has no\n" +
      "    database to act on. Load your local .env first.\n",
  );
  process.exit(1);
}

const remote = checked.filter((entry) => !entry.isLocal);

if (remote.length > 0) {
  if (process.env.ALLOW_REMOTE_DB_MIGRATE !== OVERRIDE) {
    console.error(
      "\n  ✖ Refusing to run a development database command against a remote host.\n",
    );
    for (const entry of remote) {
      console.error(`      ${entry.name} → ${entry.host}`);
    }
    console.error(
      "\n    `prisma migrate dev` resets the schema when it cannot reconcile drift,\n" +
        "    and `prisma db push` rewrites it with no migration history. Against a\n" +
        "    live database either one loses every row.\n\n" +
        "    To change a deployed database, use:  bun run db:deploy\n" +
        "    To develop locally, point POSTGRES_URL and MONGO_URL at localhost.\n\n" +
        `    If you genuinely mean to do this: ALLOW_REMOTE_DB_MIGRATE=${OVERRIDE}\n`,
    );
    process.exit(1);
  }

  // Overridden. Say so loudly and name the hosts: the one thing this must never
  // print is a reassuring tick next to a production hostname.
  console.warn("\n  ⚠ ALLOW_REMOTE_DB_MIGRATE is set. Proceeding against REMOTE hosts:\n");
  for (const entry of remote) {
    console.warn(`      ${entry.name} → ${entry.host}`);
  }
  console.warn("\n    A reset prompt from here destroys real data. Answer it carefully.\n");
  process.exit(0);
}

console.log(`  ✓ Local database targets (${checked.map((e) => e.host).join(", ")})`);

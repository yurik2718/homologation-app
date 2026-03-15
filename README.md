# Homologation App

Student document homologation management for Spain. Students submit requests, upload documents, chat with coordinators. Data syncs to AmoCRM after payment confirmation.

## Tech Stack

Rails 8.1.2 + React 19 + Inertia.js + Vite + Tailwind + shadcn/ui + SQLite3

## Setup

```bash
bundle install
npm install
bin/rails db:prepare
bin/rails server
```

## Commands

```bash
bin/rails server              # Start Rails + Vite
bin/rails test                # Run tests
npm run check                 # TypeScript type check
bundle exec brakeman          # Security scan
```

## Database Backups

SQLite databases are stored in `storage/`. Automatic daily backups run at 3:00 AM via Solid Queue (see `config/recurring.yml`). Backups are saved to `storage/backups/` with 7-day rotation.

### Create backup manually (on server)

```bash
bin/kamal backup
```

### Download backup to your PC

**Step 1** — Create a fresh backup on the server:

```bash
bin/kamal backup
```

**Step 2** — Download via SSH (replace `user` and IP with your server):

```bash
# Download all backups
scp user@YOUR_SERVER_IP:/var/lib/docker/volumes/homologation_app_storage/_data/backups/* ./backups/

# Or download just the main database (latest backup)
scp user@YOUR_SERVER_IP:/var/lib/docker/volumes/homologation_app_storage/_data/backups/production_*.sqlite3 ./backups/
```

**Alternative — one-liner** (backup + download in one step):

```bash
bin/kamal backup && scp user@YOUR_SERVER_IP:/var/lib/docker/volumes/homologation_app_storage/_data/backups/production_*.sqlite3 ./backups/
```

### View backup locally

Open the downloaded `.sqlite3` file with any SQLite client:
- [DB Browser for SQLite](https://sqlitebrowser.org/) (free, GUI)
- [TablePlus](https://tableplus.com/) (GUI)
- Terminal: `sqlite3 backups/production_20260315_030000.sqlite3`

### Kamal aliases

| Alias | Command | Description |
|---|---|---|
| `bin/kamal console` | Rails console | Interactive Ruby console |
| `bin/kamal shell` | Bash | Shell inside container |
| `bin/kamal logs` | Puma logs | Tail application logs |
| `bin/kamal dbc` | DB console | SQLite console |
| `bin/kamal backup` | DatabaseBackupJob | Create database backup |

## Documentation

See `docs/` for architecture, features, database schema, and implementation plan.

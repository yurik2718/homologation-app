# Space for Edu — Demo Setup

## Setup

```bash
# Install mise (manages Ruby and Node versions)
brew install mise

# Optional: add mise to your shell so it activates automatically in every new terminal.
# Without this, you'll need to run `mise install` manually each time you open a new terminal window.
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc && source ~/.zshrc

# Clone and enter the project
git clone <repo-url> space-for-edu
cd space-for-edu

# Install Ruby 3.4.9 and Node 22 (reads .mise.toml automatically)
mise install

# Install dependencies
gem install bundler && bundle install && npm install

# Create database and load demo data
bin/rails db:reset
```

## Run

```bash
bin/rails server
```

Open **http://localhost:3000**

## Demo Accounts

Password for all accounts: **`password123`**

| Role            | Email                | What you'll see                                     |
| --------------- | -------------------- | --------------------------------------------------- |
| **Super Admin** | `boss@example.com`   | Dashboard, user management, reports, CRM pipeline   |
| **Coordinator** | `maria@example.com`  | Request inbox, chat, payment confirmation, pipeline |
| **Coordinator** | `carlos@example.com` | Same role, different assigned requests              |
| **Teacher**     | `ivan@example.com`   | Lesson calendar, student chat, meeting links        |
| **Student**     | `ana@example.com`    | Requests, document uploads, status tracking, chat   |
| **Student**     | `pedro@example.com`  | Same role, different request history                |

To switch accounts: avatar in the sidebar → **Sign out**.

## Suggested Walkthrough

1. **`ana@example.com`** — student experience: request list, documents, chat
2. **`maria@example.com`** — coordinator: inbox, reply in chat, confirm a payment, pipeline board
3. **`boss@example.com`** — admin: dashboard stats, user management, full pipeline with filters
4. **`ivan@example.com`** — teacher: lesson calendar, meeting links

## Select Options (Dropdown Lists)

All dropdown lists in the app (service types, countries, universities, etc.) are stored as separate YAML files in `config/select_options/`. Each file is one dropdown — the filename becomes the key on the frontend.

To edit options, open the corresponding `.yml` file, change entries, and restart the server. To add a new dropdown, create a new `.yml` file in the same folder.

See `config/select_options/README.md` for format details and examples.

## Pipeline Configuration

Pipeline stages, document checklist, and country routing are configured in `config/pipeline.yml`. This is the single source of truth for both backend and frontend.

- **Stages** — addreact /remove/reorder pipeline stages, set display mode (kanban column or horizontal row), colors, icons
- **Document checklist** — documents to collect per request (shown as toggleable tags on pipeline cards)
- **Country routing** — which countries route to ministerio vs delegación after RedSARA

Restart the server after changes.

## Reset Demo Data

```bash
bin/rails db:reset
```

## Архив полной версии

Тег **`v1-full-featured`** содержит полную версию приложения, включая функционал который был удалён в процессе упрощения:

- Учителя и уроки (calendar, lessons, teacher management)
- Pipeline / Kanban доска (CRM board)
- Telegram-бот уведомления
- Чат учитель-студент
- Публичный сайт

Посмотреть или скопировать удалённый код:

```bash
git checkout v1-full-featured   # переключиться на полную версию
git checkout main               # вернуться обратно
```

Или через GitHub: переключи ветку/тег на `v1-full-featured`.

# Select Options (Dropdown Lists)

Each `.yml` file in this folder is a dropdown list used in the app.
The filename becomes the key: `service_types.yml` -> `selectOptions.service_types` on the frontend.

## How to edit

Open any `.yml` file and add/remove/reorder entries. Each entry needs:

- **`key`** — internal identifier stored in the database. **Do not rename keys that are already in use.**
- **`label`** — display text (if the same in all languages)
- **`label_es`, `label_en`, `label_ru`** — per-language labels (when translations differ)

Example:
```yaml
- key: "new_option"
  label_es: "Nueva opción"
  label_en: "New option"
  label_ru: "Новый вариант"
```

## How to add a new dropdown

1. Create a new file, e.g. `config/select_options/my_list.yml`
2. Use the same format as existing files
3. Restart the server (`bin/rails server`)
4. Access on frontend: `selectOptions.my_list`

## After changes

Restart the server. Options are loaded once at boot.

# 17. CRM Pipeline Board (Super Admin)

## Overview

A Kanban-style pipeline board for super_admin to manage homologation requests **after payment is confirmed**. Inspired by the existing CRM workflow, adapted for our Rails + Inertia.js + React + shadcn/ui stack.

**Who uses it:** Only `super_admin`.
**When it appears:** Requests enter the pipeline when status transitions to `payment_confirmed`.
**What it replaces:** The generic `in_progress` status gets expanded into 7 granular pipeline stages.

---

## Pipeline Stages

Linear progression with two special rules:
- **Traducción** is conditional (skipped for Spanish-speaking countries)
- **Cotejo** splits into two sub-groups by country

```
payment_confirmed
       ↓
┌─────────────────┐
│  pago_recibido  │  Payment received, request enters pipeline
└────────┬────────┘
         ↓
┌─────────────────┐
│   documentos    │  Collecting/reviewing student documents
└────────┬────────┘
         ↓
┌─────────────────┐
│  traduccion *   │  Sworn translation needed (non-Spanish countries only)
└────────┬────────┘
         ↓
┌─────────────────┐
│ tasas_volantes  │  Government fees paid, forms filed
└────────┬────────┘
         ↓
┌─────────────────┐
│    redsara      │  Submitted to RedSARA electronic system
└────────┬────────┘
         ↓
┌──────────────────────────────────────────────┐
│  cotejo_ministerio  OR  cotejo_delegacion    │  In-person verification
│  (auto-selected by student's country)        │  at assigned location
└────────┬─────────────────────────────────────┘
         ↓
┌─────────────────┐
│   completado    │  Process finished, documents delivered
└─────────────────┘
```

### Stage definitions

| Stage | Label (es) | Label (en) | Label (ru) | UI Layout |
|-------|-----------|-----------|-----------|-----------|
| `pago_recibido` | Pago Recibido | Payment Received | Оплата получена | Kanban column |
| `documentos` | Documentos | Documents | Документы | Kanban column |
| `traduccion` | Trad. Jurada | Sworn Translation | Присяжный перевод | Kanban column |
| `tasas_volantes` | Tasas y Volantes | Fees & Forms | Пошлины и формы | Kanban column |
| `redsara` | RedSARA | RedSARA | RedSARA | Kanban column |
| `cotejo_ministerio` | Cotejo – Ministerio | Verification – Ministry | Котехо – Министерство | Horizontal group |
| `cotejo_delegacion` | Cotejo – Delegación | Verification – Delegation | Котехо – Делегация | Horizontal group |
| `completado` | Completado | Completed | Завершено | Horizontal group |

### Conditional logic

**Traducción skip:** If the student's `country` is in the Spanish-speaking list (AR, CO, MX, PE, VE, CU, EC, BO, CL, PY, UY, HN, SV, GT, NI, CR, PA, DO, PR, GQ), the `traduccion` stage is **skipped**. The "Avanzar" button on `documentos` goes directly to `tasas_volantes`.

**Cotejo routing:** When advancing from `redsara`, the destination is auto-selected:

| Cotejo destination | Countries |
|--------------------|-----------|
| `cotejo_ministerio` | RU, UA, CN, IN, MA, TR, GB, PT, PK, BD, PH, NG, EG, IR, IQ, SY, AF, KZ, UZ, TM, GE, AM, AZ, BY, MD, KG, TJ, IL, JP, KR, VN, TH (32 countries — non-Convenio) |
| `cotejo_delegacion` | AR, CO, MX, PE, VE, CU, EC, BO, CL, PY, UY, HN, SV, GT, NI, CR, PA, DO, PR, GQ, BR, US, AE, SA, IT, FR, DE (25+ countries — Convenio/LATAM) |

If country is missing → show ❓ badge, admin must set country before advancing past `redsara`.

---

## Data Model Changes

### New fields on `homologation_requests`

```ruby
# Migration
add_column :homologation_requests, :pipeline_stage, :string
add_column :homologation_requests, :pipeline_notes, :text
add_column :homologation_requests, :document_checklist, :json, default: {}
add_column :homologation_requests, :year, :integer
add_index  :homologation_requests, :pipeline_stage
```

| Field | Type | Purpose |
|-------|------|---------|
| `pipeline_stage` | string | Current stage in pipeline (NULL = not in pipeline yet) |
| `pipeline_notes` | text | Free-text notes by super_admin (shown on card) |
| `document_checklist` | JSON | `{ sol: true, vol: false, tas: false, ... }` — 10 boolean flags |
| `year` | integer | Year of the homologation process (2025, 2026, etc.) |

### Document checklist structure

```json
{
  "sol": false,
  "vol": false,
  "tas": false,
  "aut": false,
  "pas": false,
  "ori": false,
  "tra": false,
  "reg": false,
  "not": false,
  "ent": false
}
```

All values are boolean. Default: all `false`. Display: green badge = `true`, gray badge = `false`.
Counter on card: "7/10" = `checklist.values.count(true)` / 10.

### Document tag labels

| Key | Spanish | English | Russian |
|-----|---------|---------|---------|
| `sol` | Solicitud | Application | Заявление |
| `vol` | Volante | Receipt | Квитанция |
| `tas` | Tasas | Fees | Пошлины |
| `aut` | Autorización | Authorization | Доверенность |
| `pas` | Pasaporte | Passport/ID | Паспорт |
| `ori` | Originales | Originals | Оригиналы |
| `tra` | Traducciones | Translations | Переводы |
| `reg` | Registro | Registration | Регистрация |
| `not` | Notificación | Notification | Уведомление |
| `ent` | Entrega | Delivery | Выдача |

These labels go into i18n files (`es.json`, `en.json`, `ru.json`) under `pipeline.documents.*`.

### Relationship to existing `status` field

The existing `status` state machine stays as-is. The `pipeline_stage` is a **parallel track** that only activates after `payment_confirmed`:

| `status` value | `pipeline_stage` | What student sees |
|----------------|-------------------|-------------------|
| `draft` | NULL | Borrador |
| `submitted` | NULL | Enviada |
| `in_review` | NULL | En revisión |
| `awaiting_reply` | NULL | Esperando respuesta |
| `awaiting_payment` | NULL | Pendiente de pago |
| `payment_confirmed` | `pago_recibido` | En proceso ✓ |
| `in_progress` | `documentos`..`redsara` | En proceso |
| `in_progress` | `cotejo_*` | En proceso |
| `resolved` | `completado` | Resuelta |

**Key rule:** When `pipeline_stage` changes, `status` updates automatically:
- `pago_recibido` → `status` stays `payment_confirmed`
- `documentos` through `cotejo_*` → `status` = `in_progress`
- `completado` → `status` = `resolved`

The student never sees pipeline stages — they see simplified status labels.

### Year field

Auto-set from `payment_confirmed_at.year` when request enters pipeline. Editable by admin. Used for filtering (2025 / 2026 / Todo).

---

## Pipeline stage transitions (Model logic)

```ruby
# In HomologationRequest model

PIPELINE_STAGES = %w[
  pago_recibido documentos traduccion tasas_volantes
  redsara cotejo_ministerio cotejo_delegacion completado
].freeze

STAGES_REQUIRING_TRANSLATION = ... # non-Spanish countries
COTEJO_MINISTERIO_COUNTRIES = %w[RU UA CN IN MA TR GB PT ...].freeze
COTEJO_DELEGACION_COUNTRIES = %w[AR CO MX PE VE CU EC BO CL ...].freeze

DEFAULT_DOCUMENT_CHECKLIST = {
  sol: false, vol: false, tas: false, aut: false, pas: false,
  ori: false, tra: false, reg: false, not: false, ent: false
}.freeze

def enter_pipeline!
  return if pipeline_stage.present?

  update!(
    pipeline_stage: "pago_recibido",
    document_checklist: DEFAULT_DOCUMENT_CHECKLIST,
    year: (payment_confirmed_at || Time.current).year
  )
end

def advance_pipeline!
  next_stage = compute_next_stage
  raise InvalidTransition, "Cannot advance from #{pipeline_stage}" unless next_stage

  update!(pipeline_stage: next_stage)
  sync_status_from_pipeline!
end

def retreat_pipeline!
  prev_stage = compute_previous_stage
  raise InvalidTransition, "Cannot retreat from #{pipeline_stage}" unless prev_stage

  update!(pipeline_stage: prev_stage)
  sync_status_from_pipeline!
end

private

def compute_next_stage
  ordered = effective_pipeline_stages
  current_index = ordered.index(pipeline_stage)
  return nil unless current_index
  ordered[current_index + 1]
end

def compute_previous_stage
  ordered = effective_pipeline_stages
  current_index = ordered.index(pipeline_stage)
  return nil unless current_index || current_index == 0
  ordered[current_index - 1]
end

def effective_pipeline_stages
  stages = %w[pago_recibido documentos]
  stages << "traduccion" if requires_translation?
  stages += %w[tasas_volantes redsara]
  stages << cotejo_destination
  stages << "completado"
  stages
end

def requires_translation?
  !SPANISH_SPEAKING_COUNTRIES.include?(user.country&.upcase)
end

def cotejo_destination
  country = user.country&.upcase
  if COTEJO_MINISTERIO_COUNTRIES.include?(country)
    "cotejo_ministerio"
  elsif COTEJO_DELEGACION_COUNTRIES.include?(country)
    "cotejo_delegacion"
  else
    "cotejo_ministerio" # default, admin can override
  end
end

def sync_status_from_pipeline!
  new_status = case pipeline_stage
               when "pago_recibido" then "payment_confirmed"
               when "completado" then "resolved"
               else "in_progress"
               end
  update!(status: new_status) if status != new_status
end
```

---

## Controller

### `Admin::PipelineController`

```
GET  /admin/pipeline          → Admin::PipelineController#index
PATCH /admin/pipeline/:id/advance → Admin::PipelineController#advance
PATCH /admin/pipeline/:id/retreat → Admin::PipelineController#retreat
PATCH /admin/pipeline/:id       → Admin::PipelineController#update (notes, checklist, year, amount)
```

**`#index` action:**

```ruby
def index
  authorize :pipeline, :index? # Pundit — super_admin only

  requests = HomologationRequest.kept
    .where.not(pipeline_stage: nil)
    .includes(:user)

  # Apply filters
  requests = requests.where(year: params[:year]) if params[:year].present?
  requests = filter_by_cotejo_route(requests) if params[:cotejo_route].present?
  requests = filter_by_service_type(requests) if params[:service_type].present?
  requests = search(requests, params[:q]) if params[:q].present?

  # Group by stage
  grouped = PIPELINE_STAGES.each_with_object({}) do |stage, hash|
    hash[stage] = requests.where(pipeline_stage: stage).order(updated_at: :desc).map { |r| pipeline_card_json(r) }
  end

  # Stats
  stats = {
    active: requests.where.not(pipeline_stage: "completado").count,
    revenue: requests.sum(:payment_amount).to_f,
    byYear: requests.group(:year).count,
    noPago: requests.where(payment_amount: [nil, 0]).count,
    cotejo: requests.where(pipeline_stage: %w[cotejo_ministerio cotejo_delegacion]).count
  }

  render inertia: "Admin/Pipeline", props: {
    stages: grouped,
    stats: stats,
    filters: { q: params[:q], year: params[:year], cotejoRoute: params[:cotejo_route], serviceType: params[:service_type] }
  }
end
```

**`pipeline_card_json` serialization:**

```ruby
private

def pipeline_card_json(r)
  {
    id: r.id,
    studentName: r.user.name,
    phone: r.user.phone,
    country: r.user.country,
    year: r.year,
    serviceType: r.service_type,
    amount: r.payment_amount.to_f,
    pipelineStage: r.pipeline_stage,
    pipelineNotes: r.pipeline_notes,
    documentChecklist: r.document_checklist || {},
    documentsComplete: documents_complete_count(r),
    documentsTotal: 10,
    cotejoRoute: cotejo_route_for(r),
    updatedAt: r.updated_at.iso8601,
    canAdvance: r.can_advance?,
    canRetreat: r.can_retreat?
  }
end
```

### `#advance` and `#retreat` actions:

```ruby
def advance
  @request = HomologationRequest.find(params[:id])
  authorize @request, :manage_pipeline?

  @request.advance_pipeline!
  redirect_to admin_pipeline_path(request.query_parameters), notice: t("flash.pipeline_advanced")
end

def retreat
  @request = HomologationRequest.find(params[:id])
  authorize @request, :manage_pipeline?

  @request.retreat_pipeline!
  redirect_to admin_pipeline_path(request.query_parameters), notice: t("flash.pipeline_retreated")
end
```

### `#update` action (notes, checklist, amount):

```ruby
def update
  @request = HomologationRequest.find(params[:id])
  authorize @request, :manage_pipeline?

  @request.update!(pipeline_params)
  redirect_to admin_pipeline_path(request.query_parameters), notice: t("flash.pipeline_updated")
end

private

def pipeline_params
  params.require(:homologation_request).permit(
    :pipeline_notes, :payment_amount, :year,
    document_checklist: %i[sol vol tas aut pas ori tra reg not ent]
  )
end
```

---

## Routes

```ruby
# config/routes.rb
namespace :admin do
  resource :pipeline, only: [:index], controller: "pipeline" do
    member do
      # These are nested under individual requests
    end
  end

  # Or simpler flat approach:
  get "pipeline", to: "pipeline#index"
  patch "pipeline/:id", to: "pipeline#update"
  patch "pipeline/:id/advance", to: "pipeline#advance"
  patch "pipeline/:id/retreat", to: "pipeline#retreat"
end
```

Add to `app/frontend/lib/routes.ts`:
```ts
pipeline: "/admin/pipeline",
pipelineUpdate: (id: number) => `/admin/pipeline/${id}`,
pipelineAdvance: (id: number) => `/admin/pipeline/${id}/advance`,
pipelineRetreat: (id: number) => `/admin/pipeline/${id}/retreat`,
```

---

## UI Components

### Page structure: `app/frontend/pages/admin/Pipeline.tsx`

```
┌─────────────────────────────────────────────────────────────────┐
│ AuthenticatedLayout + breadcrumbs: [Admin, Pipeline]            │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────┬──────────┬──────────┬──────────┬──────────┐         │
│ │ Activos │ Ingresos │  2025    │   2026   │  Cotejo  │  StatsBar
│ │   26    │ 23,545€  │    43    │     4    │    14    │         │
│ └─────────┴──────────┴──────────┴──────────┴──────────┘         │
├─────────────────────────────────────────────────────────────────┤
│ [🔍 Search...] [Año ▾] [Cotejo ▾] [Tipo ▾]         FilterBar   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  KANBAN COLUMNS (horizontal scroll)                             │
│ ┌──────────┬──────────┬──────────┬──────────┬──────────┐        │
│ │  Pago    │ Documen- │  Trad.   │ Tasas y  │ RedSARA  │        │
│ │Recibido  │   tos    │ Jurada   │ Volantes │          │        │
│ │  (6)     │   (3)    │   (0)    │   (4)    │   (6)    │        │
│ │┌────────┐│┌────────┐│          │┌────────┐│┌────────┐│        │
│ ││ Card   │││ Card   ││          ││ Card   │││ Card   ││        │
│ │└────────┘│└────────┘│          │└────────┘│└────────┘│        │
│ │┌────────┐│┌────────┐│          │┌────────┐│┌────────┐│        │
│ ││ Card   │││ Card   ││          ││ Card   │││ Card   ││        │
│ │└────────┘│└────────┘│          │└────────┘│└────────┘│        │
│ └──────────┴──────────┴──────────┴──────────┴──────────┘        │
│                                                                 │
│  HORIZONTAL GROUPS                                              │
│ ┌───────────────────────────────────────────────────────┐       │
│ │ 🏛 Cotejo – Ministerio de Educación              (8) │       │
│ │ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ →scroll   │       │
│ │ │Card│ │Card│ │Card│ │Card│ │Card│ │Card│            │       │
│ │ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘            │       │
│ └───────────────────────────────────────────────────────┘       │
│ ┌───────────────────────────────────────────────────────┐       │
│ │ 🏢 Cotejo – Delegación García Paredes             (3) │       │
│ │ ┌────┐ ┌────┐ ┌────┐                                  │       │
│ │ │Card│ │Card│ │Card│                                  │       │
│ │ └────┘ └────┘ └────┘                                  │       │
│ └───────────────────────────────────────────────────────┘       │
│ ┌───────────────────────────────────────────────────────┐       │
│ │ ✓ Completado                                     (14) │       │
│ │ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ →scroll           │       │
│ │ │Card│ │Card│ │Card│ │Card│ │Card│                    │       │
│ │ └────┘ └────┘ └────┘ └────┘ └────┘                    │       │
│ └───────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### Component tree

```
pages/admin/Pipeline.tsx
├── components/pipeline/StatsBar.tsx
├── components/pipeline/FilterBar.tsx
├── components/pipeline/KanbanBoard.tsx
│   └── components/pipeline/KanbanColumn.tsx
│       └── components/pipeline/PipelineCard.tsx
│           └── components/pipeline/DocumentTags.tsx
├── components/pipeline/HorizontalGroup.tsx
│   └── components/pipeline/PipelineCard.tsx (reused)
└── components/pipeline/CardEditDialog.tsx
```

### Component details

#### `StatsBar`

5 stat cards in a row using shadcn `Card`:

```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
  <Card><CardContent className="p-4">
    <p className="text-xs text-muted-foreground">{t("pipeline.stats.active")}</p>
    <p className="text-2xl font-bold">{stats.active}</p>
  </CardContent></Card>
  <Card><CardContent className="p-4">
    <p className="text-xs text-muted-foreground">{t("pipeline.stats.revenue")}</p>
    <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.revenue)}</p>
  </CardContent></Card>
  {/* ... year counts, cotejo count */}
</div>
```

#### `FilterBar`

Search input + 3 select filters. Uses Inertia `router.get()` with query params for server-side filtering:

```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
  <Input placeholder={t("pipeline.search_placeholder")} ... />
  <Select value={filters.year} onValueChange={...}>  {/* Todo / 2025 / 2026 */}
  <Select value={filters.cotejoRoute} onValueChange={...}>  {/* Todo / Ministerio / Delegación / Sin país */}
  <Select value={filters.serviceType} onValueChange={...}>  {/* Todo / equivalencia / invoice / ... */}
</div>
```

Search uses debounce (300ms) to avoid excessive requests.

#### `KanbanBoard`

Horizontal scroll container with 5 columns:

```tsx
<div className="flex gap-4 overflow-x-auto pb-4">
  {kanbanStages.map(stage => (
    <KanbanColumn key={stage} stage={stage} cards={stages[stage]} />
  ))}
</div>
```

Each column: fixed width (`w-72` / 288px), vertical scroll for cards.

#### `KanbanColumn`

```tsx
<div className="w-72 flex-shrink-0">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-sm font-semibold">{t(`pipeline.stages.${stage}`)}</h3>
    <Badge variant="secondary">{cards.length}</Badge>
  </div>
  <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto">
    {cards.map(card => <PipelineCard key={card.id} card={card} />)}
  </div>
</div>
```

#### `PipelineCard`

The core component. Compact card showing all key info:

```tsx
<Card className="cursor-pointer" onClick={() => openEditDialog(card)}>
  <CardContent className="p-3 space-y-2">
    {/* Row 1: Name + phone */}
    <div>
      <p className="font-semibold text-sm truncate">{card.studentName}</p>
      <p className="text-xs text-muted-foreground">{card.phone}</p>
    </div>

    {/* Row 2: Badges — year, service type, country flag, amount */}
    <div className="flex items-center gap-1.5 flex-wrap">
      <Badge variant="outline" className="text-xs">{card.year}</Badge>
      <Badge className="text-xs bg-purple-100 text-purple-700">{serviceLabel}</Badge>
      <span className="text-sm">{countryFlag(card.country)}</span>
      <span className="text-xs font-medium ml-auto">{card.amount}€</span>
    </div>

    {/* Row 3: Notes (truncated) */}
    {card.pipelineNotes && (
      <p className="text-xs text-muted-foreground line-clamp-2">{card.pipelineNotes}</p>
    )}

    {/* Row 4: Document tags */}
    <DocumentTags checklist={card.documentChecklist} />

    {/* Row 5: Actions */}
    <div className="flex items-center gap-2 pt-1">
      {card.canRetreat && (
        <Button variant="ghost" size="sm" className="min-h-[44px] flex-1"
          onClick={(e) => { e.stopPropagation(); retreat(card.id) }}>
          ←
        </Button>
      )}
      {card.canAdvance && (
        <Button size="sm" className="min-h-[44px] flex-1 bg-green-600 hover:bg-green-700"
          onClick={(e) => { e.stopPropagation(); advance(card.id) }}>
          {t("pipeline.advance")} →
        </Button>
      )}
    </div>
  </CardContent>
</Card>
```

#### `DocumentTags`

10 small badges, green if true, gray if false:

```tsx
const DOC_KEYS = ["sol", "vol", "tas", "aut", "pas", "ori", "tra", "reg", "not", "ent"] as const

<div className="flex flex-wrap gap-1">
  {DOC_KEYS.map(key => (
    <span key={key} className={cn(
      "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
      checklist[key]
        ? "bg-green-600 text-white"
        : "bg-muted text-muted-foreground"
    )}>
      {key}
    </span>
  ))}
</div>
```

#### `CardEditDialog`

Opens when clicking a card. Uses shadcn `Dialog` + `Sheet` (responsive):

Contents:
- **Student name** (read-only, link to request)
- **Amount** — `Input type="number"` (editable)
- **Year** — `Select` (editable)
- **Notes** — `Textarea` (editable)
- **Document checklist** — 10 toggles (checkbox or switch for each document)
- **Save** / **Cancel** buttons

Submits via `router.patch(routes.pipelineUpdate(card.id), { ... })`.

#### `HorizontalGroup`

For cotejo and completado stages:

```tsx
<div className="border-t pt-4">
  <div className="flex items-center gap-2 mb-3">
    <span>{icon}</span>
    <h3 className="text-sm font-semibold">{t(`pipeline.stages.${stage}`)}</h3>
    <Badge variant="secondary">{cards.length}</Badge>
  </div>
  <div className="flex gap-3 overflow-x-auto pb-3">
    {cards.map(card => (
      <div key={card.id} className="w-64 flex-shrink-0">
        <PipelineCard card={card} />
      </div>
    ))}
  </div>
</div>
```

---

## Mobile Layout (360px+)

On mobile, the kanban columns don't work horizontally. Two approaches:

### Option A: Stage filter (recommended for MVP)

On screens < 768px, replace kanban columns with:
1. **Stage selector** — horizontal scrollable pills or `Select` dropdown
2. **Card list** — vertical list of cards for the selected stage

```tsx
{/* Mobile: stage tabs + vertical list */}
<div className="md:hidden">
  <div className="flex gap-2 overflow-x-auto pb-2">
    {allStages.map(stage => (
      <Button key={stage} variant={activeStage === stage ? "default" : "outline"}
        size="sm" className="min-h-[44px] whitespace-nowrap flex-shrink-0"
        onClick={() => setActiveStage(stage)}>
        {t(`pipeline.stages.${stage}`)} ({stages[stage].length})
      </Button>
    ))}
  </div>
  <div className="space-y-3 mt-3">
    {stages[activeStage].map(card => <PipelineCard key={card.id} card={card} />)}
  </div>
</div>

{/* Desktop: full kanban */}
<div className="hidden md:block">
  <KanbanBoard ... />
  <HorizontalGroup ... />
</div>
```

### Option B: Horizontal scroll (like original CRM)

Just let the kanban scroll horizontally on mobile too. Simpler but less usable — admin unlikely to use phone for this workflow.

**Recommendation:** Option A for MVP. The admin primarily uses desktop, but having a usable mobile fallback is important per project rules.

---

## Interaction Flows

### 1. Request enters pipeline

**Trigger:** When `confirm_payment` action is called (existing flow).

```ruby
# In HomologationRequestsController#confirm_payment (existing)
def confirm_payment
  # ... existing logic ...
  @request.enter_pipeline!  # NEW: also sets pipeline_stage + checklist
end
```

### 2. Advancing a card

1. Admin clicks "Avanzar →" on card
2. `router.patch(routes.pipelineAdvance(id))` — Inertia request
3. Controller calls `@request.advance_pipeline!`
4. Model computes next stage (skipping traducción if not needed, routing cotejo)
5. Redirect back to pipeline index (preserving filters)
6. Flash: "Solicitud avanzada a Documentos"

### 3. Retreating a card

Same as advancing but backwards. "←" button calls `retreat_pipeline!`.

### 4. Editing card details

1. Admin clicks on card body → `CardEditDialog` opens
2. Admin edits notes / amount / year / document checkboxes
3. Clicks "Save" → `router.patch(routes.pipelineUpdate(id), data)`
4. Dialog closes, board refreshes

### 5. Filtering

All filters use Inertia `router.get()` with query params:
```ts
router.get(routes.pipeline, { q: search, year, cotejoRoute, serviceType }, {
  preserveState: true,
  replace: true,
})
```

Server-side filtering → full page re-render with filtered data. No client-side filtering.

### 6. Search

Debounced (300ms) text input. Searches across:
- `users.name`
- `users.country`
- `users.phone` (encrypted — search via `LIKE` on decrypted, or skip for MVP)
- `homologation_requests.pipeline_notes`

For MVP: search by name and notes only (encrypted fields need special handling).

---

## Country → Flag Mapping

Use a simple utility function:

```ts
// app/frontend/lib/utils.ts
const COUNTRY_FLAGS: Record<string, string> = {
  AR: "🇦🇷", CO: "🇨🇴", MX: "🇲🇽", PE: "🇵🇪", VE: "🇻🇪",
  RU: "🇷🇺", UA: "🇺🇦", US: "🇺🇸", ES: "🇪🇸", BR: "🇧🇷",
  CU: "🇨🇺", EC: "🇪🇨", BO: "🇧🇴", CL: "🇨🇱", // ... etc
}

export function countryFlag(code: string | null): string {
  if (!code) return "❓"
  return COUNTRY_FLAGS[code.toUpperCase()] ?? "🏳️"
}
```

---

## Country Lists (config)

Store in `config/select_options.yml` under new keys:

```yaml
cotejo_routes:
  ministerio:
    countries: [RU, UA, CN, IN, MA, TR, GB, PT, PK, BD, PH, NG, EG, IR, IQ, SY, AF, KZ, UZ, TM, GE, AM, AZ, BY, MD, KG, TJ, IL, JP, KR, VN, TH]
    label: "Ministerio de Educación"
    icon: "🏛"
  delegacion:
    countries: [AR, CO, MX, PE, VE, CU, EC, BO, CL, PY, UY, HN, SV, GT, NI, CR, PA, DO, PR, GQ, BR, US, AE, SA, IT, FR, DE]
    label: "Delegación García Paredes"
    icon: "🏢"

spanish_speaking_countries: [AR, CO, MX, PE, VE, CU, EC, BO, CL, PY, UY, HN, SV, GT, NI, CR, PA, DO, PR, GQ]
```

This way, adding/removing countries doesn't require code changes — just YAML.

---

## Pundit Policy

```ruby
# app/policies/pipeline_policy.rb
class PipelinePolicy < ApplicationPolicy
  def index?
    user.super_admin?
  end

  def update?
    user.super_admin?
  end

  def advance?
    user.super_admin?
  end

  def retreat?
    user.super_admin?
  end
end
```

---

## i18n Keys

Add to all three locale files:

```json
{
  "pipeline": {
    "title": "Pipeline",
    "search_placeholder": "Buscar por nombre, país, pasaporte...",
    "advance": "Avanzar",
    "retreat": "Volver",
    "stages": {
      "pago_recibido": "Pago Recibido",
      "documentos": "Documentos",
      "traduccion": "Trad. Jurada",
      "tasas_volantes": "Tasas y Volantes",
      "redsara": "RedSARA",
      "cotejo_ministerio": "Cotejo – Ministerio",
      "cotejo_delegacion": "Cotejo – Delegación",
      "completado": "Completado"
    },
    "stats": {
      "active": "Activos",
      "revenue": "Ingresos",
      "no_payment": "Sin pago",
      "cotejo": "Cotejo"
    },
    "documents": {
      "sol": "SOL", "vol": "VOL", "tas": "TAS", "aut": "AUT", "pas": "PAS",
      "ori": "ORI", "tra": "TRA", "reg": "REG", "not": "NOT", "ent": "ENT"
    },
    "filters": {
      "all": "Todo",
      "year": "Año",
      "cotejo_route": "Ruta Cotejo",
      "service_type": "Tipo"
    },
    "edit_dialog": {
      "title": "Editar solicitud",
      "notes": "Notas",
      "amount": "Importe €",
      "year": "Año",
      "documents": "Documentos",
      "save": "Guardar",
      "cancel": "Cancelar"
    },
    "flash": {
      "advanced": "Solicitud avanzada a %{stage}",
      "retreated": "Solicitud devuelta a %{stage}",
      "updated": "Solicitud actualizada"
    }
  }
}
```

---

## Files to Create/Modify

### New files

| File | Purpose |
|------|---------|
| `db/migrate/XXX_add_pipeline_fields_to_homologation_requests.rb` | Migration |
| `app/controllers/admin/pipeline_controller.rb` | Controller |
| `app/policies/pipeline_policy.rb` | Authorization |
| `app/frontend/pages/admin/Pipeline.tsx` | Main page |
| `app/frontend/components/pipeline/StatsBar.tsx` | Stats cards |
| `app/frontend/components/pipeline/FilterBar.tsx` | Search + filters |
| `app/frontend/components/pipeline/KanbanBoard.tsx` | Column container |
| `app/frontend/components/pipeline/KanbanColumn.tsx` | Single column |
| `app/frontend/components/pipeline/PipelineCard.tsx` | Request card |
| `app/frontend/components/pipeline/DocumentTags.tsx` | 10 doc badges |
| `app/frontend/components/pipeline/HorizontalGroup.tsx` | Cotejo/completado rows |
| `app/frontend/components/pipeline/CardEditDialog.tsx` | Edit dialog |
| `test/controllers/admin/pipeline_controller_test.rb` | Tests |

### Modified files

| File | Change |
|------|--------|
| `app/models/homologation_request.rb` | Add pipeline methods, stage constants, country lists |
| `config/routes.rb` | Add admin pipeline routes |
| `app/frontend/lib/routes.ts` | Add pipeline route helpers |
| `app/frontend/lib/utils.ts` | Add `countryFlag()` helper |
| `config/select_options.yml` | Add `cotejo_routes`, `spanish_speaking_countries` |
| `app/frontend/locales/es.json` | Add pipeline i18n keys |
| `app/frontend/locales/en.json` | Add pipeline i18n keys |
| `app/frontend/locales/ru.json` | Add pipeline i18n keys |
| `app/controllers/homologation_requests_controller.rb` | Call `enter_pipeline!` on payment confirmation |
| `app/frontend/components/layout/AppSidebar.tsx` | Add Pipeline nav item for super_admin |

---

## Implementation Order (TDD)

1. **Migration** — add 4 new fields to `homologation_requests`
2. **Model** — pipeline stage logic, transitions, country routing, validation
3. **Model tests** — advance/retreat, skip traducción, cotejo routing, edge cases
4. **Config** — country lists in `select_options.yml`
5. **Controller** — index, advance, retreat, update
6. **Policy** — super_admin only
7. **Controller tests** — all actions, authorization, filters
8. **Routes** — add to `config/routes.rb` and `routes.ts`
9. **i18n** — all 3 locales
10. **UI Components** — StatsBar → FilterBar → DocumentTags → PipelineCard → KanbanColumn → KanbanBoard → HorizontalGroup → CardEditDialog
11. **Page** — Pipeline.tsx (assemble all components)
12. **Sidebar** — add nav item
13. **Integration** — wire `enter_pipeline!` into `confirm_payment`
14. **Mobile** — stage filter tabs
15. **Polish** — flags, formatting, empty states

---

## What This Does NOT Include (Future)

- **Drag & drop** — not needed, buttons only (matching original CRM)
- **Real-time updates** — not needed, single admin user
- **Audit log UI** — model can log transitions, but no UI for viewing in MVP
- **Pre-payment kanban** — handled by existing Inbox/Requests pages
- **AmoCRM auto-sync** — Step 10, separate from pipeline board
- **Stripe payment tracking** — separate concern, not part of pipeline
- **Print/export** — not in MVP

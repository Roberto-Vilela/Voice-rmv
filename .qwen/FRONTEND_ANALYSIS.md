# Relatório de Análise do Frontend - Voice-RMV

## Visão Geral

O frontend do Voice-RMV é uma SPA (Single Page Application) construída com React 19, TypeScript, Vite, Tailwind CSS 4 e React Router. O design segue Material Design principles com tema personalizado.

---

## Stack Tecnológico

| Tecnologia | Versão | Função |
|------------|--------|--------|
| React | ^19.0.0 | UI Framework |
| React Router | ^7.16.0 | Navegação SPA |
| TypeScript | ~5.7.0 | Type Safety |
| Vite | ^6.0.0 | Build Tool |
| Tailwind CSS | ^4.0.0 | CSS Framework |
| @tanstack/react-query | ^5.60.0 | Data Fetching |
| axios | ^1.7.0 | HTTP Client |

---

## Arquitetura do Projeto

### Estrutura de Diretórios

```
frontend/src/
├── api/           # Client HTTP e hooks
│   ├── client.ts  # Axios instance + API functions
│   ├── hooks.ts   # React Query hooks
│   └── tasks.ts   # Task API functions wrapper
├── components/    # Reusable UI components
│   ├── AppLayout.tsx
│   ├── AudioModal.tsx
│   ├── AudioPlayer.tsx
│   ├── BottomNav.tsx
│   ├── CreditsCard.tsx
│   ├── FileDropzone.tsx
│   ├── HeroSection.tsx
│   ├── RecentActivity.tsx
│   ├── Sidebar.tsx
│   ├── TaskProgress.tsx
│   ├── TaskRow.tsx
│   ├── TopBar.tsx
│   ├── TranscriptionView.tsx
│   ├── UploadDropzone.tsx
│   ├── VoiceSelector.tsx
│   └── WaveformPlayer.tsx
├── pages/         # Route pages
│   ├── AudioUploadPage.tsx
│   ├── DashboardPage.tsx
│   ├── EditorPage.tsx
│   ├── HistoryPage.tsx
│   ├── ProviderSettingsPage.tsx
│   ├── TextPage.tsx
│   ├── VideoUploadPage.tsx
│   ├── VideoUrlPage.tsx
│   └── VoiceOverPage.tsx
├── App.tsx        # Root component + routes
├── main.tsx       # Entry point
├── types.ts       # TypeScript interfaces
└── index.css      # Global styles + theme
```

---

## Mapeamento de Rotas

### App.tsx - Estrutura de Rotas

```tsx
<AppLayout>
  /               → DashboardPage
  /editor         → EditorPage (transcription editor)
  /voice-over     → VoiceOverPage (text-to-speech)
  /library        → VideoUploadPage (file library)
  /url            → VideoUrlPage (placeholder)
  /history        → HistoryPage (placeholder)
  /settings/provider → ProviderSettingsPage
</AppLayout>
```

### AppLayout.tsx - Layout Principal

```
┌─────────────────────────────────────────┐
│           TopBar (mobile)               │
├─────────────┬───────────────────────────┤
│  Sidebar    │     Main Content          │
│  (desktop)  │     Outlet                │
├─────────────┴───────────────────────────┤
│           BottomNav (mobile)            │
└─────────────────────────────────────────┘
```

- **Responsive:** Sidebar apenas em desktop (`hidden md:flex`)
- **BottomNav:** Apenas em mobile (`md:hidden`)
- **TopBar:** Logo + welcome em desktop, apenas logo em mobile

---

## Análise Detalhada por Componente

### `/api/client.ts` - API Client

**Axios Configuration:**
- `baseURL: "/api"` - Proxy para backend

**API Functions:**
| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `narrateText` | POST | `/narrate/text` | Text-to-speech sync |
| `narrateVideoUrl` | POST | `/narrate/video-url` | Video URL narration (async) |
| `narrateUpload` | POST | `/narrate/upload` | File upload (audio/video) |
| `getTask` | GET | `/tasks/{id}` | Get single task |
| `listTasks` | GET | `/tasks` | List all tasks |
| `deleteTask` | DELETE | `/tasks/{id}` | Delete task |
| `duplicateTask` | POST | `/tasks/{id}/duplicate` | Duplicate task |
| `patchTask` | PATCH | `/tasks/{id}` | Update task |
| `getVoices` | GET | `/voices` | List available voices |

### `/api/hooks.ts` - React Query Hooks

**`useTask(taskId)`**
- Fetches single task
- `refetchInterval`: 1s se não completed/error, false senão
- `enabled`: Only fetches if taskId exists

**`useTasks()`**
- Fetches task list
- `staleTime`: 60s
- `refetchOnWindowFocus`: false

**`useVoices()`**
- Fetches available voices
- `staleTime`: 1h

### `/components/Sidebar.tsx` - Navigation Sidebar

**Features:**
- Desktop-only navigation (`hidden md:flex`)
- 4 nav items: Dashboard, Editor, Voice-over, Library
- User profile section at bottom
- Dropdown menu for "Provedor" settings
- Click-outside-to-close menu

**Icons:**
- `grid_view` - Dashboard
- `edit_note` - Editor
- `record_voice_over` - Voice-over
- `video_library` - Library

### `/components/BottomNav.tsx` - Mobile Navigation

**Features:**
- Fixed bottom navigation (mobile only)
- Same 4 nav items as Sidebar
- Active state with `bg-primary text-white rounded-xl`
- Scale animation on press

### `/components/TopBar.tsx` - Header

**Features:**
- Logo + "Welcome back, Alex!" em desktop
- Notification icon
- User avatar (mobile only)
- Sticky header (`sticky top-0 bg-surface shadow-sm`)
- Backdrop blur em desktop (`md:backdrop-blur-md`)

### `/components/HeroSection.tsx` - Hero Banner (ATUALIZADO)

**Props:** `{ onVideoSubmitted?: (task: Task) => void, selectedVoice?: string }`

**Features:**
- Gradient background (primary/secondary/tertiary)
- YouTube URL input **conectado** via `narrateVideoUrl()`
- Voice selector (select HTML com 18 vozes hardcoded)
- Progress tracker com 4 etapas: Download → Extract → Transcribe → Synthesize
- Polling de task a cada 1s via `getTask()`
- Humanização de erros do YouTube
- Absolute positioned decorative blobs

**Bug Conhecido:** Usa `listTasks()` em vez de `getVoices()` (linha 23). Voices funcionam apenas por fallback hardcoded.

### `/components/UploadDropzone.tsx` - File Upload

**Props:** `{ voice: string }`

**Features:**
- Drag-and-drop + click-to-select
- Accepts: `.mp3, .wav, .m4a, .mp4, .mkv, .avi, .mov, .webm`
- Upload via `createUploadTask(file, voice)`
- States: idle, dragging, uploading, success, error
- Icon #2 badge (step indicator)

**Implementation:**
```tsx
handleFile(file: File) {
  createUploadTask(file, voice)
    .then(() => refetch())
    .catch(...)
}
```

### `/components/VoiceSelector.tsx` - Voice Picker

**Props:** `{ value: string, onChange: (voice) => void }`

**Features:**
- Dropdown voice selector
- Portuguese (🇧🇷) / English (🇺🇸) sections
- Play sample audio per voice
- Active state highlighting
- Format label: `locale flag + name.short (gender)`

**Voice Formatting:**
```tsx
function formatLabel(v: VoiceOption): string {
  const flag = v.locale.startsWith("pt") ? "🇧🇷" : "🇺🇸";
  const genderIcon = v.gender === "Female" ? "♀" : "♂";
  const short = v.name.replace("MultilingualNeural", "").replace("Neural", "");
  return `${flag} ${short} (${genderIcon})`;
}
```

**Sample Audio Playback:**
```tsx
const res = await api.post("/narrate/text", { 
  text: sampleText(v), 
  voice: v.name 
});
```

### `/components/WaveformPlayer.tsx` - Audio Player

**Props:** `{ task: Task | null, onTimeUpdate?: (time) => void }`

**Features:**
- Play/pause button
- Waveform visualization (100 simulated bars)
- Animated bars when playing
- Time display: `current / total`
- Rename button (via `prompt()`)
- Share button (web share API or clipboard)
- Re-rendered when task changes

**Waveform Implementation:**
```tsx
const count = 100;
for (let i = 0; i < count; i++) {
  const bar = document.createElement("div");
  bar.style.height = `${Math.random() * 80 + 20}%`;
  container.appendChild(bar);
}
```

### `/components/RecentActivity.tsx` - Task List

**Props:** `{ onSelectTask?: (task) => void }`

**Features:**
- Shows last 5 tasks
- "View All" button
- Zebra-striping for rows
- Uses `TaskRow` component

### `/components/TaskRow.tsx` - Individual Task Row

**Props:** `{ task, onRefetch, onSelectTask }`

**Features:**
- Task icon based on type (mic/movie/description)
- Status badge with color coding:
  - `completed`: green
  - `processing`: primary (blue)
  - `error`: red
- Menu dropdown with actions:
  - Play audio
  - Edit text (if `input_text`)
  - Rerecord (if `audio_upload`)
  - Duplicate
  - Delete

**Menu Actions:**
```tsx
handlePlayAudio() → AudioModal
handleEditText() → /editor?taskId=xxx
handleRerecord() → /voice-over?taskId=xxx
handleDuplicate() → duplicateTask API call
handleDelete() → deleteTask API call
```

### `/components/AudioModal.tsx` - Audio Preview Modal

**Props:** `{ task, onClose }`

**Features:**
- Full-screen overlay
- Audio player with play/pause
- Animated waveform (60 bars)
- Time display
- Transcription display (if available)
- ESC key to close
- Click outside to close

**Waveform:**
- 60 random bars
- Active bars highlight when playing
- Animated during playback

### `/components/HeroSection.tsx` - Hero Banner (CORRIGIDO)

**Props:** `{ onVideoSubmitted?: (task: Task) => void, selectedVoice?: string }`

**Features:**
- Gradient background (primary/secondary/tertiary)
- YouTube URL input **conectado** via `narrateVideoUrl()`
- Voice selector (select HTML com 18 vozes hardcoded)
- Progress tracker com 4 etapas: Download → Extract → Transcribe → Synthesize
- Polling de task a cada 1s via `getTask()`
- Humanização de erros do YouTube (video unavailable, private, age restricted, etc.)
- Absolute positioned decorative blobs

**Bug Conhecido:** Na linha 23, usa `listTasks()` em vez de `getVoices()` para voices. Voices funcionam apenas porque são hardcoded nas linhas 29-48.

### `/pages/DashboardPage.tsx` - Home Page

**Features:**
- Hero section
- Upload dropzone
- Voice selector
- Recent activity (last 5 tasks)
- Waveform player (latest task)

**State Management:**
```tsx
const [voice, setVoice] = useState("en-US-AriaNeural");
const [activeTask, setActiveTask] = useState<Task | null>(null);
const { data: tasks = [] } = useTasks();
```

**Latest Task:**
```tsx
const latestCompleted = useMemo(() => {
  if (!Array.isArray(tasks)) return null;
  return tasks.find((t: any) => t.audio_url) || null;
}, [tasks]);
```

### `/pages/VideoUploadPage.tsx` - File Library

**Features:**
- Grid/list view toggle
- Search filter
- Category filters: All, Videos, Transcriptions, Audio, Archived
- Reveal animations (Intersection Observer)
- Card-based layout
- Actions per card: edit, share, download, delete

**File Card Types:**
| Preview | Type | Description |
|---------|------|-------------|
| Video icon | video_upload/video_url | Video placeholder |
| Audio waves | audio_upload | Audio file |
| Text lines | text/transcription | Text content |
| Error icon | error | Failed task |

**Card Status:**
- `Done` - completed
- `Transcribing` - processing
- `Error` - failed

**Card Actions:**
```tsx
edit → /editor?taskId=xxx
share → clipboard: audio_url or input_url
download → open audio_url
delete → deleteTask API call
```

### `/pages/VideoUrlPage.tsx` - Placeholder

```tsx
function VideoUrlPage() {
  return <div>Video URL narration — coming soon</div>;
}
```

### `/pages/EditorPage.tsx` - Transcription Editor

**Features:**
- Split view: waveform sidebar + editor
- Source loading (video/YouTube)
- Segments display with timestamps
- Content-editable segments
- Formatting toolbar (bold, italic, underline, undo/redo)
- Auto-save with debounce (1s)
- SRT export
- Error handling

**Segment Building Logic:**
```tsx
function buildSegments(task: Task | null, draftText: string): EditorSegment[] {
  // 1. Try use saved editor_segments
  // 2. Fallback to transcription_segments
  // 3. Fallback to split text into chunks
}
```

**Segment Chunks:**
```tsx
function splitTextIntoChunks(text: string): string[] {
  // Split by sentences first
  // Then by words if < 1 sentence
  // Chunk size: 16 words if >48, 12 if >24, else all
}
```

**SRT Export:**
```tsx
function buildSrt(segments: EditorSegment[]): string {
  // Format: index\ntime-->time\n[SPEAKER X] text
}
```

**Save Logic:**
```tsx
const saveChanges = async (mode: "auto" | "manual" = "manual") => {
  const transcription = segments.map(s => stripHtml(s.html).trim()).join("\n\n");
  await patchTask(id, { transcription, extra_data: { editor_segments, editor_saved_at } });
}
```

**Auto-save:**
```tsx
useEffect(() => {
  if (!isDirty || !currentTask?.id || !segments.length) return;
  const timer = window.setTimeout(() => saveChanges("auto"), 1000);
  return () => window.clearTimeout(timer);
}, [segments, isDirty, currentTask?.id]);
```

### `/pages/VoiceOverPage.tsx` - Voice-over Studio

**Features:**
- Script textarea (5000 char limit)
- Voice selection grid
- Speed slider (0.5x - 2x)
- Pitch slider (-10 - +10)
- Advanced modulation (placeholder)
- Real-time preview
- Generate button

**Featured Voices:**
```tsx
const candidates = [
  { name: "en-US-GuyNeural", title: "Natural Male", ... },
  { name: "en-US-AriaNeural", title: "Soft Female", ... },
  { name: "pt-BR-FranciscaNeural", title: "AI Professional", ... },
  { name: "pt-BR-AntonioNeural", title: "Storyteller", ... },
];
```

**Script Tools:**
- `autoFixScript()` - capitalize first letter, trim spaces
- `copyScript()` - clipboard write
- Character counter

**Generate Flow:**
```tsx
const generateAudio = async () => {
  if (!script.trim()) { setError("Paste or write a script first."); return; }
  setIsGenerating(true);
  const task = await createTextTask(script, selectedVoice);
  setGeneratedTask(task);
}
```

### `/pages/HistoryPage.tsx` - Placeholder

```tsx
function HistoryPage() {
  return <div>History — coming soon</div>;
}
```

### `/pages/ProviderSettingsPage.tsx` - Settings

**Features:**
- Provider selection: OpenAI / Local
- Model selection dropdown
- API URL input
- API Key display (masked + toggle visibility)
- Info card about local server compatibility

**UI Sections:**
1. **Model & Provedor**
   - OpenAI / Local buttons
   - Model dropdown: GPT-4o, GPT-4 Turbo, GPT-3.5, Custom

2. **Endpoints de Conexão**
   - Base URL input
   - API Key (read-only, masked)

### `/pages/TextPage.tsx` - Placeholder

```tsx
function TextPage() {
  return <div>Text narration — coming soon</div>;
}
```

### `/pages/AudioUploadPage.tsx` - Placeholder

```tsx
function AudioUploadPage() {
  return <div>Audio upload narration — coming soon</div>;
}
```

---

## Tipos TypeScript (`types.ts`)

### TaskStatus
```ts
type TaskStatus = "pending" | "processing" | "completed" | "error";
```

### TaskExtraData
```ts
export interface TaskExtraData {
  display_name?: string;
  transcription_segments?: Array<{
    start?: number;
    end?: number;
    text?: string;
    speaker?: string;
  }>;
  editor_segments?: Array<{
    id: string;
    start: number;
    end: number;
    speaker: string;
    html: string;
  }>;
  [key: string]: unknown;
}
```

### Task
```ts
export interface Task {
  id: string;
  type: string;
  status: TaskStatus;
  progress: number;
  voice: string;
  input_text?: string;
  input_url?: string;
  input_file?: string;
  transcription?: string;
  audio_url?: string;
  duration_seconds?: number;
  error?: string;
  extra_data?: TaskExtraData | null;
  created_at: string;
  updated_at: string;
}
```

### Voice
```ts
export interface Voice {
  name: string;
  locale: string;
  gender: string;
}
```

---

## Estilização e Tema

### Tailwind CSS 4 Configuration

**`tailwind.config.js`:**
- Dark mode: class-based
- Content scanning: `./src/**/*.{js,jsx,ts,tsx}`, `./index.html`
- Custom colors (Material Design palette)
- Custom spacing tokens
- Font families (Inter)
- Font sizes with responsive variants

**Custom Spacing:**
```js
"stack-md": "16px",
"stack-lg": "32px",
gutter: "24px",
unit: "8px",
"margin-mobile": "16px",
"margin-desktop": "40px",
"container-max": "1280px",
"stack-sm": "8px"
```

**Color Palette:**
| Token | Value | Usage |
|-------|-------|-------|
| `primary` | #3525cd | Brand color |
| `secondary` | #00687a | Accent |
| `tertiary` | #571ac0 | Additional accent |
| `on-primary` | #ffffff | Text on primary |
| `surface` | #f8f9ff | Background |
| `on-surface` | #121c28 | Primary text |
| `outline` | #777587 | Borders |

**`index.css`:**
- Tailwind imports
- Custom utilities:
  - `.zebra-striping` - alternating row backgrounds
  - `.waveform-bar` - animated bar transitions
  - `.reveal-card` - fade-in slide-up animation
  - `.hover-lift` - lift on hover
  - `.sidebar-item.active` - active nav state
- Material Symbols font styling

**Animations:**
```css
.reveal-card {
  opacity: 0;
  transform: translateY(14px) scale(0.985);
  transition: opacity 420ms ease, transform 420ms ease;
}

.reveal-card.is-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}
```

---

## Build e Deploy

### `vite.config.ts`

```ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": apiTarget, // Proxy para backend
    },
  },
  build: {
    sourcemap: false,
  },
});
```

### `Dockerfile`

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### Scripts (`package.json`)

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint ."
}
```

---

## Nota sobre Arquivos Modificados (Git)

**ATENÇÃO:** Esta seção está desatualizada. Para informações precisas sobre o estado atual do git, execute `git status` e `git diff` no repositório.

---

## Fluxos de Trabalho Principais

### 1. Upload de Arquivo
```
UploadDropzone
  ↓
createUploadTask(file, voice)
  ↓
PATCH /api/tasks/{id}
  ↓
Refetch task list
```

### 2. Narração de Texto
```
VoiceOverPage
  ↓
Textarea input + voice selection
  ↓
Generate Audio Button
  ↓
POST /api/narrate/text
  ↓
Update state with task
```

### 3. Edição de Transcrição
```
VideoUploadPage → Open Task → /editor?taskId=xxx
  ↓
EditorPage
  ↓
Load task + build segments
  ↓
Edit segments (contentEditable)
  ↓
Auto-save / Manual save
PATCH /api/tasks/{id}
```

### 4. Reprodução de Áudio
```
TaskRow → Play → AudioModal
  ↓
New Audio(audio_url)
  ↓
Play/Pause controls
Waveform animation
```

### 5. Seleção de Voz
```
VoiceSelector
  ↓
Dropdown open
  ↓
Select voice
  ↓
onChange(voice.name)
  ↓
Close dropdown
```

---

## Padrões de Design

### Cards Reveal Animation
```tsx
<div data-reveal className="reveal-card hover-lift">
  ...
</div>

useEffect(() => {
  const observer = new IntersectionObserver(...);
  cards.forEach((card) => observer.observe(card));
}, []);
```

### Status Badges
```tsx
const statusClass = statusColors[task.status] ?? "bg-gray-100";
const dotClass = dotColors[task.status] ?? "bg-gray-600";
```

### Conditional Rendering
```tsx
{isLoading ? (
  <div>Loading...</div>
) : (
  <div>Data</div>
)}
```

---

## Pontos de Atenção / Known Issues

### 1. Placeholder Components
Vários componentes ainda são placeholders:
- `VideoUrlPage`
- `HistoryPage`
- `TextPage`
- `AudioUploadPage`
- `TranscriptionView`
- `FileDropzone`
- `TaskProgress`

**Recomendação:** Implementar ou remover estes componentes.

### 2. Hardcoded User Data
```tsx
// Sidebar.tsx
<img src="https://lh3.googleusercontent.com/..." />
// TopBar.tsx
<img src="https://lh3.googleusercontent.com/..." />
// EditorPage.tsx
<img src="https://lh3.googleusercontent.com/..." />
```

**Recomendação:** Adicionar API para fetch do usuário atual.

### 3. Prompt para Renomear
```tsx
const handleRename = async () => {
  const current = displayName(task);
  const name = prompt("Rename file:", current);
  // ...
};
```

**Recomendação:** Substituir `prompt()` por modal ou componente de input.

### 4. Bug no HeroSection - listTasks() em vez de getVoices()
```tsx
// HeroSection.tsx:22-24
const { data: voices = [] } = useQuery({
  queryKey: ["voices"],
  queryFn: () => listTasks(), // BUG: deveria ser getVoices()
});
```

**Impacto:** Voices funcionam apenas porque são hardcoded nas linhas 29-48.
**Recomendação:** Corrigir para `getVoices()` e implementar dropdown dinâmico.

### 5. Páginas Não Registradas nas Rotas
`TextPage` e `AudioUploadPage` existem mas não estão em `App.tsx`:
- `TextPage.tsx` — placeholder "Text narration — coming soon"
- `AudioUploadPage.tsx` — placeholder "Audio upload narration — coming soon"

**Recomendação:** Implementar ou remover.

### 6. TypeScript `any` Usage
Vários usos de `any` em código:
```tsx
return tasks.find((t: any) => t.audio_url) || null;
const { data: tasks = [] } = useTasks(); // deveria ser Task[]
```

**Recomendação:** Remover `any` e usar tipos corretos.

### 7. Missing Error Boundaries
React não tem error boundaries implementados.

**Recomendação:** Adicionar `ErrorBoundary` wrappers.

### 8. No Loading States para API Calls
Alguns componentes não mostram loading:
```tsx
const { data: voices = [], isLoading: voicesLoading } = useVoices();
```

**Recomendação:** Melhorar loading states.

### 9. Inline Styles
Uso de `style={{ ... }}` em vários lugares:
```tsx
className="..." style={{ fontVariationSettings: "'FILL' 1" }}
```

**Recomendação:** Mover para Tailwind utility classes.

---

## Melhorias Sugeridas

### 1. Implementar Error Boundaries
```tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return <div>Something went wrong: {error.message}</div>;
}

export default function DashboardPage() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <DashboardContent />
    </ErrorBoundary>
  );
}
```

### 2. Adicionar Loading Skeletons
```tsx
const { data: tasks, isLoading } = useTasks();

if (isLoading) {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-20 bg-surface-container rounded-xl animate-pulse" />
      ))}
    </div>
  );
}
```

### 3. Tipagem Melhorada
```ts
// types.ts
export interface Task {
  id: string;
  type: TaskType;
  status: TaskStatus;
  // ...
}

export type TaskType = 
  | 'text'
  | 'video_url'
  | 'audio_upload'
  | 'video_upload'
  | 'video_file';
```

### 4. Componentes de Loading Reusáveis
```tsx
// components/LoadingSpinner.tsx
export default function LoadingSpinner() {
  return (
    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  );
}

// components/Skeleton.tsx
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export function Skeleton({ className, variant = 'rect' }: SkeletonProps) {
  // ...
}
```

### 5. Context para Estado Global
```tsx
// contexts/UserContext.tsx
export interface UserState {
  user: User | null;
  settings: Settings;
}

export const UserContext = createContext<UserState>(null as any);
```

### 6. Toast Notifications
```tsx
// components/Toast.tsx
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // ...
}
```

### 7. Image Optimization
```tsx
import { Image } from '@next/image'; // ou similar

<img
  src={task.audio_url}
  alt="Generated audio"
  className="w-full h-full object-cover"
/>
```

### 8. Form Validation
```tsx
// hooks/useFormValidation.ts
export function useFormValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!script.trim()) {
      newErrors.script = 'Script is required';
    }
    if (script.length > 5000) {
      newErrors.script = 'Script too long';
    }
    return newErrors;
  };
  
  return { errors, validate, setErrors };
}
```

### 9. Lazy Loading de Components
```tsx
const EditorPage = lazy(() => import('./pages/EditorPage'));
const VoiceOverPage = lazy(() => import('./pages/VoiceOverPage'));

<Routes>
  <Route path="/editor" element={<EditorPage />} />
  <Route path="/voice-over" element={<VoiceOverPage />} />
</Routes>
```

### 10. Unit Tests
```tsx
// __tests__/DashboardPage.test.tsx
import { render, screen } from '@testing-library/react';
import DashboardPage from '../src/pages/DashboardPage';

describe('DashboardPage', () => {
  it('renders hero section', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Transform any video/i)).toBeInTheDocument();
  });
});
```

---

## Checklist de Qualidade

### ✅ Implementado
- [x] TypeScript strict mode
- [x] React Query para data fetching
- [x] React Router SPA navigation
- [x] Tailwind CSS 4
- [x] Responsive design (mobile/desktop)
- [x] Material Design principles
- [x] Accessibility (aria attributes)
- [x] Error handling (try/catch)
- [x] Loading states (alguns)

### ⚠️ Melhorias Necessárias
- [ ] Remover `any` types
- [ ] Adicionar error boundaries
- [ ] Implementar loading skeletons
- [ ] Criar toast notifications
- [ ] Adicionar unit tests
- [ ] Otimizar imagens
- [ ] Remover placeholders
- [ ] Centralizar estado global
- [ ] Adicionar analytics
- [ ] SEO optimization

---

## Métricas de Código

### Arquivos
- **Total:** ~33 arquivos .ts/.tsx
- **Líneas:** ~3,800 (estimado)
- **Components:** 17 (4 placeholders: AudioPlayer, FileDropzone, TranscriptionView, TaskProgress)
- **Pages:** 9 (4 placeholders: TextPage, AudioUploadPage, VideoUrlPage, HistoryPage)
- **Hooks:** 3

### Complexidade
- **Baixa:** Components simples (Sidebar, TopBar)
- **Média:** Pages com state (Dashboard, VoiceOver)
- **Alta:** EditorPage (segment building, saving)

### Boilerplate
- `AppLayout`: 15 linhas
- `TopBar`: 30 linhas
- `BottomNav`: 18 linhas
- `Sidebar`: 85 linhas

---

## Conclusão

O frontend do Voice-RMV é uma aplicação bem arquitetada que:
- Utiliza tecnologias modernas (React 19, TS, Vite, Tailwind 4)
- Tem design responsivo e intuitivo
- Segue boas práticas de código TypeScript
- Possui components reutilizáveis
- Implementa patterns de UI modernos (React Query, lazy loading)

**Pontos fortes:**
- Código limpo e bem organizado
- Design consistente com Material Design
- Boa separação de responsabilidades
- TypeScript types bem definidos
- Loading states e error handling básicos

**Áreas de melhoria:**
- Implementar componentes faltantes (placeholders)
- Adicionar error boundaries e toast notifications
- Melhorar loading states
- Remover `any` e hardcoded data
- Adicionar testes unitários
- Otimizar imagens e assets

**Bugs Conhecidos:**
- 🔴 `HeroSection.tsx:22` — usa `listTasks()` em vez de `getVoices()`
- 🟡 `TextPage` e `AudioUploadPage` existem mas não estão nas rotas
- 🟡 Speed/pitch sliders no VoiceOverPage não são enviados ao backend
- 🟢 `AudioPlayer.tsx` — placeholder importado mas nunca usado

---

*Validado em: 2026-06-06 (baseado na análise direta do código-fonte)*
*Gerado em: 2026-06-05*

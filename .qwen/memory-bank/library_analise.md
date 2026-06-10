# Library Module — Análise de Diagnóstico

**Data:** 2026-06-10
**Arquivo principal:** `frontend/src/pages/VideoUploadPage.tsx` (293 linhas)
**Rota:** `/library`
**Componente renderizado:** `VideoUploadPage` (naming mismatch — deveria ser `LibraryPage`)
**Build:** 163 modules, sem erros TS

---

## 🔴 1. Bugs Críticos

| # | Problema | Local | Impacto | Correção |
|---|----------|-------|---------|----------|
| L1 | **`total` do backend retorna count da página, não do banco** | `history.py:29` — `total=len(tasks)` | Paginação quebrada: frontend não sabe quantas tasks existem no total. `total` sempre igual ao número de tasks retornadas. | `total` deve ser uma `count()` query separada no banco |
| L2 | **Nenhum tratamento de erro no delete** | `VideoUploadPage.tsx:101-103` | Se `deleteTask` falhar (ex: 401, 404), a promise rejeita silenciosamente — sem toast, sem rollback no estado local | Envolver em try/catch com feedback pro usuário |
| L3 | **Share button copia URL relativa do backend** | `VideoUploadPage.tsx:268` — `navigator.clipboard.writeText(task?.audio_url)` | `audio_url` é `/api/output/uuid.mp3` — URL relativa. Se copiada e compartilhada, não funciona em outro contexto | Converter para URL absoluta: `window.location.origin + audio_url` |

## 🟡 2. Bugs UX / Funcionais

| # | Problema | Local | Impacto | Correção |
|---|----------|-------|---------|----------|
| L4 | **Botão "Filter" sem onClick** | `VideoUploadPage.tsx:154-157` | Botão decorativo — não faz nada. Usuário pode clicar e nada acontece | Remover ou implementar filtro real |
| L5 | **`getSizeLabel` retorna "Video" genérico** | `VideoUploadPage.tsx:34` | Video uploads nunca mostram tamanho real — sempre "Video" | Extrair duração/tamanho do `extra_data` |
| L6 | **0% de progresso em tasks pending** | `VideoUploadPage.tsx:261` — `task?.progress ?? 0` | Tasks pending mostram "0%" como se estivessem completadas sem progresso | Ocultar progresso se status for "pending" ou mostrar "—" |
| L7 | **Empty state navega para VoiceOver, não Upload** | `VideoUploadPage.tsx:191` — `navigate("/voice-over")` | Botão "Upload Your First File" leva para página de texto, não upload | Navegar para upload page ou ter upload inline |
| L8 | **Sem loading state na carga inicial** | `VideoUploadPage.tsx` | Enquanto tasks carregam, tela fica vazia (sem skeleton) | Adicionar skeleton grid de 6-8 cards enquanto `isLoading` |
| L9 | **Delete sem confirmação** | `VideoUploadPage.tsx:277` — `void handleDelete(task.id)` | Clique em delete apaga imediatamente — sem "Você tem certeza?" | Adicionar confirm dialog ou undo toast |

## 🟠 3. Violações Designer Rules

| # | Problema | Local | Regra |
|---|----------|-------|-------|
| L10 | **FAB `rounded-2xl` e `h-14`** | `VideoUploadPage.tsx:288` | DESIGNER_RULES sec.4: botões `rounded-xl` (12px) e `h-11` (44px). Atual: `rounded-2xl` (16px) e `h-14` (56px) |
| L11 | **`font-bold` em headline** | `VideoUploadPage.tsx:132` | DESIGNER_RULES sec.3: headlines usam `font-semibold`, não `font-bold` |
| L12 | **`text-headline-md font-bold`** | `VideoUploadPage.tsx:132` | Consistência: outros headlines no projeto usam `font-headline-md text-headline-md` |
| L13 | **`status-badge` classe CSS inexistente** | `VideoUploadPage.tsx:243` | Classe não definida em `index.css` nem no Tailwind — dead code. Estilo real vem das classes Tailwind inline |

## 🟣 4. Segurança

| # | Problema | Local | Risco |
|---|----------|-------|-------|
| L14 | **Audio URL exposta como caminho relativo** | `task_response.py:8` | Se o frontend construir URLs absolutas incorretamente, pode expor estrutura interna |
| L15 | **Delete sem confirmação** | `VideoUploadPage.tsx:277` | Deleção acidental irreversível |

## 🔵 5. Código / Manutenibilidade

| # | Problema | Local | Descrição |
|---|----------|-------|-----------|
| L16 | **Nome do componente inconsistente** | `VideoUploadPage.tsx` | Arquivo se chama `VideoUploadPage` mas a rota é `/library` e o título é "Your Projects". Confunde manutenção. |
| L17 | **`openTask` com ternário inútil** | `VideoUploadPage.tsx:106-121` | 3 branches fazem `navigate(/editor?taskId=...)` — apenas audio_upload difere (vai para /voice-over). Código duplicado. |
| L18 | **`revealId` variável não utilizada** | `VideoUploadPage.tsx:197` | `const revealId = ...` usada como `id={revealId}` que duplica a função de `key={card.id}`. |
| L19 | **`transitionDelay` inline** | `VideoUploadPage.tsx:204` | `style={{ transitionDelay: ... }}` — deveria ser classe CSS com `--delay` custom property |
| L20 | **Sem testes para Library** | `backend/tests/` | Nenhum teste automatizado para o módulo Library |

## 🟢 6. Compatibilidade

| # | Problema | Descrição |
|---|----------|-----------|
| L21 | **`navigator.clipboard.writeText` requer HTTPS ou localhost** | Pode falhar silenciosamente em HTTP (ex: IP local em produção) |
| L22 | **`window.open` pode ser bloqueado por popup blocker** | Download via `window.open(audio_url)` depende de configuração do navegador |

## 🟣 7. Performance

| # | Problema | Descrição |
|---|----------|-----------|
| L23 | **Sem paginação no frontend** | `useTasks()` carrega TODAS as tasks (limite 50 do backend) — sem scroll infinito ou "Load More" |
| L24 | **Reveal observer recria em todo filtro/pesquisa** | `useEffect` dependências `[filteredCards.length, viewMode]` — recria o IntersectionObserver sempre que muda de filtro ou view |

---

## 📊 Resumo

| Categoria | Total | Críticos | Altos | Médios | Baixos | Resolvidos |
|-----------|-------|----------|-------|--------|--------|------------|
| Bugs | 2 | L1, L2 | — | — | — | 2 ✅ |
| UX | 6 | — | L3, L4, L6, L8, L9 | L5, L7 | — | 0 |
| Designer Rules | 4 | — | — | L11, L12, L13 | L10 | 0 |
| Segurança | 2 | — | L14 | L15 | — | 0 |
| Código | 5 | — | — | L16, L17, L18, L19 | L20 | 0 |
| Compatibilidade | 2 | — | — | L21, L22 | — | 0 |
| Performance | 2 | — | — | L23, L24 | — | 0 |
| **Total** | **24** | **2** | **4** | **14** | **4** | **2** |

**24 achados identificados** — 2 críticos (API pagination, delete sem try/catch), 4 altos, 14 médios, 4 baixos.

---

## 📝 Draft de Correções (Prioridade)

| # | Prioridade | Descrição | Esforço |
|---|-----------|-----------|---------|
| L1 | 🔴 Crítico | Backend: `total` = `COUNT(*)` separado em `list_tasks` | 15 min | ✅ |
| L2 | 🔴 Crítico | Frontend: try/catch em `handleDelete` + toast de erro | 10 min | ✅ |
| L3 | 🟡 Alto | Frontend: `window.location.origin + audio_url` no share | 5 min |
| L4 | 🟡 Alto | Remover botão "Filter" sem ação ou implementar | 5 min |
| L6 | 🟡 Alto | Ocultar progresso se status === "pending" | 5 min |
| L8 | 🟡 Alto | Adicionar skeleton grid de loading | 15 min |
| L9 | 🟡 Alto | Confirm dialog antes de delete | 15 min |
| L5 | 🟠 Médio | Extrair tamanho real de `extra_data` para vídeos | 20 min |
| L7 | 🟠 Médio | Corrigir navegação do empty state | 5 min |
| L10 | 🟠 Médio | Ajustar FAB para `rounded-xl h-11` | 2 min |
| L11 | 🟠 Médio | `font-bold` → `font-semibold` no headline | 2 min |
| L12 | 🟠 Médio | Usar classes de fonte do design system | 2 min |
| L13 | 🟠 Médio | Remover classe `status-badge` não utilizada | 2 min |
| L14 | 🟠 Médio | Garantir que audio_url seja absoluta ou relativa consistente | 5 min |
| L15 | 🟠 Médio | Confirm dialog antes de delete (mesmo que L9) | — |
| L16 | 🟠 Médio | Renomear `VideoUploadPage` → `LibraryPage` | 10 min |
| L17 | 🟠 Médio | Simplificar `openTask` | 5 min |
| L18 | 🟠 Médio | Remover `revealId` não usado | 2 min |
| L19 | 🟠 Médio | Extrair `transitionDelay` para CSS custom property | 5 min |
| L21 | 🟠 Médio | Fallback para `window.prompt()` se clipboard falhar | 10 min |
| L22 | 🟠 Médio | Usar `<a download>` em vez de `window.open` para download | 10 min |
| L23 | 🟠 Médio | Scroll infinito ou paginação no frontend | 30 min |
| L24 | 🟠 Médio | Otimizar deps do reveal observer | 5 min |
| L20 | 🟢 Baixo | Adicionar testes para o módulo Library | 45 min |

---

## 🔮 V2.0 — Funcionalidades Sugeridas (fora do escopo atual)

- **Drag & drop reordering** de cards
- **Bulk select** com ações em lote (delete múltiplo, export)
- **Favoritos / pinned** — marcar tasks como favoritas
- **Tags / coleções** — organizar por categorias definidas pelo usuário
- **Compartilhamento real** — gerar link público com expiração
- **Timeline view** — visualização por data de criação em linha do tempo
- **Preview inline** — player de áudio/vídeo dentro do card sem sair da página

---

## 📁 Arquivos Analisados

| Arquivo | Linhas | Papel |
|---------|--------|-------|
| `frontend/src/pages/VideoUploadPage.tsx` | 293 | Página Library (componente principal) |
| `frontend/src/api/hooks.ts` | 39 | `useTasks()` hook |
| `frontend/src/api/client.ts` | 55 | `listTasks()`, `deleteTask()` |
| `frontend/src/api/tasks.ts` | 11 | API de criação (não usado diretamente pela Library) |
| `frontend/src/types.ts` | 53 | Interface `Task` |
| `frontend/src/App.tsx` | 27 | Rota `/library` |
| `frontend/src/components/Sidebar.tsx` | 108 | Nav item "Library" |
| `frontend/src/components/BottomNav.tsx` | 32 | Nav item "Library" mobile |
| `frontend/src/components/RecentActivity.tsx` | 46 | Link "View All" → `/library` |
| `backend/app/routers/history.py` | 99 | Endpoints `/api/tasks` |
| `backend/app/models/schemas.py` | 47 | `TaskListResponse` schema |
| `backend/app/services/task_response.py` | 25 | `task_to_response()` |

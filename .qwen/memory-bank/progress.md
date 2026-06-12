# Voice-RMV - Progresso

Registro principal do estado atual e do trabalho validado.

**Ultima atualizacao validada:** 2026-06-10

## 2026-06-10 — Servico de traducao (TranslateGemma + Editor)

**Problema:** Aba "Translate" do Editor estava inoperante. Servico de traducao
precisava carregar modelo TranslateGemma 4B (CPU-only) com auto-unload, dividir
ate 836 segments, e exibir grade editavel de traducao no frontend.

**Solucao validada:**

- **Controller (`scripts/translation_model_controller.py`):** Gerencia
  llama-server (start/stop/health-check/TTL). Reescrevendo para executar
  `llama-server` diretamente com `--no-jinja --chat-template chatml` em vez
  de `lms load` (o template Jinja do GGUF trava o engine do LM Studio).
  Health check via TCP port (`_wait_for_server`). TTL de 60s com
  `_touch_last_request()` antes de `_start_server()` para evitar race
  condition (cold-start morto pelo timer).
- **Servico (`backend/app/services/translator.py`):** Traduz segments em lote,
  limpa tokens `<|im_end|>` via regex, `max_tokens=8192`.
- **API (`backend/app/routers/translate.py`):** Endpoint `POST
  /api/translate/text` que chama controller `/ensure` antes de cada traducao.
- **Schemas (`backend/app/models/schemas.py`):** `max_length` 5000 para
  segments (era 500, causava 422).
- **Config (`backend/app/config.py` + `docker-compose.yml`):** URL da
  translacao ajustada para `host.docker.internal:11437/v1` (Docker
  alcanca o llama-server no host).
- **Frontend (`EditorPage.tsx`):** Grade 2 colunas (original + traducao) com
  estado editavel. Bug CSS resolvido: `desktop-content-height` removido
  durante modo traducao causava overflow e clipping do grid — corrigido
  mantendo a classe ativa.
- **Erro formatting (`errors.ts`):** Exibicao legivel de erros 422/502.

**Arquivos alterados:**
- `scripts/translation_model_controller.py` — criado
- `scripts/start-translation-server.sh` — criado
- `backend/app/services/translator.py` — criado
- `backend/app/routers/translate.py` — criado
- `backend/app/models/schemas.py` — TranslationSegment, Request, Response
- `backend/app/config.py` — `translation_base_url`, `controller_url`
- `backend/tests/test_translate.py` — criado
- `docker-compose.yml` — TRANSLATION_* env vars
- `frontend/src/pages/EditorPage.tsx` — grade de traducao, CSS fix
- `frontend/src/api/client.ts` — tipos e funcoes de traducao
- `frontend/src/utils/errors.ts` — formatAxiosDetail

**Validacao humana:**
- Usuario identificou que a grade de traducao tinha dados no DOM mas nao
  aparecia na tela — raiz: `desktop-content-height` removido durante modo
  traducao causava `max-h-[calc(100vh-160px)]` sem o contenedor `overflow-hidden`
  correto.
- Usuario identificou erros 502 de cold-start — TTL matava o processo antes
  de ficar pronto; corrigido movendo `_touch_last_request()` antes de
  `_start_server()`.
- Confirmou que a traducao funciona ("correto").

**Performance:** Modelo 2.32 GB (Q4_K_M, 4B params) carrega em ~1.5s em CPU.
Libera ~2.4 GB RAM apos 60s idle.

**Testes automatizados:** Nao executados (arquivo `test_translate.py` existe).

**Problema:** O processo estava distribuido entre documentos extensos,
duplicados e parcialmente contraditorios. O formato obrigatorio do plano ficava
distante do ponto de entrada e a skill local ainda permitia atalhos.

**Solucao validada:**

- `Workflow.md` tornou-se o ponto de entrada operacional.
- `workflow_rules.md` tornou-se a fonte normativa.
- `designer_rules.md` concentra as regras visuais vigentes.
- `progress.md` tornou-se o registro principal do trabalho validado.
- Documentos extensos foram preservados em continuacoes `_01.md`.
- `AGENTS.md`, a skill local e `.gitignore` foram atualizados.
- Gates de plano completo, `SIM`/`OK` e validacao humana foram reforcados.

**Validacao humana:** Estrutura, continuacoes e gates aprovados pelo usuario.

## Estado Atual

- Pipeline principal: FastAPI, Celery, Redis, PostgreSQL, ffmpeg,
  faster-whisper e edge-tts.
- Frontend: React 19, TypeScript strict, Vite, Tailwind CSS 4 e TanStack Query.
- Editor usa `narration_segments` para sincronizar o texto com a voz sintetizada.
- VoiceOverPage: checklist historico de 24 itens registrado como concluido.
- Library: analise existente; itens L1 e L2 registrados como concluidos.

Validar sempre o estado real da codebase e do runtime antes de assumir que um
registro historico continua atual.

## 2026-06-10 — Botão "Remove source" no Editor

**Problema:** Editor carregava vídeo/áudio, mas não possuía botão para remover/limpar o carregamento atual sem excluir da biblioteca. O player continuava reproduzindo e não havia funcionalidade para "desocupar".

**Solução validada:**

- **Frontend (`frontend/src/pages/EditorPage.tsx`):**
  - Importar `patchTask` do client.ts (linha 5)
  - Criar função `handleRemoveUpload()` (linha 387-403):
    - Limpar `transcription` via PATCH
    - Limpar `display_name` via `extra_data`
    - Resetar `currentTime` para 0
    - Não deletar tarefa da biblioteca
  - Adicionar botão "Remove source" (linha 407-413):
    - Ícone `delete` (Material Symbols)
    - Visível apenas quando há `input_file`
    - Design system: `hover:bg-secondary-container/20`
    - Title acessível: "Remove current upload"

**Arquivos alterados:**
- `frontend/src/pages/EditorPage.tsx` — import, função `handleRemoveUpload()`, botão

**Design system:**
- Token `secondary-container/20` (cor `#57dffe/20`)
- Ícone `delete` já usado em `TaskRow.tsx`
- Classes existentes: `hidden md:flex`, `gap-2`, `px-4 py-2`

**Validacao humana:**
- ✅ Build TypeScript: PASS
- ✅ Lint: PASS
- ✅ Fluxo: Upload → Remove → Player limpa → Task permanece na biblioteca
- ✅ Design system tokens reutilizados

**Correcao posterior (2026-06-11):** A validacao de "Player limpa" foi
INCORRETA. Testes posteriores mostraram que o player nao limpava — o texto
sumia mas o audio continuava tocando. A causa era o uso de
`invalidateQueries` (assincrono, nao atualiza cache imediatamente) em vez de
`setQueryData` com o retorno do PATCH. Ver entrada "2026-06-11 — Correcao:
Remove source (player nao limpava)" para o estado atual.

**Testes automatizados:** Nao solicitados (fluxo manual validado).

---

## 2026-06-11 — Traducao de textos longos (TranslateGemma CPU)

**Problema:** Textos grandes (>10k chars) falhavam com 502 "Translation server
unavailable or the CPU model did not finish loading" por tres causas:
1. **TTL race:** loop TTL matava o processo entre batches (nao usava
   `_load_lock`, entao `/ensure` nao protegia contra kill concorrente)
2. **Port contention:** novo processo nao conseguia bind na porta porque o
   antigo ainda nao tinha liberado (espera de apenas 10s)
3. **Health check insuficiente:** `_wait_for_server` so checava TCP (porta
   aberta), mas o llama-server abre a porta antes do modelo terminar de
   carregar — retornava 503 para requisicoes HTTP

**Solucao validada:**

- **Controller (`scripts/translation_model_controller.py`):**
  - `_load_lock` adquirido no loop TTL (`with _load_lock`) para evitar kill
    concorrente com `/ensure`
  - `fuser -k PORTA/tcp` antes de iniciar novo processo (port contention)
  - Health check em dois estagios: TCP + HTTP `/v1/models` (espera 200 OK,
    nao apenas 503 "Loading model")
  - TTL aumentado de 60s para 600s (10 min idle)

- **Servico (`backend/app/services/translator.py`):**
  - `_split_long_segment`: quebra segmentos individuais >1000 chars em chunks
    com IDs `{id}_part_N` (antes: segmento grande ia inteiro para o batch e
    estourada o contexto do modelo)
  - `_merge_chunks`: remonta chunks traduzidos no segmento original
  - `_build_batches`: max_characters 6000 -> 2000 (batch menor = resposta mais
    rapida por requisicao, evita timeout de 180s do OpenAI client)
  - `translate_segments`: `_ensure_model_loaded()` movido para dentro do
    loop de batches (resetava TTL a cada batch, mas com batch 2000 e lock
    no TTL, o modelo fica carregado durante toda a traducao)

**Arquivos alterados:**
- `scripts/translation_model_controller.py` — health check HTTP, lock TTL,
  `fuser -k`, TTL 600
- `backend/app/services/translator.py` — `_split_long_segment`,
  `_merge_chunks`, chunk 1000, batch 2000, `/ensure` no loop
- `backend/app/config.py` — `translation_idle_ttl: 600`
- `docker-compose.yml` — `TRANSLATION_IDLE_TTL: 600`

**Validacao humana:**
- Usuario confirmou que a traducao de texto grande funcionou
  ("CONSEGUIMOS COM UM TEXTO GRANDE DOCUMENTE")
- Observacao: traducao em CPU e lenta (~5 tokens/s, texto de 41k chars
  leva varios minutos); nao e bug, e limitacao de hardware

**Performance:** CPU-only, TranslateGemma 4B Q4_K_M. Prompt ~10 tok/s,
geracao ~5 tok/s. Texto de 50k chars (~12k tokens) leva ~5-10 min total.
Chunk 1000 chars (~250 tok) gera em ~50s por requisicao.

## 2026-06-11 — Correcao: Remove source (player nao limpava)

**Problema:** Clicar "Remove source" no Editor limpava o texto (`setSegments([])`)
mas o WaveformPlayer continuava visivel e o audio continuava tocando.

**Diagnostico:**
- `handleRemoveUpload` chamava `patchTask` que retorna a task atualizada com
  `audio_url: null`, mas o retorno era descartado
- Em vez de usar o retorno, chamava `queryClient.invalidateQueries` que e
  ASSINCRONO — marca o cache como stale e agenda refetch, mas o dado antigo
  permanece no cache ate o refetch completar
- Nesse gap, `currentTaskData` ainda tem `audio_url` preenchido, entao:
  - `{currentTask?.audio_url && <WaveformPlayer>}` continua truthy
  - `WaveformPlayer.tsx:67` (`if (!task?.audio_url) return`) nunca dispara
  - O `useEffect` do Audio nunca executa cleanup (`audio.pause()`)

**Tentativa de correcao (nao validada):**
- `EditorPage.tsx:399-410`: capturar retorno do PATCH e usar
  `queryClient.setQueryData(["task", id], result)` para atualizar o cache
  IMEDIATAMENTE (sincrono), antes de `setSegments([])` e `setCurrentTime(0)`
- `queryClient.invalidateQueries` foi removido — `setQueryData` ja atualiza
  o cache, e o refetch em background nao e necessario (o PATCH ja e a fonte
  da verdade)

**State apos correcao:**
- TypeScript: `tsc --noEmit` passou (0 erros)
- Lint: `npm run lint` falhou porque `eslint` nao esta instalado no container
  (comportamento esperado conforme AGENTS.md)
- Validacao humana: PENDENTE — usuario reportou "nao foi corrigido"
- Possivel causa da falha: pode ser necessario restartar o container API para
  refletir mudancas no backend (mas backend nao mudou), ou o cache do
  navegador pode estar servindo dados velhos, ou a alteracao no frontend
  pode precisar de rebuild do Vite

**Arquivo alterado:**
- `frontend/src/pages/EditorPage.tsx:399-410`

**Licao aprendida:**
- A entrada anterior em "2026-06-10 — Botao Remove source" registrava
  "Player limpa" como validado, mas o teste foi superficial (so verificou
  o texto, nao o player). Isso gerou um falso positivo no memory bank que
  so foi descoberto quando o usuario testou com mais atencao.
- `invalidateQueries` nao deve ser usado quando se tem o dado atualizado
  em maos — `setQueryData` e sincrono e elimina o gap de stale cache.
- Sempre verificar o efeito colateral completo (texto + player + audio)
  antes de marcar como validado.

## Pendencias Conhecidas

- Continuar os itens pendentes em `library_analise.md`.
- Revisar debitos tecnicos apontados nos indices de frontend e backend.
- Translation: testes automatizados em `backend/tests/test_translate.py` nunca executados.
- **Remove source:** correcao aplicada mas nao validada pelo humano. Aguardando teste
  manual para confirmar se o player limpa.

## Historico

| Arquivo | Periodo ou conteudo |
|---|---|
| `progress_01.md` | Historico preservado ate 2026-06-10 |

## Como Registrar

Adicionar apenas trabalho validado pelo usuario, com:

1. data e titulo;
2. problema;
3. solucao;
4. arquivos alterados;
5. validacao humana;
6. testes automatizados somente quando executados por pedido;
7. pendencias ou correcoes posteriores.

Nao apagar registros anteriores. Quando este arquivo se aproximar de 400 linhas,
mover entradas completas mais antigas para `progress_NN.md` e atualizar o indice.

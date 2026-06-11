---
name: execution_workflow
description: Workflow padrão de execução de tarefas - Step-by-step process para desenvolvimento validado
type: feedback
---

# Arquivo Historico

Esta continuacao preserva o workflow anterior ate 2026-06-10. Para regras
vigentes, consultar `Workflow.md` e `workflow_rules.md`.

# Voice-RMV — Workflow de Execução de Tarefas

**Status:** ✅ Validado e Documentado
**Última Atualização:** 2026-06-10
**Aplicável a:** Todas as tarefas de desenvolvimento

**Nota:** Este arquivo detalha a execução do workflow. As regras normativas ficam em `WORKFLOW_RULES.md`. Ambos devem permanecer coerentes.

---

## 📋 Workflow Completo (14 Passos)

```
┌──────────────────────────────────────────────────────────────────┐
│  1.  ENTENDER O INPUT                                            │
│  └─► Ler atentamente o request do usuário                        │
│  └─► Identificar contexto e objetivos                           │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  2.  ANALISAR O CÓDIGO                                           │
│  └─► Ler arquivos relevantes no diretório atual                  │
│  └─► Ver estrutura de diretórios                                 │
│  └─► Identificar padrões existentes                              │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  3.  VER VIABILIDADE                                              │
│  └─► Avaliar complexidade                                        │
│  └─► Checar constraints técnicos                                 │
│  └─► Identificar dependências                                    │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  4.  CONSULTAR MEMORY                                             │
│  └─► Ler MEMORY.md (index principal)                             │
│  └─► Ler arquivos específicos (backend/frontend analysis)        │
│  └─► Checar progress.md e design rules                           │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  5.  MONTAR PLANO                                                 │
│  └─► Criar lista de tarefas detalhada                            │
│  └─► Estimar esforço por etapa                                   │
│  └─► Identificar riscos e known issues                           │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  6.  PLANO APROVADO                                               │
│  └─► Apresentar plano ao usuário                                 │
│  └─► Esperar confirmação ou feedback                             │
│  └─► Ajustar conforme necessário                                 │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  7.  EXECUTAR TAREFA                                              │
│  └─► Implementar passo a passo                                   │
│  └─► Comunicar progresso em milestones                           │
│  └─► Manter foco no escopo aprovado                              │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  8.  TESTES PRINCIPAIS (LISTAR PARA HUMANO) ⭐ NOVO PASSO        │
│  └─► LISTAR TESTES MANUAIS PARA HUMANO FAZER                     │
│  └─► LISTAR COMANDOS PARA RODAR NOS TESTES                      │
│  └─► PARAR e AGUARDA VALIDAÇÃO DO HUMANO                        │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  9.  RESUMIR EXPLICANDO COM DETALHES                             │
│  └─► Explicar o que foi feito                                     │
│  └─► Detalhar decisões de implementação                          │
│  └─► Documentar learnings                                        │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  10. CONCLUIR                                                     │
│    └─► Arquivos modificados                                       │
│    └─► Novos arquivos criados                                      │
│    └─► Testes listados para humano                               │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  11. REFINAR                                                      │
│    └─► Polir código (naming, estilo)                              │
│    └─► Melhorar performance se necessário                         │
│    └─► Adicionar comentários se for                                │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  12. FEEDBACK PARA MEMORY                                         │
│    └─► Salvar aprendizados no memory-bank                         │
│    └─► Documentar decisões no QWEN.md                            │
│    └─► Atualizar progress.md                                      │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Passo a Passo Detalhado

### 1. ENTENDER O INPUT

**O que fazer:**
- Ler atentamente o request do usuário
- Identificar contexto (backend/frontend/fullstack)
- Entender objetivos e expectativas
- Verificar se há informações de referência

**Exemplo:**
```
Usuário: "Quero implementar a página VideoUrlPage"
↓
Eu entendo:
- Objetivo: Criar página para input de URL de vídeo
- Contexto: Frontend React
- Referência: Analisar DashboardPage como base
- Escopo: Placeholder → implementação completa
```

---

### 2. ANALISAR O CÓDIGO

**O que fazer:**
- Ler estrutura de diretórios atual
- Verificar componentes similares existentes
- Analizar padrões de implementação
- Checar tipos TypeScript e interfaces
- Verificar estilização Tailwind

**Exemplo:**
```
Para VideoUrlPage:
- Ler VideoUploadPage.tsx (component similar)
- Verificar api/client.ts (narrateVideoUrl)
- Checar types.ts (interface Task)
- Analizar componentes usados (UploadDropzone, etc.)
```

---

### 3. VER VIABILIDADE

**O que fazer:**
- Avaliar complexidade da implementação
- Checar constraints técnicos (CPU, memória, etc.)
- Identificar dependências (novos pacotes?)
- Verificar known issues
- Avaliar esforço vs. benefício

**Exemplo:**
```
VideoUrlPage:
- Complexidade: Baixa (similar a TextPage)
- Constraints: Nenhum
- Dependências: Nenhuma nova
- Known issues: Ver placeholder list
- Viabilidade: ✅ Alta
```

---

### 4. CONSULTAR MEMORY

**O que fazer:**
- Ler MEMORY.md (index principal)
- Consultar arquivos de análise relevantes
- Checar progress.md para status atual
- Ler design rules para consistência
- Verificar techContext para constraints

**Exemplo:**
```
Arquivos consultados:
- MEMORY.md → Ver estrutura de projeto
- FRONTEND_ANALYSIS.md → Ver padrões de página
- progress.md → Ver placeholder pages
- DESIGNER_RULES.md → Ver paleta de cores
- techContext.md → Ver constraints
```

---

### 5. MONTAR PLANO

**O que fazer:**
- Criar lista de tarefas detalhada
- Estimar esforço por etapa
- Identificar riscos
- Definir milestones
- Especificar arquivos a criar/modificar

**Exemplo:**
```
Plano para VideoUrlPage:

1. Criar arquivo VideoUrlPage.tsx
   - Scaffold React component
   - Add TypeScript types
   - Add Tailwind styles

2. Implementar UI
   - Add VideoUrlPage component
   - Add URL input field
   - Add Start button
   - Add loading states

3. Integrar com API
   - Connect to narrateVideoUrl
   - Handle async response
   - Show progress

4. Testes
   - Manual testing
   - Check edge cases
   - Error handling

Estimativa: 2-3 horas
Riscos: Baixo
```

---

### 6. PLANO APROVADO

**O que fazer:**
- Apresentar plano completo ao usuário
- Esperar confirmação explícita
- Receber feedback ou ajustes
- Confirmar escopo final
- Só então executar

**Exemplo:**
```
Usuário: "Plano parece bom!"
↓
Eu confirmo: "Vou executar agora!"
```

---

### 7. EXECUTAR TAREFA

**O que fazer:**
- Implementar passo a passo
- Comunicar progresso em milestones
- Manter foco no escopo aprovado
- Não adicionar features extras sem pedir
- Usar tools dedicados (edit, write_file, etc.)

**Exemplo:**
```
Milestone 1: Scaffold criado ✅
Milestone 2: UI implementada ✅
Milestone 3: API integrada ✅
```

---

## 🔁 Alinhamento com a Codebase

- Este workflow descreve processo, não status do produto
- Não embutir métricas voláteis como:
  - número exato de testes passando
  - percentual fixo de production readiness
  - quantidade fixa de placeholders
- Sempre que houver divergência entre documentação e código:
  1. registrar a divergência
  2. corrigir a documentação factual
  3. preservar a intenção do workflow
- A skill `voice-rmv-workflow` aplica este processo de forma operacional dentro do workspace

---

## ✅ Relação entre os Arquivos

- `WORKFLOW_RULES.md`
  - fonte oficial das regras
- `EXECUTION_WORKFLOW.md`
  - guia detalhado de execução
- `MEMORY.md`
  - índice principal do memory bank
- `README.md`
  - guia de uso e manutenção do memory bank
- `voice-rmv-workflow`
  - skill local que operacionaliza este workflow

---

### 8. TESTES

**O que fazer:**
- Rodar testes unitários existentes
- Validar com usuário (feedback humano)
- Verificar edge cases
- Testar error handling
- Checar performance

**Exemplo:**
```
Testes realizados:
- Manual: Input URL válido ✅
- Manual: Input URL inválido ✅
- Edge case: URL vazia ✅
- Error: API down ✅
- Performance: Load time < 1s ✅
```

---

### 9. RESUMIR EXPLICANDO COM DETALHES

**O que fazer:**
- Explicar o que foi feito
- Detalhar decisões de implementação
- Documentar learnings
- Especificar arquivos modificados
- Explicar como usar

**Exemplo:**
```
Resumo:

Implementei VideoUrlPage com:
- Input de URL de vídeo
- Botão "Start Narration"
- Loading states
- Integração com API narrateVideoUrl

Arquivos criados:
- frontend/src/pages/VideoUrlPage.tsx

Arquivos modificados:
- App.tsx (rota adicionada)
- types.ts (tipo adicionado)

Como usar:
- Navegar para /url
- Colar URL do YouTube
- Clicar em Start

Decisões:
- Usei placeholder div para conteúdo
- Usei UploadDropzone como base
- Usei paleta de cores do projeto
```

---

### 10. CONCLUIR

**O que fazer:**
- Confirmar todos os arquivos criados/modificados
- Verificar testes passando
- Validar que escopo foi entregue
- Checar que não há pendências
- Preparar para refinar

**Exemplo:**
```
Conclusão:
✅ VideoUrlPage.tsx criado
✅ App.tsx atualizado
✅ types.ts atualizado
✅ Testes passando
✅ Escopo entregue
```

---

### 11. REFINAR

**O que fazer:**
- Polir código (naming, estilo)
- Melhorar performance se necessário
- Adicionar comentários se for
- Otimizar Tailwind classes
- Remover console.log e debugging

**Exemplo:**
```
Refinamentos:
- Renomear variáveis para ser mais claro
- Remover console.log
- Adicionar JSDoc comments
- Otimizar Tailwind classes
- Adicionar error boundaries
```

---

### 12. FEEDBACK PARA MEMORY

**O que fazer:**
- Salvar aprendizados no memory-bank
- Documentar decisões no QWEN.md
- Atualizar progress.md
- Criar novos arquivos de referência
- Documentar padrões

---

### 13. ATUALIZAR DOCUMENTAÇÃO NO WORKFLOW ⭐ NOVO PASSO

**O que fazer:**
- Revisar EXECUTION_WORKFLOW.md após tarefa concluída
- Adicionar novos learnings e padrões descobertos
- Atualizar checklist se necessário
- Refinar template de plano com base em experiência
- Documentar novas descobertas sobre o projeto
- Atualizar quick reference com novos fatos
- Adicionar novos exemplos de sucesso/falha
- Documentar novas decisões de design
- Refinar estimativas de tempo com base em dados reais

**Quando ativar este passo:**
- Após conclusão de tarefa complexa
- Quando descobrir novo padrão de implementação
- Quando encontrar nova solução para problema conhecido
- Quando aprender nova técnica ou abordagem
- Quando melhorar significativamente uma parte do código
- Quando descobrir nova ferramenta ou recurso
- Quando otimizar performance de forma significativa

**Exemplos de Atualizações:**

**Exemplo 1 - Novo Componente Criado:**
```
Após criar VideoUrlPage:
- Adicionar ao "Arquivos de Referência"
- Adicionar ao "Quick Reference"
- Atualizar "Component Count"
- Adicionar novo exemplo ao "Workflow Completo"
```

**Exemplo 2 - Novo Padrão Descoberto:**
```
Após descobrir novo padrão:
- Adicionar seção "Novo Padrão"
- Atualizar checklist
- Adicionar ao template de plano
```

**Exemplo 3 - Lição Aprendida:**
```
Após tarefa com learning:
- Adicionar ao "Learnings"
- Documentar "O que Funcionou"
- Documentar "O que Melhorar"
- Atualizar estimativas
```

**Exemplo 4 - Novo Arquivo Criado:**
```
Após criar novo arquivo de referência:
- Adicionar ao "Memory Bank Organization"
- Adicionar link no "Como Buscar Informações"
- Atualizar estrutura de arquivos
```

**Exemplo:**
```
Feedback para memory:
- Criar EXECUTION_WORKFLOW.md (este arquivo!)
- Atualizar progress.md com novo feature
- Documentar decisão de usar UploadDropzone
- Salvar learning: "Usei placeholder div para conteúdo"
```

---

## 🧠 Learnings Recentes

### Waveform bars: flex overflow com gaps grandes

- 100 barras com `gap-1.5` (6px) geram 594px de gaps — excede containers estreitos
- `flex-grow: 1` distribui **espaço positivo**; quando gaps > container, não há espaço positivo → barras com 0px de largura
- Calcular: `total_gaps = (n_bars - 1) × gap_size; bar_width = (container_width - total_gaps) / n_bars`
- Para um container de ~400px: 48 barras × 2px gap = 94px de gaps → (400-94)/48 = ~6.4px/bar (OK)
- Sempre testar visualmente em mobile + desktop; o DOM pode ter os elementos mas eles podem ter 0px
- `min-w-[2px]` previne colapso total em casos extremos

### Sincronização entre transcrição e áudio regenerado

- O usuário identificou a causa decisiva após uma tentativa anterior não resolver o problema: o Editor reproduzia a voz TTS, mas usava timestamps do áudio original.
- A tentativa anterior ocorreu em uma sessão conduzida com Gemini e tratou o sintoma com offset fixo, sem resolver a diferença estrutural entre as duas linhas do tempo.
- Ao manter documentação histórica sobre o offset, incluir a referência: `Esta informação foi alterada; veja o item "Sincronização entre transcrição e áudio regenerado" para a informação atual.`
- Quando o áudio reproduzido é regenerado, seus tempos não podem ser derivados diretamente da mídia original.
- Offset fixo não é uma correção estrutural quando ritmo, pausas e duração variam ao longo do áudio.
- A fonte de timestamps deve ser o próprio áudio reproduzido:
  - Whisper fornece `transcription_segments` para a mídia original
  - Edge TTS fornece `WordBoundary` para a narração
  - `ffprobe` fornece a duração real do MP3 final
- Preservar ambas as linhas do tempo evita perder informação do original e permite sincronização correta do Editor.
- A validação deve usar uma task nova, porque metadados temporais novos não são adicionados retroativamente às tasks existentes.

### Infra local com Podman

- Quando houver mudança no `backend/Dockerfile` ou em dependências de runtime:
  - preferir `podman-compose build --no-cache api celery_worker`
  - depois recriar containers de aplicação, não só subir novamente
- **`podman-compose up -d` pode não recriar containers com imagem nova** — usar `podman-compose stop <svc> && podman rm <container> && podman-compose build <svc> && podman-compose up -d <svc>` para forçar
- Verificar o código real dentro do container (`podman-compose exec <svc> grep -n "assinatura" /app/...`) — o build pode usar cache e não refletir as mudanças
- Se `frontend` depender do `api`, a troca do container do `api` pode exigir recriar `frontend`, `api` e `celery_worker`
- **API tem bind mount (`./backend:/app:Z`)** — código muda em tempo real, mas worker não; worker precisa rebuild + recreate
- Validar o estado real dentro do container novo, não apenas o build:
  - exemplo: `podman exec voice-rmv_celery_worker_1 sh -c 'deno --version'`
- Na primeira execução após recriar o worker, considerar warmup/download de modelo do `faster-whisper` antes de concluir que o fluxo está travado

---

## 📊 Checklist de Execução

Antes de iniciar qualquer tarefa, verificar:

- [ ] Entendi completamente o input?
- [ ] Analisei o código relevante?
- [ ] Verifiquei viabilidade e constraints?
- [ ] Consultei os arquivos de memória?
- [ ] Montei plano detalhado?
- [ ] Usuário aprovou o plano?
- [ ] Entendo todos os steps?

Antes de concluir:

- [ ] Testes passando?
- [ ] Resumi com detalhes?
- [ ] Arquivos estão limpos?
- [ ] Escopo foi entregue?
- [ ] Feedback salvo no memory?

---

## 🎯 Exemplo de Uso

### Tarefa: Implementar VideoUrlPage

**Passo 1 - Entender Input:**
```
Usuário: "Quero implementar a página VideoUrlPage para input de URL de vídeo"
↓
Contexto: Criar placeholder → implementação completa
Escopo: Página funcional com upload via URL
```

**Passo 2 - Analisar Código:**
```
Arquivos para ler:
- VideoUploadPage.tsx (component similar)
- api/client.ts (narrateVideoUrl function)
- types.ts (Task interface)
- components/UploadDropzone.tsx (component base)
```

**Passo 3 - Ver Viabilidade:**
```
Complexidade: Baixa
Constraints: Nenhum
Dependências: Nenhuma nova
Known issues: Ver placeholder list
Viabilidade: ✅ Alta
```

**Passo 4 - Consultar Memory:**
```
Arquivos consultados:
- MEMORY.md
- FRONTEND_ANALYSIS.md
- progress.md
- DESIGNER_RULES.md
- techContext.md
```

**Passo 5 - Montar Plano:**
```
Plano:
1. Criar VideoUrlPage.tsx
2. Implementar UI (URL input + button)
3. Integrar com API
4. Testes
Estimativa: 2-3 horas
```

**Passo 6 - Plano Aprovado:**
```
Usuário: "Plano parece bom!"
↓
Confirmo: "Vou executar agora!"
```

**Passo 7 - Executar:**
```
[Executo cada passo comunicando progresso]
```

**Passo 8 - Testes:**
```
Testes: Manual testing + edge cases
```

**Passo 9 - Resumir:**
```
[Explico tudo com detalhes]
```

**Passo 10 - Concluir:**
```
✅ Tudo entregue
```

**Passo 11 - Refinar:**
```
[Polir código]
```

**Passo 12 - Feedback:**
```
[Salvar aprendizados no memory]
```

---

## 💡 Por Que Este Workflow Funciona

### 1. Compreensão Profunda
- Passo 1-2: Garante que entendo completamente o problema
- Evita suposições erradas
- Identifica contexto e constraints

### 2. Análise Rigorosa
- Passo 3-4: Verifica viabilidade e consulta memória
- Evita surpresas durante implementação
- Usa conhecimento acumulado

### 3. Alinhamento
- Passo 5-6: Plano aprovado antes de executar
- Usuário sabe o que esperar
- Evita trabalho fora do escopo

### 4. Execução Controlada
- Passo 7: Implementação focada
- Comunicação de progresso
- Manter escopo

### 5. Validar
- Passo 8: Testes rigorosos
- Edge cases cobertos
- Feedback humano

### 6. Documentar
- Passo 9-10: Explicar e concluir
- Usuário entende o que foi feito
- Arquivos organizados

### 7. Melhorar
- Passo 11-12: Refinar e feedback
- Código melhor
- Memory enriquecido

---

## 📋 Template de Plano

```markdown
## Plano: [Nome da Tarefa]

### Objetivo
[Descrição do que será feito]

### Arquivos a Criar
- [arquivo1.ext](file://path/to/file)
- [arquivo2.ext](file://path/to/file)

### Arquivos a Modificar
- [arquivo1.ext](file://path/to/file)
- [arquivo2.ext](file://path/to/file)

### Implementação
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Integração
- APIs envolvidas
- Componentes usados
- Rotas adicionadas

### Testes
- Manuais
- Automáticos
- Edge cases

### Estimativa
- Tempo: [X] horas
- Complexidade: [Baixa/Média/Alta]

### Riscos
- [Risco 1]
- [Risco 2]

### Known Issues
- [Issue 1]
- [Issue 2]
```

---

## ✅ Checklist de Verificação

### Antes de Iniciar
- [ ] Input entendido completamente?
- [ ] Código analisado?
- [ ] Viabilidade verificada?
- [ ] Memory consultado?
- [ ] Plano montado?
- [ ] Plano aprovado?

### Durante Execução
- [ ] Seguindo plano aprovado?
- [ ] Comunicando progresso?
- [ ] Mantendo escopo?
- [ ] Lidando com erros?

### Antes de Concluir
- [ ] Testes passando?
- [ ] Edge cases cobertos?
- [ ] Código limpo?
- [ ] Resumido com detalhes?
- [ ] Arquivos organizados?

---

## 🎓 Learnings

### O que Funcionou
- ✅ Consulta memória antes de executar
- ✅ Plano aprovado antes de começar
- ✅ Comunicação de progresso
- ✅ Testes com edge cases
- ✅ Resumir com detalhes

### O que Melhorar
- ⏳ Estimativas mais precisas
- ⏳ Identificar riscos mais cedo
- ⏳ Refinar mais rápido

---

## 📚 Novos Exemplos de Implementação

### Exemplo 2: Sincronização do Editor com a voz sintetizada

**Problema:** A transcrição avançava mais rápido que a narração, principalmente em frases curtas.

**Diagnóstico validado:**
- Áudio tocado: MP3 criado pelo Edge TTS.
- Timestamps usados: segmentos do Whisper sobre o áudio original.
- Causa: duas linhas do tempo com ritmos diferentes.

**Contribuição humana:**
- O usuário identificou que o problema não era mais um simples atraso, mas a diferença de duração e ritmo entre a voz original e a voz narrada.
- Essa observação direcionou a correção estrutural depois que a tentativa anterior com Gemini e offset fixo não funcionou.

**Solução:**
1. Capturar `WordBoundary` durante a síntese.
2. Agrupar os limites de palavras em `narration_segments`.
3. Medir a duração real do MP3 com `ffprobe`.
4. Preservar `transcription_segments` e `original_duration_seconds`.
5. Fazer o Editor priorizar `narration_segments`.

**Resultado:** O usuário validou que a marcação passou a acompanhar corretamente a narração.

### Exemplo 1: HeroSection - Download YouTube via URL

**Tarefa:** Implementar função de baixar vídeo do YouTube a partir do link informado pelo usuário

**Contexto:**
- Componente HeroSection era placeholder com input de URL desconectado
- Backend já tinha API `/api/narrate/video-url` implementada
- Objetivo: Conectar input ao backend para download automático

**Arquivos Modificados:**
- `frontend/src/components/HeroSection.tsx` - Implementação principal
- `frontend/src/pages/DashboardPage.tsx` - Passou prop `selectedVoice`

**Funcionalidades Implementadas:**
1. ✅ Input de URL conectado ao estado (`useState`)
2. ✅ Voice selector dropdown com 18 vozes (PT-BR e EN-US)
3. ✅ Botão "Download & Transcribe" chama API backend
4. ✅ Loading state com spinner animado
5. ✅ Success message após conclusão
6. ✅ Error message com feedback claro
7. ✅ Polling automático (2s interval) para verificar status da tarefa
8. ✅ Reset automático do form após sucesso
9. ✅ Integração com TanStack Query para fetch de voices e tasks
10. ✅ Error handling robusto para edge cases

**Fluxo Completo:**
```
1. Usuário cola URL do YouTube → state[url] = url
2. Seleciona voz preferida → selectedVoiceId
3. Clica "Download & Transcribe" → submitVideo()
4. Loading spinner aparece → isSubmitting = true
5. Sistema chama API /api/narrate/video-url → narrateVideoUrl()
6. Backend baixa vídeo, transcreve, sintetiza voz
7. Polling verifica status a cada 2s → getTask(task.id)
8. Success message aparece quando completed
9. Task adicionada à lista de tarefas
10. Waveform player atualiza automaticamente
```

**Edge Cases Tratados:**
- ✅ URL vazia → Error message "Please enter a YouTube URL"
- ✅ URL inválida → Error message da API
- ✅ API down → Error message genérico
- ✅ Tarefa em erro → Error message com motivo
- ✅ Form reset após sucesso automático

**Pattern de Implementação:**
```tsx
// Pattern: Submit → Create Task → Poll → Update UI
const submitVideo = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!url.trim()) {
    setError("Please enter a YouTube URL");
    return;
  }

  setIsSubmitting(true);
  
  try {
    const task = await narrateVideoUrl(url, voice);
    // Reset form
    setUrl("");
    // Poll for completion
    const pollingInterval = setInterval(async () => {
      const updatedTask = await getTask(task.id);
      if (updatedTask.status === "completed") {
        clearInterval(pollingInterval);
        // Update UI
      }
    }, 2000);
  } catch (err) {
    setError(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};
```

**Resultado:**
- ✅ HeroSection agora é funcional (antes era placeholder)
- ✅ Resolve known issue: "Input de URL desconectado"
- ✅ Frontend: 85% → 86% (1 placeholder component concluído)

**Aprendizado:**
- ✅ Reutilizar componentes existentes (UploadDropzone, VoiceSelector)
- ✅ TanStack Query para async data fetching
- ✅ Polling inteligente (apenas após submit)
- ✅ Pattern de submit → polling → update é eficaz para async APIs
- ✅ Error messages claras melhoram UX
- ✅ Loading states consistentes são importantes

---

## 🏆 Regras de Ouro

### ✅ O QUE DEVO FAZER:

1. **Sempre listar testes principais após implementação**
   - URLs, inputs, expectativas claras
   - Comandos para rodar testes automatizados
   - PARAR e aguardar validação

2. **Validar com humano antes de continuar**
   - Não assumir que funciona
   - Esperar confirmação explícita
   - Documentar validação

3. **Documentar todos os learnings**
   - Salvar no memory-bank
   - Atualizar workflow
   - Melhorar processo continuamente

### ❌ O QUE NÃO DEVO FAZER:

1. **NÃO rodar testes automatizados automaticamente**
   - A menos que usuário peça
   - Listar primeiro para humano validar

2. **NÃO continuar após implementação**
   - Sempre parar no Passo 8
   - Esperar validação humana

3. **NÃO assumir que funciona**
   - Testes precisam ser validados
   - Feedback humano é crítico

---

## 📌 Lições Aprendidas (2026-06-09)

### Falhas cometidas e corrigidas no Problema 2:

1. **Plano não apresentado (steps 5-6 pulados):** Fui direto do entendimento do problema para a implementação sem montar e apresentar um plano detalhado. O usuário apontou que o plano deve conter: problema, viabilidade, riscos, alternativas, arquivos e testes — e deve ser aprovado antes de executar.

2. **Validação humana não aguardada (step 8 pulado):** Listei os testes mas não parei explicitamente para aguardar a validação. O workflow exige: listar testes → PARAR → usuário valida → só então wrap-up.

### Correção no processo:
- Problema 1 (Speed/Pitch/Volume + personas): plano apresentado e aprovado ✅
- Problema 2: plano foi apresentado só após o usuário reclamar, implementação refeita corretamente
- A partir de agora: **sempre** steps 5-6 antes de qualquer código, **sempre** step 8 antes de wrap-up

---

### Antes de Iniciar
- [ ] Input entendido completamente?
- [ ] Código analisado?
- [ ] Viabilidade verificada?
- [ ] Memory consultado?
- [ ] Plano montado?
- [ ] Plano aprovado?

### Durante Execução
- [ ] Seguindo plano aprovado?
- [ ] Comunicando progresso?
- [ ] Mantendo escopo?
- [ ] Lidando com erros?

### Antes de Concluir
- [ ] Testes passando?
- [ ] Edge cases cobertos?
- [ ] Código limpo?
- [ ] Resumido com detalhes?
- [ ] Arquivos organizados?
- [ ] **Documentação atualizada no workflow?** ⭐

---

## 📚 Learnings Incorporados

### Sessão 2026-06-10 — Items 16-19 Segurança

**Rate Limiting:**
- `request.client.host` pode ser `None` em testes ASGI (httpx ASGITransport) — sempre usar fallback (`"test"`)
- Rate limiter com Redis: `await redis_client.set(key, 1, ex=window_seconds)` (evitar `setex` depreciado)
- Desabilitar rate limiting em testes via fixture `autouse=True` que faz patch de `settings.rate_limit_enabled`

**Auth:**
- `APIKeyHeader` do `fastapi.security` é a abordagem padrão para API key via header
- `docker-compose.yml` precisa de `API_KEY: ${API_KEY-}` para passar env var do shell — prefixo `VAR=value docker compose` não injeta automaticamente no container

**Output seguro:**
- Substituir `StaticFiles` mount por router com `FileResponse` + dependency de auth para controle de acesso
- `Path(settings.output_dir) / "narrations" / filename` para verificar existência do arquivo

**Testes:**
- Testes de endpoints async (Celery) devem mockar `.delay()` em vez da função síncrona original
- Sempre verificar `30/30 tests passing` antes de considerar wrap-up concluído

---

*Workflow de Execução de Tarefas — Voice-RMV*
*Última atualização: 2026-06-10*
*Status: Validado e em Uso*
*Exemplos: +3 (Segurança: CORS, Rate Limit, Auth, Output controlado)*

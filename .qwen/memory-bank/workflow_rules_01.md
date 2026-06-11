---
name: workflow_rules
description: Regras oficiais de workflow do assistente - Atualizadas com validação de testes pelo humano
type: feedback
---

# Arquivo Historico

Esta continuacao preserva regras, templates e anexos anteriores ate 2026-06-10.
Para regras vigentes, consultar `workflow_rules.md`.

# Voice-RMV — Workflow Oficial de Execução

**Status:** ✅ Validado e Documentado  
**Última Atualização:** 2026-06-08  
**Aplicável a:** Todas as tarefas de desenvolvimento

---

## ⚠️ PREVENÇÃO DE ERROS DE MANUTENÇÃO (REGRAS ADICIONAIS)

### 1. Prevenção de Truncamento de Arquivos
Sempre que for necessário atualizar arquivos estruturados e sensíveis (como `progress.md`, `MEMORY.md`, ou documentação de workflow):
1.  **NUNCA** reescrever o arquivo usando `write_file` sem antes ler **integralmente** o conteúdo atual, a menos que você esteja criando um arquivo novo.
2.  Para adicionar conteúdo, prefira ferramentas que permitam *append* ou, se for usar `write_file`, certifique-se de concatenar o conteúdo existente lido com a nova adição.
3.  **SEMPRE** valide o tamanho e a estrutura do arquivo resultante antes e depois da operação (ex: via `git diff`).
4.  O objetivo é nunca remover informações existentes durante atualizações de histórico.

### 2. Preservação de Histórico e Correções Posteriores
1.  **NUNCA** substituir ou apagar um registro histórico apenas porque um diagnóstico posterior mostrou que ele estava incompleto ou incorreto.
2.  Manter o texto anterior e adicionar uma seção como `Correção posterior`, `Adendo` ou `Revisão adicional`, com data e explicação.
3.  Quando houver contribuição humana decisiva, registrar explicitamente a autoria do diagnóstico sem reescrever o histórico anterior.
4.  Atualizações de cabeçalho ou status devem preservar datas e estados anteriores como histórico, adicionando a revisão atual separadamente.
5.  Quando uma informação histórica não for mais válida, adicionar ao lado ou imediatamente abaixo uma referência explícita no formato:
    - `Esta informação foi alterada; veja o item X.Y para a informação atual.`
6.  A referência deve apontar para um título ou item numerado estável no mesmo arquivo ou para o caminho completo do arquivo que contém a informação atual.
7.  Não usar referências vagas como `veja acima`, `veja depois` ou `consulte a versão nova`.
8.  Se o documento ainda não tiver numeração adequada, criar um identificador claro no novo adendo sem renumerar ou apagar os itens históricos existentes.

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
│  └─► Esperar confirmação explícita ("SIM" ou "OK")               │
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
│  └─► Verificar se testes estão instalados (npm test, pytest)      │
│  └─► LISTAR TESTES MANUALS QUE O HUMANO DEVE FAZER              │
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
│    └─► Novos arquivos criados                                     │
│    └─► Testes listados para humano                               │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  11. REFINAR                                                      │
│    └─► Polir código (naming, estilo)                              │
│    └─► Melhorar performance se necessário                         │
│    └─► Adicionar comentários se for                               │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  12. FEEDBACK PARA MEMORY                                         │
│    └─► Salvar aprendizados no memory-bank                         │
│    └─► Documentar decisões no QWEN.md                            │
│    └─► Atualizar progress.md                                      │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  13. ATUALIZAR DOCUMENTAÇÃO NO WORKFLOW                          │
│    └─► Revisar EXECUTION_WORKFLOW.md                              │
│    └─► Adicionar novo exemplo de implementação                    │
│    └─► Atualizar checklist se necessário                          │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  14. ATUALIZAR INDEX PRINCIPAL                                   │
│    └─► Atualizar MEMORY.md com novas métricas                     │
│    └─► Atualizar progress.md                                      │
│    └─► Atualizar README.md                                        │
└──────────────────────────────────────────────────────────────────┘
```

---

## ⭐ Passo 8 - TESTES PRINCIPAIS (CRÍTICO!)

### O que fazer:

1. **Verificar Testes Automáticos:**
   - `npm test` ou `pytest` para backend
   - `npm run test` ou Playwright para frontend

2. **Listar Testes Manuais para Humano:**
   - Criar lista clara e concisa
   - Incluir URLs, inputs, expectativas
   - Incluir comandos para rodar testes automatizados

3. **PARAR e AGUARDA VALIDAÇÃO:**
   - NÃO continuar até humano validar
   - NÃO rodar testes automatizados automaticamente
   - ESPERAR comando do humano

4. **Formato da Lista de Testes:**
   ```
   ## Testes Manuais para Validar

   ### Teste 1: [Nome do Teste]
   
   **URL:** http://localhost:8456/[endpoint]
   
   **Steps:**
   1. [Ação 1]
   2. [Ação 2]
   3. [Ação 3]
   
   **Expectativa:** [O que deve aparecer]
   
   **Command:** `npm test` ou `pytest` (opcional)

   ### Teste 2: ...
   ```

---

## 📋 Checklist de Testes para Listar ao Humano

### Para Backend Tests:

```markdown
## Testes para Validar no Backend

### 1. Testar API Health Check
**URL:** http://localhost:8456/api/health
**Expectativa:** Retorna {"status": "ok"}

### 2. Testar API Narrate Video URL
**URL:** http://localhost:8456/api/narrate/video-url
**Method:** POST
**Body:**
```json
{
  "url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
  "voice": "en-US-AriaNeural"
}
```
**Expectativa:** Retorna task com status "pending"

### 3. Testar API List Tasks
**URL:** http://localhost:8456/api/tasks
**Method:** GET
**Expectativa:** Retorna lista de tasks

### 4. Testar API Get Task
**URL:** http://localhost:8456/api/tasks/{task_id}
**Method:** GET
**Expectativa:** Retorna task específica

### 5. Testar API Delete Task
**URL:** http://localhost:8456/api/tasks/{task_id}
**Method:** DELETE
**Expectativa:** Retorna {"status": "deleted"}

### Comandos para Rodar Testes:
```bash
# Backend tests
pytest backend/tests/

# Verificar se testes estão passando
pytest --cov=backend/
```

**Validar:** ✓ Comportamento e retorno corretos?
```

### Para Frontend Tests:

```markdown
## Testes para Validar no Frontend

### 1. Testar HeroSection Component
**URL:** http://localhost:5173/
**Steps:**
1. Navegar para página inicial (/)
2. Verificar se input de URL aparece
3. Verificar se voice selector aparece
4. Clicar em "Download & Transcribe"
5. Verificar loading spinner
6. Verificar success message após conclusão

**Expectativa:** Componente funcional com loading states

### 2. Testar Upload Dropzone
**URL:** http://localhost:5173/
**Steps:**
1. Navegar para página inicial
2. Arrastar arquivo para dropzone
3. Verificar upload progress
4. Verificar sucesso

**Expectativa:** Upload funcionando corretamente

### 3. Testar Voice Selector
**URL:** http://localhost:5173/
**Steps:**
1. Navegar para página inicial
2. Clicar em dropdown de voz
3. Selecionar voz diferente
4. Verificar seleção aplicada

**Expectativa:** Voice selector funcionando

### Comandos para Rodar Testes:
```bash
# Se Playwright instalado
npm run test:e2e

# Ou verificar build
npm run build
```

**Validar:** ✓ Interface renderizando corretamente?
```

---

## 🎯 Regras de Ouro
- Não alterar o workflow só porque a implementação mudou; atualizar a documentação mantendo a intenção das regras
- Se a codebase divergir da documentação, registrar a divergência e corrigir os fatos documentados
- Não usar métricas fixas de prontidão, cobertura ou quantidade de placeholders sem revalidar na codebase atual
- `MEMORY.md` continua sendo o ponto de entrada principal
- `WORKFLOW_RULES.md` define as regras; `EXECUTION_WORKFLOW.md` detalha a execução

### ✅ O QUE DEVO FAZER:

1. **Sempre listar testes principais após implementação**
   - URLs, inputs, expectativas claras
   - Comandos para rodar testes automatizados
   - PARAR e aguardar validação

2. **Validar com humano antes de continuar**
   - Não assumir que testes passaram
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

### Skill Relacionada

- `voice-rmv-workflow`
  - skill local que aplica estas regras de forma consistente no workspace

---

## 📊 Exemplo de Implementação com Workflow Atualizado

### Tarefa: Implementar HeroSection com Download YouTube

**Passos 1-7:** Seguir workflow normal
- Entender input
- Analisar código
- Ver viabilidade
- Consultar memory
- Montar plano
- Plano aprovado
- Executar tarefa

**Passo 8 - TESTES PRINCIPAIS (LISTAR PARA HUMANO):**

```markdown
## ✅ Implementação Completa!

### Arquivos Modificados:
- `frontend/src/components/HeroSection.tsx`
- `frontend/src/pages/DashboardPage.tsx`

### Testes Principais para Validar:

### Teste 1: HeroSection - URL Input
**URL:** http://localhost:5173/
**Steps:**
1. Abrir navegador e navegar para http://localhost:5173/
2. Verificar se HeroSection aparece no topo da página
3. Verificar input de URL com placeholder "Paste YouTube URL here..."
4. Verificar voice selector dropdown
5. Verificar botão "Download & Transcribe"

**Expectativa:** Componente renderizando corretamente

### Teste 2: HeroSection - Submit Functionality
**URL:** http://localhost:5173/
**Steps:**
1. Colar URL do YouTube no input (ex: https://youtube.com/watch?v=dQw4w9WgXcQ)
2. Selecionar voz no dropdown
3. Clicar em "Download & Transcribe"
4. Verificar loading spinner aparecendo
5. Aguardar processamento
6. Verificar success message

**Expectativa:** Loading spinner aparece, depois success message

### Teste 3: HeroSection - Error Handling
**URL:** http://localhost:5173/
**Steps:**
1. Tentar submit com URL vazia
2. Verificar error message

**Expectativa:** Error message "Please enter a YouTube URL"

### Comandos para Rodar Testes Automatizados (Opcional):
```bash
# Verificar se build funciona
npm run build

# Se Playwright instalado
npm run test:e2e
```

### Validar:
- [ ] Teste 1 passou?
- [ ] Teste 2 passou?
- [ ] Teste 3 passou?
- [ ] Todos os testes passaram?

**Responda com:** "Testes validados!" ou "Preciso corrigir algo"

**Após validação:** Vou continuar com o Passo 9 (Resumir)
```

---

## 🔄 Fluxo de Validação

```
┌─────────────────────────────────────────────┐
│  Passo 7: EXECUTAR TAREFA                    │
│  └─► Implementação completa                  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Passo 8: TESTES PRINCIPAIS (LISTAR) ⭐      │
│  └─► Listar testes para humano               │
│  └─► PARAR e aguardar validação              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  HUMANO VALIDA TESTES                       │
│  └─► "Testes validados!" ou feedback         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Passo 9: RESUMIR EXPLICANDO COM DETALHES   │
│  └─► Explicar implementação                  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Passo 10: CONCLUIR                          │
│  └─► Confirmar entrega                       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Passo 11: REFINAR                          │
│  └─► Polir código                           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Passo 12: FEEDBACK PARA MEMORY              │
│  └─► Salvar aprendizados                    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Passo 13: ATUALIZAR DOCUMENTAÇÃO           │
│  └─► Execução.Workflow                      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Passo 14: ATUALIZAR INDEX PRINCIPAL        │
│  └─► MEMORY.md, progress.md, README.md      │
└─────────────────────────────────────────────┘
```

---

## 💡 Por Que Este Passo é Crítico

### Benefícios da Validação Humana:

1. **Garante Qualidade:**
   - Humano valida manualmente
   - Pega edge cases que automation não pega
   - Feedback imediato sobre UX

2. **Economiza Tempo:**
   - Evita iterações desnecessárias
   - Corrige problemas antes de prosseguir
   - Menos retrabalho

3. **Mantém Foco:**
   - Não assume que funciona
   - Validação explícita requerida
   - Qualidade como prioridade

4. **Aprendizado Contínuo:**
   - Feedback humano melhora código
   - Learnings documentados no memory
   - Processo evolui com tempo

---

## 📋 Template de Lista de Testes

```markdown
## ✅ Implementação Completa!

### Arquivos Modificados:
- [arquivo1.ext](file://path/to/file)
- [arquivo2.ext](file://path/to/file)

### Testes Principais para Validar:

### Teste 1: [Nome do Teste]

**URL:** http://localhost:8456/[endpoint]

**Steps:**
1. [Ação 1]
2. [Ação 2]
3. [Ação 3]

**Expectativa:** [O que deve aparecer]

**Command:** `npm test` ou `pytest` (opcional)

### Teste 2: [Nome do Teste]

**URL:** http://localhost:8456/[endpoint]

**Steps:**
1. [Ação 1]
2. [Ação 2]

**Expectativa:** [O que deve aparecer]

### Comandos para Rodar Testes Automatizados:
```bash
npm run test
```

### Validar:
- [ ] Teste 1 passou?
- [ ] Teste 2 passou?
- [ ] Todos os testes passaram?

**Responda com:** "Testes validados!" ou "Preciso corrigir algo"
```

---

*Workflow Oficial de Execução — Voice-RMV*  
*Última atualização: 2026-06-10*  
*Status: Validado e em Uso*  
*Passo 8: TESTES PRINCIPAIS (CRÍTICO!)*

---

## 🧩 Regra: Formato Obrigatório do Plano (Passos 5-6)

Antes de qualquer execução, o plano apresentado ao usuário DEVE conter obrigatoriamente todos os itens abaixo. Planos incompletos serão rejeitados.

### Estrutura Obrigatória

| Seção | O que conter | Exemplo |
|-------|-------------|---------|
| **O que deve ser feito** | Explicação clara do problema e da solução proposta, em linguagem de usuário (não técnica) | "O total de tasks retornado pela API está errado — mostra o número da página atual em vez do total no banco." |
| **Arquivos utilizados** | Lista exata de arquivos que serão modificados/criados, com caminho completo, linha afetada e justificativa de por que cada um precisa ser alterado | `backend/app/routers/history.py:29` — contém a query que calcula `total` |
| **Técnica** | Abordagem específica de implementação com justificativa técnica | `select(func.count(Task.id))` do SQLAlchemy para count separado, porque é padrão do ORM e não adiciona latência significativa |
| **Mini draft** | Esboço das partes importantes do código NOVO, SEM alterar o arquivo ainda. Apenas para mostrar a direção. | `total = (await db.execute(select(func.count(Task.id)))).scalar()` |
| **Riscos** | Tabela com riscos, impacto e mitigação | Query extra por request → impacto insignificante porque `count(*)` é O(1) no PostgreSQL |
| **Viabilidade** | Alta/Média/Baixa com justificativa | Alta — mudança localizada de 3 linhas, nenhuma dependência externa |
| **Fallback** | O que fazer se a abordagem principal falhar | Usar `len(await db.execute(select(Task.id)).scalars().all())` |

### O que NÃO pode faltar

1. **Explicação clara** — o usuário precisa entender o problema e a solução sem ler código
2. **Por que cada arquivo** — justificar individualmente, não apenas listar
3. **Draft sem alterar** — mostrar o código futuro sem editar arquivos reais
4. **Riscos reais** — não inventar riscos genéricos; pensar no que pode realmente quebrar
5. **Fallback real** — se a abordagem A falhar, qual é a abordagem B?

### Exemplo de plano aprovado (L1)

```
### L1 — `total` do backend: corrigir paginação

**O que deve ser feito:**
O endpoint GET /api/tasks retorna total: len(tasks), que é o número de tasks na
página atual (ex: 50). O correto é retornar o total de registros no banco.

**Arquivos utilizados:**
- backend/app/routers/history.py:29 — contém a função list_tasks que monta a resposta
- backend/tests/test_narrate_api.py — teste existente que verifica o retorno

**Técnica:**
select(func.count(Task.id)) do SQLAlchemy para fazer uma segunda query que conta
o total de linhas no banco, independente do offset/limit.

**Mini draft:**
total = (await db.execute(select(func.count(Task.id)))).scalar()

**Riscos:**
| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Query extra | Mínimo | count(*) é O(1) no PostgreSQL |

**Viabilidade:** Alta — mudança localizada de 3 linhas

**Fallback:**
len(await db.execute(select(Task.id)).scalars().all()) se func.count falhar
```

---

---

## 📌 Anexo: VoiceOverPage — Workflow de Correção Dirigida

Quando o módulo alvo for **VoiceOverPage**, aplicar estas adaptações ao workflow padrão:

### 1. Fonte de Verdade

Consultar obrigatoriamente antes de qualquer ação:

| Fonte | Conteúdo |
|-------|----------|
| `.qwen/memory-bank/voiceoverpage_analise.md` | Checklist mestre dos 24 achados |
| `.qwen/memory-bank/` (progress.md, DESIGNER_RULES.md, techContext.md) | Soluções similares já aplicadas, regras de design |
| Código atual | Estado real de cada arquivo antes de alterar |

### 2. Ciclo Item a Item

```
Usuário indica item → Modelo consulta análise.md → Pesquisa memory/código
→ Apresenta plano completo (problema, viabilidade, riscos, alternativas, arquivos)
→ Usuário aprova → Executa → Lista testes para humano
→ Humano testa:
    ├── Passou → Documenta em voiceoverpage_analise.md + progress.md + memory
    └── Falhou → Volta ao início do ciclo
```

### 3. Plano Completo (Formato Obrigatório)

Cada item deve conter no plano antes da execução:

- **Problema:** arquivo + linha + descrição
- **Viabilidade:** complexidade (Baixa/Média/Alta)
- **Riscos:** o que pode quebrar
- **Alternativas:** se houver mais de uma abordagem
- **Arquivos a modificar:** lista exata
- **Testes:** comandos + cenários manuais

### 4. Documentação ao Final (Sempre)

Após cada item aprovado e validado:

1. Atualizar `voiceoverpage_analise.md` — marcar item como `✅` e adicionar draft do que foi feito (sem apagar o checklist original)
2. Atualizar `progress.md` — entrada do dia com o item
3. Atualizar `MEMORY.md` — quick facts se necessário

### 5. Regra de Ouro

**NUNCA** apagar itens do checklist original em `voiceoverpage_analise.md`. Itens resolvidos recebem `✅` + draft abaixo. Itens não resolvidos permanecem intactos.

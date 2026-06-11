# Voice-RMV - Workflow Principal

Este e o ponto de entrada obrigatorio para qualquer tarefa no projeto.

## Documentos Oficiais

| Prioridade | Arquivo | Responsabilidade |
|---|---|---|
| 1 | `workflow_rules.md` | Regras normativas e gates obrigatorios |
| 2 | `Workflow.md` | Sequencia operacional e indice de consulta |
| 3 | `designer_rules.md` | Regras visuais para tarefas de interface |
| 4 | `progress.md` | Estado atual e registro do trabalho validado |

Em caso de divergencia, o documento de maior prioridade prevalece.

## Ordem Obrigatoria de Leitura

1. Ler `Workflow.md`.
2. Ler `workflow_rules.md`.
3. Ler `progress.md`.
4. Ler `designer_rules.md` quando a tarefa tocar frontend ou UX.
5. Consultar somente as referencias tecnicas relacionadas ao escopo.
6. Ler continuacoes apenas quando o indice do arquivo principal indicar necessidade.

## Workflow de 14 Passos

### Fase 1 - Analise e planejamento

1. Entender o pedido e o objetivo.
2. Inspecionar codigo, estrutura e mudancas locais.
3. Avaliar viabilidade, dependencias e riscos.
4. Consultar os documentos oficiais e referencias tecnicas.
5. Preparar o plano no formato obrigatorio de `workflow_rules.md`.
6. Apresentar o plano e aguardar `SIM` ou `OK`.

### Fase 2 - Execucao

7. Executar somente o escopo aprovado e comunicar marcos relevantes.

### Fase 3 - Validacao humana

8. Listar testes manuais e comandos de validacao. Nao executar testes
   automatizados sem pedido expresso. Parar e aguardar o resultado humano.

### Fase 4 - Encerramento

9. Resumir a implementacao e as decisoes.
10. Confirmar arquivos e escopo entregues.
11. Refinar somente o codigo pertencente ao escopo aprovado.
12. Registrar o resultado validado em `progress.md`.
13. Atualizar `Workflow.md` ou `workflow_rules.md` apenas se o processo mudou.
14. Revisar indices, continuacoes e referencias afetadas.

## Gate Antes de Editar

Nenhum arquivo pode ser alterado antes de:

- concluir os passos 1 a 4;
- apresentar todos os campos obrigatorios do plano;
- receber aprovacao explicita com `SIM` ou `OK`.

Uma aprovacao dada antes de um plano completo nao libera execucao.

## Gate Depois de Implementar

Depois da implementacao:

1. listar cenarios manuais, URLs, entradas e resultados esperados;
2. listar comandos automatizados sem executa-los;
3. parar;
4. aguardar o usuario informar os resultados;
5. somente depois executar os passos 9 a 14.

## Referencias Tecnicas

| Tema | Arquivo |
|---|---|
| Stack e dependencias | `techContext.md` |
| Arquitetura e padroes | `systemPatterns.md` |
| Contexto de produto | `productContext.md`, `projectbrief.md` |
| Backend | `REPORTO_BACKEND_ANALISE_INDEX.md` |
| Frontend | `FRONTEND_ANALYSIS_INDEX.md` |
| Analise da Library | `library_analise.md` |
| Analise da VoiceOverPage | `voiceoverpage_analise.md` |

Esses arquivos sao referencias auxiliares. Eles nao substituem os quatro
documentos oficiais e devem ser conferidos contra a codebase atual.

## Continuacoes

| Arquivo | Conteudo |
|---|---|
| `Workflow_01.md` | Workflow anterior, exemplos e learnings ate 2026-06-10 |

## Regra de Rotacao

Quando este arquivo se aproximar de 400 linhas:

1. mover secoes historicas completas para `Workflow_NN.md`;
2. nao dividir uma secao no meio;
3. manter aqui apenas o processo vigente e o indice;
4. atualizar esta tabela;
5. validar links e referencias com busca textual.


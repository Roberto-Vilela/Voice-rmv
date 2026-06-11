# Voice-RMV - Regras Oficiais do Workflow

Este arquivo e normativo. Suas regras nao podem ser ignoradas por pedido
informal, pressa ou pela aparente simplicidade da tarefa.

## 1. Precedencia

1. `workflow_rules.md`
2. `Workflow.md`
3. `designer_rules.md`
4. `progress.md`

Documentos de continuacao preservam historico, mas nao sobrepoem estas regras.

## 2. Plano Obrigatorio

Antes de solicitar aprovacao, o plano deve conter:

1. **O que deve ser feito** - problema e solucao em linguagem clara.
2. **Arquivos utilizados** - caminho, linha ou secao e justificativa individual.
3. **Tecnica** - abordagem concreta e motivo da escolha.
4. **Mini draft** - esboco do codigo ou estrutura futura, sem editar arquivos.
5. **Riscos** - risco real, impacto e mitigacao.
6. **Viabilidade** - Alta, Media ou Baixa, com justificativa.
7. **Fallback** - abordagem alternativa real.
8. **Validacao prevista** - cenarios manuais e comandos que serao entregues.

### Checklist de bloqueio

- [ ] Todos os oito campos estao presentes?
- [ ] Cada arquivo foi justificado?
- [ ] O mini draft nao alterou arquivos reais?
- [ ] Os riscos possuem impacto e mitigacao?
- [ ] Existe fallback executavel?

Se qualquer resposta for negativa:

- o plano e invalido;
- nao solicitar aprovacao;
- nao editar arquivos;
- completar o plano primeiro.

## 3. Aprovacao

- Somente `SIM` ou `OK`, enviados depois do plano completo, liberam execucao.
- Feedback, pergunta ou pedido de ajuste nao contam como aprovacao.
- Se o plano mudar materialmente, apresentar a versao revisada e aguardar nova
  aprovacao.
- Pedido de "corrigir direto" nao elimina o gate.

## 4. Execucao

- Alterar somente o escopo aprovado.
- Ler o arquivo atual antes de editar.
- Preservar mudancas locais do usuario.
- Nao executar refatoracoes paralelas sem novo plano.
- Comunicar mudancas de abordagem, bloqueios e marcos relevantes.

## 5. Testes e Validacao Humana

- Nao executar testes automatizados automaticamente.
- Testes automatizados so podem ser executados quando o usuario pedir.
- Depois de implementar, listar:
  - URL ou ponto de entrada;
  - passos;
  - entradas;
  - resultado esperado;
  - comandos automatizados disponiveis.
- Parar no passo 8 e aguardar validacao humana.
- Nao declarar a tarefa concluida antes dessa validacao.

## 6. Documentacao

- `progress.md` e o registro principal do que foi feito e validado.
- Registrar fatos validados, arquivos alterados, decisoes e pendencias.
- Nao congelar metricas volateis sem data e evidencia.
- Atualizar workflow somente quando houver mudanca real de processo.
- Atualizar designer rules somente quando houver decisao visual validada.

## 7. Preservacao de Historico

- Nunca apagar ou reescrever silenciosamente registros historicos.
- Correcoes posteriores devem ser adicionadas como adendo com data.
- Referencias historicas incorretas devem apontar para a informacao atual.
- Antes de editar documento sensivel, le-lo integralmente.
- Depois da edicao, revisar diff, tamanho e estrutura.

## 8. Continuacoes e Rotacao

Arquivos extensos podem ser divididos em `nome_01.md`, `nome_02.md` e assim por
diante.

Regras:

1. O arquivo principal e sempre o indice e a fonte vigente.
2. Nao dividir uma entrada ou regra no meio.
3. Nao duplicar uma entrada entre arquivos.
4. Preservar texto historico integralmente.
5. Informar periodo ou conteudo de cada continuacao.
6. Criar nova continuacao perto de 400 linhas.
7. Atualizar referencias ao concluir a rotacao.

## 9. Seguranca de Manutencao

- Nao truncar documentos ao atualiza-los.
- Nao remover arquivos antigos antes de confirmar que o conteudo foi preservado
  ou arquivado.
- Nao usar referencias vagas como "veja acima".
- Usar titulo ou caminho estavel para toda referencia.

## Continuacoes

| Arquivo | Conteudo |
|---|---|
| `workflow_rules_01.md` | Regras anteriores, templates e anexos ate 2026-06-10 |


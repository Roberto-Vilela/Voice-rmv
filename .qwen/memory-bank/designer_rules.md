# Voice-RMV - Regras Visuais

Este arquivo define as decisoes visuais vigentes. A codebase atual e a fonte de
verdade para tokens ja implementados.

## Identidade

- Precisao
- Velocidade
- Minimalismo moderno
- Feedback claro para operacoes assincronas

## Stack Visual

- React 19
- TypeScript strict
- Vite
- Tailwind CSS 4 com `@tailwindcss/vite`
- Material Symbols para os icones atuais

## Tokens Vigentes

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#3525cd` | Marca, acoes principais e estado ativo |
| `secondary` | `#00687a` | Acoes secundarias e audio |
| `tertiary` | `#571ac0` | Acentos adicionais |
| `surface` | `#f8f9ff` | Fundo principal |
| `on-primary` | `#ffffff` | Texto sobre primary |
| `outline` | `#777587` | Bordas e divisores |

Nao introduzir uma segunda paleta sem plano e validacao visual.

## Componentes

### Botoes

Base recomendada:

```text
h-11 px-6 rounded-lg font-semibold transition-all active:scale-95
```

- Mostrar estado desabilitado durante operacoes.
- A acao principal usa `primary`.
- Nao depender apenas de cor para comunicar estado.

### Cards

- Usar `rounded-xl`.
- Usar borda sutil e sombra baixa.
- Evitar movimento de hover em areas de leitura ou players.

### Inputs

- Fundo claro ou token de surface.
- Borda visivel.
- Foco com `primary` e ring de baixa opacidade.
- Label explicita quando o contexto nao for obvio.

### Feedback

- Loading deve preservar a estrutura com skeleton quando possivel.
- Erros devem ser claros, acionaveis e fechaveis.
- Processos longos devem mostrar status ou progresso.

## Layout

- Mobile: navegacao inferior.
- Desktop: sidebar e top bar.
- Evitar cabecalhos duplicados dentro de paginas.
- Validar overflow em mobile e desktop.

## Acessibilidade

- Botoes de icone precisam de `title` ou nome acessivel.
- Estados de foco devem permanecer visiveis.
- Contraste deve ser verificado em textos, waveform e estados inativos.
- Nao usar texto como imagem.

## Regras de Implementacao

- Reutilizar tokens e classes existentes antes de criar variacoes.
- Preferir classes compartilhadas para padroes repetidos.
- Evitar estilos inline quando existe equivalente no sistema.
- Nao registrar contagens de componentes ou placeholders neste arquivo.
- Mudancas visuais novas exigem validacao humana.

## Fontes de Consulta

- `frontend/src/index.css`
- componentes existentes em `frontend/src/components/`
- paginas existentes em `frontend/src/pages/`
- `.qwen/FRONTEND_ANALYSIS.md`

## Continuacoes

| Arquivo | Conteudo |
|---|---|
| `designer_rules_01.md` | Especificacao visual anterior ate 2026-06-10 |

## Regra de Rotacao

Ao se aproximar de 400 linhas, mover decisoes historicas completas para
`designer_rules_NN.md`, mantendo neste arquivo somente as regras vigentes.


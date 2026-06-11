---
name: designer_rules
description: Design System e regras de design do projeto Voice-RMV
type: reference
---

# Arquivo Historico

Esta continuacao preserva a especificacao visual anterior ate 2026-06-10. Para
regras vigentes, consultar `designer_rules.md`.

# Voice-RMV — Design System & Technical Specification

Regras de design e especificações técnicas do projeto.

---

## 1. Brand Identity

Voice RMV é uma plataforma tech-forward para transcrição e síntese de voz de alta fidelidade. A identidade visual reflete:
- **Precisão** (Precision)
- **Velocidade** (Speed)
- **Minimalismo Moderno** (Modern Minimalism)

---

## 2. Technical Stack

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Framework** | React 19+ | Functional Components, Hooks |
| **Language** | TypeScript | Strict Mode |
| **Build Tool** | Vite | Lightning-fast HMR |
| **CSS** | Tailwind CSS | Utility-first, Responsive |
| **State Management** | TanStack Query v5 | Server State, Caching, Sync |
| **Icons** | Lucide React / Google Material Symbols | UI Icons |

---

## 3. Visual Foundation

### Color Palette

O sistema usa uma paleta Electric Indigo com alto contraste.

| Token | Hex | Usage |
| :--- | :--- | :--- |
| **Primary** | `#4f46e5` | Main Buttons, Active States, Brand Highlights |
| **Secondary** | `#06b6d4` | Action Accents (Download, Transcribe) |
| **Surface** | `#f8f9ff` | Background (Light Mode) |
| **Container** | `#eef4ff` | Cards, Input Fields |
| **Success** | `#22c55e` | Completed Status |
| **Processing** | `#8b5cf6` | Active Generation |
| **Outline** | `#d1dbec` | Borders and Dividers |

> **Nota:** O projeto atual usa `#3525cd` como primary (Material Design palette). Verificar qual paleta aplicar.

### Typography (Inter)

| Style | Class |
| :--- | :--- |
| **Display** | `text-3xl font-bold tracking-tight` |
| **Headline** | `text-xl font-semibold` |
| **Body** | `text-base font-normal text-slate-700` |
| **Label** | `text-sm font-medium uppercase tracking-wider` |

### Elevation & Shapes

| Property | Value | Usage |
| :--- | :--- | :--- |
| **Radius** | `rounded-xl` (12px) | Cards, buttons, inputs, containers |
| **Shadow-sm** | Standard elevation | Components |
| **Shadow-lg** | Overlays/modals | Full-screen overlays |

> **Nota:** O DESIGNER_RULES anterior listava `rounded-lg` (8px). A codebase atual padronizou `rounded-xl` (12px) em todos os componentes. Mantido o padrão real do projeto.

---

## 4. UI Patterns

### Navigation Strategy

| Device | Navigation | Items |
| :--- | :--- | :--- |
| **Mobile** | Bottom navigation bar | Dashboard, Editor, Voice-over, Library |
| **Desktop** | Fixed sidebar (left) | Dashboard, Editor, Voice-over, Library + User profile |
| **Global** | Header | Logo (left) + Notifications/Settings (right) |

### Component Guidelines

| Component | Classes |
| :--- | :--- |
| **Buttons** | `h-11 px-6 rounded-lg font-semibold transition-all active:scale-95` |
| **Cards** | White or `surface-container` background with subtle borders |
| **Inputs** | `bg-white border-outline focus:border-primary focus:ring-2 focus:ring-primary/20` |

### AI Features Visuals

- **Waveforms**: Indigo/Cyan gradient patterns para representar áudio
- **Generation States**: Pulse animations ou subtis gradients para indicar processos de IA ativos

---

## 5. Development Patterns (Clean Code)

### Component Structure

```
/components/
├── ui/              # Atomic UI components
├── layout/          # Layout components
└── features/        # Feature-specific components
```

### Query Hooks

Custom hooks para TanStack Query:
- `useTranscriptions`
- `useVoiceModels`
- `useTasks`
- `useVoices`

### Styles

Use Tailwind's `@layer components` para padrões repetidos e manter JSX limpo.

---

## 6. Current Implementation Status

### Tailwind Config (Atual)

O projeto atual usa:

| Token | Value | Usage |
| :--- | :--- | :--- |
| **primary** | `#3525cd` | Brand color |
| **secondary** | `#00687a` | Accent |
| **tertiary** | `#571ac0` | Additional accent |
| **surface** | `#f8f9ff` | Background |
| **on-primary** | `#ffffff` | Text on primary |
| **outline** | `#777587` | Borders |

**Nota:** Verificar se deve migrar para a paleta `#4f46e5` (Electric Indigo) ou manter a paleta atual.

---

## 7. Known Issues

### Critical
- **Placeholder Components:** 7 componentes ainda são placeholders
- **Type Safety:** Múltiplos usos de `any`
- **Error Boundaries:** Nenhum error boundary implementado

### Medium
- **Prompt para Rename:** Usa `prompt()` nativo
- **HeroSection Input:** YouTube input desconectado
- **Inline Styles:** Vários `style={{...}}` attributes

---

## 8. Quick Reference

### Para Consultar Design
1. **Regras de Design:** Este arquivo (`DESIGNER_RULES.md`)
2. **Análise Frontend:** `/mnt/projetos/voice-rmv/.qwen/FRONTEND_ANALYSIS.md`
3. **Análise Backend:** `/mnt/projetos/voice-rmv/.qwen/REPORTO_BACKEND_ANALISE.md`
4. **Progresso:** `/mnt/projetos/voice-rmv/.qwen/memory-bank/progress.md`

### Para Implementar Componentes
- Use as classes do Tailwind configuradas em `tailwind.config.js`
- Siga os padrões de elevação e formas especificados
- Use a paleta de cores atual ou migre para Electric Indigo

### Para UI Patterns
- **Mobile:** Bottom nav com 4 itens
- **Desktop:** Sidebar fixa + Header
- **Cards:** `rounded-lg` + border sutil
- **Buttons:** `h-11 px-6 rounded-lg font-semibold`

---

*Design System — Voice-RMV*
*Última atualização: 2026-06-05*

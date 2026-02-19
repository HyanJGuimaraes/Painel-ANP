# AI Assistant Guidelines for This Project

Este documento define como um assistente de IA deve trabalhar neste projeto: qual é o stack, quais bibliotecas usar e quais decisões de arquitetura seguir.

## Stack Tecnológico (visão geral)

Use estas informações sempre que for criar ou alterar código.

- **Linguagem & Runtime**: TypeScript + JavaScript moderno, executando em ambiente React SPA.
- **Framework de UI**: **React** com **React Router** para roteamento de páginas.
- **Organização de código**:
  - Código-fonte dentro de `src/`
  - Páginas em `src/pages/`
  - Componentes reutilizáveis em `src/components/`
  - Rota principal configurada em `src/App.tsx`
- **Página inicial**: o ponto de entrada visual é `src/pages/Index.tsx`. Qualquer novo componente que o usuário precise visualizar deve ser importado e utilizado nesta página (ou em uma rota claramente acessível).
- **UI Library principal**: **shadcn/ui** (baseado em Radix UI) como biblioteca padrão de componentes.
- **Estilização**: **Tailwind CSS** para layout, espaçamento, cores e tipografia; evitar CSS manual disperso, preferindo classes utilitárias.
- **Ícones**: **lucide-react** como biblioteca padrão de ícones.
- **Roteamento**: manter e atualizar as rotas em `src/App.tsx`. Não criar sistemas paralelos de roteamento.

## Regras Gerais de Arquitetura

1. **Simplicidade em primeiro lugar**
   - Evite sobreengenharia: implemente apenas o que o usuário pediu, da forma mais simples possível.
   - Prefira componentes pequenos e focados em vez de componentes enormes com muitas responsabilidades.

2. **Organização de arquivos**
   - Novas páginas vão para `src/pages/`.
   - Novos componentes reutilizáveis vão para `src/components/`.
   - Não mova grandes blocos da estrutura existente sem necessidade explícita do usuário.

3. **TypeScript**
   - Sempre usar extensões `.tsx` para componentes React.
   - Tipar props de componentes e dados principais; não exagere em tipos complexos se não forem necessários.

4. **Roteamento**
   - Toda nova página deve ser registrada em `src/App.tsx` usando React Router.
   - Garanta que a página inicial (`/`) aponte para `src/pages/Index.tsx`.

5. **Visibilidade das mudanças**
   - Quando criar novos componentes importantes para o usuário, garanta que eles sejam utilizados em alguma página acessível (normalmente `Index.tsx`), para que apareçam na pré-visualização.

## Regras de Uso de Bibliotecas

### shadcn/ui

**Sempre que possível, use shadcn/ui para componentes de interface.**

- Use shadcn/ui para:
  - Botões, inputs, textareas, selects, checkboxes, radios, switches.
  - Diálogos, modais, sheets, dropdowns, menus.
  - Cards, tabs, accordions, tooltips, alerts, badges, breadcrumbs, pagination.
  - Layouts simples que combinem componentes de shadcn/ui com Tailwind.
- Não edite os arquivos internos da biblioteca shadcn/ui.
  - Se precisar de variação de estilo ou comportamento, crie um novo componente em `src/components/` que **compose** os componentes da shadcn/ui.

### Tailwind CSS

**Tailwind é a forma padrão de estilização.**

- Use Tailwind para:
  - Layout (flex, grid, espaçamentos, largura, altura, alinhamentos).
  - Cores, tipografia, bordas, sombras, estados de hover/focus.
  - Responsividade (breakpoints `sm`, `md`, `lg`, etc.).
- Evite criar CSS global extra, a menos que seja realmente necessário e consistente com o projeto.

### lucide-react

- Use `lucide-react` como **única** fonte de ícones.
- Importe apenas os ícones necessários, por exemplo:
  ```tsx
  import { ArrowRight, Menu } from "lucide-react";
  ```
- Combine ícones com componentes de shadcn/ui (por exemplo, ícones dentro de botões ou cabeçalhos).

### React Router

- Use React Router para qualquer navegação entre páginas.
- Não implemente roteamento manual com `window.location` ou `<a href>` simples para rotas internas; use `<Link>` ou hooks do React Router quando disponível.

## Boas Práticas de Implementação

- **Ler antes de escrever**: antes de alterar um arquivo, verifique o conteúdo atual e se a funcionalidade já não está implementada.
- **Mudanças cirúrgicas**: altere apenas o que for relevante para o pedido do usuário.
- **Sem implementações parciais**: qualquer funcionalidade solicitada deve estar **completamente funcional** antes de considerar a tarefa concluída (sem `TODO` ou placeholders).
- **Consistência**: siga o estilo e padrões já utilizados no projeto (nomes de arquivos, organização de pastas, padrões de componentes).

## O que o Assistente de IA **não** deve fazer

- Não adicionar novas dependências externas sem necessidade muito clara.
- Não criar sistemas próprios de UI ignorando shadcn/ui e Tailwind.
- Não modificar a configuração de build, a menos que seja absolutamente necessário para cumprir o pedido do usuário.
- Não deixar códigos mortos, comentários extensos desnecessários ou console.logs permanentes.

---

Este documento deve ser seguido sempre que a IA modificar este projeto. Se o código real divergir dessas regras no futuro, atualize este arquivo para refletir os novos padrões, mantendo as seções claras e objetivas.
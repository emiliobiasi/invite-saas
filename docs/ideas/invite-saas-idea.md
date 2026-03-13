# 📋 InviteFlow — Requisitos do Projeto (MVP)

> SaaS de convites digitais para eventos. O organizador cria um evento com página personalizada
e compartilha o link. O convidado abre a página e confirma presença com um clique — sem
preencher nada, sem criar conta.
> 

---

## Visão Geral

**Problema resolvido:** Organizadores improvisam convites com arte no Canva, confirmação pelo
WhatsApp e headcount na cabeça. Não existe um lugar que centralize convite bonito + RSVP simples.

**Solução:** Uma página viva por evento. O organizador configura, compartilha o link, e os
convidados confirmam com um clique. O organizador acompanha o contador em tempo real.

**Hipótese que o MVP valida:** As pessoas usam um convite digital e confirmam presença por ele?

**Público-alvo MVP:** Festas universitárias, aniversários, eventos privados e confraternizações.

---

## Fluxo Central

```
Organizador cria conta
       ↓
  Cria o evento
       ↓
  Personaliza a página do convite
       ↓
  Publica e compartilha o link
       ↓
Convidado abre a página
       ↓
  Clica em "Vou" — sem preencher nada
       ↓
Organizador vê o contador atualizar em tempo real
```

---

## Módulos e Features

---

### 1. Autenticação (`/auth`)

### 1.1 — Cadastro de Organizador

**O QUE:** O organizador cria uma conta com nome, e-mail e senha ou login social do google

**PORQUE:** O organizador é o único que precisa de identidade persistente no sistema.
Convidados não têm conta — não têm nem cadastro.

**COMO:**

- `POST /auth/register` — recebe `{ name, email, password }`
- Senha hasheada com Bun hash
- Retorna `{ user }`
- Validações: e-mail único, senha mínima de 8 caracteres

---

### 1.2 — Login

**O QUE:** Organizador autenticado acessa rotas protegidas

**PORQUE:** Permite gerenciar eventos de forma segura entre sessões.

**COMO:**

- `POST /auth/login` — recebe `{ email, password }`
- Retorna `{ user }`

---

### 1.3 — Perfil do Organizador

**O QUE:** O organizador pode atualizar nome, e-mail e foto.

**PORQUE:** O nome pode aparecer na página pública do evento.

**COMO:**

- `GET /users/me`
- `PATCH /users/me` — atualiza `name`, `email`, `avatarUrl`

---

### 2. Eventos (`/events`)

> ⚠️ **Nota arquitetural:** Adicionar `modules/events/` — não consta na estrutura atual mas
é a entidade central do sistema.
> 

---

### 2.1 — Criar Evento

**O QUE:** O organizador cria um evento com as informações básicas.

**PORQUE:** O evento é o contexto de tudo. É ele que vira a página pública do convite.

**COMO:**

- `POST /events` (autenticado)
- Body:
    
    ```json
    {  "title": "Festa de Formatura Medicina USP",  "description": "...",  "date": "2025-12-20T22:00:00Z",  "location": "Av. Paulista, 1000 — São Paulo"}
    ```
    
- Gera `slug` único a partir do título (ex: `festa-formatura-medicina-usp`)
- Status inicial: `DRAFT`

**Schema:**

```
Event {
  id:          uuid
  userId:      uuid (FK → User)
  title:       string
  description: string?
  date:        datetime
  location:    string
  slug:        string (único)
  status:      DRAFT | ACTIVE | FINISHED
  createdAt:   datetime
  updatedAt:   datetime
}
```

---

### 2.2 — Listar e Detalhar Eventos

**O QUE:** O organizador vê todos os seus eventos e o estado de cada um.

**PORQUE:** Um organizador pode ter múltiplos eventos. Precisa navegar entre eles e ver o
headcount de cada um.

**COMO:**

- `GET /events` — lista eventos do usuário autenticado, ordenado por `date DESC`
- `GET /events/:id` — detalhes do evento + total de confirmações:
    
    ```json
    { "confirmedCount": 287 }
    ```
    

---

### 2.3 — Editar Evento e Ciclo de Vida

**O QUE:** O organizador edita os dados e controla o status do evento.

**PORQUE:** O status define o que a página pública exibe e se aceita confirmações.

**COMO:**

- `PATCH /events/:id` — atualiza campos (só se `status != FINISHED`)
- `PATCH /events/:id/status` — transições:
    - `DRAFT → ACTIVE` — publica o evento, página fica acessível
    - `ACTIVE → FINISHED` — encerra o evento, página para de aceitar confirmações

---

### 2.4 — Personalizar o Convite (Template)

**O QUE:** O organizador personaliza a aparência da página pública do evento.

**PORQUE:** A personalização visual é o diferencial do produto. A página é o convite.

**COMO:**

- `POST /events/:id/template` — upsert (um template por evento)
- Body:
    
    ```json
    {  "headline": "Você está convidado 🎉",  "message": "Vai ser incrível, não perde!",  "coverImageUrl": "https://...",  "primaryColor": "#E63946",  "secondaryColor": "#1D3557"}
    ```
    

clara: o botão "Vou".

**COMO:**

- Rota pública: `GET /events/public/:slug`
- Retorna dados do evento + template personalizado + `confirmedCount`
- `status = DRAFT` → 404
- `status = FINISHED` → retorna a página sem o botão de confirmação, com mensagem de encerramento

---

### 3.2 — Confirmação de Presença (RSVP)

**O QUE:** O convidado confirma presença com um único clique. Sem preencher nada.

**PORQUE:** Fricção zero é o objetivo. Qualquer campo a mais é uma desistência a mais.

**COMO:**

- `POST /rsvp/:slug` — rota pública, sem autenticação, sem body
- Validações:
    1. Evento existe e está `ACTIVE` → senão, rejeita
    2. Cria um registro anônimo de `Confirmation` vinculado ao evento
    3. Retorna `{ confirmedCount: 288 }` — contador atualizado

**Schema:**

```
Confirmation {
  id:          uuid
  eventId:     uuid (FK → Event)
  confirmedAt: datetime
}
```

> Sem nome, sem e-mail, sem identidade. Cada clique vira uma linha na tabela.
O organizador vê o número — não quem são as pessoas.
> 

---

### 4. Dashboard do Organizador

---

### 4.1 — Contador de Confirmações

**O QUE:** O organizador vê quantas pessoas confirmaram presença em cada evento.

**PORQUE:** É a métrica central do MVP — headcount para planejamento do evento.

**COMO:**

- Embutido em `GET /events/:id`:
    
    ```json
    { "confirmedCount": 287 }
    ```
    
- Calculado com `COUNT(*)` na tabela `Confirmation` filtrado por `eventId`

---

## Regras de Negócio

| Regra | Descrição |
| --- | --- |
| Convidado sem conta | Nenhum dado é coletado do convidado — zero fricção |
| Confirmação anônima | Cada clique em "Vou" gera um registro sem identificação pessoal |
| Evento DRAFT | Página retorna 404; RSVP não é aceito |
| Evento FINISHED | Página exibe encerramento; RSVP bloqueado |
| Ownership | Organizador só acessa dados de seus próprios eventos |

---

## Arquitetura de Dados

```
User (organizador)
 └── Event (1:N)
      ├── InviteTemplate (1:1)
      └── Confirmation (1:N) ← criada por cada clique em "Vou"
```

---

```

```

---

## O que NÃO está no MVP (backlog v2)

- Coleta de nome/e-mail do convidado
- QR Code e check-in de entrada
- Botão "Não vou"
- Controle de capacidade
- Eventos fechados com allowlist
- Envio de e-mail transacional
- Editor visual de convite
- Integração com Spotify
- Venda de ingressos
- Múltiplos organizadores

---

*MVP com uma pergunta só: as pessoas usam o convite digital e confirmam presença por ele?
Tudo que não responde essa pergunta é v2.*
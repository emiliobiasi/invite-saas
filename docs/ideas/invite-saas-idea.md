# InviteFlow — A ideia

> Pense no Apple Invites, mas aberto para todo mundo.

---

## O problema

Quem organiza um evento hoje improvisa: faz uma arte no Canva, manda no WhatsApp, pergunta um por um quem vai, e conta na cabeça. Não existe um lugar simples que junte convite bonito + confirmação de presença sem fricção.

---

## A solução

O InviteFlow é uma plataforma web onde qualquer pessoa cria uma página de convite personalizada para seu evento, publica e compartilha o link. Do outro lado, o convidado abre o link, vê todas as informações do evento e confirma presença sem precisar criar conta, fazer login ou preencher formulário nenhum.

---

## Como funciona

### Lado do organizador

1. **Cria uma conta** — email/senha ou Google
2. **Cria o evento** — coloca título, data, horário, local e descrição
3. **Personaliza a página do convite** com:
   - Uma imagem de fundo (background)
   - Título e mensagem de destaque
   - Cores personalizadas
   - Uma frase ou citação com autor (ex: "A little party never killed nobody" — The Great Gatsby)
   - Um carrossel de fotos / mini álbum do evento (até 10 fotos)
   - Links customizados (Instagram, site, o que quiser — até 10)
   - Vídeos do YouTube incorporados (playlist, teaser — até 10)
   - Upload direto de vídeos (até 3 vídeos, 50 MB cada)
   - Músicas do Spotify (tracks, álbuns ou playlists incorporados — até 5)
4. **Publica** — o convite ganha um link público
5. **Compartilha** o link por WhatsApp, Instagram, email, onde quiser
6. **Acompanha** o contador de respostas: quantos vão, quantos não vão, quantos estão em dúvida

### Lado do convidado

1. **Recebe o link** do convite
2. **Abre a página** — vê tudo: "Hosted by" com o nome do organizador, foto de capa, informações do evento, fotos, vídeos, músicas, links
3. **Responde** com um clique: **Vou** / **Não vou** / **Talvez**
4. Opcionalmente pode deixar o nome ou email — mas não é obrigado a preencher nada

Sem login. Sem cadastro. Sem atrito.

---

## O que a página do convite tem

A página pública do convite é o coração do produto. Ela é montada com as seções que o organizador configurou:

- **Imagem de fundo** — a foto principal que dá o clima do evento
- **Título do evento** — nome grande e visível
- **Data, horário e local** — informações essenciais
- **"Hosted by"** — mostra o nome e foto do organizador, com a descrição do evento logo abaixo
- **Mensagem do organizador** — um texto livre de boas-vindas ou descrição
- **Frase / Citação** — bloco estilizado com uma frase marcante e autor (ex: "A little party never killed nobody" — The Great Gatsby)
- **Carrossel de fotos** — um mini álbum com até 10 fotos. Ao clicar, expande como galeria
- **Links** — seção de links livres (Instagram, site, formulário, o que o organizador quiser — até 10)
- **Vídeos do YouTube** — vídeos incorporados, pode ser playlist, teaser, aftermovie (até 10)
- **Upload de vídeos** — vídeos enviados diretamente pelo organizador, sem depender do YouTube (até 3, max 50 MB)
- **Músicas do Spotify** — player incorporado de tracks, álbuns ou playlists do Spotify (até 5)
- **Previsão do tempo** — componente opcional que mostra a previsão do tempo para a data, horário e local do evento (dados de API em tempo real)
- **Mini mapa** — componente opcional com um pin no local do evento, mostrando ruas ao redor. Clicável para abrir no Google Maps ou Waze
- **Botões de resposta** — Going / Not Going / Maybe (inspirado no Apple Invites). O organizador pode desativar se quiser uma página só informativa
- **Contador de respostas** — mostra quantas pessoas confirmaram, quantas não vão e quantas estão em dúvida

Todos esses componentes são opcionais. O organizador escolhe o que quer mostrar no convite. Os únicos elementos obrigatórios são as informações do evento (título, data, local) e o visual base (cores, background).

---

## Ciclo de vida do evento

```
RASCUNHO → PUBLICADO → ENCERRADO
```

- **Rascunho**: o organizador está montando o convite, a página ainda não existe publicamente
- **Publicado**: o link está ativo, convidados podem ver e responder
- **Encerrado**: a página continua visível mas não aceita mais respostas

---

## Referência visual

O Apple Invites (app nativo da Apple, exclusivo do ecossistema) é a principal referência de experiência. Ele permite criar convites visuais para eventos, com:

- Imagem de capa marcante
- Informações claras (data, hora, local)
- Botões de resposta: Going / Not Going / Maybe
- Contador de quem vai com avatares dos convidados
- Clima visual rico e imersivo

A diferença é que o Apple Invites é fechado para o ecossistema Apple. O InviteFlow faz a mesma coisa, mas na web, aberto para qualquer pessoa usar.

---

## Público-alvo

- Festas de aniversário
- Formaturas
- Confraternizações
- Festas universitárias
- Eventos privados em geral
- Qualquer pessoa que quer um convite bonito sem complicação

---

## A pergunta que o MVP responde

> As pessoas usam um convite digital e confirmam presença por ele?

Tudo que não ajuda a responder essa pergunta fica para depois.

---

## O que NÃO está no MVP

- Card de "Going" com avatares dos convidados (exige identidade/login do convidado)
- QR Code e check-in de entrada
- Controle de capacidade (lotação máxima)
- Eventos fechados com lista de convidados
- Envio de email ou notificação automática
- Editor visual drag-and-drop
- Álbum compartilhado (convidados fazendo upload de fotos)
- Venda de ingressos
- Múltiplos organizadores por evento
- Templates reutilizáveis entre eventos

---

*Um link. Um clique. Confirmado.*

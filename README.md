# Aroma & Encanto

Site institucional e catálogo com montador de pedido para uma marca artesanal de
velas aromáticas, aromatizadores e sabonetes de São Caetano do Sul.

**No ar:** https://aromaeencantoscs.com.br

---

## O problema

A marca vendia por Instagram e tinha uma loja em template de marketplace, que não
comunicava o cuidado artesanal do produto e não resolvia o principal atrito da
operação: o pedido chegava no WhatsApp em pedaços, com idas e vindas para descobrir
qual peça, qual fragrância e quantas unidades.

## A solução

Catálogo de 21 peças em carrosséis por categoria, com um montador de pedido que
entrega a conversa pronta. O cliente escolhe as peças e a fragrância, preenche nome
e entrega, e o site gera uma mensagem completa e formatada no WhatsApp da marca.

Sem cadastro, sem checkout, sem pagamento online — o fechamento continua sendo a
conversa, que é como a marca vende.

## Stack

HTML, CSS e JavaScript — sem framework, sem build, sem dependências.
Hospedado em Cloudflare Workers (assets estáticos) com domínio próprio e SSL.

### Por que sem framework

O site é estático: não tem autenticação, banco de dados nem estado compartilhado
entre telas. O carrinho vive em memória e vira texto de uma URL. React resolveria
um problema que este projeto não tem, ao custo de ~130 KB de JavaScript antes do
primeiro pixel e de uma camada a mais entre o crawler e o conteúdo.

A decisão foi avaliada, não assumida.

## Implementação

**Carrossel** — `scroll-snap` nativo para toque, com arraste por mouse implementado
sobre Pointer Events: captura de ponteiro, cálculo de velocidade e inércia com
desaceleração exponencial, snap desligado durante o arraste e religado ao assentar.
Um guarda de 6px distingue arraste de clique, para não disparar "Adicionar ao
pedido" sem querer.

**Pedido** — estado em objeto simples, persistido em `localStorage` com try/catch
(o acesso falha em janela anônima). O botão de envio é uma âncora real com `href`
reescrito a cada mudança, e não `window.open` — links funcionam onde popups são
bloqueados, e o usuário pode copiar o link do pedido.

**Imagens** — as fotos originais vinham em proporções diferentes e com faixa de
preço sobreposta. Script de preparo recorta a faixa, encaixa cada foto inteira em
3:4 sem cortar conteúdo e preenche a sobra replicando e desfocando a borda.

**SEO** — JSON-LD de `Store` e `ItemList` com os 21 produtos e preços, metadados
Open Graph com URL absoluta (prévia de link no WhatsApp, que é o canal de
distribuição real da marca), sitemap e robots.

**Acessibilidade** — navegação por teclado nos carrosséis, `aria-live` nos
contadores, foco visível, e todas as animações desligadas sob
`prefers-reduced-motion`.

## Estrutura

```
index.html        marcação e dados estruturados
css/style.css     ~360 linhas, design tokens em :root
js/app.js         pedido, carrossel e revelação ao rolar
img/              26 imagens tratadas
robots.txt
sitemap.xml
```

> A versão publicada em produção tem CSS e JS embutidos no HTML, para servir a
> primeira tela em uma única requisição. Este repositório mantém os arquivos
> separados para leitura.

## Rodando localmente

Não há build. Qualquer servidor estático resolve:

```bash
python3 -m http.server 8000
```

E abrir http://localhost:8000

# Vale Imobiliária — Site estático

Site simples e moderno para uma imobiliária, com catálogo de imóveis, tema escuro por padrão, página de contato e conteúdo de dicas.

## Estrutura

- `index.html` — Página inicial (hero, sobre, blog com "Dicas e Notícias").
- `imoveis.html` — Catálogo de imóveis com filtros, favoritos, modal e mapa.
- `contato.html` — Página de contato com formulário, telefone e e-mail.
- `dicas.html` — Dicas: casa para 5 pessoas, vista bonita e preço em conta.
- `style.css` — Estilos (inclui tema escuro via `data-theme`).
- `main.js` — Interatividade (filtros, favoritos, modal, mapa e toggle de tema).
- `data/imoveis.json` — Fonte de dados dos imóveis.
- `imgs/` — Imagens usadas no site.

## Funcionalidades

- Tema escuro por padrão com alternância (botão "Tema" no menu) e persistência (`localStorage: vale:theme`).
- Catálogo de imóveis com filtros (texto, tipo, quartos, preço, bairro), ordenação, paginação e favoritos (`localStorage: vale:favs`).
- Modal de detalhes com imagem e mapa (Leaflet/OpenStreetMap quando latitude/longitude estão disponíveis).
- Página de contato com formulário (mensagem simulada), telefone, e-mail e link de WhatsApp.
- Página de dicas com orientações para buscar imóveis com bom custo-benefício.

## Como executar localmente

Por usar `fetch` para carregar `data/imoveis.json`, é recomendado servir os arquivos via um servidor local.

Opção recomendada (VS Code):
- Instale a extensão "Live Server" e clique em "Go Live" na `index.html`.

Opção por linha de comando (PowerShell, requer Python instalado):

```powershell
# na pasta do projeto
python -m http.server 5500
# Abra: http://localhost:5500/index.html
```

## Personalização rápida

- Telefone/E-mail: edite em `contato.html` (links `tel:` e `mailto:`) e, se desejar, o número do WhatsApp (links `wa.me`).
- Tema: o site inicia com `data-theme="dark"`. Use o botão "Tema" no menu para alternar; a preferência fica salva.
- Logo/Imagens: substitua arquivos em `imgs/` preservando os nomes, ou atualize os caminhos nas páginas.
- Título/SEO: ajuste `<title>` e `<meta name="description">` em cada página.

## Dados de imóveis

Arquivo: `data/imoveis.json` (lista de objetos). Campos usados:

```json
[
	{
		"id": 1,
		"titulo": "Apartamento no Centro",
		"descricao": "2 quartos, 1 suíte, próximo a tudo.",
		"tipo": "apartamento",
		"quartos": 2,
		"preco": 350000,
		"imagem": "imgs/apartamento no centro.jpg",
		"bairro": "Centro",
		"banheiros": 2,
		"vagas": 1,
		"area": 65,
		"lat": -23.55052,
		"lng": -46.63331
	}
]
```

Campos obrigatórios para exibição: `id`, `titulo`, `descricao`, `tipo`, `quartos`, `preco`, `imagem`.
Outros são opcionais, mas melhoram filtros e detalhes (bairro, área, mapa, etc.).

## Observações

- O mapa no modal usa Leaflet por CDN (carregado em `imoveis.html`). Se não houver `lat/lng`, o mapa fica oculto.
- O formulário de contato exibe mensagem de sucesso simulada (sem backend).

---

© 2024 Vale Imobiliária. Todos os direitos reservados.
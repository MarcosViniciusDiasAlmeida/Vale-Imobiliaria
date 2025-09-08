// main.js - Scripts futuros para interatividade do site Vale Imobiliária
// Exemplo: scroll suave para navegação

document.addEventListener('DOMContentLoaded', function() {
    // Tema: padrão dark com toggle e persistência
    const root = document.documentElement;
    const THEME_KEY = 'vale:theme';
    function applyTheme(theme){
        root.setAttribute('data-theme', theme);
        try { localStorage.setItem(THEME_KEY, theme); } catch {}
    }
    let stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch {}
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored || (prefersDark ? 'dark' : 'dark'); // força dark por padrão
    applyTheme(initial);
    document.getElementById('theme-toggle')?.addEventListener('click', ()=>{
        const current = root.getAttribute('data-theme') || 'dark';
        applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    // Menu mobile toggle
    const toggle = document.getElementById('menu-toggle');
    const links = document.getElementById('nav-links');
    if (toggle && links) {
        toggle.addEventListener('click', () => {
            links.classList.toggle('open');
        });
    }

    // Scroll suave para navegação
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Placeholder para futuras funções (ex: abrir modal de detalhes do imóvel)
    let cards = Array.from(document.querySelectorAll('.card'));
    let allImoveis = [];
    let favs = new Set(JSON.parse(localStorage.getItem('vale:favs') || '[]'));
    let currentPage = 1;
    let pageSize = 6;
    const modal = document.getElementById('modal-detalhes');
    const modalClose = document.getElementById('modal-close');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalSpecs = document.getElementById('modal-specs');
    let modalMap = null; // Leaflet map instance

    const openModal = (data) => {
        if (!modal) return;
        modalImg.src = data.img || '';
        modalImg.alt = data.title || 'Imagem do imóvel';
        modalTitle.textContent = data.title || '';
        modalDesc.textContent = data.desc || '';
        const modalPrice = document.getElementById('modal-price');
        if (modalPrice) {
            modalPrice.textContent = data.price ? `R$ ${Number(data.price).toLocaleString('pt-BR')}` : '';
        }
        modalSpecs.innerHTML = '';
        (data.specs || []).forEach(s => {
            const li = document.createElement('li');
            li.textContent = s;
            modalSpecs.appendChild(li);
        });
        // WhatsApp link com mensagem pré-preenchida
        const w = document.getElementById('modal-whats');
        if (w) {
            const msg = encodeURIComponent(`Olá, tenho interesse no imóvel: ${data.title} (Preço: R$ ${Number(data.price||0).toLocaleString('pt-BR')}). Pode me passar mais detalhes?`);
            w.href = `https://wa.me/5500000000000?text=${msg}`;
        }
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');

        // Configurar mapa se houver coordenadas e Leaflet disponível
        const mapEl = document.getElementById('modal-map');
        if (mapEl) {
            const hasCoords = typeof data.lat === 'number' && typeof data.lng === 'number' && !isNaN(data.lat) && !isNaN(data.lng);
            if (hasCoords && typeof L !== 'undefined') {
                mapEl.style.display = '';
                if (modalMap) { modalMap.remove(); modalMap = null; }
                modalMap = L.map('modal-map').setView([data.lat, data.lng], 15);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '&copy; OpenStreetMap'
                }).addTo(modalMap);
                L.marker([data.lat, data.lng]).addTo(modalMap);
                setTimeout(() => { modalMap && modalMap.invalidateSize(); }, 120);
            } else {
                mapEl.style.display = 'none';
            }
        }
    };
    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        if (modalMap) { modalMap.remove(); modalMap = null; }
    };
    [modalClose, modalOverlay].forEach(el => el && el.addEventListener('click', closeModal));

    function bindDetalhes(){
        document.querySelectorAll('.btn-detalhes').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const card = this.closest('.card');
                if (!card) return;
                const data = {
                    img: card.querySelector('img')?.src,
                    title: card.querySelector('h3')?.textContent?.trim(),
                    desc: card.querySelector('p')?.textContent?.trim(),
                    specs: [
                        `${card.dataset.quartos || '?'} quartos`,
                        `${card.dataset.banheiros || '?'} banheiros`,
                        `${card.dataset.vagas || '0'} vagas`,
                        `Área: ${card.dataset.area || '?'} m²`,
                        `Bairro: ${card.dataset.bairro || '-'}`,
                        `Preço: R$ ${Number(card.dataset.preco || 0).toLocaleString('pt-BR')}`,
                        `Tipo: ${(card.dataset.tipo || '').toUpperCase()}`
                    ],
                    lat: Number(card.dataset.lat || NaN),
                    lng: Number(card.dataset.lng || NaN)
                };
                openModal(data);
            });
        });
    }

    // Placeholder para envio de formulário
    const form = document.getElementById('form-contato');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const feedback = document.getElementById('form-feedback');
            if (feedback) {
                feedback.textContent = 'Mensagem enviada! Retornaremos em breve.';
            } else {
                alert('Mensagem enviada! (Funcionalidade em desenvolvimento)');
            }
            form.reset();
        });
    }

    // Reveal on scroll
    let reveals = document.querySelectorAll('.reveal');
    const onScroll = () => {
        const vh = window.innerHeight || document.documentElement.clientHeight;
        reveals.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < vh - 80) {
                el.classList.add('visible');
            }
        });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Filtros
    const q = document.getElementById('filter-q');
    const tipo = document.getElementById('filter-tipo');
    const quartos = document.getElementById('filter-quartos');
    const preco = document.getElementById('filter-preco');
    const bairro = document.getElementById('filter-bairro');
    const sortOrder = document.getElementById('sort-order');
    const btnLimpar = document.getElementById('btn-limpar');
    const onlyFavs = document.getElementById('only-favorites');
    const pageSizeSel = document.getElementById('page-size');
    const resultsInfo = document.getElementById('results-info');
    const pagination = document.getElementById('pagination');
    const precoMin = document.getElementById('filter-preco-min');
    const precoMax = document.getElementById('filter-preco-max');
    const localInput = document.getElementById('filter-local');

    function onlyDigits(str){ return String(str||'').replace(/\D+/g,''); }
    function parseMoney(str){ const d = onlyDigits(str); return d ? Number(d) : 0; }
    function applyFilters(){
        const qv = (q?.value || '').toLowerCase();
        const tv = tipo?.value || '';
        const qtv = Number(quartos?.value || 0);
        const pv = (preco?.value || '').split('-').map(Number);
        const bv = (bairro?.value || '').toLowerCase();
        const loc = (localInput?.value || '').toLowerCase();
        const minV = precoMin ? parseMoney(precoMin.value) : 0;
        const maxV = precoMax ? parseMoney(precoMax.value) : 0;
        let list = allImoveis.filter(item => {
            const title = (item.titulo || '').toLowerCase();
            const desc = (item.descricao || '').toLowerCase();
            const matchQ = !qv || title.includes(qv) || desc.includes(qv);
            const matchTipo = !tv || (item.tipo || '').toLowerCase() === tv;
            const matchQuartos = !qtv || (item.quartos || 0) >= qtv;
            const price = Number(item.preco || 0);
            const bySelect = !pv.length || (price >= (pv[0]||0) && price <= (pv[1]||Infinity));
            const byMin = !minV || price >= minV;
            const byMax = !maxV || price <= maxV;
            const matchPreco = bySelect && byMin && byMax;
            const matchBairro = !bv || (item.bairro || '').toLowerCase() === bv;
            const matchLoc = !loc || (item.bairro || '').toLowerCase().includes(loc) || title.includes(loc) || desc.includes(loc);
            return matchQ && matchTipo && matchQuartos && matchPreco && matchBairro && matchLoc;
        });
        // Somente favoritos
        if (onlyFavs?.checked) {
            list = list.filter(i => favs.has(i.id));
        }

        // Ordenação
        const order = sortOrder?.value || '';
    if (order === 'preco-asc') list.sort((a,b)=> (a.preco||0)-(b.preco||0));
    if (order === 'preco-desc') list.sort((a,b)=> (b.preco||0)-(a.preco||0));

    // Paginação
    const total = list.length;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    currentPage = Math.min(currentPage, pages);
    const start = (currentPage - 1) * pageSize;
    const pageItems = list.slice(start, start + pageSize);
    renderList(pageItems);
    updateResults(total, pages);
    renderPagination(pages);
    }

    [q, tipo, quartos, preco, bairro, sortOrder].forEach(el => el && el.addEventListener('input', () => { currentPage = 1; applyFilters(); }));
    // Máscara de moeda e listeners de filtros adicionais
    function onCurrencyInput(e){
        const digits = onlyDigits(e.target.value);
        const num = digits ? Number(digits) : 0;
        e.target.value = num.toLocaleString('pt-BR');
    }
    precoMin && precoMin.addEventListener('input', (e) => { onCurrencyInput(e); currentPage = 1; applyFilters(); });
    precoMax && precoMax.addEventListener('input', (e) => { onCurrencyInput(e); currentPage = 1; applyFilters(); });
    localInput && localInput.addEventListener('input', () => { currentPage = 1; applyFilters(); });
    btnLimpar && btnLimpar.addEventListener('click', () => {
        if (q) q.value = '';
        if (tipo) tipo.value = '';
        if (quartos) quartos.value = '';
        if (preco) preco.value = '';
        if (bairro) bairro.value = '';
    if (sortOrder) sortOrder.value = '';
    if (precoMin) precoMin.value = '';
    if (precoMax) precoMax.value = '';
    if (localInput) localInput.value = '';
        if (onlyFavs) onlyFavs.checked = false;
        currentPage = 1;
        applyFilters();
    });
    onlyFavs && onlyFavs.addEventListener('change', () => { currentPage = 1; applyFilters(); });
    pageSizeSel && pageSizeSel.addEventListener('change', () => { pageSize = Number(pageSizeSel.value || 6); currentPage = 1; applyFilters(); });

    // Renderizar cards dinamicamente a partir do JSON (somente se existir grid na página)
    const grid = document.getElementById('portfolio-grid');
    function formatMoney(v){ return Number(v||0).toLocaleString('pt-BR'); }
    function renderList(list){
        if (!grid) return;
        const fragment = document.createDocumentFragment();
        list.forEach(imovel => {
            const card = document.createElement('div');
            card.className = 'card reveal';
            card.tabIndex = 0;
            card.dataset.id = imovel.id;
            card.dataset.tipo = imovel.tipo;
            card.dataset.quartos = imovel.quartos;
            card.dataset.preco = imovel.preco;
            card.dataset.bairro = imovel.bairro || '';
            card.dataset.banheiros = imovel.banheiros || '';
            card.dataset.vagas = imovel.vagas || '';
            card.dataset.area = imovel.area || '';
            if (typeof imovel.lat === 'number') card.dataset.lat = imovel.lat;
            if (typeof imovel.lng === 'number') card.dataset.lng = imovel.lng;
            card.setAttribute('aria-label', `${imovel.titulo}, ${imovel.descricao}`);
            card.innerHTML = `
                <div class="media">
                    <img src="${imovel.imagem}" alt="${imovel.titulo}">
                    <span class="badge">${(imovel.tipo || '').toUpperCase()}</span>
                    <span class="price">R$ ${formatMoney(imovel.preco)}</span>
                    <button class="fav-float btn-fav" data-id="${imovel.id}" aria-label="Favoritar">❤</button>
                </div>
                <h3>${imovel.titulo}</h3>
                <p>${imovel.descricao}</p>
                <div class="specs">
                    <span>${imovel.quartos} q</span>
                    <span>${imovel.banheiros ?? '?'} b</span>
                    <span>${imovel.vagas ?? 0} vg</span>
                    <span>${imovel.area ?? '?'} m²</span>
                    <span>${imovel.bairro || '-'}</span>
                </div>
                <div style="display:flex; gap:8px; padding:0 14px 16px;">
                    <a href="#" class="btn-secondary btn-detalhes" data-imovel="${imovel.id}">Mais Detalhes</a>
                </div>
            `;
            fragment.appendChild(card);
        });
        grid.innerHTML = '';
        grid.appendChild(fragment);
        // atualizar referências
        cards = Array.from(document.querySelectorAll('.card'));
        reveals = document.querySelectorAll('.reveal');
        onScroll();
        bindDetalhes();
        bindFavs();
    }

    function bindFavs(){
        document.querySelectorAll('.btn-fav').forEach(btn => {
            const id = Number(btn.dataset.id);
            if (favs.has(id)) btn.classList.add('active');
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (favs.has(id)) { favs.delete(id); btn.classList.remove('active'); }
                else { favs.add(id); btn.classList.add('active'); }
                localStorage.setItem('vale:favs', JSON.stringify(Array.from(favs)));
            });
        });
    }

    function updateResults(total, pages){
        if (resultsInfo) {
            const start = total ? (currentPage - 1) * pageSize + 1 : 0;
            const end = Math.min(currentPage * pageSize, total);
            resultsInfo.textContent = `${start}-${end} de ${total} imóveis`;
        }
    }

    function renderPagination(pages){
        if (!pagination) return;
        const frag = document.createDocumentFragment();
        const mkBtn = (label, disabled, page) => {
            const b = document.createElement('button');
            b.textContent = label;
            b.disabled = !!disabled;
            if (!disabled) b.addEventListener('click', ()=>{ currentPage = page; applyFilters(); });
            return b;
        };
        frag.appendChild(mkBtn('«', currentPage === 1, 1));
        frag.appendChild(mkBtn('‹', currentPage === 1, Math.max(1, currentPage - 1)));
        for (let p = 1; p <= pages; p++){
            const b = mkBtn(String(p), false, p);
            if (p === currentPage) b.classList.add('active');
            frag.appendChild(b);
        }
        frag.appendChild(mkBtn('›', currentPage === pages, Math.min(pages, currentPage + 1)));
        frag.appendChild(mkBtn('»', currentPage === pages, pages));
        pagination.innerHTML = '';
        pagination.appendChild(frag);
    }

    function populateBairros(list){
        const sel = document.getElementById('filter-bairro');
        const dl = document.getElementById('loc-suggestions');
        if (!sel) return;
        const bairros = Array.from(new Set(list.map(i => (i.bairro||'').trim()).filter(Boolean))).sort((a,b)=>a.localeCompare(b));
        sel.innerHTML = '<option value="">Bairro</option>' + bairros.map(b=>`<option value="${b}">${b}</option>`).join('');
        if (dl) {
            dl.innerHTML = bairros.map(b=>`<option value="${b}">`).join('');
        }
    }

    async function loadImoveis(){
        try {
            const res = await fetch('data/imoveis.json', { cache: 'no-store' });
            const data = await res.json();
            if (!Array.isArray(data)) throw new Error('JSON inválido');
            allImoveis = data;
            populateBairros(allImoveis);
            applyFilters();
        } catch (e) {
            console.error('Erro ao carregar imóveis, usando fallback local:', e);
            allImoveis = [
                { id:1, titulo:'Apartamento no Centro', descricao:'2 quartos, 1 suíte, próximo a tudo que você precisa.', tipo:'apartamento', quartos:2, preco:350000, imagem:'imgs/apartamento no centro.jpg', bairro:'Centro', banheiros:2, vagas:1, area:65, lat:-23.55052, lng:-46.63331 },
                { id:2, titulo:'Casa com Quintal', descricao:'Espaço amplo, ideal para famílias.', tipo:'casa', quartos:3, preco:550000, imagem:'imgs/casa com quintal.jpg', bairro:'Primavera', banheiros:2, vagas:2, area:120, lat:-23.5591, lng:-46.6359 },
                { id:3, titulo:'Apartamento Compacto', descricao:'1 quarto, ótimo para estudantes e jovens casais.', tipo:'apartamento', quartos:1, preco:200000, imagem:'imgs/apartamento no centro.jpg', bairro:'Universitário', banheiros:1, vagas:0, area:42, lat:-23.5623, lng:-46.6402 }
            ];
            populateBairros(allImoveis);
            applyFilters();
        }
    }
    if (grid) {
        loadImoveis();
    }
});

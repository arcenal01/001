// ==================== BLOCO DE SCRIPT 0 ====================

// Revela elementos com a classe .reveal-up conforme entram na tela (usado em todas as páginas do site)
        (function () {
            const items = Array.from(document.querySelectorAll('.reveal-up'));
            if (items.length === 0) return;

            if (!('IntersectionObserver' in window)) {
                items.forEach(el => el.classList.add('in-view'));
                return;
            }

            // Agrupa os itens pelo elemento pai para escalonar a animação entre irmãos
            const groups = new Map();
            items.forEach(el => {
                const parent = el.parentElement;
                if (!groups.has(parent)) groups.set(parent, []);
                groups.get(parent).push(el);
            });

            // Marca o instante do carregamento: elementos que já aparecem na tela
            // sem precisar rolar (ex.: estatísticas logo abaixo do hero) entram numa
            // fila única em cascata, começando um pouco depois do hero para não
            // animar tudo ao mesmo tempo. Quem só aparece depois de rolar mantém
            // o pequeno escalonamento entre irmãos, disparado no momento do scroll.
            const pageLoadTime = performance.now();
            const INITIAL_WINDOW_MS = 400;
            let initialBatchCount = 0;

            function reveal(el) {
                if (el.classList.contains('in-view')) return;
                const elapsed = performance.now() - pageLoadTime;
                let delay;

                if (elapsed < INITIAL_WINDOW_MS) {
                    delay = 550 + Math.min(initialBatchCount, 8) * 100;
                    initialBatchCount += 1;
                } else {
                    const siblings = groups.get(el.parentElement) || [el];
                    const idx = siblings.indexOf(el);
                    delay = Math.min(idx, 6) * 90;
                }

                setTimeout(() => el.classList.add('in-view'), delay);
                observer.unobserve(el);
            }

            // threshold baixo (dispara com só 1% visível) e rootMargin levemente
            // negativo: a revelação só acontece quando o elemento realmente
            // começa a entrar na tela pela parte de baixo, então o usuário vê o
            // efeito de fade+subida acontecer. A rede de segurança abaixo cobre
            // o caso de rolagens muito bruscas que pulam o elemento por completo.
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) reveal(entry.target);
                });
            }, { threshold: 0.01, rootMargin: '0px 0px -8% 0px' });

            items.forEach(el => observer.observe(el));

            // Rede de segurança: em rolagens muito bruscas ou saltos instantâneos
            // (ex.: âncoras de navegação, teclas Home/End) o navegador às vezes não
            // chega a pintar um quadro em que o elemento esteja na tela, então o
            // observer nunca dispara. Uma checagem leve e debounced no scroll/resize
            // garante que nada fique preso em opacidade zero.
            let safetyTimer = null;
            function safetyCheck() {
                if (safetyTimer) return;
                safetyTimer = setTimeout(() => {
                    safetyTimer = null;
                    const vh = window.innerHeight;
                    items.forEach(el => {
                        if (el.classList.contains('in-view')) return;
                        const rect = el.getBoundingClientRect();
                        // Revela tudo cujo topo já tenha alcançado (ou passado) a
                        // borda inferior da tela — inclui elementos ainda visíveis
                        // E elementos que uma rolagem brusca já deixou para trás,
                        // que de outra forma ficariam presos em opacidade zero.
                        if (rect.top < vh) reveal(el);
                    });
                }, 120);
            }
            window.addEventListener('scroll', safetyCheck, { passive: true });
            window.addEventListener('resize', safetyCheck);
            window.addEventListener('load', safetyCheck);
        })();

// Filtro de categorias na vitrine de TCCs (tccs.html)
        (function () {
            const filterTags = document.querySelectorAll('.filter-tag');
            const tccCards = document.querySelectorAll('.tcc-showcase-card');
            if (filterTags.length === 0 || tccCards.length === 0) return;

            filterTags.forEach(tag => {
                tag.addEventListener('click', function () {
                    const filter = this.getAttribute('data-filter');

                    filterTags.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');

                    tccCards.forEach(card => {
                        const category = card.getAttribute('data-category');
                        card.style.display = (filter === 'all' || category === filter) ? 'block' : 'none';
                    });
                });
            });
        })();

// Revela os cards de TCC (tccs.html) com animação escalonada ao entrar na tela
        (function () {
            const cards = Array.from(document.querySelectorAll('.tcc-showcase-card'));
            if (cards.length === 0) return;

            if (!('IntersectionObserver' in window)) {
                cards.forEach(c => c.classList.add('in-view'));
                return;
            }

            const pageLoadTime = performance.now();
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const elapsed = performance.now() - pageLoadTime;
                        const idx = cards.indexOf(el);
                        // Cards já visíveis ao carregar esperam o cabeçalho terminar de animar
                        const delay = (elapsed < 400 ? 600 : 0) + idx * 110;
                        setTimeout(() => el.classList.add('in-view'), delay);
                        observer.unobserve(el);
                    }
                });
            }, { threshold: 0.15 });

            cards.forEach(c => observer.observe(c));
        })();

// Popup com o conteúdo completo do TCC (tccs.html)
        (function () {
            const overlay = document.getElementById('tccModalOverlay');
            const body = document.getElementById('tccModalBody');
            const closeBtn = document.getElementById('tccModalClose');
            const cards = document.querySelectorAll('.tcc-showcase-card');
            if (!overlay || !body || cards.length === 0) return;

            let lastFocused = null;

            function openModalFromCard(card) {
                const imageArea = card.querySelector('.tcc-card-image-area');
                const info = card.querySelector('.tcc-card-info');
                if (!info) return;

                body.innerHTML = '';
                if (imageArea) body.appendChild(imageArea.cloneNode(true));
                body.appendChild(info.cloneNode(true));

                lastFocused = document.activeElement;
                overlay.classList.add('is-open');
                document.body.style.overflow = 'hidden';
                closeBtn.focus();
            }

            function closeModal() {
                overlay.classList.remove('is-open');
                document.body.style.overflow = '';
                setTimeout(() => { body.innerHTML = ''; }, 300);
                if (lastFocused) lastFocused.focus();
            }

            cards.forEach(card => {
                const trigger = card.querySelector('.tcc-card-expand-btn');
                if (trigger) {
                    trigger.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openModalFromCard(card);
                    });
                }
            });

            closeBtn.addEventListener('click', closeModal);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeModal();
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
            });
        })();

// Lightbox com a imagem do site/programa ampliada (tccs.html)
        (function () {
            const lightbox = document.getElementById('tccImageLightbox');
            const lightboxImg = document.getElementById('tccImageLightboxImg');
            const closeBtn = document.getElementById('tccImageLightboxClose');
            // Só as imagens dentro da vitrine abrem o lightbox (não a cópia dentro do popup de projeto)
            const zoomables = document.querySelectorAll('.tcc-showcase-grid .tcc-image-zoomable');
            if (!lightbox || !lightboxImg || zoomables.length === 0) return;

            let lastFocused = null;

            function openLightbox(src, alt) {
                lightboxImg.src = src;
                lightboxImg.alt = alt || '';
                lastFocused = document.activeElement;
                lightbox.classList.add('is-open');
                document.body.style.overflow = 'hidden';
                closeBtn.focus();
            }

            function closeLightbox() {
                lightbox.classList.remove('is-open');
                document.body.style.overflow = '';
                setTimeout(() => { lightboxImg.src = ''; }, 300);
                if (lastFocused) lastFocused.focus();
            }

            zoomables.forEach(area => {
                area.setAttribute('tabindex', '0');
                area.setAttribute('role', 'button');
                area.setAttribute('aria-label', 'Ampliar imagem do projeto');

                area.addEventListener('click', () => {
                    openLightbox(area.getAttribute('data-zoom-src'), area.getAttribute('data-zoom-alt'));
                });
                area.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openLightbox(area.getAttribute('data-zoom-src'), area.getAttribute('data-zoom-alt'));
                    }
                });
            });

            closeBtn.addEventListener('click', closeLightbox);
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) closeLightbox();
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
            });
        })();

// ==================== BLOCO DE SCRIPT 1 ====================

// Expande as categorias extras na página inicial
        (function () {
            const grid = document.querySelector('.tccs-grid');
            const button = document.querySelector('.tcc-more-button');
            if (!grid || !button) return;

            button.addEventListener('click', function () {
                const isExpanded = grid.classList.toggle('is-expanded');
                button.classList.toggle('is-expanded', isExpanded);
                button.setAttribute('aria-expanded', String(isExpanded));
                button.querySelector('span').textContent = isExpanded ? 'Menos categorias' : 'Mais categorias';
            });
        })();

// Revela os cards da galeria conforme entram na tela
        (function () {
            const cards = document.querySelectorAll('.monitor-card');
            if (!('IntersectionObserver' in window) || cards.length === 0) {
                cards.forEach(c => c.classList.add('in-view'));
                return;
            }
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry, idx) => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const delay = (Array.from(el.parentElement.children).indexOf(el) % 6) * 70;
                        setTimeout(() => el.classList.add('in-view'), delay);
                        observer.unobserve(el);
                    }
                });
            }, { threshold: 0.15 });
            cards.forEach(c => observer.observe(c));
        })();

                // Arrastar cada cartão individualmente com resistência elástica.
        // O cartão original permanece no lugar; somente um proxy visual sobe para a camada superior.
        (function () {
            const cards = document.querySelectorAll('.monitor-card');
            if (cards.length === 0) return;

            const MAX_X = 82;
            const MAX_Y = 56;
            const DRAG_THRESHOLD = 4;
            let activeProxyCleanup = null;

            function rubberBand(delta, max) {
                const sign = delta < 0 ? -1 : 1;
                const distance = Math.abs(delta);
                return sign * max * (1 - 1 / (distance / max + 1));
            }

            cards.forEach((card) => {
                let dragging = false;
                let pointerId = null;
                let startX = 0;
                let startY = 0;
                let moved = false;
                let suppressClick = false;
                let dragProxy = null;
                let restoreTimer = null;

                function clearProxy() {
                    if (restoreTimer !== null) {
                        window.clearTimeout(restoreTimer);
                        restoreTimer = null;
                    }
                    if (dragProxy) {
                        dragProxy.remove();
                        dragProxy = null;
                    }
                    card.style.removeProperty('visibility');
                    card.style.removeProperty('transition');
                    card.style.removeProperty('transform');
                    if (activeProxyCleanup === clearProxy) activeProxyCleanup = null;
                }

                function settleCardBeforeDrag() {
                    card.classList.add('in-view');
                    card.style.transition = 'none';
                    card.style.transform = 'translateY(0)';
                }

                function createProxy() {
                    if (activeProxyCleanup && activeProxyCleanup !== clearProxy) {
                        activeProxyCleanup();
                    }
                    const rect = card.getBoundingClientRect();
                    const computedStyle = getComputedStyle(card);
                    const accent = computedStyle.getPropertyValue('--ch-accent').trim();
                    const accentGlow = computedStyle.getPropertyValue('--ch-accent-glow').trim();

                    dragProxy = card.cloneNode(true);
                    dragProxy.classList.add('drag-proxy');
                    dragProxy.style.position = 'absolute';
                    dragProxy.style.left = `${rect.left + window.scrollX}px`;
                    dragProxy.style.top = `${rect.top + window.scrollY}px`;
                    dragProxy.style.width = `${rect.width}px`;
                    dragProxy.style.height = `${rect.height}px`;
                    dragProxy.style.margin = '0';
                    dragProxy.style.zIndex = '40';
                    dragProxy.style.pointerEvents = 'none';
                    dragProxy.style.setProperty('--drag-x', '0px');
                    dragProxy.style.setProperty('--drag-y', '0px');
                    if (accent) dragProxy.style.setProperty('--ch-accent', accent);
                    if (accentGlow) dragProxy.style.setProperty('--ch-accent-glow', accentGlow);
                    document.body.appendChild(dragProxy);
                    activeProxyCleanup = clearProxy;

                    card.style.visibility = 'hidden';
                    dragProxy.classList.add('is-dragging');
                }

                function returnProxy(immediate = false) {
                    if (!dragProxy) return;
                    if (immediate) {
                        clearProxy();
                        return;
                    }
                    dragProxy.classList.remove('is-dragging');
                    dragProxy.style.setProperty('--drag-x', '0px');
                    dragProxy.style.setProperty('--drag-y', '0px');
                    restoreTimer = window.setTimeout(clearProxy, 700);
                }

                card.querySelectorAll('img').forEach((img) => {
                    img.addEventListener('dragstart', (e) => e.preventDefault());
                });

                card.addEventListener('pointerdown', (e) => {
                    if (e.pointerType === 'mouse' && e.button !== 0) return;

                    clearProxy();
                    settleCardBeforeDrag();
                    dragging = true;
                    moved = false;
                    pointerId = e.pointerId;
                    startX = e.clientX;
                    startY = e.clientY;
                    card.setPointerCapture(pointerId);
                });

                card.addEventListener('pointermove', (e) => {
                    if (!dragging || e.pointerId !== pointerId) return;

                    const dx = e.clientX - startX;
                    const dy = e.clientY - startY;
                    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
                        moved = true;
                        suppressClick = true;
                        e.preventDefault();
                        if (!dragProxy) createProxy();
                    }

                    if (dragProxy) {
                        dragProxy.style.setProperty('--drag-x', `${rubberBand(dx, MAX_X)}px`);
                        dragProxy.style.setProperty('--drag-y', `${rubberBand(dy, MAX_Y)}px`);
                    }
                }, { passive: false });

                function release(e) {
                    if (!dragging) return;
                    if (e && e.pointerId !== pointerId) return;

                    dragging = false;
                    if (dragProxy) returnProxy(e && e.type === 'pointercancel');

                    if (pointerId !== null) {
                        try { card.releasePointerCapture(pointerId); } catch (err) { /* noop */ }
                    }
                    pointerId = null;

                    if (moved) {
                        window.setTimeout(() => { suppressClick = false; }, 80);
                    }
                }

                card.addEventListener('pointerup', release);
                card.addEventListener('pointercancel', release);

                card.addEventListener('click', (e) => {
                    if (!suppressClick) return;
                    e.preventDefault();
                    e.stopPropagation();
                    suppressClick = false;
                }, true);
            });
        })();

        // Expandir foto + texto ao clicar em um card da galeria
        (function () {
            const cards = Array.from(document.querySelectorAll('.monitor-card'));
            if (cards.length === 0) return;

            const lightbox = document.getElementById('galleryLightbox');
            const lbImage = document.getElementById('lightboxImage');
            const lbTitle = document.getElementById('lightboxTitle');
            const lbDescription = document.getElementById('lightboxDescription');
            const lbScanbar = document.getElementById('lightboxScanbar');
            const lbChannel = document.getElementById('lightboxChannel');
            const lbWhen = document.getElementById('lightboxWhen');
            const btnClose = document.getElementById('lightboxClose');
            const btnPrev = document.getElementById('lightboxPrev');
            const btnNext = document.getElementById('lightboxNext');
            const panel = lightbox.querySelector('.lightbox-panel');

            let currentIndex = 0;
            let lastFocused = null;

            function describeMoment(caption, channelTitle, channelSub) {
                const base = caption ? caption.replace(/\.$/, '') : 'Um momento do Nexus';
                const context = channelSub ? channelSub : channelTitle;
                return base + ' — um registro de ' + context + ', parte da coleção de bastidores que mostra a energia de quem viveu o Nexus por dentro, do preparo às apresentações finais.';
            }

            function render(index) {
                const card = cards[index];
                const img = card.querySelector('.monitor-frame img');
                const captionEl = card.querySelector('.monitor-caption p');
                const scanbarEl = card.querySelector('.monitor-scanbar span:last-child');
                const channel = card.closest('.channel');
                const channelTitle = channel ? channel.querySelector('.channel-title')?.textContent.trim() : 'Nexus';
                const channelMeta = channel ? channel.querySelector('.channel-meta')?.textContent.replace('·', '').trim() : '';
                const channelSub = channel ? channel.querySelector('.channel-sub')?.textContent.trim() : '';
                const caption = captionEl ? captionEl.textContent.trim() : 'Momento Nexus';
                const accent = channel ? getComputedStyle(channel).getPropertyValue('--ch-accent').trim() : '#8b5cf6';
                const accentGlow = channel ? getComputedStyle(channel).getPropertyValue('--ch-accent-glow').trim() : 'rgba(139, 92, 246, 0.4)';

                lbImage.src = img ? img.src : '';
                lbImage.alt = caption;
                lbTitle.textContent = caption;
                lbDescription.textContent = describeMoment(caption, channelTitle, channelSub);
                lbScanbar.textContent = scanbarEl ? scanbarEl.textContent.trim() : 'NEXUS';
                lbChannel.textContent = channelTitle || 'Nexus';
                lbWhen.textContent = channelMeta || channelSub || '';
                panel.style.setProperty('--ch-accent', accent);
                panel.style.setProperty('--ch-accent-glow', accentGlow);

                currentIndex = index;
            }

            function openLightbox(index) {
                lastFocused = document.activeElement;
                render(index);
                lightbox.classList.add('is-open');
                lightbox.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
                btnClose.focus();
            }

            function closeLightbox() {
                lightbox.classList.remove('is-open');
                lightbox.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
                if (lastFocused) lastFocused.focus();
            }

            function step(delta) {
                const next = (currentIndex + delta + cards.length) % cards.length;
                render(next);
            }

            cards.forEach((card, index) => {
                card.addEventListener('click', () => openLightbox(index));
                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openLightbox(index);
                    }
                });
                if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
            });

            btnClose.addEventListener('click', closeLightbox);
            btnPrev.addEventListener('click', () => step(-1));
            btnNext.addEventListener('click', () => step(1));

            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) closeLightbox();
            });

            document.addEventListener('keydown', (e) => {
                if (!lightbox.classList.contains('is-open')) return;
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft') step(-1);
                if (e.key === 'ArrowRight') step(1);
            });
        })();

// ==================== BLOCO DE SCRIPT 2 ====================

// ==================== CRONÔMETRO REGRESSIVO ====================
        const dataAlvo = new Date("2026-11-30T23:59:59");

        const diasEl = document.getElementById('dias');
        const horasEl = document.getElementById('horas');
        const minutosEl = document.getElementById('minutos');
        const segundosEl = document.getElementById('segundos');

        function atualizarCronometro() {
            const agora = new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
            const dataBrasilia = new Date(agora);
            
            const diferenca = dataAlvo - dataBrasilia;

            if (diferenca <= 0) {
                diasEl.textContent = "00";
                horasEl.textContent = "00";
                minutosEl.textContent = "00";
                segundosEl.textContent = "00";
                return;
            }

            const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
            const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
            const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

            diasEl.textContent = String(dias).padStart(2, '0');
            horasEl.textContent = String(horas).padStart(2, '0');
            minutosEl.textContent = String(minutos).padStart(2, '0');
            segundosEl.textContent = String(segundos).padStart(2, '0');
        }

        setInterval(atualizarCronometro, 1000);
        atualizarCronometro();

// ==================== BLOCO DE SCRIPT 3 ====================

// Alterna a exibição de cada evento: mantém as fotos ocultas até o clique
        (function () {
            const teasers = document.querySelectorAll('.event-teaser');
            const closeButtons = document.querySelectorAll('.channel-close');

            function revealCards(channel) {
                channel.querySelectorAll('.monitor-card').forEach((card, idx) => {
                    if (card.classList.contains('in-view')) return;
                    const delay = (idx % 6) * 70;
                    setTimeout(() => card.classList.add('in-view'), delay);
                });
            }

            function openChannel(id) {
                const channel = document.getElementById(id);
                if (!channel) return;
                channel.classList.remove('channel-collapsed');
                revealCards(channel);
                const teaser = document.querySelector(`.event-teaser[data-target="${id}"]`);
                if (teaser) teaser.setAttribute('aria-expanded', 'true');
                channel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            function closeChannel(id) {
                const channel = document.getElementById(id);
                if (!channel) return;
                channel.classList.add('channel-collapsed');
                const teaser = document.querySelector(`.event-teaser[data-target="${id}"]`);
                if (teaser) {
                    teaser.setAttribute('aria-expanded', 'false');
                    teaser.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }

            teasers.forEach((teaser) => {
                teaser.addEventListener('click', () => openChannel(teaser.dataset.target));
            });

            closeButtons.forEach((btn) => {
                btn.addEventListener('click', () => closeChannel(btn.dataset.target));
            });
        })();

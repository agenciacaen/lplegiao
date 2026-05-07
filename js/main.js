/* =============================================
   LEGIÃO – Main JavaScript
   Landing Page Final
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

    // ──────────────────────────────────────────────
    // 0. Smooth Scroll Global (Lerp / Inércia)
    // ──────────────────────────────────────────────
    const isMobile = /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);

    if (!isMobile) {
        let targetScroll = window.scrollY;
        let currentScroll = window.scrollY;
        const SMOOTH_FACTOR = 0.07;
        const SCROLL_SPEED = 1.2;

        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            targetScroll = Math.min(Math.max(targetScroll + e.deltaY * SCROLL_SPEED, 0), maxScroll);
        }, { passive: false });

        const smoothScrollLoop = () => {
            currentScroll += (targetScroll - currentScroll) * SMOOTH_FACTOR;

            if (Math.abs(currentScroll - targetScroll) > 0.5) {
                window.scrollTo(0, currentScroll);
            } else {
                currentScroll = targetScroll;
                window.scrollTo(0, currentScroll);
            }

            requestAnimationFrame(smoothScrollLoop);
        };

        requestAnimationFrame(smoothScrollLoop);

        window.addEventListener('scroll', () => {
            if (Math.abs(window.scrollY - currentScroll) > 2) {
                currentScroll = window.scrollY;
                targetScroll = window.scrollY;
            }
        });

        window.__smoothScroll = {
            scrollTo: (y) => { targetScroll = y; }
        };
    }

    // ──────────────────────────────────────────────
    // 1. Scroll Reveal (IntersectionObserver)
    // ──────────────────────────────────────────────
    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        scrollObserver.observe(el);
    });

    // ──────────────────────────────────────────────
    // 2. Flashlight Effect (Cards)
    // ──────────────────────────────────────────────
    document.querySelectorAll('.flashlight-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });

    // ──────────────────────────────────────────────
    // 3. Navbar Scroll Behavior
    // ──────────────────────────────────────────────
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 80) {
                navbar.classList.add('navbar--scrolled');
            } else {
                navbar.classList.remove('navbar--scrolled');
            }
        });
    }

    // ──────────────────────────────────────────────
    // 4. Smooth Scroll for Anchor Links
    // ──────────────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const targetY = target.getBoundingClientRect().top + window.scrollY;
                if (window.__smoothScroll) {
                    window.__smoothScroll.scrollTo(targetY);
                } else {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // ──────────────────────────────────────────────
    // 5. Hero Video Autoplay (Static)
    // ──────────────────────────────────────────────
    const heroVideo = document.querySelector('.hero__bg video');
    if (heroVideo) {
        // Garantimos que o vídeo comece a tocar caso o autoplay falhe
        heroVideo.play().catch(() => {
            console.log("Autoplay prevented, waiting for interaction");
        });
    }

    // Seção 2 removida (agora estática via CSS)


    // ──────────────────────────────────────────────
    // 7. SEÇÃO 3 – O QUE É A LEGIÃO (Zoom & Reveal)
    // ──────────────────────────────────────────────
    const s3Section = document.getElementById('o-que-e-a-legiao');
    const s3ZoomLayer = document.getElementById('s3ZoomLayer');
    const s3ZoomTarget = document.querySelector('.s3__zoom-target');

    if (s3Section && s3ZoomLayer && s3ZoomTarget) {
        
        const isDesktopS3 = () => window.innerWidth > 768;

        // Cache de dimensões
        let s3Top = 0;
        let s3Height = 0;
        let s3Scrollable = 0;
        let s3InView = false;

        // Estado do Lerp
        let s3CurrentProgress = 0;
        const S3_LERP = 0.12; 
        const MAX_SCALE = 60; // Aumentado para SVG vetorial, garantindo preenchimento total em 4K

        const recalcS3 = () => {
            s3Top = s3Section.offsetTop;
            s3Height = s3Section.offsetHeight;
            s3Scrollable = s3Height - window.innerHeight;
            if (s3Scrollable <= 0) s3Scrollable = 1; 
            alignZoomOrigin();
        };

        const animateS3 = () => {
            if (!s3InView) return;

            const scrolled = window.scrollY - s3Top;
            const targetProgress = Math.min(Math.max(scrolled / s3Scrollable, 0), 1);
            
            const diff = targetProgress - s3CurrentProgress;
            if (Math.abs(diff) > 0.0001) {
                s3CurrentProgress += diff * S3_LERP;
            } else {
                s3CurrentProgress = targetProgress;
            }

            const zoomProgress = s3CurrentProgress;
            
            // Curva de zoom mais suave
            const scale = 1 + (Math.pow(zoomProgress, 3) * MAX_SCALE);
            
            // Fade out mais gradual
            const zoomOpacity = zoomProgress < 0.3 ? 1 : 1 - ((zoomProgress - 0.3) / 0.5);
            
            // Aplicar transformações
            s3ZoomLayer.style.transform = `translate3d(0,0,0) scale3d(${scale}, ${scale}, 1) rotate(0.01deg)`;
            s3ZoomLayer.style.opacity = Math.max(zoomOpacity, 0);

            requestAnimationFrame(animateS3);
        };

        const alignZoomOrigin = () => {
            const prevTransform = s3ZoomLayer.style.transform;
            s3ZoomLayer.style.transform = 'none';
            
            const targetRect = s3ZoomTarget.getBoundingClientRect();
            const containerRect = s3ZoomLayer.getBoundingClientRect();
            
            if (containerRect.width > 0) {
                const originX = ((targetRect.left + targetRect.width / 2) - containerRect.left) / containerRect.width * 100;
                const originY = ((targetRect.top + targetRect.height / 2) - containerRect.top) / containerRect.height * 100;
                s3ZoomLayer.style.transformOrigin = `${originX}% ${originY}%`;
            }
            
            s3ZoomLayer.style.transform = prevTransform;
        };

        // Intersection Observer para ligar/desligar rAF
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                s3InView = entry.isIntersecting;
                if (s3InView) {
                    requestAnimationFrame(animateS3);
                }
            });
        }, { threshold: 0.01 });

        observer.observe(s3Section);

        window.addEventListener('resize', recalcS3);
        window.addEventListener('load', recalcS3);
        
        document.fonts.ready.then(() => {
            setTimeout(recalcS3, 100); 
        });
    }

    // --- SEÇÃO 4: GAMIFICAÇÃO (Timeline Vertical) ---
    const s4Section = document.getElementById('s4-gamification');
    const s4TitleSticky = document.getElementById('s4-title-sticky');
    const s4ContentReveal = document.getElementById('s4-content-reveal');
    const s4TimelineLineActive = document.getElementById('s4-timeline-line-active');
    const s4TimelineItems = document.querySelectorAll('.s4__timeline-item');
    if (s4Section) {
        // 1. Preparar o texto (split into letters)
        const revealElements = s4Section.querySelectorAll('.js-reveal-text');
        let allLetters = [];

        revealElements.forEach(el => {
            const text = el.getAttribute('data-text');
            el.innerHTML = text.split('').map(char => 
                `<span class="letter">${char === ' ' ? '&nbsp;' : char}</span>`
            ).join('');
            
            const letters = el.querySelectorAll('.letter');
            allLetters.push(...Array.from(letters));
        });

        // Observer para Ativar Scroll Event apenas quando visível
        const s4Observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    window.addEventListener('scroll', handleS4Scroll);
                    handleS4Scroll(); // Executa uma vez no início
                } else {
                    window.removeEventListener('scroll', handleS4Scroll);
                }
            });
        }, { threshold: 0 });

        s4Observer.observe(s4Section);

        function handleS4Scroll() {
            const rect = s4Section.getBoundingClientRect();
            const viewHeight = window.innerHeight;
            const sectionHeight = s4Section.offsetHeight;
            
            // Cálculo de progresso global da seção (0 a 1)
            let progress = -rect.top / (sectionHeight - viewHeight);
            progress = Math.min(Math.max(progress, 0), 1);

            // 1. FASE 1: Animação de letras (0% a 30% do progresso)
            const textProgress = Math.min(progress / 0.3, 1);
            const totalLetters = allLetters.length;
            const activeCount = Math.floor(textProgress * totalLetters);
            
            allLetters.forEach((letter, i) => {
                if (i < activeCount) {
                    letter.classList.add('active');
                } else {
                    letter.classList.remove('active');
                }
            });

            // 2. FASE DE TRANSIÇÃO (30% a 45%)
            if (progress > 0.3) {
                const transProgress = Math.min((progress - 0.3) / 0.15, 1);
                
                // Título desaparece e sobe MAIS RÁPIDO para não sobrepor
                if (s4TitleSticky) {
                    // O título deve sumir completamente antes do transProgress chegar a 0.7
                    const titleOpacity = Math.max(0, 1 - (transProgress * 1.5));
                    s4TitleSticky.style.opacity = titleOpacity;
                    s4TitleSticky.style.transform = `translateY(-${transProgress * 150}px) scale(${1 - transProgress * 0.1})`;
                    s4TitleSticky.style.visibility = titleOpacity <= 0 ? 'hidden' : 'visible';
                }

                // Conteúdo aparece e sobe (transição mais suave)
                if (s4ContentReveal) {
                    const contentOpacity = Math.min(progress > 0.35 ? (progress - 0.35) / 0.1 : 0, 1);
                    s4ContentReveal.style.opacity = contentOpacity;
                    s4ContentReveal.style.visibility = contentOpacity > 0 ? 'visible' : 'hidden';
                    s4ContentReveal.style.transform = `translateY(${(1 - contentOpacity) * 100}px)`;
                }

                // 3. FASE DA TIMELINE
                if (progress > 0.42) {
                    let lineProgress = (progress - 0.42) / 0.55;
                    lineProgress = Math.min(Math.max(lineProgress, 0), 1);

                    if (s4TimelineLineActive) {
                        s4TimelineLineActive.style.height = `${lineProgress * 100}%`;
                    }

                    s4TimelineItems.forEach(item => {
                        const itemRect = item.getBoundingClientRect();
                        const itemCenter = itemRect.top + (itemRect.height / 2);
                        if (itemCenter < viewHeight * 0.7) {
                            item.classList.add('active');
                        } else {
                            item.classList.remove('active');
                        }
                    });
                }
            } else {
                if (s4TitleSticky) {
                    s4TitleSticky.style.opacity = '1';
                    s4TitleSticky.style.transform = 'translateY(0) scale(1)';
                    s4TitleSticky.style.visibility = 'visible';
                }
                if (s4ContentReveal) {
                    s4ContentReveal.style.opacity = '0';
                    s4ContentReveal.style.visibility = 'hidden';
                    s4ContentReveal.style.transform = 'translateY(100px)';
                }
                if (s4TimelineLineActive) s4TimelineLineActive.style.height = '0%';
                s4TimelineItems.forEach(item => item.classList.remove('active'));
            }
        }
    }

    // ──────────────────────────────────────────────
    // 8. SEÇÃO 8 – Scroll-Driven Card Merge
    //    Cards voam um por um para o centro (ingredientes)
    //    e formam um card unificado com barra de progresso
    // ──────────────────────────────────────────────
    const s8Section = document.getElementById('s8-score');
    const s8Dashboard = document.getElementById('s8-dashboard');
    const s8Merged = document.getElementById('s8-merged');
    const s8Items = document.querySelectorAll('.s8__item');
    const s8Counter = document.getElementById('s8-counter');
    const s8MainFill = document.getElementById('s8-main-fill');
    const s8MainGlow = document.getElementById('s8-main-glow');
    const s8ProgressPercent = document.getElementById('s8-progress-percent');
    const s8MergedListItems = document.querySelectorAll('.s8__merged-list-item');
    const s8Scene = document.getElementById('s8-scene');

    const isDesktopS8 = () => window.innerWidth > 768;

    if (s8Section && s8Dashboard && s8Merged && s8Items.length > 0 && isDesktopS8()) {
        
        const TOTAL_MH = 340;
        const CARD_COUNT = s8Items.length; // 6 cards
        const MH_VALUES = [10, 30, 50, 100, 150, -20]; // Valor individual de cada card
        const MH_CUMULATIVE = [10, 40, 90, 190, 340, 320]; // Acumulado
        let s8Completed = false;
        let lastAbsorbedIndex = -1;

        // Ponto de convergência (centro da scene)
        const getCenterPoint = () => {
            const sceneRect = s8Scene.getBoundingClientRect();
            return {
                x: sceneRect.left + sceneRect.width / 2,
                y: sceneRect.top + sceneRect.height / 2
            };
        };

        // Flash visual ao absorver um card
        const createAbsorbFlash = () => {
            const flash = document.createElement('div');
            flash.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 60px;
                height: 60px;
                background: radial-gradient(circle, rgba(213,145,15,0.6) 0%, transparent 70%);
                border-radius: 50%;
                pointer-events: none;
                z-index: 30;
                animation: s8FlashAbsorb 0.6s ease-out forwards;
            `;
            s8Scene.appendChild(flash);
            setTimeout(() => flash.remove(), 700);
        };

        const handleS8Scroll = () => {
            if (!isDesktopS8()) return;

            const rect = s8Section.getBoundingClientRect();
            const viewHeight = window.innerHeight;
            const sectionHeight = s8Section.offsetHeight;
            
            let progress = -rect.top / (sectionHeight - viewHeight);
            progress = Math.min(Math.max(progress, 0), 1);

            /*
             * TIMELINE:
             * 0.00 – 0.15  → Fase 1: Tudo estático, cards visíveis
             * 0.15 – 0.70  → Fase 2: Cards voam UM POR UM para o centro
             *                 Cada card tem uma faixa de ~0.092 do progresso
             *                 Sub-fases por card:
             *                   0% – 30%: card começa a flutuar (leve translate Y + scale up)
             *                   30% – 80%: card voa para o centro (translate + rotate + shrink)
             *                   80% – 100%: card desaparece (opacity 0 + scale 0)
             * 0.70 – 1.00  → Fase 3: Card unificado + barra de progresso
             */

            const PHASE1_END = 0.15;
            const PHASE2_END = 0.70;
            const CARD_WINDOW = (PHASE2_END - PHASE1_END) / CARD_COUNT; // ~0.092 per card

            // ── FASE 1: Cards estáticos (0% → 15%) ──
            if (progress < PHASE1_END) {
                s8Dashboard.style.opacity = '1';
                s8Items.forEach(item => {
                    item.style.transform = 'none';
                    item.style.opacity = '1';
                });
                s8Merged.classList.remove('active');
                s8Completed = false;
                lastAbsorbedIndex = -1;

                // Reset dashboard header
                const dashTop = s8Dashboard.querySelector('.s8__dashboard-top');
                if (dashTop) dashTop.style.opacity = '1';
                
                // Reset counter e barra
                if (s8Counter) { s8Counter.textContent = '0'; s8Counter.classList.remove('complete'); }
                if (s8MainFill) s8MainFill.style.width = '0%';
                if (s8MainGlow) s8MainGlow.style.width = '0%';
                if (s8ProgressPercent) s8ProgressPercent.textContent = '0%';
                s8MergedListItems.forEach(item => item.classList.remove('highlight'));
                const mergedCard = document.querySelector('.s8__merged-card');
                if (mergedCard) mergedCard.classList.remove('pulse');
            }

            // ── FASE 2: Cards voam sequencialmente (15% → 70%) ──
            else if (progress < PHASE2_END) {
                const center = getCenterPoint();
                
                // Dashboard header desaparece gradualmente
                const headerFade = Math.min((progress - PHASE1_END) / 0.1, 1);
                const dashTop = s8Dashboard.querySelector('.s8__dashboard-top');
                if (dashTop) dashTop.style.opacity = `${1 - headerFade}`;

                s8Items.forEach((item, i) => {
                    const cardStart = PHASE1_END + (i * CARD_WINDOW);
                    const cardEnd = cardStart + CARD_WINDOW;
                    
                    if (progress < cardStart) {
                        // Card ainda não começou — mantém normal
                        item.style.transform = 'none';
                        item.style.opacity = '1';
                    } else if (progress >= cardEnd) {
                        // Card já foi absorvido — invisível
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0) rotate(15deg)';
                        
                        // Trigger flash apenas uma vez
                        if (i > lastAbsorbedIndex) {
                            lastAbsorbedIndex = i;
                            createAbsorbFlash();
                        }
                    } else {
                        // Card em animação — interpolando
                        const cardProgress = (progress - cardStart) / CARD_WINDOW; // 0 → 1
                        
                        // Offset para o centro
                        const itemRect = item.getBoundingClientRect();
                        const itemCenterX = itemRect.left + itemRect.width / 2;
                        const itemCenterY = itemRect.top + itemRect.height / 2;
                        const dx = center.x - itemCenterX;
                        const dy = center.y - itemCenterY;

                        if (cardProgress < 0.3) {
                            // Sub-fase A: Flutuação (card começa a se levantar)
                            const lift = cardProgress / 0.3;
                            const floatY = -8 * lift;
                            const floatScale = 1 + (0.05 * lift);
                            item.style.transform = `translateY(${floatY}px) scale(${floatScale})`;
                            item.style.opacity = '1';
                            item.style.zIndex = '15';
                        } else if (cardProgress < 0.8) {
                            // Sub-fase B: Voo para o centro
                            const flyProgress = (cardProgress - 0.3) / 0.5; // 0 → 1
                            const eased = 1 - Math.pow(1 - flyProgress, 3); // ease-out cubic
                            
                            const tx = dx * eased;
                            const ty = dy * eased;
                            const flyScale = 1.05 - (0.6 * eased);
                            const rotate = (i % 2 === 0 ? 1 : -1) * 12 * eased;
                            
                            item.style.transform = `translate(${tx}px, ${ty}px) scale(${flyScale}) rotate(${rotate}deg)`;
                            item.style.opacity = `${1 - (eased * 0.5)}`;
                            item.style.zIndex = '15';
                        } else {
                            // Sub-fase C: Absorção (desaparece no centro)
                            const absorbProgress = (cardProgress - 0.8) / 0.2; // 0 → 1
                            const eased = absorbProgress * absorbProgress; // ease-in
                            
                            const tx = dx;
                            const ty = dy;
                            const absorbScale = 0.45 * (1 - eased);
                            const rotate = (i % 2 === 0 ? 1 : -1) * 12;
                            
                            item.style.transform = `translate(${tx}px, ${ty}px) scale(${absorbScale}) rotate(${rotate}deg)`;
                            item.style.opacity = `${Math.max(0, 0.5 - eased)}`;
                            item.style.zIndex = '15';
                        }
                    }
                });

                // Card unificado começa a aparecer quando o último card está sendo absorvido
                const mergeAppearStart = PHASE1_END + ((CARD_COUNT - 1) * CARD_WINDOW);
                if (progress > mergeAppearStart) {
                    s8Merged.classList.add('active');
                } else {
                    s8Merged.classList.remove('active');
                }
                
                s8Completed = false;
            }

            // ── FASE 3: Card Unificado + Barra de Progresso (70% → 100%) ──
            else {
                const fillProgress = (progress - PHASE2_END) / (1 - PHASE2_END); // 0 → 1
                
                // Esconder todos os cards individuais
                s8Items.forEach(item => {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0) rotate(15deg)';
                });
                const dashTop = s8Dashboard.querySelector('.s8__dashboard-top');
                if (dashTop) dashTop.style.opacity = '0';
                s8Dashboard.style.opacity = '0';
                
                // Merged ativo
                s8Merged.classList.add('active');
                
                // Barra de progresso
                const barPercent = Math.min(fillProgress * 100, 100);
                if (s8MainFill) s8MainFill.style.width = `${barPercent}%`;
                if (s8MainGlow) s8MainGlow.style.width = `${barPercent}%`;
                
                // Contador numérico
                const currentMH = Math.round(fillProgress * TOTAL_MH);
                if (s8Counter) s8Counter.textContent = currentMH;
                
                // Porcentagem
                const percent = Math.round(fillProgress * 100);
                if (s8ProgressPercent) s8ProgressPercent.textContent = `${percent}%`;
                
                // Highlight list items progressivamente
                s8MergedListItems.forEach((item, i) => {
                    if (currentMH >= MH_CUMULATIVE[i]) {
                        item.classList.add('highlight');
                    } else {
                        item.classList.remove('highlight');
                    }
                });
                
                // Efeito de conclusão
                if (fillProgress >= 0.98 && !s8Completed) {
                    s8Completed = true;
                    if (s8Counter) s8Counter.classList.add('complete');
                    const mergedCard = document.querySelector('.s8__merged-card');
                    if (mergedCard) {
                        mergedCard.classList.remove('pulse');
                        void mergedCard.offsetWidth;
                        mergedCard.classList.add('pulse');
                    }
                }
                
                if (fillProgress < 0.98) {
                    s8Completed = false;
                    if (s8Counter) s8Counter.classList.remove('complete');
                }
            }
        };

        // Observer
        const s8Observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    window.addEventListener('scroll', handleS8Scroll);
                    handleS8Scroll();
                } else {
                    window.removeEventListener('scroll', handleS8Scroll);
                }
            });
        }, { threshold: 0 });

        s8Observer.observe(s8Section);
    }

    // ──────────────────────────────────────────────
    // 13. SEÇÃO 13 – A HIERARQUIA VIVA (Scroll Scrub)
    // ──────────────────────────────────────────────
    function initSection13() {
        const section = document.querySelector('.s13');
        const roleCards = document.querySelectorAll('.s13__role-card');
        const videos = section.querySelectorAll('video');
        if (!section || roleCards.length === 0) return;

        // Garante que as fichas de conteúdo estejam visíveis agora que é estático
        roleCards.forEach(card => {
            const reveal = card.querySelector('.s13__cards-reveal');
            if (reveal) {
                reveal.style.opacity = '1';
                reveal.style.transform = 'translateY(0)';
            }
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const inView = entry.isIntersecting;
                videos.forEach(video => {
                    if (inView) {
                        video.play().catch(() => {});
                    } else {
                        video.pause();
                    }
                });
            });
        }, { threshold: 0.1 });

        observer.observe(section);
    }

    initSection13();

    function initSection14() {
        const section = document.querySelector('.s14');
        const cards = document.querySelectorAll('.s14__item-card');
        const prevBtn = document.querySelector('.s14__nav--prev');
        const nextBtn = document.querySelector('.s14__nav--next');
        const dotsContainer = document.querySelector('.s14__dots');
        
        if (!section || cards.length === 0) return;

        let currentIndex = 0;

        // Criar dots
        cards.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.classList.add('s14__dot');
            if (idx === 0) dot.classList.add('is-active');
            dot.addEventListener('click', () => goToSlide(idx));
            dotsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.s14__dot');

        function updateCarousel() {
            cards.forEach((card, idx) => {
                card.classList.remove('is-active', 'is-next', 'is-prev');
                if (idx === currentIndex) {
                    card.classList.add('is-active');
                } else if (idx > currentIndex) {
                    card.classList.add('is-next');
                } else {
                    card.classList.add('is-prev');
                }
            });

            dots.forEach((dot, idx) => {
                dot.classList.toggle('is-active', idx === currentIndex);
            });
        }

        function goToSlide(index) {
            currentIndex = index;
            updateCarousel();
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % cards.length;
            updateCarousel();
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + cards.length) % cards.length;
            updateCarousel();
        }

        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);

        // Auto-play opcional ou Swipe?
        // Por enquanto apenas manual para foco na doutrina.
    }

    initSection14();

    function initSection15() {
        const section = document.querySelector('.s15');
        const pages = document.querySelectorAll('.s15__page');
        if (!section || pages.length === 0) return;

        const handleScroll = () => {
            const rect = section.getBoundingClientRect();
            const rawProgress = -rect.top / (rect.height - window.innerHeight);
            const scrollProgress = Math.max(0, Math.min(1, rawProgress / 0.85));
            
            // Se estiver no mobile, desativa a lógica de rotação (controlado via CSS stack)
            if (window.innerWidth <= 768) {
                pages.forEach(page => page.style.transform = '');
                return;
            }

            // Cada página vira em um intervalo específico do scroll total
            const numPages = pages.length;
            const step = 1 / numPages;

            pages.forEach((page, index) => {
                const start = index * step;
                const end = (index + 1) * step;
                
                let pageProgress = (scrollProgress - start) / (end - start);
                pageProgress = Math.max(0, Math.min(1, pageProgress));
                
                const rotation = pageProgress * -180;
                page.style.transform = `rotateY(${rotation}deg)`;
                
                // Ajusta o z-index dinamicamente para evitar clipping
                if (pageProgress > 0.5) {
                    page.style.zIndex = index;
                } else {
                    page.style.zIndex = numPages - index;
                }
            });

            // Centralização Dinâmica Inteligente
            // 0% (Capa Fechada): precisa estar centralizado (desloca -200px pois a espinha está no centro)
            // 50% (Livro Aberto): espinha no centro é o ideal (desloca 0px)
            // 100% (Contra-capa Fechada): precisa estar centralizado (desloca +200px)
            // Centralização por Estados (Snap)
            const book = section.querySelector('.s15__book');
            if (book) {
                let targetOffset = 0;
                if (scrollProgress < 0.05) {
                    targetOffset = -250; // Metade da nova largura (500/2) para centrar a capa
                } else if (scrollProgress > 0.95) {
                    targetOffset = 250; // Metade da nova largura para centrar a contra-capa
                } else {
                    targetOffset = 0; // Centra o livro aberto
                }
                
                // Usamos uma transição suave no CSS para esse movimento não ser brusco
                book.style.transform = `rotateX(10deg) translateX(${targetOffset}px)`;
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);
        handleScroll();
    }

    initSection15();

    /* ==========================================================================
       SEÇÃO 16: O ARSENAL (Lógica de Baú 3D e Cards)
       ========================================================================== */
    function initSection16() {
        const section = document.querySelector('.s16');
        if (!section) return;

        const cards = Array.from(section.querySelectorAll('.s16__item-card'));
        const nextBtn = section.querySelector('.s16__nav--next');
        const prevBtn = section.querySelector('.s16__nav--prev');
        const dotsContainer = section.querySelector('.s16__dots');
        
        let currentIndex = 0;
        let isChestOpen = false;

        // Criar dots
        cards.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('s16__dot');
            if (i === 0) dot.classList.add('is-active');
            dot.addEventListener('click', () => goToCard(i));
            dotsContainer.appendChild(dot);
        });

        const dots = section.querySelectorAll('.s16__dot');

        function updateCarousel() {
            cards.forEach((card, i) => {
                card.classList.remove('is-active', 'is-prev', 'is-next');
                dots[i].classList.remove('is-active');

                if (i === currentIndex) {
                    card.classList.add('is-active');
                    dots[i].classList.add('is-active');
                } else if (i < currentIndex) {
                    card.classList.add('is-prev');
                } else {
                    card.classList.add('is-next');
                }
            });
        }

        function goToCard(index) {
            if (index < 0) index = cards.length - 1;
            if (index >= cards.length) index = 0;
            currentIndex = index;
            updateCarousel();
        }

        nextBtn.addEventListener('click', () => goToCard(currentIndex + 1));
        prevBtn.addEventListener('click', () => goToCard(currentIndex - 1));

        // Swipe support
        let touchStartX = 0;
        section.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        section.addEventListener('touchend', e => {
            const touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) goToCard(currentIndex + 1);
            if (touchEndX - touchStartX > 50) goToCard(currentIndex - 1);
        }, { passive: true });

        const handleScroll = () => {
            const rect = section.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            // O baú abre quando o topo da seção chega perto do centro da tela
            const triggerPoint = viewportHeight * 0.7;
            const progress = Math.min(Math.max((triggerPoint - rect.top) / 400, 0), 1);
            
            section.style.setProperty('--chest-open', progress);
            
            if (progress > 0.5 && !isChestOpen) {
                isChestOpen = true;
                updateCarousel();
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();
    }

    initSection16();

    /* ==========================================================================
       SEÇÃO 18: A TRAVESSIA (Timeline Horizontal Sticky)
       ========================================================================== */


    /* ==========================================================================
       SEÇÃO 19: FAQ (Accordion Logic)
       ========================================================================== */
    function initSection19() {
        const faqItems = document.querySelectorAll('.s19__faq-item');

        faqItems.forEach(item => {
            const trigger = item.querySelector('.s19__faq-trigger');
            
            trigger.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Fecha todos os outros itens (opcional, para efeito accordion clássico)
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                });

                // Se não estava ativo, abre o atual
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }

    initSection19();

});

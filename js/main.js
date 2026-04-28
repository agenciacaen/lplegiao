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
    // 5. Hero Scroll Sequence
    //    Otimizado para scrub suave com fastSeek,
    //    lerp lento e throttle de seeks.
    // ──────────────────────────────────────────────
    const heroVideo = document.querySelector('.hero__bg video');
    const heroSection = document.getElementById('hero');
    const stageIntro = document.getElementById('stage-intro');
    const stagePhrase = document.getElementById('stage-phrase');
    const stageFull = document.getElementById('stage-full');
    const heroOverlay = document.querySelector('.hero__overlay');
    const bgGrid = document.querySelector('.bg-grid');

    if (heroVideo && heroSection && stageIntro && stagePhrase && stageFull) {
        heroVideo.pause();

        // Cache de dimensões
        let heroTop = 0;
        let scrollableHeight = 0;
        let heroInView = false;

        // Stage management
        let currentStage = 'intro';
        const setStage = (name) => {
            if (currentStage === name) return;
            currentStage = name;
            stageIntro.classList.toggle('active', name === 'intro');
            stagePhrase.classList.toggle('active', name === 'phrase');
            stageFull.classList.toggle('active', name === 'full');
        };

        // Video scrub state
        let videoReady = false;
        let videoDuration = 0;
        let lerpTime = 0;
        let lastSeekTime = 0;
        const SEEK_THRESHOLD = 0.04;
        const SEEK_THROTTLE = 16;

        const initVideo = () => {
            videoDuration = heroVideo.duration;
            if (!videoDuration || !isFinite(videoDuration)) return;
            videoReady = true;
        };

        if (heroVideo.readyState >= 1) {
            initVideo();
        } else {
            heroVideo.addEventListener('loadedmetadata', initVideo);
        }

        const seekVideo = (time) => {
            const now = performance.now();
            if (now - lastSeekTime < SEEK_THROTTLE) return;
            lastSeekTime = now;
            if (typeof heroVideo.fastSeek === 'function') {
                heroVideo.fastSeek(time);
            } else {
                heroVideo.currentTime = time;
            }
        };

        const recalcHero = () => {
            heroTop = heroSection.offsetTop;
            const heroHeight = heroSection.offsetHeight;
            scrollableHeight = heroHeight - window.innerHeight;
            if (scrollableHeight <= 0) scrollableHeight = 1;
        };

        // Loop principal de animação
        const animate = () => {
            if (!heroInView) return;

            const scrolled = window.scrollY - heroTop;
            const progress = Math.min(Math.max(scrolled / scrollableHeight, 0), 1);

            // --- Stage Management ---
            let showOverlay = false;

            if (progress < 0.12) {
                setStage('intro');
                showOverlay = true;
            } else if (progress < 0.50) {
                setStage('none');
                showOverlay = false;
            } else if (progress < 0.68) {
                setStage('phrase');
                showOverlay = false;
            } else {
                setStage('full');
                showOverlay = true;
            }

            if (heroOverlay) heroOverlay.style.opacity = showOverlay ? '1' : '0';
            if (bgGrid) bgGrid.style.opacity = showOverlay ? '1' : '0';

            // --- Video Scrub ---
            if (videoReady) {
                const videoProgress = Math.min(Math.max((progress - 0.05) / 0.85, 0), 1);
                const targetTime = videoProgress * videoDuration;

                const MAX_SPEED = 0.035;
                let delta = (targetTime - lerpTime) * 0.04;
                delta = Math.max(Math.min(delta, MAX_SPEED), -MAX_SPEED);
                
                if (Math.abs(delta) > 0.0001) {
                    lerpTime += delta;
                } else {
                    lerpTime = targetTime;
                }

                if (Math.abs(heroVideo.currentTime - lerpTime) > SEEK_THRESHOLD) {
                    seekVideo(lerpTime);
                }
            }

            requestAnimationFrame(animate);
        };

        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                heroInView = entry.isIntersecting;
                if (heroInView) requestAnimationFrame(animate);
            });
        }, { threshold: 0.01 });

        heroObserver.observe(heroSection);
        window.addEventListener('resize', recalcHero);
        recalcHero();
    }

    // ──────────────────────────────────────────────
    // 6. Seção 2 – Scroll-Driven Text Panels
    //    O scroll vertical controla o translateX
    //    dos painéis horizontalmente
    // ──────────────────────────────────────────────
    const s2Section = document.getElementById('antes-de-tudo');
    const s2Track = document.getElementById('s2Track');
    const s2Panels = document.querySelectorAll('.s2__panel');
    const TOTAL_PANELS = s2Panels.length; // 8 (0-7)

    const isDesktopS2 = () => window.innerWidth > 768;

    if (s2Section && s2Track && TOTAL_PANELS > 0 && isDesktopS2()) {

        let s2Top = s2Section.offsetTop;
        let s2Height = s2Section.offsetHeight;
        let s2Scrollable = 0;
        let s2InView = false;
        let currentTranslate = 0;
        let currentActivePanel = -1;
        const S2_LERP = 0.12;

        const recalcS2 = () => {
            s2Top = s2Section.offsetTop;
            s2Height = s2Section.offsetHeight;
            s2Scrollable = s2Height - window.innerHeight;
            if (s2Scrollable <= 0) s2Scrollable = 1;
        };

        const animateS2 = () => {
            if (!s2InView || !isDesktopS2()) return;

            const scrolled = window.scrollY - s2Top;
            const progress = Math.min(Math.max(scrolled / s2Scrollable, 0), 1);

            const maxTranslate = (TOTAL_PANELS - 1) * window.innerWidth;
            const targetTranslate = progress * maxTranslate;

            const diff = targetTranslate - currentTranslate;
            if (Math.abs(diff) > 0.1) {
                currentTranslate += diff * S2_LERP;
            } else {
                currentTranslate = targetTranslate;
            }

            s2Track.style.transform = `translate3d(${-currentTranslate}px, 0, 0)`;

            const progressBar = document.getElementById('s2ProgressBar');
            if (progressBar) progressBar.style.width = `${progress * 100}%`;

            const activeIndex = Math.min(Math.round(progress * (TOTAL_PANELS - 1)), TOTAL_PANELS - 1);

            if (activeIndex !== currentActivePanel) {
                s2Panels.forEach((panel, i) => {
                    panel.classList.toggle('active', i === activeIndex);
                });
                currentActivePanel = activeIndex;
            }

            requestAnimationFrame(animateS2);
        };

        const s2Observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                s2InView = entry.isIntersecting;
                if (s2InView && isDesktopS2()) requestAnimationFrame(animateS2);
            });
        }, { threshold: 0.01 });

        s2Observer.observe(s2Section);
        window.addEventListener('resize', recalcS2);
        recalcS2();

    } else if (s2Panels.length > 0 && !isDesktopS2()) {
        // Mobile: mostra todos os painéis
        s2Panels.forEach(p => p.classList.add('active'));
    }

    // ──────────────────────────────────────────────
    // 7. SEÇÃO 3 – O QUE É A LEGIÃO (Zoom & Reveal)
    // ──────────────────────────────────────────────
    const s3Section = document.getElementById('o-que-e-a-legiao');
    const s3ZoomLayer = document.getElementById('s3ZoomLayer');
    const s3ContentLayer = document.getElementById('s3ContentLayer');
    const s3ZoomTarget = document.querySelector('.s3__zoom-target');

    if (s3Section && s3ZoomLayer && s3ContentLayer && s3ZoomTarget) {
        
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
            if (!s3InView || !isDesktopS3()) return;

            const scrolled = window.scrollY - s3Top;
            const targetProgress = Math.min(Math.max(scrolled / s3Scrollable, 0), 1);
            
            const diff = targetProgress - s3CurrentProgress;
            if (Math.abs(diff) > 0.0001) {
                s3CurrentProgress += diff * S3_LERP;
            } else {
                s3CurrentProgress = targetProgress;
            }

            const zoomProgress = Math.min(s3CurrentProgress / 0.75, 1);
            
            // Curva de zoom mais suave
            const scale = 1 + (Math.pow(zoomProgress, 3) * MAX_SCALE);
            
            // Fade out mais gradual
            const zoomOpacity = zoomProgress < 0.3 ? 1 : 1 - ((zoomProgress - 0.3) / 0.5);
            
            // Aplicar transformações
            s3ZoomLayer.style.transform = `translate3d(0,0,0) scale3d(${scale}, ${scale}, 1) rotate(0.01deg)`;
            s3ZoomLayer.style.opacity = Math.max(zoomOpacity, 0);
            
            // Fase 2: Revelação do Conteúdo (Inicia em 65%)
            if (s3CurrentProgress > 0.62) {
                s3ContentLayer.classList.add('active');
                s3ContentLayer.style.pointerEvents = 'auto';
            } else {
                s3ContentLayer.classList.remove('active');
                s3ContentLayer.style.pointerEvents = 'none';
            }

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
                if (s3InView && isDesktopS3()) {
                    requestAnimationFrame(animateS3);
                }
            });
        }, { threshold: 0.01 });

        observer.observe(s3Section);

        window.addEventListener('resize', recalcS3);
        
        document.fonts.ready.then(() => {
            recalcS3();
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
    // 13. SEÇÃO 13 – A HIERARQUIA VIVA (Scrub & Reveal)
    // ──────────────────────────────────────────────
    function initSection13() {
        const roleSections = document.querySelectorAll('.s13__role-sticky');
        if (roleSections.length === 0) return;

        roleSections.forEach(section => {
            const videos = section.querySelectorAll('video');
            const cards = section.querySelectorAll('.s13__reveal-card');
            const mainOverlay = section.querySelector('.s13__overlay--main');

            let sectionTop = 0;
            let sectionHeight = 0;
            let sectionInView = false;
            let lerpProgress = 0;
            let targetProgress = 0;
            const LERP_FACTOR = 0.05; // Mais suave para evitar a sensação de "rápido demais"

            const recalc = () => {
                // Pega a posição absoluta no documento, não apenas relativa ao pai
                const rect = section.getBoundingClientRect();
                sectionTop = rect.top + window.scrollY;
                sectionHeight = section.offsetHeight;
                
                // Inicializa o progresso no valor atual para evitar pulos ao carregar/redimensionar
                const scrolled = window.scrollY - sectionTop;
                const viewHeight = window.innerHeight;
                const scrollable = sectionHeight - viewHeight;
                lerpProgress = Math.max(0, Math.min(1, scrolled / (scrollable > 0 ? scrollable : 1)));
            };

            const animate = () => {
                if (!sectionInView) return;

                const scrolled = window.scrollY - sectionTop;
                const viewHeight = window.innerHeight;
                const scrollable = sectionHeight - viewHeight;
                
                targetProgress = Math.max(0, Math.min(1, scrolled / (scrollable > 0 ? scrollable : 1)));

                // Lerp para suavizar o progresso
                const diff = targetProgress - lerpProgress;
                if (Math.abs(diff) > 0.0001) {
                    lerpProgress += diff * LERP_FACTOR;
                } else {
                    lerpProgress = targetProgress;
                }

                // Controle dos Vídeos (Scrubbing Suave)
                videos.forEach(video => {
                    if (video.duration && !isNaN(video.duration)) {
                        const safeDuration = video.duration - 0.05;
                        const targetTime = lerpProgress * safeDuration;
                        
                        if (Math.abs(video.currentTime - targetTime) > 0.01) {
                            video.currentTime = targetTime;
                        }
                    }
                });

                // Controle do Overlay
                if (mainOverlay) {
                    const overlayOpacity = 0.3 + (lerpProgress * 0.45);
                    mainOverlay.style.opacity = overlayOpacity;
                }

                // Revelação dos Cards
                cards.forEach(card => {
                    const threshold = parseFloat(card.dataset.reveal);
                    if (lerpProgress >= threshold) {
                        card.classList.add('active');
                    } else {
                        card.classList.remove('active');
                    }
                });

                // Role Info em evidência
                if (lerpProgress > 0.01 && lerpProgress < 0.99) {
                    section.classList.add('in-view');
                } else {
                    section.classList.remove('in-view');
                }

                requestAnimationFrame(animate);
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    sectionInView = entry.isIntersecting;
                    if (sectionInView) {
                        recalc(); // Recalcula ao entrar para garantir precisão
                        requestAnimationFrame(animate);
                    }
                });
            }, { threshold: 0.01 });

            observer.observe(section);
            window.addEventListener('resize', recalc);
            window.addEventListener('load', recalc);
            recalc();
        });
    }

    initSection13();

    function initSection14() {
        const section = document.querySelector('.s14');
        const track = document.querySelector('.s14__track');
        if (!section || !track) return;

        let sectionTop = 0;
        let sectionHeight = 0;
        let windowHeight = window.innerHeight;
        let targetX = 0;
        let currentX = 0;
        let sectionInView = false;

        const recalc = () => {
            const rect = section.getBoundingClientRect();
            sectionTop = rect.top + window.scrollY;
            sectionHeight = rect.height;
            windowHeight = window.innerHeight;
        };

        const animate = () => {
            if (!sectionInView && Math.abs(targetX - currentX) < 0.1) return;

            const scrollY = window.scrollY;
            const relativeScroll = scrollY - sectionTop;
            const scrollRange = sectionHeight - windowHeight;
            
            // Calcula o progresso (0 a 1)
            let progress = Math.max(0, Math.min(1, relativeScroll / scrollRange));
            
            // Calcula o deslocamento máximo do track
            const trackWidth = track.offsetWidth;
            const maxDelta = trackWidth - window.innerWidth;
            
            targetX = progress * maxDelta * -1;

            // Lerp para suavidade (Fator 0.07 para horizontal scroll cinematográfico)
            currentX += (targetX - currentX) * 0.07;

            track.style.transform = `translate3d(${currentX}px, 0, 0)`;

            if (sectionInView || Math.abs(targetX - currentX) > 0.1) {
                requestAnimationFrame(animate);
            }
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                sectionInView = entry.isIntersecting;
                if (sectionInView) {
                    recalc();
                    requestAnimationFrame(animate);
                }
            });
        }, { threshold: 0.01 });

        observer.observe(section);
        window.addEventListener('resize', recalc);
        window.addEventListener('load', recalc);
        recalc();
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
        let lastProgress = -1;
        
        const handleScroll = () => {
            const rect = section.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const totalScrollable = section.offsetHeight - viewportHeight;
            
            let progress = -rect.top / totalScrollable;
            progress = Math.min(Math.max(progress, 0), 1);

            if (progress === lastProgress) return;
            lastProgress = progress;

            // 1. Sincronizar abertura do baú (0 a 15% do scroll)
            const animProgress = Math.min(progress / 0.15, 1);
            section.style.setProperty('--chest-open', animProgress);

            // 2. Animação dos Cards (Saindo do Baú)
            // Cards saem entre 15% e 80% do scroll total para garantir que o último complete o voo
            cards.forEach((card, index) => {
                card.style.setProperty('--card-index', index);
                
                // Espaçamento entre cards (0.15 a 0.90)
                const cardStart = 0.15 + (index * (0.75 / cards.length));
                
                if (progress > cardStart) {
                    card.classList.add('is-active');
                } else {
                    card.classList.remove('is-active');
                }
            });
        };

        // Intersection Observer para ligar/desligar o listener de scroll (Performance)
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    window.addEventListener('scroll', handleScroll);
                    handleScroll();
                } else {
                    window.removeEventListener('scroll', handleScroll);
                }
            });
        }, { threshold: 0.01 });

        observer.observe(section);
        window.addEventListener('resize', handleScroll);
    }

    initSection16();

    /* ==========================================================================
       SEÇÃO 18: A TRAVESSIA (Timeline Horizontal Sticky)
       ========================================================================== */
    function initSection18() {
        const section = document.querySelector('.s18');
        const timeline = document.querySelector('.s18__timeline');
        const milestones = document.querySelectorAll('.s18__milestone');
        if (!section || !timeline) return;

        let sectionTop = 0;
        let sectionHeight = 0;
        let targetX = 0;
        let currentX = 0;
        let sectionInView = false;
        const LERP_FACTOR = 0.08;

        const recalc = () => {
            const rect = section.getBoundingClientRect();
            sectionTop = rect.top + window.scrollY;
            sectionHeight = rect.height;
        };

        const animate = () => {
            if (!sectionInView && Math.abs(targetX - currentX) < 0.1) return;

            const scrolled = window.scrollY - sectionTop;
            const scrollableHeight = sectionHeight - window.innerHeight;
            let progress = Math.max(0, Math.min(1, scrolled / (scrollableHeight > 0 ? scrollableHeight : 1)));

            // Deslocamento horizontal: o quanto a timeline precisa andar para mostrar o fim
            const timelineWidth = timeline.scrollWidth;
            const windowWidth = window.innerWidth;
            const maxDelta = Math.max(0, timelineWidth - windowWidth);
            
            targetX = progress * maxDelta * -1;

            // Suavização (Lerp) - Fator ligeiramente menor para mais inércia
            currentX += (targetX - currentX) * 0.06;

            timeline.style.transform = `translate3d(${currentX}px, 0, 0)`;

            // Destaque do Milestone ativo (quando o ponto central cruza a maior parte da tela)
            milestones.forEach(m => {
                const mRect = m.getBoundingClientRect();
                const mCenter = mRect.left + (mRect.width / 2);
                // Faixa de ativação mais ampla (10% a 90% da tela)
                if (mCenter < windowWidth * 0.9 && mCenter > windowWidth * 0.1) {
                    m.classList.add('in-view');
                } else {
                    m.classList.remove('in-view');
                }
            });

            if (sectionInView || Math.abs(targetX - currentX) > 0.1) {
                requestAnimationFrame(animate);
            }
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                sectionInView = entry.isIntersecting;
                if (sectionInView) {
                    recalc();
                    requestAnimationFrame(animate);
                }
            });
        }, { threshold: 0.01 });

        observer.observe(section);
        window.addEventListener('resize', recalc);
        window.addEventListener('load', recalc);
        recalc();
    }

    initSection18();

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

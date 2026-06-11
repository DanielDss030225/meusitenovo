document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. STICKY HEADER & MOBILE NAVIGATION
       ========================================================================== */
    const header = document.getElementById('header');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle sticky header on scroll
    const handleScrollHeader = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScrollHeader);
    handleScrollHeader(); // Run on load in case page was refreshed halfway down

    // Mobile Menu Toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            header.classList.toggle('nav-open');
            
            // Toggle aria-label for accessibility
            const isOpen = navMenu.classList.contains('open');
            navToggle.setAttribute('aria-label', isOpen ? 'Fechar Menu' : 'Abrir Menu');
        });
    }

    // Close Mobile Menu on Link Click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                header.classList.remove('nav-open');
                navToggle.setAttribute('aria-label', 'Abrir Menu');
            }
        });
    });

    /* ==========================================================================
       2. SMOOTH SCROLL NAVIGATION WITH OFFSET
       ========================================================================== */
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = targetPosition - (headerHeight - 10); // Subtle padding offset

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    /* ==========================================================================
       3. ACTIVE LINK HIGHLIGHT ON SCROLL (Intersection Observer)
       ========================================================================== */
    const sections = document.querySelectorAll('section[id]');
    
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px', // Triggers when section occupies central screen area
        threshold: 0
    };

    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(section => observer.observe(section));

    /* ==========================================================================
       4. SCROLL REVEAL ANIMATIONS
       ========================================================================== */
    // Add scroll reveal classes dynamically to elements for a clean HTML
    const elementsToReveal = [
        '.section-header',
        '.about-text-content',
        '.stats-card',
        '.service-card',
        '.team-card',
        '.testimonials-slider-container',
        '.contact-info-panel',
        '.contact-form-panel'
    ];

    elementsToReveal.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.classList.add('reveal');
        });
    });

    const revealObserverOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Reveal slightly before entering view
    };

    const revealObserverCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Animate only once
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealObserverCallback, revealObserverOptions);
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    /* ==========================================================================
       5. COUNTER ANIMATION FOR STATS (About Section)
       ========================================================================== */
    const statsSection = document.querySelector('.about-section');
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersStarted = false;

    const startCounters = () => {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'), 10);
            let current = 0;
            const duration = 2000; // 2 seconds
            const stepTime = Math.max(Math.floor(duration / target), 15);
            
            const counterInterval = setInterval(() => {
                current += Math.ceil(target / (duration / stepTime));
                if (current >= target) {
                    current = target;
                    clearInterval(counterInterval);
                }
                
                // Formatter for specific stats
                if (stat.getAttribute('data-target') === '98') {
                    stat.textContent = `${current}%`;
                } else if (stat.getAttribute('data-target') === '24') {
                    stat.textContent = `${current}/7`;
                } else if (stat.getAttribute('data-target') === '500') {
                    stat.textContent = `${current}+`;
                } else {
                    stat.textContent = `${current}+`;
                }
            }, stepTime);
        });
    };

    const statsObserverOptions = {
        root: null,
        threshold: 0.3
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersStarted) {
                countersStarted = true;
                startCounters();
                statsObserver.unobserve(entry.target);
            }
        });
    }, statsObserverOptions);

    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    /* ==========================================================================
       6. TESTIMONIALS SLIDER / CAROUSEL
       ========================================================================== */
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');
    let currentSlide = 0;
    let autoPlayTimer;

    const showSlide = (index) => {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Wrap-around boundary conditions
        if (index >= slides.length) currentSlide = 0;
        else if (index < 0) currentSlide = slides.length - 1;
        else currentSlide = index;

        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    };

    const nextSlide = () => showSlide(currentSlide + 1);
    const prevSlide = () => showSlide(currentSlide - 1);

    const resetAutoplay = () => {
        clearInterval(autoPlayTimer);
        autoPlayTimer = setInterval(nextSlide, 7000); // Rotate every 7 seconds
    };

    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoplay();
        });
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoplay();
        });
    }

    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'), 10);
            showSlide(index);
            resetAutoplay();
        });
    });

    // Initialize Autoplay for testimonials
    if (slides.length > 0) {
        resetAutoplay();
    }

    /* ==========================================================================
       7. CONTACT FORM VALIDATION & SUBMISSION SIMULATION
       ========================================================================== */
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('formSubmitBtn');
    const submitText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
    const loader = submitBtn ? submitBtn.querySelector('.btn-loader') : null;
    const alertBox = document.getElementById('formAlert');

    // Real-time error removal on input
    const formInputs = form ? form.querySelectorAll('input, select, textarea') : [];
    formInputs.forEach(input => {
        input.addEventListener('input', () => {
            const formGroup = input.closest('.form-group');
            if (formGroup && formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid');
            }
        });
    });

    const validateForm = () => {
        let isValid = true;

        // Check each input
        formInputs.forEach(input => {
            const formGroup = input.closest('.form-group');
            if (!formGroup) return;

            // Basic check for required field
            if (input.hasAttribute('required') && !input.value.trim()) {
                formGroup.classList.add('invalid');
                isValid = false;
            } else if (input.type === 'email') {
                // Email format check
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(input.value)) {
                    formGroup.classList.add('invalid');
                    isValid = false;
                }
            } else {
                formGroup.classList.remove('invalid');
            }
        });

        return isValid;
    };

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Validate all fields
            if (!validateForm()) {
                return;
            }

            // Simulate form submission
            if (submitBtn && loader && submitText && alertBox) {
                // Lock form and show loader
                submitBtn.disabled = true;
                submitText.textContent = 'Enviando...';
                loader.classList.remove('hidden');
                
                setTimeout(() => {
                    // Reset form and show success message
                    form.reset();
                    submitBtn.disabled = false;
                    submitText.textContent = 'Enviar Mensagem';
                    loader.classList.add('hidden');
                    
                    alertBox.classList.remove('hidden');
                    
                    // Hide success alert after 5 seconds
                    setTimeout(() => {
                        alertBox.classList.add('hidden');
                    }, 6000);
                }, 2000); // 2 second simulation
            }
        });
    }

});

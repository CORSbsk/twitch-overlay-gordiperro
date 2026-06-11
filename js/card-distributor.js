// Módulo de distribución de cartas a laterales - Distribución aleatoria dispersa

const cardDistributor = {
    leftSide: null,
    rightSide: null,
    gordiperroImage: 'resources/gordiperro.png',
    cardWidth: 80,
    cardHeight: 100,
    verticalOffset: 12, // px between cards in a stack
    stacksLeft: [],
    stacksRight: [],
    
    // Inicializar
    init() {
        this.leftSide = document.getElementById('left-side');
        this.rightSide = document.getElementById('right-side');
        console.log('CardDistributor inicializado con distribución aleatoria');
        // Reconstruir pilas al cambiar el tamaño de ventana (debounced)
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                try {
                    const total = storage.loadCount ? storage.loadCount() : 0;
                    this.rebuildStacks(total);
                } catch (e) {
                    console.warn('Error al reconstruir pilas en resize:', e);
                }
            }, 200);
        });
    },
    
    // Distribuir cartas aleatoriamente en los laterales
    distributeCards(count) {
        console.log(`Reconstruyendo distribución para ${count} gordiperros`);
        // Rebuild stacks and populate without animation
        this.clearSides();
        this.rebuildStacks(count);
    },
    
    // Distribuir cartas a un lado con posiciones aleatorias
    distributeToSide(container, count, side) {
        // Not used in stack mode; kept for compatibility
        console.warn('distributeToSide deprecated in stack mode');
    },

    // Rebuild stacks based on total count
    rebuildStacks(totalCount) {
        // compute counts per side
        const leftCount = Math.ceil(totalCount / 2);
        const rightCount = totalCount - leftCount;

        // prepare container dims
        const containerHeight = window.innerHeight;
        const maxPerStack = Math.max(1, Math.floor(containerHeight / this.verticalOffset));

        // build stacks for left
        this.stacksLeft = [];
        let remaining = leftCount;
        while (remaining > 0) {
            const take = Math.min(remaining, maxPerStack);
            this.stacksLeft.push(take);
            remaining -= take;
        }

        // build stacks for right
        this.stacksRight = [];
        remaining = rightCount;
        while (remaining > 0) {
            const take = Math.min(remaining, maxPerStack);
            this.stacksRight.push(take);
            remaining -= take;
        }

        // create stack DOM containers
        this.createStackContainers();

        // populate stacks with static cards
        this.populateStacksStatic();
    },

    createStackContainers() {
        // side container widths
        const leftWidth = this.leftSide.clientWidth || window.innerWidth * 0.3;
        const stackSpacing = Math.max(10, Math.floor(this.cardWidth * 0.6));

        // create left stacks
        this.leftSide.innerHTML = '';
        this.stacksLeft.forEach((count, idx) => {
            const stack = document.createElement('div');
            stack.className = 'gordiperro-stack';
            stack.style.position = 'absolute';
            stack.style.width = this.cardWidth + 'px';
            stack.style.height = '100%';
            stack.style.left = (10 + idx * (stackSpacing)) + 'px';
            stack.style.bottom = '0px';
            stack.dataset.count = count;
            this.leftSide.appendChild(stack);
        });

        // create right stacks (from right edge inward)
        this.rightSide.innerHTML = '';
        this.stacksRight.forEach((count, idx) => {
            const stack = document.createElement('div');
            stack.className = 'gordiperro-stack';
            stack.style.position = 'absolute';
            stack.style.width = this.cardWidth + 'px';
            stack.style.height = '100%';
            stack.style.right = (10 + idx * (stackSpacing)) + 'px';
            stack.style.bottom = '0px';
            stack.dataset.count = count;
            this.rightSide.appendChild(stack);
        });
    },

    populateStacksStatic() {
        // fill left stacks
        const leftStacks = Array.from(this.leftSide.querySelectorAll('.gordiperro-stack'));
        leftStacks.forEach((stackEl) => {
            const count = parseInt(stackEl.dataset.count, 10) || 0;
            for (let i = 0; i < count; i++) {
                const card = this.createCardElement();
                // position from bottom
                const bottomOffset = i * this.verticalOffset;
                card.style.position = 'absolute';
                card.style.bottom = bottomOffset + 'px';
                card.style.left = '0px';
                stackEl.appendChild(card);
            }
        });

        // fill right stacks
        const rightStacks = Array.from(this.rightSide.querySelectorAll('.gordiperro-stack'));
        rightStacks.forEach((stackEl) => {
            const count = parseInt(stackEl.dataset.count, 10) || 0;
            for (let i = 0; i < count; i++) {
                const card = this.createCardElement();
                const bottomOffset = i * this.verticalOffset;
                card.style.position = 'absolute';
                card.style.bottom = bottomOffset + 'px';
                card.style.left = '0px';
                stackEl.appendChild(card);
            }
        });
    },

    createCardElement() {
        const card = document.createElement('div');
        card.className = 'gordiperro-card';
        card.style.width = this.cardWidth + 'px';
        card.style.height = this.cardHeight + 'px';
        card.style.backgroundImage = `url('${this.gordiperroImage}')`;
        card.style.backgroundSize = 'contain';
        card.style.backgroundRepeat = 'no-repeat';
        card.style.backgroundPosition = 'center';
        card.style.border = 'none';
        card.style.boxShadow = 'none';
        card.style.margin = '0';
        card.style.padding = '0';
        return card;
    },

    // Add a single card with animation from center to appropriate stack
    addCardAnimated() {
        return new Promise((resolve) => {
        // Determine total counts currently
        const totalLeft = Array.from(this.leftSide.querySelectorAll('.gordiperro-stack')).reduce((acc, s) => acc + s.children.length, 0);
        const totalRight = Array.from(this.rightSide.querySelectorAll('.gordiperro-stack')).reduce((acc, s) => acc + s.children.length, 0);
        const targetSide = (totalLeft <= totalRight) ? 'left' : 'right';

        const stacks = targetSide === 'left' ? Array.from(this.leftSide.querySelectorAll('.gordiperro-stack')) : Array.from(this.rightSide.querySelectorAll('.gordiperro-stack'));
        let targetStack = stacks[stacks.length - 1];
        const maxPerStack = Math.max(1, Math.floor(window.innerHeight / this.verticalOffset));

        // If no stacks exist or last stack is full, create a new stack
        if (!targetStack || targetStack.children.length >= maxPerStack) {
            // create new stack
            const idx = stacks.length;
            const stack = document.createElement('div');
            stack.className = 'gordiperro-stack';
            stack.style.position = 'absolute';
            stack.style.width = this.cardWidth + 'px';
            stack.style.height = '100%';
            const stackSpacing = Math.max(10, Math.floor(this.cardWidth * 0.6));
            if (targetSide === 'left') {
                stack.style.left = (10 + idx * stackSpacing) + 'px';
                this.leftSide.appendChild(stack);
            } else {
                stack.style.right = (10 + idx * stackSpacing) + 'px';
                this.rightSide.appendChild(stack);
            }
            targetStack = stack;
        }

        const indexInStack = targetStack.children.length;
        const bottomOffset = indexInStack * this.verticalOffset;

        // Create animated card at center (fixed)
        const centralImage = document.getElementById('central-image');
        const cRect = centralImage.getBoundingClientRect();

        const temp = document.createElement('div');
        temp.className = 'gordiperro-card';
        temp.style.position = 'fixed';
        temp.style.width = this.cardWidth + 'px';
        temp.style.height = this.cardHeight + 'px';
        temp.style.left = (cRect.left + (cRect.width - this.cardWidth) / 2) + 'px';
        temp.style.top = (cRect.top + (cRect.height - this.cardHeight) / 2) + 'px';
        temp.style.backgroundImage = `url('${this.gordiperroImage}')`;
        temp.style.backgroundSize = 'contain';
        temp.style.backgroundRepeat = 'no-repeat';
        temp.style.backgroundPosition = 'center';
        temp.style.transition = 'all 0.8s ease-in-out';
        temp.style.zIndex = 2000;
        document.body.appendChild(temp);

        // compute target absolute position
        const stackRect = targetStack.getBoundingClientRect();
        const targetLeft = stackRect.left + 0; // align left
        const targetTop = stackRect.bottom - bottomOffset - this.cardHeight;

        // trigger reflow then move
        requestAnimationFrame(() => {
            temp.style.left = targetLeft + 'px';
            temp.style.top = targetTop + 'px';
            temp.style.transform = `rotate(${(Math.random()-0.5)*6}deg)`;
        });

        let resolved = false;
        const finish = () => {
            if (resolved) return;
            resolved = true;
            temp.remove();
            const card = this.createCardElement();
            card.style.position = 'absolute';
            card.style.bottom = bottomOffset + 'px';
            card.style.left = '0px';
            targetStack.appendChild(card);
            resolve();
        };

        temp.addEventListener('transitionend', () => {
            finish();
        }, { once: true });

        // Fallback if transitionend doesn't fire
        setTimeout(() => {
            finish();
        }, 1200);
        
    });
    },
    
    // Aplicar animaciones aleatorias a todas las cartas
    applyRandomAnimations() {
        const allCards = document.querySelectorAll('.gordiperro-card-random');
        
        allCards.forEach((card, index) => {
            // Delay aleatorio para cada carta
            const randomDelay = Math.random() * 800; // 0 a 800ms
            
            setTimeout(() => {
                card.style.animation = `cardFadeInRandom 0.6s ease-out forwards`;
                card.style.opacity = '1';
            }, randomDelay);
        });
    },
    
    // Limpiar laterales
    clearSides() {
        if (this.leftSide) {
            this.leftSide.innerHTML = '';
        }
        if (this.rightSide) {
            this.rightSide.innerHTML = '';
        }
    },
    
    // Obtener número total de cartas
    getTotalCards() {
        const leftCards = this.leftSide ? this.leftSide.querySelectorAll('.gordiperro-card-random').length : 0;
        const rightCards = this.rightSide ? this.rightSide.querySelectorAll('.gordiperro-card-random').length : 0;
        return leftCards + rightCards;
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = cardDistributor;
}

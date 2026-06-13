// Módulo de distribución de cartas a laterales

const cardDistributor = {
    leftSide: null,
    rightSide: null,
    gordiperroImage: 'resources/gordiperro.png',
    leftStacks: [],
    rightStacks: [],
    cardWidth: 80,
    cardHeight: 100,

    // Distancia vertical entre cartas en una pila (con algo de aleatoriedad)
    minOffset: 14,
    maxOffset: 26,

    stackSpacing: 18,
    sidePadding: 20,
    sideHeight: 0,

    // Inicializar
    init() {
        this.leftSide = document.getElementById('left-side');
        this.rightSide = document.getElementById('right-side');
        this.updateSideHeight();
        window.addEventListener('resize', () => this.updateSideHeight());
        if (typeof config !== 'undefined' && typeof this.applyConfig === 'function') {
            this.applyConfig();
        }
        console.log('CardDistributor inicializado');
    },

    updateSideHeight() {
        this.sideHeight = this.leftSide ? this.leftSide.clientHeight : window.innerHeight;
    },

    // Distribuir cartas a laterales
    distributeCards(count) {
        console.log(`Distribuyendo ${count} cartas de gordiperro`);

        this.clearSides();
        this.updateSideHeight();

        for (let i = 0; i < count; i++) {
            const side = i % 2 === 0 ? 'left' : 'right';
            this.addCardToSide(side);
        }
    },

    addCardToSide(side) {
        const sideStacks = side === 'left' ? this.leftStacks : this.rightStacks;
        const stack = this.getActiveStack(side, sideStacks);
        this.appendCardToStack(stack);
    },

    getActiveStack(side, stacks) {
        if (stacks.length === 0) {
            return this.createStack(side, 0);
        }

        const currentStack = stacks[stacks.length - 1];
        if (this.willOverflow(currentStack)) {
            return this.createStack(side, stacks.length);
        }

        return currentStack;
    },

    willOverflow(stack) {
        const projectedHeight = this.cardHeight + stack.cardCount * this.maxOffset;
        return projectedHeight + this.sidePadding > this.sideHeight;
    },

    createStack(side, index) {
        const stack = document.createElement('div');
        stack.className = 'pile-stack';
        stack.style.position = 'absolute';
        stack.style.bottom = '20px';
        stack.style.width = `${this.cardWidth}px`;
        stack.style.height = 'calc(100% - 20px)';
        stack.style.pointerEvents = 'none';

        const offset = index * this.stackSpacing + (Math.random() * 8 - 4);
        if (side === 'left') {
            stack.style.left = `${Math.max(10, offset)}px`;
        } else {
            stack.style.right = `${Math.max(10, offset)}px`;
        }

        stack.style.zIndex = 100 + index;
        const stackInfo = {
            element: stack,
            cardCount: 0
        };

        if (side === 'left') {
            this.leftSide.appendChild(stack);
            this.leftStacks.push(stackInfo);
        } else {
            this.rightSide.appendChild(stack);
            this.rightStacks.push(stackInfo);
        }

        return stackInfo;
    },

    createCard() {
        const card = document.createElement('div');
        card.className = 'gordiperro-card';
        card.style.backgroundImage = `url('${this.gordiperroImage}')`;
        card.style.position = 'absolute';
        card.style.width = `${this.cardWidth}px`;
        card.style.height = `${this.cardHeight}px`;
        card.style.pointerEvents = 'none';
        card.style.transform = `rotate(${Math.random() * 14 - 7}deg)`;
        card.style.opacity = '0';
        return card;
    },

    applyConfig() {
        if (typeof config === 'undefined') {
            return;
        }

        this.cardWidth = Math.max(10, config.gordiperroCardWidth || this.cardWidth);
        this.cardHeight = Math.max(10, config.gordiperroCardHeight || this.cardHeight);
        this.minOffset = Math.max(0, Math.min(config.gordiperroMinOffset || this.minOffset, config.gordiperroMaxOffset || this.maxOffset));
        this.maxOffset = Math.max(this.minOffset, config.gordiperroMaxOffset || this.maxOffset);

        // Ajustar el ancho de las pilas existentes si ya existieran
        [...this.leftStacks, ...this.rightStacks].forEach((stackInfo) => {
            stackInfo.element.style.width = `${this.cardWidth}px`;
        });
    },

    appendCardToStack(stack, offset = null) {
        const card = this.createCard();
        const cardOffset = offset !== null ? offset : this.randomOffset();
        card.style.bottom = `${stack.cardCount * cardOffset}px`;
        card.style.left = `${Math.random() * 16 - 8}px`;
        card.style.zIndex = 100 + stack.cardCount;
        stack.element.appendChild(card);
        stack.cardCount += 1;

        requestAnimationFrame(() => {
            card.style.opacity = '1';
        });

        return { card, cardOffset };
    },

    randomOffset() {
        return this.minOffset + Math.floor(Math.random() * (this.maxOffset - this.minOffset + 1));
    },

    addCardAnimated() {
        return new Promise((resolve) => {
            this.updateSideHeight();
            const side = this.getNextSide();
            const sideStacks = side === 'left' ? this.leftStacks : this.rightStacks;
            const stack = this.getActiveStack(side, sideStacks);
            const cardOffset = this.randomOffset();

            const stackRect = stack.element.getBoundingClientRect();
            const destinationLeft = this.calculateDestinationLeft(stackRect);
            const destinationTop = this.calculateDestinationTop(stackRect, stack.cardCount, cardOffset);

            const tempCard = this.createCard();
            tempCard.style.position = 'fixed';
            tempCard.style.left = '50%';
            tempCard.style.top = '50%';
            tempCard.style.transform = 'translate(-50%, -50%) rotate(0deg)';
            tempCard.style.opacity = '0';
            tempCard.style.width = `${this.cardWidth}px`;
            tempCard.style.height = `${this.cardHeight}px`;
            tempCard.style.transition = 'left 0.8s ease, top 0.8s ease, opacity 0.8s ease, transform 0.8s ease';
            document.body.appendChild(tempCard);

            requestAnimationFrame(() => {
                tempCard.style.opacity = '1';
                tempCard.style.left = `${destinationLeft}px`;
                tempCard.style.top = `${destinationTop}px`;
                tempCard.style.transform = `translate(0, 0) rotate(${Math.random() * 14 - 7}deg)`;
            });

            setTimeout(() => {
                document.body.removeChild(tempCard);
                this.appendCardToStack(stack, cardOffset);
                resolve();
            }, 850);
        });
    },

    calculateDestinationLeft(stackRect) {
        return stackRect.left + (stackRect.width - this.cardWidth) / 2 + (Math.random() * 10 - 5);
    },

    calculateDestinationTop(stackRect, cardIndex, offset) {
        return stackRect.top + stackRect.height - this.cardHeight - cardIndex * offset;
    },

    getNextSide() {
        return this.getTotalCards() % 2 === 0 ? 'left' : 'right';
    },

    clearSides() {
        if (this.leftSide) {
            this.leftSide.innerHTML = '';
        }
        if (this.rightSide) {
            this.rightSide.innerHTML = '';
        }
        this.leftStacks = [];
        this.rightStacks = [];
    },

    getTotalCards() {
        return this.leftStacks.reduce((sum, stack) => sum + stack.cardCount, 0) +
            this.rightStacks.reduce((sum, stack) => sum + stack.cardCount, 0);
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = cardDistributor;
}

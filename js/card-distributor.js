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
    // Número máximo de columnas por cada lateral (configurable)
    maxColumnsPerSide: 3,
    // Punteros para distribución circular cuando se alcanza el máximo
    nextColumnIndexLeft: 0,
    nextColumnIndexRight: 0,
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

        // Si la pila actual aún puede aceptar otra carta, usarla.
        if (!this.willOverflow(currentStack)) {
            return currentStack;
        }

        // Si aún no alcanzamos el número máximo de columnas, crear una nueva.
        if (stacks.length < this.maxColumnsPerSide) {
            return this.createStack(side, stacks.length);
        }

        // Si ya alcanzamos el máximo, distribuir circularmente entre las columnas existentes.
        const pointerKey = side === 'left' ? 'nextColumnIndexLeft' : 'nextColumnIndexRight';
        const idx = this[pointerKey] % this.maxColumnsPerSide;
        this[pointerKey] = (this[pointerKey] + 1) % this.maxColumnsPerSide;

        return stacks[idx];
    },

    willOverflow(stack) {
        // Evaluar el espacio restante usando el peor caso para las cartas actuales.
        const projectedHeight = this.cardHeight + stack.cardCount * this.maxOffset;
        const remaining = this.sideHeight - projectedHeight - this.sidePadding;

        // Si queda espacio suficiente para un offset máximo, no hay overflow.
        if (remaining >= this.maxOffset) {
            return false;
        }

        // Si queda menos que el offset mínimo, entonces no cabe la siguiente carta.
        if (remaining < this.minOffset) {
            return true;
        }

        // Si queda entre min y max, permitimos una última carta ajustando su offset.
        return false;
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
        this.maxColumnsPerSide = Math.max(1, config.gordiperroMaxColumnsPerSide || this.maxColumnsPerSide);

        // Ajustar el ancho de las pilas existentes si ya existieran
        [...this.leftStacks, ...this.rightStacks].forEach((stackInfo) => {
            stackInfo.element.style.width = `${this.cardWidth}px`;
        });
    },

    appendCardToStack(stack, offset = null) {
        const card = this.createCard();

        // Si no se pasa offset, calcular el mejor offset posible para que
        // la pila aproveche el espacio restante (dentro de min/max). Solo
        // la última carta puede ser ajustada para rellenar el hueco.
        const cardOffset = offset !== null ? offset : this.calculateBestOffset(stack);

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

    // Calcula el mejor offset posible para la siguiente carta en la pila
    // intentando encajar la siguiente carta sin comprimir toda la pila.
    calculateBestOffset(stack) {
        // Usamos la proyección conservadora basada en maxOffset para las cartas existentes.
        const projectedHeight = this.cardHeight + stack.cardCount * this.maxOffset;
        const remaining = this.sideHeight - projectedHeight - this.sidePadding;

        // Caso normal: queda espacio suficiente para un offset máximo -> usar offset aleatorio.
        if (remaining >= this.maxOffset) {
            return this.randomOffset();
        }

        // Si no hay suficiente espacio ni para el mínimo, devolvemos minOffset (willOverflow debe haber evitado esto).
        if (remaining < this.minOffset) {
            return this.minOffset;
        }

        // Si queda entre min y max, usar exactamente el espacio restante para ajustar la última carta.
        return Math.floor(remaining);
    },

    addCardAnimated() {
        return new Promise((resolve) => {
            this.updateSideHeight();
            const side = this.getNextSide();
            const sideStacks = side === 'left' ? this.leftStacks : this.rightStacks;
            const stack = this.getActiveStack(side, sideStacks);
            const cardOffset = this.calculateBestOffset(stack);

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
        // Reiniciar punteros de distribución circular
        this.nextColumnIndexLeft = 0;
        this.nextColumnIndexRight = 0;
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

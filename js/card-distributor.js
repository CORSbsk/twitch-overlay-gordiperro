// Módulo de distribución de cartas a laterales - Sistema de pilas dinámicas

const cardDistributor = {
    leftSide: null,
    rightSide: null,
    gordiperroImage: 'resources/gordiperro.png',
    cardsPerStack: 5, // Máximo de cartas por pila antes de crear una nueva
    
    // Inicializar
    init() {
        this.leftSide = document.getElementById('left-side');
        this.rightSide = document.getElementById('right-side');
        console.log('CardDistributor inicializado con sistema de pilas dinámicas');
    },
    
    // Distribuir cartas a laterales en pilas
    distributeCards(count) {
        console.log(`Distribuyendo ${count} cartas de gordiperro en pilas dinámicas`);
        
        // Limpiar laterales (redistribución completa)
        this.clearSides();
        
        // Calcular pilas necesarias
        const numStacks = Math.ceil(count / this.cardsPerStack);
        
        // Distribuir cartas entre las pilas
        const leftStacks = [];
        const rightStacks = [];
        
        // Crear arrays para las pilas alternando izquierda/derecha
        for (let i = 0; i < numStacks; i++) {
            if (i % 2 === 0) {
                leftStacks.push([]);
            } else {
                rightStacks.push([]);
            }
        }
        
        // Llenar pilas con las cartas
        for (let i = 0; i < count; i++) {
            const stackIndex = Math.floor(i / this.cardsPerStack);
            const isLeft = stackIndex % 2 === 0;
            
            if (isLeft) {
                const actualStackIndex = Math.floor(stackIndex / 2);
                if (actualStackIndex < leftStacks.length) {
                    leftStacks[actualStackIndex].push(i);
                }
            } else {
                const actualStackIndex = Math.floor((stackIndex - 1) / 2);
                if (actualStackIndex < rightStacks.length) {
                    rightStacks[actualStackIndex].push(i);
                }
            }
        }
        
        // Crear elementos de pilas en el DOM
        this.createStacksInDOM(leftStacks, 'left');
        this.createStacksInDOM(rightStacks, 'right');
        
        // Aplicar animaciones
        this.applyStackAnimations(count);
    },
    
    // Crear pilas en el DOM
    createStacksInDOM(stacks, side) {
        const container = side === 'left' ? this.leftSide : this.rightSide;
        
        stacks.forEach((stack, stackIndex) => {
            // Crear contenedor de pila
            const stackContainer = document.createElement('div');
            stackContainer.className = 'gordiperro-stack';
            stackContainer.style.position = 'relative';
            stackContainer.style.width = '100px';
            stackContainer.style.height = '130px';
            stackContainer.style.margin = '20px';
            stackContainer.style.opacity = '0';
            stackContainer.dataset.stackIndex = stackIndex;
            
            // Crear cartas en la pila
            stack.forEach((cardIndex, cardPosInStack) => {
                const card = document.createElement('div');
                card.className = 'gordiperro-card';
                card.style.position = 'absolute';
                card.style.width = '90px';
                card.style.height = '120px';
                card.style.backgroundImage = `url('${this.gordiperroImage}')`;
                card.style.backgroundSize = 'contain';
                card.style.backgroundRepeat = 'no-repeat';
                card.style.backgroundPosition = 'center';
                card.style.borderRadius = '8px';
                card.style.border = '2px solid #9146FF';
                card.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
                card.dataset.cardIndex = cardIndex;
                
                // Offset para efecto de pila (superpuesta)
                const offset = cardPosInStack * 3;
                card.style.top = offset + 'px';
                card.style.left = offset + 'px';
                card.style.zIndex = cardPosInStack;
                card.style.transform = `rotate(${(Math.random() - 0.5) * 2}deg)`;
                card.style.opacity = '0';
                
                stackContainer.appendChild(card);
            });
            
            container.appendChild(stackContainer);
        });
    },
    
    // Aplicar animaciones a las pilas
    applyStackAnimations(totalCount) {
        const leftStacks = this.leftSide.querySelectorAll('.gordiperro-stack');
        const rightStacks = this.rightSide.querySelectorAll('.gordiperro-stack');
        
        const allStacks = Array.from(leftStacks).concat(Array.from(rightStacks));
        const delayPerStack = Math.max(30, Math.floor(800 / (allStacks.length || 1)));
        
        allStacks.forEach((stackContainer, stackIndex) => {
            setTimeout(() => {
                // Animar entrada del contenedor de pila
                stackContainer.style.animation = `stackFadeIn 0.5s ease-out forwards`;
                stackContainer.style.opacity = '1';
                
                // Animar cada carta en la pila con delay
                const cards = stackContainer.querySelectorAll('.gordiperro-card');
                cards.forEach((card, cardIndex) => {
                    setTimeout(() => {
                        card.style.animation = `cardFadeIn 0.4s ease-out forwards`;
                        card.style.opacity = '1';
                    }, cardIndex * 50);
                });
            }, stackIndex * delayPerStack);
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
        const leftCards = this.leftSide ? this.leftSide.querySelectorAll('.gordiperro-card').length : 0;
        const rightCards = this.rightSide ? this.rightSide.querySelectorAll('.gordiperro-card').length : 0;
        return leftCards + rightCards;
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = cardDistributor;
}

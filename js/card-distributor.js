// Módulo de distribución de cartas a laterales

const cardDistributor = {
    leftSide: null,
    rightSide: null,
    gordiperroImage: 'resources/gordiperro.png',
    
    // Inicializar
    init() {
        this.leftSide = document.getElementById('left-side');
        this.rightSide = document.getElementById('right-side');
        console.log('CardDistributor inicializado');
    },
    
    // Distribuir cartas a laterales
    distributeCards(count) {
        console.log(`Distribuyendo ${count} cartas de gordiperro`);
        
        // Limpiar laterales (redistribución completa)
        this.clearSides();
        
        // Calcular velocidad dinámica basada en cantidad
        // Más rápido con más cartas para evitar fatiga visual
        const baseDelay = 50; // ms base
        const delayPerCard = Math.max(10, Math.floor(500 / count)); // Menor delay con más cartas
        
        // Distribuir cartas usando documentFragment para performance
        const leftFragment = document.createDocumentFragment();
        const rightFragment = document.createDocumentFragment();
        
        // Crear cartas y asignar a laterales
        for (let i = 0; i < count; i++) {
            const card = this.createCard(i);
            
            // Alternar entre izquierdo y derecho
            if (i % 2 === 0) {
                leftFragment.appendChild(card);
            } else {
                rightFragment.appendChild(card);
            }
        }
        
        // Agregar fragmentos al DOM
        this.leftSide.appendChild(leftFragment);
        this.rightSide.appendChild(rightFragment);
        
        // Aplicar animaciones escalonadas
        this.applyStaggeredAnimation(count, delayPerCard);
    },
    
    // Crear una carta individual
    createCard(index) {
        const card = document.createElement('div');
        card.className = 'gordiperro-card';
        card.style.backgroundImage = `url('${this.gordiperroImage}')`;
        card.style.opacity = '0'; // Inicialmente invisible para animación
        card.dataset.index = index;
        
        // Posición aleatoria ligera para efecto natural
        const randomOffset = Math.random() * 10 - 5;
        card.style.transform = `translateX(${randomOffset}px)`;
        
        return card;
    },
    
    // Aplicar animaciones escalonadas
    applyStaggeredAnimation(count, delayPerCard) {
        const leftCards = this.leftSide.querySelectorAll('.gordiperro-card');
        const rightCards = this.rightSide.querySelectorAll('.gordiperro-card');
        
        // Animar cartas del lado izquierdo
        leftCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.animation = `cardDeal 0.3s ease-out ${index * delayPerCard}ms`;
            }, index * delayPerCard);
        });
        
        // Animar cartas del lado derecho
        rightCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.animation = `cardDeal 0.3s ease-out ${index * delayPerCard}ms`;
            }, index * delayPerCard);
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
        const leftCount = this.leftSide ? this.leftSide.children.length : 0;
        const rightCount = this.rightSide ? this.rightSide.children.length : 0;
        return leftCount + rightCount;
    },
    
    // Optimización: Limitar cartas visuales si hay demasiadas
    // (opcional, actualmente no usado ya que el usuario quiere sin límite)
    optimizeForPerformance(maxVisible = 100) {
        const totalCards = this.getTotalCards();
        
        if (totalCards > maxVisible) {
            console.log(`Optimizando: ${totalCards} cartas, limitando a ${maxVisible} visuales`);
            
            const leftCards = this.leftSide.querySelectorAll('.gordiperro-card');
            const rightCards = this.rightSide.querySelectorAll('.gordiperro-card');
            
            // Ocultar cartas excedentes
            leftCards.forEach((card, index) => {
                if (index >= maxVisible / 2) {
                    card.style.display = 'none';
                }
            });
            
            rightCards.forEach((card, index) => {
                if (index >= maxVisible / 2) {
                    card.style.display = 'none';
                }
            });
        }
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = cardDistributor;
}

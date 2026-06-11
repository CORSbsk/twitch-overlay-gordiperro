// Módulo de distribución de cartas a laterales - Distribución aleatoria dispersa

const cardDistributor = {
    leftSide: null,
    rightSide: null,
    gordiperroImage: 'resources/gordiperro.png',
    cardWidth: 80,
    cardHeight: 100,
    
    // Inicializar
    init() {
        this.leftSide = document.getElementById('left-side');
        this.rightSide = document.getElementById('right-side');
        console.log('CardDistributor inicializado con distribución aleatoria');
    },
    
    // Distribuir cartas aleatoriamente en los laterales
    distributeCards(count) {
        console.log(`Distribuyendo ${count} cartas de gordiperro aleatoriamente`);
        
        // Limpiar laterales
        this.clearSides();
        
        // Dividir cartas entre izquierda y derecha
        const leftCount = Math.ceil(count / 2);
        const rightCount = count - leftCount;
        
        // Distribuir cartas
        this.distributeToSide(this.leftSide, leftCount, 'left');
        this.distributeToSide(this.rightSide, rightCount, 'right');
        
        // Aplicar animaciones
        this.applyRandomAnimations();
    },
    
    // Distribuir cartas a un lado con posiciones aleatorias
    distributeToSide(container, count, side) {
        // Obtener dimensiones del contenedor
        const containerRect = container.getBoundingClientRect();
        const containerWidth = window.innerWidth * 0.3; // 30% del ancho
        const containerHeight = window.innerHeight; // Alto total
        
        // Array para rastrear posiciones ya usadas (evitar solapamiento excesivo)
        const usedPositions = [];
        
        for (let i = 0; i < count; i++) {
            // Generar posición aleatoria que no esté muy cerca de otras
            let randomX, randomY, validPosition;
            let attempts = 0;
            
            do {
                randomX = Math.random() * (containerWidth - this.cardWidth);
                randomY = Math.random() * (containerHeight - this.cardHeight);
                
                // Verificar que no esté muy cerca de otra posición
                validPosition = !usedPositions.some(pos => 
                    Math.abs(pos.x - randomX) < 60 && Math.abs(pos.y - randomY) < 60
                );
                
                attempts++;
            } while (!validPosition && attempts < 10); // Máximo 10 intentos
            
            if (validPosition) {
                usedPositions.push({ x: randomX, y: randomY });
            } else {
                // Si no encuentra posición válida, usar posición random sin validar
                randomX = Math.random() * (containerWidth - this.cardWidth);
                randomY = Math.random() * (containerHeight - this.cardHeight);
            }
            
            // Crear carta
            const card = document.createElement('div');
            card.className = 'gordiperro-card-random';
            card.style.position = 'absolute';
            card.style.width = this.cardWidth + 'px';
            card.style.height = this.cardHeight + 'px';
            card.style.backgroundImage = `url('${this.gordiperroImage}')`;
            card.style.backgroundSize = 'contain';
            card.style.backgroundRepeat = 'no-repeat';
            card.style.backgroundPosition = 'center';
            card.style.borderRadius = '0';
            card.style.border = 'none';
            card.style.boxShadow = 'none';
            card.style.margin = '0';
            card.style.padding = '0';
            
            // Posición aleatoria
            card.style.left = randomX + 'px';
            card.style.top = randomY + 'px';
            
            // Rotación aleatoria para efecto más natural
            const randomRotation = (Math.random() - 0.5) * 15; // -7.5 a 7.5 grados
            card.style.transform = `rotate(${randomRotation}deg)`;
            
            // Opacidad inicial para animación
            card.style.opacity = '0';
            
            // Índice z aleatorio para efecto de profundidad
            card.style.zIndex = Math.floor(Math.random() * 1000);
            
            card.dataset.cardIndex = i;
            
            container.appendChild(card);
        }
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

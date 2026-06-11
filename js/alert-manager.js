// Módulo coordinador principal de alertas

const alertManager = {
    state: 'idle', // idle, animating, queueing
    gordiperroCount: 0,
    
    // Inicializar
    async init() {
        console.log('AlertManager inicializado');
        
        // Inicializar todos los módulos
        configUI.init();
        cardDistributor.init();
        animationController.init();
        
        // Cargar contador histórico
        this.gordiperroCount = storage.loadCount();
        console.log(`Contador histórico cargado: ${this.gordiperroCount}`);
        
        // Mostrar gordiperros existentes al cargar la página
        if (this.gordiperroCount > 0) {
            if (cardDistributor && typeof cardDistributor.rebuildStacks === 'function') {
                cardDistributor.rebuildStacks(this.gordiperroCount);
                console.log(`Reconstruidas ${this.gordiperroCount} cartas al cargar`);
            } else {
                cardDistributor.distributeCards(this.gordiperroCount);
                console.log(`Distribuidas ${this.gordiperroCount} cartas al cargar (fallback)`);
            }
        }
    },
    
    // Inicializar sonidos con barra de carga
    async initSounds(onProgress) {
        try {
            await soundManager.init(onProgress);
            console.log('Sonidos inicializados correctamente');
            return true;
        } catch (e) {
            console.error('Error al inicializar sonidos:', e);
            return false;
        }
    },
    
    // Manejar redención de recompensa
    handleRewardRedemption(data) {
        console.log('AlertManager: Redención recibida', data);
        
        // Incrementar contador
        const previous = this.gordiperroCount;
        this.gordiperroCount = storage.incrementCount();
        console.log(`Nuevo contador de gordiperros: ${this.gordiperroCount} (prev ${previous})`);

        // Actualizar UI de configuración
        configUI.updateUIDisplay();

        // Encolar una secuencia de animación por cada nueva unidad (delta = 1)
        const delta = this.gordiperroCount - previous;
        for (let i = 0; i < delta; i++) {
            animationController.startAnimationSequence(1);
        }
    },
    
    // Disparar animación
    triggerAnimation() {
        if (this.state === 'animating') {
            console.log('Animación en curso, se agregará a cola automáticamente');
            return;
        }
        
        this.state = 'animating';
        console.log('Iniciando animación de alerta');
        
        // Iniciar secuencia de animación
        animationController.startAnimationSequence(this.gordiperroCount);
        
        // Escuchar cuando termine la animación
        const checkInterval = setInterval(() => {
            if (!animationController.getIsAnimating()) {
                clearInterval(checkInterval);
                this.state = 'idle';
                console.log('Animación completada, estado: idle');
            }
        }, 100);
    },
    
    // Obtener estado actual
    getState() {
        return this.state;
    },
    
    // Obtener contador actual
    getCount() {
        return this.gordiperroCount;
    },
    
    // Establecer contador manualmente
    setCount(count) {
        this.gordiperroCount = storage.setCount(count);
        console.log(`Contador establecido manualmente: ${this.gordiperroCount}`);
        
        // Reconstruir pilas con el nuevo contador
        if (cardDistributor && typeof cardDistributor.rebuildStacks === 'function') {
            cardDistributor.rebuildStacks(this.gordiperroCount);
        } else {
            cardDistributor.distributeCards(this.gordiperroCount);
        }
    },
    
    // Reiniciar sistema
    reset() {
        this.state = 'idle';
        this.gordiperroCount = 0;
        storage.setCount(0);
        cardDistributor.clearSides();
        animationController.clearQueue();
        console.log('Sistema reiniciado');
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = alertManager;
}

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
        
        // Inicializar sonido (requiere interacción del usuario)
        document.addEventListener('click', async () => {
            if (!soundManager.audioContext) {
                await soundManager.init();
            }
        }, { once: true });
    },
    
    // Manejar redención de recompensa
    handleRewardRedemption(data) {
        console.log('AlertManager: Redención recibida', data);
        
        // Incrementar contador
        this.gordiperroCount = storage.incrementCount();
        console.log(`Nuevo contador de gordiperros: ${this.gordiperroCount}`);
        
        // Iniciar animación
        this.triggerAnimation();
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
        
        // Redistribuir cartas con el nuevo contador
        cardDistributor.distributeCards(this.gordiperroCount);
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

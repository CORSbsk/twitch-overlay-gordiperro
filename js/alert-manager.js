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
            cardDistributor.distributeCards(this.gordiperroCount);
            console.log(`Distribuidas ${this.gordiperroCount} cartas al cargar`);
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
        this.gordiperroCount = storage.incrementCount();
        console.log(`Nuevo contador de gordiperros: ${this.gordiperroCount}`);
        
        // Iniciar animación
        this.triggerAnimation();
    },
    
    // Disparar animación
    triggerAnimation() {
        // Siempre solicitar una secuencia al animationController; éste se encargará de encolarlas
        console.log('Iniciando animación de alerta (o encolando si ya hay una en curso)');
        // Notar: animationController internamente pone en cola si ya está animando
        animationController.startAnimationSequence(this.gordiperroCount);

        // Mantener estado 'animating' mientras haya animaciones en curso
        this.state = 'animating';
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

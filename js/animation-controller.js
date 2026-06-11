// Módulo de control de animaciones

const animationController = {
    isAnimating: false,
    animationQueue: [],
    currentAnimation: null,
    
    // Inicializar
    init() {
        console.log('AnimationController inicializado');
    },
    
    // Iniciar secuencia de animación completa
    async startAnimationSequence(deltaCount) {
        // deltaCount: número de nuevas unidades a animar en esta secuencia (normalmente 1)
        if (this.isAnimating) {
            console.log('Animación en curso, agregando a cola (delta)', deltaCount);
            this.animationQueue.push(deltaCount);
            return;
        }

        this.isAnimating = true;
        console.log(`Iniciando secuencia de animación para delta=${deltaCount}`);

        try {
            // Paso 1: Reproducir música de alerta y animación de entrada (5 segundos)
            await this.playEntryAnimation();

            // Paso 2: Rotación 3D errática en centro (1 segundo)
            await this.play3DRotation();

            // Paso 3: Multiplicador dinámico con sonido barf (usar delta como objetivo)
            await this.playMultiplierAnimation(deltaCount);

            // Paso 4: Animar deltaCount tarjetas hacia las pilas (una por una)
            for (let i = 0; i < deltaCount; i++) {
                if (cardDistributor && typeof cardDistributor.addCardAnimated === 'function') {
                    await cardDistributor.addCardAnimated();
                }
            }

            // Finalmente, reconstruir pilas para asegurar consistencia usando el total persistente
            if (cardDistributor && typeof cardDistributor.rebuildStacks === 'function') {
                const total = (typeof storage.loadCount === 'function') ? storage.loadCount() : null;
                if (total !== null) cardDistributor.rebuildStacks(total);
            }

            console.log('Secuencia de animación completada');
        } catch (e) {
            console.error('Error en secuencia de animación:', e);
        } finally {
            this.isAnimating = false;
            this.processQueue();
        }
    },
    
    // Animación de entrada desde arriba (5 segundos)
    async playEntryAnimation() {
        return new Promise((resolve) => {
            const centralAlert = document.getElementById('central-alert');
            const alertContainer = document.getElementById('alert-container');
            
            // Resetear COMPLETAMENTE todos los estilos
            centralAlert.classList.remove('entry-animation', 'active');
            // Evitar uso de transform inline porque puede bloquear la animación CSS
            centralAlert.style.transform = '';
            centralAlert.style.opacity = '';
            centralAlert.style.animation = 'none';
            
            // Limpiar contenido
            const centralImage = document.getElementById('central-image');
            const alertText = document.getElementById('alert-text');
            const multiplier = document.getElementById('multiplier');
            
            centralImage.style.animation = 'none';
            centralImage.style.transform = 'none';
            // Asegurar que la imagen central sea visible para la entrada
            centralImage.style.display = 'block';
            
            // Forzar reflow para garantizar reset de la animación
            void centralAlert.offsetWidth;
            
            // Ocultar multiplicador durante entrada
            if (multiplier) {
                multiplier.style.display = 'none';
            }
            
            // Iniciar animación (activar antes el elemento para que sea visible)
            centralAlert.classList.add('active');

            // Forzar un frame antes de añadir la clase de animación para que el navegador
            // reconozca la transición desde el estado inicial hasta el animado.
            requestAnimationFrame(() => {
                centralAlert.classList.add('entry-animation');
            });
            
            // Reproducir música de alerta
            soundManager.playAlertMusic();
            
            // Esperar 5 segundos (duración de la música)
            setTimeout(() => {
                // Remover la clase de entrada pero mantener la alerta activa
                centralAlert.classList.remove('entry-animation');
                // Dejar el elemento en su posición final para la rotación y multiplicador
                centralAlert.style.transform = '';
                centralAlert.style.opacity = '';
                resolve();
            }, 5000);
        });
    },
    
    // Rotación 3D errática tipo Balatro (1 segundo)
    async play3DRotation() {
        return new Promise((resolve) => {
            const centralImage = document.getElementById('central-image');
            const alertText = document.getElementById('alert-text');
            
            // Mostrar elementos
            centralImage.style.display = 'block';
            alertText.style.display = 'block';
            alertText.textContent = 'Gordiperro canjeado';
            
            // Aplicar animación de rotación 3D
            centralImage.style.animation = 'rotate3D 1s ease-in-out infinite';
            
            // Efecto errático tipo Balatro
            let shakeInterval = setInterval(() => {
                centralImage.classList.add('balatro-shake');
                setTimeout(() => {
                    centralImage.classList.remove('balatro-shake');
                }, 100);
            }, 200);
            
            // Esperar 1 segundo
            setTimeout(() => {
                clearInterval(shakeInterval);
                centralImage.style.animation = 'none';
                resolve();
            }, 1000);
        });
    },
    
    // Animación del multiplicador dinámico
    async playMultiplierAnimation(gordiperroCount) {
        return new Promise((resolve) => {
            const multiplier = document.getElementById('multiplier');
            const centralImage = document.getElementById('central-image');
            
            // Reiniciar pitch del sonido barf
            soundManager.resetPitch();
            
            // Mostrar multiplicador inicial desde 1
            multiplier.style.display = 'block';
            multiplier.textContent = 'x1';
            
            // Animación del multiplicador incrementando
            let currentCount = 1;
            const targetCount = gordiperroCount;
            
            // Velocidad más rápida: base de 50ms, disminuye con más count
            const incrementDelay = Math.max(30, 100 - (targetCount * 0.5));
            
            const incrementInterval = setInterval(() => {
                if (currentCount <= targetCount) {
                    // Actualizar multiplicador
                    multiplier.textContent = `x${currentCount}`;
                    
                    // Reproducir sonido barf con pitch incrementado
                    soundManager.playBarfWithIncrement();
                    
                    // Efecto visual errático en la imagen
                    centralImage.classList.add('balatro-shake');
                    setTimeout(() => {
                        centralImage.classList.remove('balatro-shake');
                    }, 50);
                    
                    currentCount++;
                } else {
                    clearInterval(incrementInterval);
                    
                    // Esperar un momento antes de continuar
                    setTimeout(() => {
                        resolve();
                    }, 300);
                }
            }, incrementDelay);
        });
    },
    
    // Distribuir cartas a laterales con animación
    async distributeCards(gordiperroCount) {
        return new Promise((resolve) => {
            const centralAlert = document.getElementById('central-alert');
            const centralImage = document.getElementById('central-image');
            
            // Animación de salida del centro hacia los laterales
            centralImage.style.animation = 'distributeOut 0.8s ease-in-out forwards';
            
            // Después de la animación, ocultar alerta y animar inserción de una carta
            setTimeout(() => {
                // Mantener alerta visualmente removida
                centralAlert.classList.remove('active');

                // Reiniciar estilos
                centralImage.style.animation = 'none';
                centralImage.style.transform = 'none';

                // Animar una sola carta desde el centro hacia la pila correspondiente
                if (cardDistributor && typeof cardDistributor.addCardAnimated === 'function') {
                    // Await the addCardAnimated promise so we can reliably finish after animation
                    try {
                        await cardDistributor.addCardAnimated();
                    } catch (e) {
                        console.warn('addCardAnimated fallo:', e);
                    }
                } else {
                    // Fallback: rebuild full distribution
                    if (cardDistributor && typeof cardDistributor.rebuildStacks === 'function') {
                        cardDistributor.rebuildStacks(gordiperroCount);
                    }
                }

                // Continue after the animation promise has resolved
                resolve();
            }, 800);
        });
    },
    
    // Procesar cola de animaciones
    processQueue() {
        if (this.animationQueue.length > 0) {
            const nextCount = this.animationQueue.shift();
            console.log(`Procesando siguiente animación en cola: gordiperro #${nextCount}`);
            this.startAnimationSequence(nextCount);
        }
    },
    
    // Limpiar cola
    clearQueue() {
        this.animationQueue = [];
    },
    
    // Obtener estado de animación
    getIsAnimating() {
        return this.isAnimating;
    },
    
    // Obtener tamaño de cola
    getQueueSize() {
        return this.animationQueue.length;
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = animationController;
}

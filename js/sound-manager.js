// Módulo de manejo de sonidos con control de pitch

const soundManager = {
    audioContext: null,
    alertMusicBuffer: null,
    barfBuffer: null,
    currentPitch: 1.0,
    pitchIncrement: 0.02, // 2% incremento
    alertMusicVolume: 0.5,
    barfVolume: 0.7,
    isLoading: false,
    onProgress: null,
    
    // Inicializar AudioContext
    async init(onProgress = null) {
        try {
            this.onProgress = onProgress;
            this.isLoading = true;
            
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('AudioContext inicializado');
            
            if (this.onProgress) {
                this.onProgress(10, 'AudioContext inicializado');
            }
            
            // Cargar archivos de sonido
            await this.loadSounds();

            // Aplicar configuración si existe
            if (typeof this.applyConfig === 'function') {
                this.applyConfig();
            }
            
            this.isLoading = false;
            if (this.onProgress) {
                this.onProgress(100, 'Sonidos cargados correctamente');
            }
        } catch (e) {
            console.error('Error al inicializar AudioContext:', e);
            this.isLoading = false;
            if (this.onProgress) {
                this.onProgress(0, 'Error al cargar sonidos');
            }
        }
    },
    
    // Cargar archivos de sonido
    async loadSounds() {
        try {
            // Cargar alertMusic5seconds.wav
            if (this.onProgress) {
                this.onProgress(30, 'Cargando música de alerta...');
            }
            
            const alertMusicResponse = await fetch('resources/alertMusic5seconds.wav');
            const alertMusicArrayBuffer = await alertMusicResponse.arrayBuffer();
            this.alertMusicBuffer = await this.audioContext.decodeAudioData(alertMusicArrayBuffer);
            console.log('alertMusic5seconds.wav cargado');
            
            if (this.onProgress) {
                this.onProgress(60, 'Música de alerta cargada');
            }
            
            // Cargar barf.wav
            if (this.onProgress) {
                this.onProgress(70, 'Cargando sonido barf...');
            }
            
            const barfResponse = await fetch('resources/barf.wav');
            const barfArrayBuffer = await barfResponse.arrayBuffer();
            this.barfBuffer = await this.audioContext.decodeAudioData(barfArrayBuffer);
            console.log('barf.wav cargado');
            
            if (this.onProgress) {
                this.onProgress(90, 'Sonido barf cargado');
            }
        } catch (e) {
            console.error('Error al cargar sonidos:', e);
            throw e;
        }
    },
    
    // Verificar si está cargando
    getIsLoading() {
        return this.isLoading;
    },
    
    // Verificar si está listo
    isReady() {
        return this.audioContext !== null && 
               this.alertMusicBuffer !== null && 
               this.barfBuffer !== null;
    },
    
    // Reproducir música de alerta (5 segundos)
    playAlertMusic() {
        if (!this.audioContext || !this.alertMusicBuffer) {
            console.error('AudioContext o buffer no inicializado');
            return;
        }
        
        // Reanudar AudioContext si está suspendido (requerido por navegadores modernos)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = this.alertMusicBuffer;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = typeof this.alertMusicVolume === 'number' ? this.alertMusicVolume : 0.5;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        source.start(0);
        console.log('Reproduciendo alertMusic5seconds.wav');
        
        // Retornar el source para poder detenerlo si es necesario
        return source;
    },
    
    // Reproducir sonido barf con pitch específico
    playBarf(pitch = 1.0) {
        if (!this.audioContext || !this.barfBuffer) {
            console.error('AudioContext o buffer no inicializado');
            return;
        }
        
        // Reanudar AudioContext si está suspendido
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = this.barfBuffer;
        
        // Aplicar pitch usando playbackRate
        source.playbackRate.value = pitch;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = typeof this.barfVolume === 'number' ? this.barfVolume : 0.7;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        source.start(0);
        console.log(`Reproduciendo barf.wav con pitch: ${pitch.toFixed(2)}`);
        
        return source;
    },
    
    // Reproducir barf con pitch incrementado automáticamente
    playBarfWithIncrement() {
        const pitch = this.currentPitch;
        this.playBarf(pitch);

        // Incrementar pitch para la próxima vez
        this.currentPitch += this.pitchIncrement;
        console.log(`Pitch incrementado a: ${this.currentPitch.toFixed(2)}`);
    },
    
    // Reiniciar pitch al valor inicial
    resetPitch() {
        this.currentPitch = 1.0;
        console.log('Pitch reiniciado a 1.0');
    },
    
    // Obtener pitch actual
    getCurrentPitch() {
        return this.currentPitch;
    },
    
    // Establecer pitch manualmente
    setPitch(pitch) {
        this.currentPitch = pitch;
    },

    setPitchIncrement(inc) {
        this.pitchIncrement = inc;
    },

    setAlertMusicVolume(v) {
        this.alertMusicVolume = Math.min(Math.max(v, 0), 1);
    },

    setBarfVolume(v) {
        this.barfVolume = Math.min(Math.max(v, 0), 1);
    },

    // Aplicar configuración global si está disponible
    applyConfig() {
        if (typeof config === 'undefined') return;
        if (typeof config.soundCurrentPitch === 'number') this.currentPitch = config.soundCurrentPitch;
        if (typeof config.soundPitchIncrement === 'number') this.pitchIncrement = config.soundPitchIncrement;
        if (typeof config.alertMusicVolume === 'number') this.alertMusicVolume = config.alertMusicVolume;
        if (typeof config.barfVolume === 'number') this.barfVolume = config.barfVolume;
        console.log('soundManager: configuración aplicada desde config');
    },
    
    // Detener todos los sonidos
    stopAll() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = soundManager;
}

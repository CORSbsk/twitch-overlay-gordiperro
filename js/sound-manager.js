// Módulo de manejo de sonidos con control de pitch

const soundManager = {
    audioContext: null,
    alertMusicBuffer: null,
    barfBuffer: null,
    currentPitch: 1.0,
    pitchIncrement: 0.02, // 2% incremento
    
    // Inicializar AudioContext
    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('AudioContext inicializado');
            
            // Cargar archivos de sonido
            await this.loadSounds();
        } catch (e) {
            console.error('Error al inicializar AudioContext:', e);
        }
    },
    
    // Cargar archivos de sonido
    async loadSounds() {
        try {
            // Cargar alertMusic5seconds.wav
            const alertMusicResponse = await fetch('resources/alertMusic5seconds.wav');
            const alertMusicArrayBuffer = await alertMusicResponse.arrayBuffer();
            this.alertMusicBuffer = await this.audioContext.decodeAudioData(alertMusicArrayBuffer);
            console.log('alertMusic5seconds.wav cargado');
            
            // Cargar barf.wav
            const barfResponse = await fetch('resources/barf.wav');
            const barfArrayBuffer = await barfResponse.arrayBuffer();
            this.barfBuffer = await this.audioContext.decodeAudioData(barfArrayBuffer);
            console.log('barf.wav cargado');
        } catch (e) {
            console.error('Error al cargar sonidos:', e);
        }
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
        gainNode.gain.value = 0.5; // Volumen al 50%
        
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
        gainNode.gain.value = 0.7; // Volumen al 70%
        
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

document.addEventListener('DOMContentLoaded', () => {
    // =============================================
    // LÓGICA DO SOM DE CLIQUE
    // =============================================
    let audioContext;
    let clickBuffer;

    // Função para inicializar o contexto de áudio (necessário por causa das políticas dos navegadores)
    function initAudio() {
        if (!audioContext) {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                // Criar um som de clique sintético para não depender de arquivos externos
                createClickSound();
            } catch (e) {
                console.error("Web Audio API is not supported in this browser");
            }
        }
    }

    // Cria um som de clique curto e sintético
    function createClickSound() {
        if (!audioContext) return;
        const duration = 0.05; // 50ms
        const sampleRate = audioContext.sampleRate;
        const frameCount = sampleRate * duration;
        clickBuffer = audioContext.createBuffer(1, frameCount, sampleRate);
        const data = clickBuffer.getChannelData(0);

        for (let i = 0; i < frameCount; i++) {
            // Um decaimento exponencial simples
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / sampleRate / 0.01);
        }
    }
    
    function playClickSound() {
        if (!audioContext || !clickBuffer) return;

        // Garante que o contexto de áudio está ativo
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const source = audioContext.createBufferSource();
        source.buffer = clickBuffer;

        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Volume baixo
        
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        source.start();
    }
    
    // Inicializa o áudio no primeiro clique do usuário em qualquer lugar
    document.body.addEventListener('click', initAudio, { once: true });


    // --- LÓGICA PARA O MODAL PRINCIPAL (IFRAME) ---
    const toolCards = document.querySelectorAll('.tool-card:not(.placeholder):not(.tool-card-disabled)');
    const modalOverlay = document.getElementById('tool-modal-overlay');
    const modalCloseButton = document.getElementById('modal-close');
    const toolIframe = document.getElementById('tool-iframe');

    const openModal = (toolUrl) => {
        if (toolUrl) {
            playClickSound(); // Toca o som ao abrir
            toolIframe.src = toolUrl;
            modalOverlay.classList.add('active');
        }
    };

    const closeModal = () => {
        playClickSound(); // Toca o som ao fechar
        modalOverlay.classList.remove('active');
        toolIframe.src = ''; 
    };

    toolCards.forEach(card => {
        card.addEventListener('click', () => {
            const url = card.dataset.toolUrl;
            openModal(url);
        });
    });

    modalCloseButton.addEventListener('click', closeModal);

    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });

    // --- LÓGICA PARA O MODAL DE ALERTA (PLACEHOLDER) ---
    const placeholderCard = document.querySelector('.tool-card.placeholder');
    const alertModalOverlay = document.getElementById('alert-modal-overlay');
    const alertModalCloseButton = document.getElementById('alert-modal-close');

    if (placeholderCard) {
        placeholderCard.addEventListener('click', () => {
            playClickSound(); // Toca o som ao abrir
            alertModalOverlay.classList.add('active');
        });
    }

    const closeAlertModal = () => {
        playClickSound(); // Toca o som ao fechar
        alertModalOverlay.classList.remove('active');
    };

    if (alertModalCloseButton) {
        alertModalCloseButton.addEventListener('click', closeAlertModal);
    }
    
    if (alertModalOverlay) {
        alertModalOverlay.addEventListener('click', (event) => {
            if (event.target === alertModalOverlay) {
                closeAlertModal();
            }
        });
    }

});


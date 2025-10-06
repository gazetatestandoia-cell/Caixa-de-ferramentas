document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA PARA O MODAL PRINCIPAL (IFRAME) ---
    // Atualizado para não selecionar cards com a classe .tool-card-disabled
    const toolCards = document.querySelectorAll('.tool-card:not(.placeholder):not(.tool-card-disabled)');
    const modalOverlay = document.getElementById('tool-modal-overlay');
    const modalCloseButton = document.getElementById('modal-close');
    const toolIframe = document.getElementById('tool-iframe');

    const openModal = (toolUrl) => {
        if (toolUrl) {
            toolIframe.src = toolUrl;
            modalOverlay.classList.add('active');
        }
    };

    const closeModal = () => {
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
            alertModalOverlay.classList.add('active');
        });
    }

    const closeAlertModal = () => {
        alertModalOverlay.classList.remove('active');
    };

    if (alertModalCloseButton) {
        alertModalCloseButton.addEventListener('click', closeAlertModal);
    }
    
    if (alertModalOverlay) {
        alertModalOverlay.addEventListener('click', (event) => {
            // Fecha somente se o clique for no fundo escuro
            if (event.target === alertModalOverlay) {
                closeAlertModal();
            }
        });
    }

});


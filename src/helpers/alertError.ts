// src/helpers/alertModal.ts

type ModalType = 'success' | 'error' | 'warning' | 'info';

interface ModalOptions {
  title?: string;
  buttonText?: string;
  onClose?: () => void;
  duration?: number;
}

const getModalColors = (type: ModalType) => {
  switch (type) {
    case 'success':
      return {
        icon: '✓',
        iconColor: '#10b981',
        buttonColor: '#10b981',
        titleColor: '#10b981'
      };
    case 'error':
      return {
        icon: '✗',
        iconColor: '#dc2626',
        buttonColor: '#dc2626',
        titleColor: '#dc2626'
      };
    case 'warning':
      return {
        icon: '⚠',
        iconColor: '#f59e0b',
        buttonColor: '#f59e0b',
        titleColor: '#f59e0b'
      };
    case 'info':
      return {
        icon: 'ℹ',
        iconColor: '#3b82f6',
        buttonColor: '#3b82f6',
        titleColor: '#3b82f6'
      };
  }
};

// Fonction générique principale
export const customAlert = (message: string, type: ModalType = 'info', options?: ModalOptions) => {
  const {
    title = type === 'success' ? 'Succès' : 
            type === 'error' ? 'Erreur' : 
            type === 'warning' ? 'Attention' : 'Information',
    buttonText = 'OK',
    onClose,
    duration
  } = options || {};
  
  const colors = getModalColors(type);
  
  const modalExistant = document.getElementById('custom-modal');
  if (modalExistant) {
    modalExistant.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'custom-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  `;
  
  const contenu = document.createElement('div');
  contenu.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 32px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    animation: modalSlideIn 0.3s ease-out;
  `;
  
  if (!document.getElementById('modal-styles')) {
    const style = document.createElement('style');
    style.id = 'modal-styles';
    style.textContent = `
      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  const icone = document.createElement('div');
  icone.textContent = colors.icon;
  icone.style.cssText = `
    margin: 0 auto 16px;
    font-size: 48px;
    font-weight: bold;
    color: ${colors.iconColor};
    text-align: center;
  `;
  
  const titre = document.createElement('h3');
  titre.textContent = title;
  titre.style.cssText = `
    margin: 0 0 12px 0;
    color: ${colors.titleColor};
    font-size: 20px;
    font-weight: 600;
    text-align: center;
  `;
  
  const texteMessage = document.createElement('p');
  texteMessage.textContent = message;
  texteMessage.style.cssText = `
    margin: 0 0 24px 0;
    color: #4b5563;
    line-height: 1.5;
    text-align: center;
  `;
  
  const bouton = document.createElement('button');
  bouton.textContent = buttonText;
  bouton.style.cssText = `
    background: ${colors.buttonColor};
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
  `;
  
  bouton.onmouseenter = () => {
    bouton.style.opacity = '0.9';
  };
  bouton.onmouseleave = () => {
    bouton.style.opacity = '1';
  };
  
  const fermerModal = () => {
    modal.remove();
    document.removeEventListener('keydown', handleEsc);
    if (onClose) onClose();
  };
  
  bouton.onclick = fermerModal;
  
  if (!duration) {
    modal.onclick = (e) => {
      if (e.target === modal) {
        fermerModal();
      }
    };
  }
  
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      fermerModal();
    }
  };
  document.addEventListener('keydown', handleEsc);
  
  contenu.appendChild(icone);
  contenu.appendChild(titre);
  contenu.appendChild(texteMessage);
  contenu.appendChild(bouton);
  modal.appendChild(contenu);
  document.body.appendChild(modal);
  
  if (duration) {
    setTimeout(() => {
      fermerModal();
    }, duration);
  }
};

// Fonctions spécialisées
export const alertError = (message?: string, options?: ModalOptions) => {
  const errorMessage = message || "Une erreur s'est produite. Veuillez réessayer";
  customAlert(errorMessage, 'error', options);
};

export const alertSuccess = (message: string, options?: ModalOptions) => {
  customAlert(message, 'success', options);
};

export const alertWarning = (message: string, options?: ModalOptions) => {
  customAlert(message, 'warning', options);
};

export const alertInfo = (message: string, options?: ModalOptions) => {
  customAlert(message, 'info', options);
};

// Remplacer la fonction native alert
export const overrideNativeAlert = () => {
  // Sauvegarder l'alert original au cas où
  const originalAlert = window.alert;
  
  // Remplacer par notre fonction personnalisée
  window.alert = (message?: any) => {
    customAlert(String(message || ''), 'info');
  };
  
  // Optionnel : stocker l'original pour pouvoir le restaurer
  return originalAlert;
};

// Restaurer la fonction native alert
export const restoreNativeAlert = (originalAlert?: typeof window.alert) => {
  if (originalAlert) {
    window.alert = originalAlert;
  } else {
    // Restaurer l'alert original du navigateur
    window.alert = (message?: any) => {
      // @ts-ignore - fonction native
      window.originalAlert?.(message);
    };
  }
};

// Initialiser le remplacement dès le chargement de l'application
export const initCustomAlerts = () => {
  overrideNativeAlert();
  console.log('Alert native remplacée par le modal personnalisé');
};

// Tes fonctions existantes adaptées
export const checkIdAlert = (data?: any) => {
  if (!data?.id) {
    alertError("Une erreur s'est produite. Veuillez réessayer");
    return false;
  }
  return true;
};

export const alertServerError = (error: any, defaultMessage: string = "Une erreur est survenue"): string => {
  console.error("Erreur détaillée:", error);
  
  let errorMessage = defaultMessage;
  
  if (error?.message) {
    const parts = error.message.split(': ');
    errorMessage = parts[parts.length - 1];
  } 
  else if (typeof error === 'string') {
    errorMessage = error;
  }
  else if (error?.error) {
    errorMessage = error.error;
  }

  else if ( error?.response?.data?.message) {

  errorMessage =  error?.response?.data?.message
  }


  alertError(errorMessage);
  return errorMessage;
};

export const getErrorMessage = (error: any, defaultMessage: string = "Une erreur est survenue"): string => {
  console.error("Erreur détaillée:", error);
  
  let errorMessage = defaultMessage;
  
  if (error?.message) {
    const parts = error.message.split(': ');
    errorMessage = parts[parts.length - 1];
  } 
  else if (typeof error === 'string') {
    errorMessage = error;
  }
  else if (error?.error) {
    errorMessage = error.error;
  }
  
  return errorMessage;
};
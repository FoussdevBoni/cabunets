export const confirmModal = (message: string, title: string = 'Confirmation'): Promise<boolean> => {
  return new Promise((resolve) => {
    // Nettoyer les modals existants
    const existingModal = document.getElementById('custom-confirm-modal');
    if (existingModal) existingModal.remove();

    const modalDiv = document.createElement('div');
    modalDiv.id = 'custom-confirm-modal';
    modalDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 24px;
      min-width: 320px;
      max-width: 400px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
    `;
    
    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    titleEl.style.cssText = `
      margin: 0 0 12px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    `;
    
    const messageP = document.createElement('p');
    messageP.textContent = message;
    messageP.style.cssText = `
      margin-bottom: 24px;
      color: #4b5563;
      line-height: 1.5;
      white-space: pre-line;
    `;
    
    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.cssText = `
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    `;
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Annuler';
    cancelBtn.style.cssText = `
      padding: 8px 16px;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    `;
    
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Confirmer';
    confirmBtn.style.cssText = `
      padding: 8px 16px;
      border: none;
      background: #dc2626;
      color: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    `;
    
    const cleanup = () => {
      if (modalDiv && modalDiv.parentNode) {
        modalDiv.remove();
      }
      document.removeEventListener('keydown', handleEsc);
    };
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cleanup();
        resolve(false);
      }
    };
    
    cancelBtn.onclick = () => {
      cleanup();
      resolve(false);
    };
    
    confirmBtn.onclick = () => {
      cleanup();
      resolve(true);
    };
    
    modalDiv.onclick = (e) => {
      if (e.target === modalDiv) {
        cleanup();
        resolve(false);
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    
    buttonsDiv.appendChild(cancelBtn);
    buttonsDiv.appendChild(confirmBtn);
    contentDiv.appendChild(titleEl);
    contentDiv.appendChild(messageP);
    contentDiv.appendChild(buttonsDiv);
    modalDiv.appendChild(contentDiv);
    document.body.appendChild(modalDiv);
  });
};
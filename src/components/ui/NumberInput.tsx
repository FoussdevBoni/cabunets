import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // On peut ajouter des props personnalisées ici si besoin
}

export const Input = ({ value, onChange, onFocus, type, ...props }: InputProps) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return;

    // Logique pour supprimer le "0" par défaut sur les types number
    if (type === 'number') {
      const val = e.target.value;
      // Si l'utilisateur tape alors qu'il n'y a qu'un 0, on remplace
      if (val.length > 1 && val.startsWith('0')) {
        e.target.value = val.replace(/^0+/, '');
      }
    }

    onChange(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Sélectionne le texte au focus pour effacer facilement le 0
    if (type === 'number' && e.target.value === '0') {
      e.target.select();
    }
    if (onFocus) onFocus(e);
  };

  return (
    <input
      {...props}
      type={type}
      value={value}
      onChange={handleChange}
      onFocus={handleFocus}
      className={`custom-input-style ${props.className || ''}`}
    />
  );
};

export default Input;
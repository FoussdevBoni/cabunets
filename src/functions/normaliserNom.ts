


export const normaliserNom = (label: string): string => {
  return label
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[/+&]+/g, ' ')           // remplace les séparateurs connus par un espace
    .replace(/[^a-z0-9\s-]/g, '')      // supprime tout sauf lettres, chiffres, tirets, espaces
    .replace(/\s+/g, '-')              // transforme espaces en tirets
    .replace(/-+/g, '-')               // fusionne les tirets consécutifs
    .replace(/^-+|-+$/g, '');          // supprime tirets en début/fin
};

export function calculerAge(dateNaissanceStr: string ): number {
  const [annee, mois, jour] = dateNaissanceStr.split("-").map(Number);
  const naissance = new Date(annee, mois - 1, jour);
  const aujourdHui = new Date();

  let age = aujourdHui.getFullYear() - naissance.getFullYear();

  // Vérifie si l'anniversaire est déjà passé cette année
  if (
    aujourdHui.getMonth() < (mois - 1) ||
    (aujourdHui.getMonth() === (mois - 1) && aujourdHui.getDate() < jour)
  ) {
    age--;
  }

  return age;
}

// Exemple
console.log(calculerAge("2000-10-05")); 

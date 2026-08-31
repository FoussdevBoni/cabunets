/**
 * Normalise un numéro de téléphone au format international RDC (243)
 * @param phone Le numéro brut saisi par l'utilisateur
 * @returns Le numéro formaté (ex: "243815625169")
 */
export const formatToRDCPhone = (phone: string): string => {
  if (!phone) return ""

  // 1. Supprimer tous les espaces, tirets, plus et caractères non numériques
  let cleaned = phone.replace(/\D/g, "")

  // 2. Si le numéro commence par '0', on retire le zéro initial
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1) // "0815625169" -> "815625169"
  }

  // 3. Si le numéro ne commence pas déjà par l'indicatif 243, on l'ajoute
  if (!cleaned.startsWith("243")) {
    cleaned = `243${cleaned}` // "815625169" -> "243815625169"
  }

  return cleaned
}
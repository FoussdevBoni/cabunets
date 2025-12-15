export function generateUniqueId(id1: string, id2: string) {
    // Trier les ID pour garantir l'unicité
    const sortedIds = [id1, id2].sort().join('-');

    return btoa(sortedIds).replace(/=+$/, ''); 
}
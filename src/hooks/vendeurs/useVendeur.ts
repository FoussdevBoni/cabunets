import { useEffect, useState } from 'react';
import useVendeurs, { vendeursService } from './useVendeurs';
import { User, Vendeur } from '../../utils/database';

interface Props {
    vendeurId: string
}


const useVendeur = ({ vendeurId }: Props) => {
    const {updateItem: updateVendeur} = useVendeurs({})
    const [vendeur, setVendeur] = useState<Vendeur | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const getVendeur = async () => {
        setLoading(true);
        try {
            const vendeurData = await vendeursService.getById(vendeurId);
            setVendeur(vendeurData);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (vendeurId) getVendeur();
    }, [vendeurId]);

    return { vendeur, vendeurError: error, vendeurLoading: loading, getVendeur , updateVendeur };
};

export { useVendeur };

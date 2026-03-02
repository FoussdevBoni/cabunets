import { useEffect, useState } from 'react';
import { Offre } from '../../utils/database';
import { offresService } from './useOffres';

interface Props {
    offreId: string
}


const useOffre = ({ offreId }: Props) => {
    const [offre, setOffre] = useState<Offre | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const getOffre = async () => {
        setLoading(true);
        try {
            const offreData = await offresService.getById(offreId);
            setOffre(offreData);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (offreId) getOffre();
    }, [offreId]);

    return { offre, offreError: error, offreLoading: loading, getOffre };
};

export { useOffre };

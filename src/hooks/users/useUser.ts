import { useEffect, useState } from 'react';
import useUsers, { userService } from './useUsers';
import { User } from '../../utils/database';

interface Props {
    userId: string
}


const useUser = ({ userId }: Props) => {
    const {updateItem: updateUser} = useUsers({})
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const getUser = async () => {
        setLoading(true);
        try {
            const userData = await userService.getById(userId);
            setUser(userData);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) getUser();
    }, [userId]);

    return { user, userError: error, userLoading: loading, getUser , updateUser };
};

export { useUser };

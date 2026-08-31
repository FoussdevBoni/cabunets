// src/hooks/useCategories.ts
import {  Client } from '../../utils/database'
import { dataService, QueryFilters } from '../../services/dataService'
import { useData } from '../data/useData'


export const clientsService = dataService<Client>('clients')

interface Props {
  filters?: QueryFilters
}

export default function useClients({ filters }: Props) {
  return useData<Client>(clientsService, filters)
}

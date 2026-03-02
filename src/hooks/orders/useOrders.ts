// src/hooks/useOrders.ts
import { Order } from '../../utils/database'
import { dataService, QueryFilters } from '../../services/dataService'
import { useData } from '../data/useData'

export const ordersService = dataService<Order>('orders')

interface Props {
  filters?: QueryFilters
}

export default function useOrders({ filters }: Props) {
  return useData<Order>(ordersService, filters)
}

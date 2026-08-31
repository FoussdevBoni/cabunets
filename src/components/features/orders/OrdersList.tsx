// components/orders/OrdersList.tsx

import { Order } from "../../../utils/database";
import TableList, { SelectAction } from "../../ui/TableList";
import OrderRow from "./OrderRow";

interface OrdersListProps {
  orders: Order[];
  onAction: (order: Order) => void;
  onSelectOrders?: (selectedOrders: Order[]) => void;
  selectable?: boolean;
  selectActions?: SelectAction[];
  onTraitOrder?: (orderId: string) => void;
  processingIds?: Record<string, boolean>;
}

export default function OrdersList({
  orders,
  onAction,
  onSelectOrders,
  selectable = false,
  selectActions,
  onTraitOrder,
  processingIds = {},
}: OrdersListProps) {
  const columns = [
    { header: "Client & Paiement", className: "w-1/5" },
    { header: "Vendeur", className: "w-1/6" },
    { header: "Réseau & Montant", className: "w-1/6" },
    { header: "Statut", className: "w-1/12" },
    { header: "WhatsApp", className: "w-1/6" },
    { header: "Date", className: "hidden lg:table-cell w-1/6" },
  ];

  return (
    <TableList
      items={orders}
      columns={columns}
      getId={(order) => order.id || order._id || ""}
      onAction={onAction}
      onSelectItems={onSelectOrders}
      selectable={selectable}
      emptyMessage="Aucune commande trouvée"
      actionColumn={true}
      selectActions={selectActions}
      renderRow={(order, isSelected, onSelect) => (
        <OrderRow
          key={order.id || order._id || ""}
          order={order}
          onAction={onAction}
          onSelect={onSelect}
          isSelected={isSelected}
          selectable={selectable}
          onTraitOrder={onTraitOrder}
          processingIds={processingIds}
        />
      )}
    />
  );
}
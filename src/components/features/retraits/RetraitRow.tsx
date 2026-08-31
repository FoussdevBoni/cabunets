// components/retraits/RetraitRow.tsx
import { formatDate } from "../../../functions/formatDate";
import TableRow from "../../ui/TableRow";
import { Retrait } from "../../../types/Retrait";

interface RetraitRowProps {
    retrait: Retrait;
    onAction: (retrait: Retrait) => void;
    onSelect?: (retrait: Retrait, isSelected: boolean) => void;
    isSelected?: boolean;
    selectable?: boolean;
}

export default function RetraitRow({
    retrait,
    onAction,
    onSelect,
    isSelected = false,
    selectable = false,
}: RetraitRowProps) {
    const getStatusColor = (status?: Retrait["status"]) => {
        const normalized = status?.toUpperCase();
        if (normalized === "COMPLETED") return "bg-green-100 text-green-800";
        if (normalized === "REJECTED") return "bg-red-100 text-red-800";
        return "bg-yellow-100 text-yellow-800";
    };

    const getStatusText = (status?: Retrait["status"]) => {
        const normalized = status?.toUpperCase();
        if (normalized === "COMPLETED") return "Validé";
        if (normalized === "REJECTED") return "Rejeté";
        return "En attente";
    };

    return (
        <TableRow
            item={retrait}
            onAction={onAction}
            onSelect={onSelect}
            isSelected={isSelected}
            selectable={selectable}
            actionable={true}
        >
            <td className="py-3 px-4">
                <div>
                    <span className="font-medium text-gray-900 block">{retrait?.vendeur?.username}</span>
                    {retrait.methodPayment?.intitule && (
                        <span className="text-gray-500 text-xs">{retrait.methodPayment.intitule}</span>
                    )}
                </div>
            </td>

            <td className="py-3 px-4">
                <span className="font-bold text-gray-900">
                    {retrait.amount?.toLocaleString()} FCFA
                </span>
            </td>

            <td className="py-3 px-4">
                <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${retrait.methodPayment?.type === "Momo"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}>
                        {retrait.methodPayment?.type === "Momo" ? "Mobile Money" : "Banque"}
                    </span>
                    <div className="mt-1 space-y-0.5">
                        <p className="text-xs text-gray-600">
                            <span className="font-medium">N°:</span> {retrait.methodPayment?.number}
                        </p>
                        <p className="text-xs text-gray-600">
                            <span className="font-medium">Titulaire:</span> {retrait.methodPayment?.intitule}
                        </p>
                    </div>
                </div>
            </td>

            <td className="py-3 px-4">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(retrait.status)}`}>
                    {getStatusText(retrait.status)}
                </span>
            </td>



            <td className="hidden lg:table-cell py-3 px-4">
                <span className="text-gray-500 text-sm">
                    {retrait.createdAt ? formatDate(retrait.createdAt) : "-"}
                </span>
            </td>
        </TableRow>
    );
}
import HorizontalTabLayout from "./HorizontalTabLayout"
import { useNavigate, useParams } from "react-router-dom"
import { ReactNode, useState } from "react"
import { TabItem } from "../components/ui/HorizontalTab"


interface SectorsTabLayoutProps {
    children: ReactNode
}
export default function VendeurDetailsTabLayout({ children }: SectorsTabLayoutProps) {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('')

      const { vendeurId } = useParams<{ vendeurId: string }>();
     
    const menuTab: TabItem[] = [
        {
            label: "Vue d'ensemble",
            value: "overview"
        },
        {
            label: "Offres",
            value: "offres"
        },
        {
            label: "Commandes",
            value: "orders"
        },
        {
            label: "Retraits",
            value: "retraits"
        }
    ]

    const handleChangeSector = (tab: string) => {
        setActiveTab(tab)
        navigate(`/admin/vendeur-details/${tab}/${vendeurId}`)
    }



    return (
        <HorizontalTabLayout activeTab={activeTab} onChange={handleChangeSector} tabs={menuTab} >
            {children}
        </HorizontalTabLayout>
    )
}

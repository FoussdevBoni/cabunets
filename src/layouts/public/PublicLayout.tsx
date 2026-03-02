import { ReactNode } from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"

interface PublicLayoutProps {
  children: ReactNode
}
export default function PublicLayout({children}: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {children}

      <Footer />
    </div>
  )
}

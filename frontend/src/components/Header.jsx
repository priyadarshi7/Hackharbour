import { Link } from "react-router-dom"
import { MapPin, Phone, MessageSquare } from "react-feather"

const Header = () => {
  return (
    <header className="bg-emerald-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <Link to="/" className="flex items-center mb-4 md:mb-0">
            <img src="/placeholder.svg?height=40&width=40" alt="Jungle Safari Logo" className="h-10 w-10 mr-3" />
            <h1 className="text-2xl font-bold">Jungle Safari Booking</h1>
          </Link>

          <nav className="flex flex-wrap gap-4 md:gap-6">
            <Link to="/" className="flex items-center hover:text-emerald-300 transition-colors">
              <MapPin size={18} className="mr-1" />
              <span>Book Safari</span>
            </Link>
            <Link to="/complaint" className="flex items-center hover:text-emerald-300 transition-colors">
              <MessageSquare size={18} className="mr-1" />
              <span>Support</span>
            </Link>
            <a href="tel:+1234567890" className="flex items-center hover:text-emerald-300 transition-colors">
              <Phone size={18} className="mr-1" />
              <span>Contact</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header


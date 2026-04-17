"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/grading", label: "Grading Tool" },
  { href: "#info", label: "Chilli Info" },
  { href: "#faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const pathname = usePathname()

  // 🔥 Active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["info", "faq"]

      let current = ""
      sections.forEach((id) => {
        const element = document.getElementById(id)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 120 && rect.bottom >= 120) {
            current = id
          }
        }
      })

      setActiveSection(current)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // 🔥 NAVIGATION HANDLER (FIXED)
  const handleNavigation = (href: string) => {
    if (href.startsWith("#")) {
      if (pathname !== "/") {
        window.location.href = "/" + href
      } else {
        const el = document.getElementById(href.replace("#", ""))
        if (el) {
          el.scrollIntoView({ behavior: "smooth" })
        }
      }
    } else {
      window.location.href = href
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* LOGO */}
        <Link href="/" className="text-xl font-semibold text-gray-900">
          ByadgiGrade
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href === "#info" && activeSection === "info") ||
              (link.href === "#faq" && activeSection === "faq")

            return (
              <button
                key={link.href}
                onClick={() => handleNavigation(link.href)}
                className={`text-sm font-medium transition ${
                  isActive
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {link.label}
              </button>
            )
          })}
        </nav>

        {/* MOBILE BUTTON */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="flex flex-col gap-4 px-4 py-4">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => {
                  handleNavigation(link.href)
                  setMobileMenuOpen(false)
                }}
                className="text-sm font-medium text-gray-700 text-left"
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
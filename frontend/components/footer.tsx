import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer id="contact" className="border-t border-border bg-card py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Project Info */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-primary">ByadgiGrade</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              AI-powered Byadgi Chilli Quality Grading System. Helping farmers
              and traders assess chilli quality with precision and speed.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/grading" className="hover:text-primary">
                  Grading Tool
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-primary" />
                <span>info@byadgigrade.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-primary" />
                <span>+91 1234567890</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>Byadgi, Karnataka, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} ByadgiGrade. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

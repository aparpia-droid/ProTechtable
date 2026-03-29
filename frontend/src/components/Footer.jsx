import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-navy/10 bg-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2">
        <div>
          <p className="font-semibold">ProTechtable</p>
          <p className="mt-2 text-sm text-white/80">
            Understand your digital exposure and take action.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-4 text-sm">
            <li>
              <a href="#about" className="underline-offset-2 hover:underline">
                About
              </a>
            </li>
            <li>
              <Link to="/privacy" className="underline-offset-2 hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="underline-offset-2 hover:underline">
                Terms of Service
              </Link>
            </li>
            <li>
              <a href="mailto:support@protechtable.com" className="underline-offset-2 hover:underline">
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/70">
        © {new Date().getFullYear()} ProTechtable. All rights reserved.
      </div>
    </footer>
  );
}

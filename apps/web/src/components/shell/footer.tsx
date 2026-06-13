import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-slate-700/50 bg-slate-900 py-8 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-white mb-4">Orion</h3>
            <p className="text-sm text-slate-400">
              Automated quality assurance for your web applications.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/manual" className="hover:text-white transition-colors">
                  Manual Audit
                </Link>
              </li>
              <li>
                <Link href="/runs" className="hover:text-white transition-colors">
                  View Runs
                </Link>
              </li>
              <li>
                <Link href="/repos" className="hover:text-white transition-colors">
                  Repositories
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://docs.example.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Documentation
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Website
                </a>
              </li>
              <li>
                <a href="mailto:support@example.com" className="hover:text-white transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700/50 pt-8">
          <p className="text-center text-sm text-slate-400">
            &copy; 2026 Orion. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

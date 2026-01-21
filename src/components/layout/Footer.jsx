import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#08080c] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">&lt;/&gt;</span>
              </div>
              <span className="text-xl font-bold text-white">CodeSupport</span>
            </Link>
            <p className="text-gray-500 max-w-sm">
              Professional coding assistance for students worldwide. Quality code, on time.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <div className="space-y-3">
              {[
                { name: 'Services', path: '/services' },
                { name: 'Pricing', path: '/pricing' },
                { name: 'Contact', path: '/contact' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block text-gray-500 hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <div className="space-y-3 text-gray-500">
              <p>support@codesupport.com</p>
              <p>Available 24/7</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} CodeSupport. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

import { Link } from 'react-router-dom';
import { Logo } from '../ui';

function Footer() {


  return (
    <footer className="bg-black border-t border-gray-800 mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <div className="mb-6">
              <Logo 
                size="lg" 
                showText={true}
                textClassName="text-2xl"
              />
            </div>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed">
              Your premier destination for discovering and streaming movies and TV shows. 
              Enjoy unlimited entertainment with our vast collection of content from around the world.
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-lg">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/privacy" 
                  className="text-gray-400 hover:text-white text-sm transition-colors hover:underline"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-gray-400 hover:text-white text-sm transition-colors hover:underline"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  to="/dmca" 
                  className="text-gray-400 hover:text-white text-sm transition-colors hover:underline"
                >
                  DMCA Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-lg">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-400 hover:text-white text-sm transition-colors hover:underline"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-400 hover:text-white text-sm transition-colors hover:underline"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 Starlight. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <p className="text-gray-400 text-sm">
                Made with ❤️ for movie lovers
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
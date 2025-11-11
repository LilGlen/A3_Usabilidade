import { Twitter, Facebook, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1A1A1A] border-t border-[#333333] mt-16">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-wrap justify-between items-start mb-8">
          {/* Links Section */}
          <div className="flex flex-wrap space-x-8 text-gray-400">
            <a href="#" className="hover:text-white transition text-sm">About Us</a>
            <a href="#" className="hover:text-white transition text-sm">Support</a>
            <a href="#" className="hover:text-white transition text-sm">Termsat</a>
            <a href="#" className="hover:text-white transition text-sm">Terms of Service</a>
          </div>

          {/* Social Icons */}
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Decorative Element (Diamond shape from the prototype) */}
        <div className="flex justify-center">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 transform rotate-45 rounded-sm opacity-50"></div>
        </div>
      </div>
    </footer>
  );
}
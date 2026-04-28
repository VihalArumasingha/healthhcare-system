import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-teal-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6 md:order-2">
            <a href="#" className="text-gray-500 hover:text-teal-600 transition-colors">About Us</a>
            <a href="#" className="text-gray-500 hover:text-teal-600 transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-teal-600 transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-500 hover:text-teal-600 transition-colors">Contact</a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} HealthEase. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
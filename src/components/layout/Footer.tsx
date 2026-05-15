import React from 'react';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps {
  companyName: string;
  version?: string;
  links?: Array<FooterLink>;
}

const Footer: React.FC<FooterProps> = ({
  companyName,
  version,
  links = [],
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex flex-col items-center justify-center h-16 text-sm text-gray-500 px-4">
      <p className="mb-1">
        &copy; {currentYear} {companyName}. All rights reserved.
        {version && <span className="ml-2 text-gray-400">v{version}</span>}
      </p>
      {links.length > 0 && (
        <div className="space-x-2">
          {links.map((link, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-gray-400">|</span>}
              <a
                href={link.href}
                className="hover:underline hover:text-gray-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            </React.Fragment>
          ))}
        </div>
      )}
    </footer>
  );
};

export default Footer;

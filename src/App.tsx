import React from 'react';
import bioDepotLogo from '/biodepot.png';
import DataExplorer from './components/DataExplorer';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col">
      <header className="w-full bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <a 
              href="https://github.com/BioDepot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <img 
                src={bioDepotLogo} 
                className="w-48 h-16 mr-8" 
                alt="Biodepot Logo" 
              />
            </a>
            <h1 className="text-3xl font-bold text-gray-800 hidden sm:block">
              CRDC Integrator
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col p-4 sm:p-8">
        <div className="max-w-5xl w-full mx-auto bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Welcome to CRDC Integrator</h2>
          <p className="text-gray-600">
            Explore and analyze data from NCI Genomic Data Commons (GDC) and NCI Imaging Data Commons (IDC) with our intuitive interface.
          </p>
        </div>
        <div className="flex-grow bg-white rounded-lg shadow-lg overflow-hidden">
          <DataExplorer />
        </div>
      </main>
    </div>
  );
}

export default App;
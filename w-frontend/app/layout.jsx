import './globals.css';
import { AppProvider } from '../src/Hooks/useAppContext';
import AppCloudBackground from '../src/components/layout/AppCloudBackground';

export const metadata = {
  title: 'WeatherWise',
  description: ''
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col text-slate-950 selection:bg-blue-600 selection:text-white bg-transparent">
        <AppProvider>
          <AppCloudBackground />
          <div className="relative z-10 flex-1 flex flex-col">
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  );
}

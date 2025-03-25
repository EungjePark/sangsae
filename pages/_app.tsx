import type { AppProps } from 'next/app';
import { Inter as FontSans } from 'next/font/google';
import { ThemeProvider } from 'next-themes';

import '../styles/globals.css';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className={`min-h-screen font-sans ${fontSans.variable}`}>
        <Component {...pageProps} />
      </div>
    </ThemeProvider>
  );
}

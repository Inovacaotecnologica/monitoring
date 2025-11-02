import type { AppProps } from 'next/app';
import '../styles/globals.css';

import { I18nProvider } from '../contexts/I18nContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import Layout from '../components/Layout';
import { UserProvider } from '../contexts/UserContext';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <UserProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </UserProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
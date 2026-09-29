import { inter, jakarta } from './fonts';
import './loans.css';

/**
 * One page, so one layout.
 *
 * It does nothing but hang the two font variables on <html> and get out of the
 * way: the page's own stylesheet owns everything from the background colour up,
 * scoped under .lp-root.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${jakarta.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}

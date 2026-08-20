import type { Metadata } from 'next'; import './globals.css';
export const metadata: Metadata={title:'Zaki Akdas Choudhary — Web Developer',description:'Professional modern websites and digital experiences for businesses of every kind.',metadataBase:new URL('https://example.com'),openGraph:{title:'Zaki Akdas Choudhary — Web Developer',description:'Professional websites for businesses of every kind.',type:'website'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}

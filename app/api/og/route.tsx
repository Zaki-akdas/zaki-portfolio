import {ImageResponse} from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #050510 0%, #0a0a1a 50%, #10102a 100%)',
        padding: '80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Nebula blobs */}
        <div style={{position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(108, 60, 224, 0.2), transparent 70%)', filter: 'blur(60px)'}} />
        <div style={{position: 'absolute', bottom: '-80px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15), transparent 70%)', filter: 'blur(60px)'}} />

        {/* Planet */}
        <div style={{position: 'absolute', right: '100px', top: '50%', transform: 'translateY(-50%)', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, #2a4a8a, #1a3a6e, #0a1a3a)', boxShadow: '0 0 80px rgba(108, 60, 224, 0.3), 0 0 160px rgba(59, 130, 246, 0.15)'}} />

        {/* Name */}
        <div style={{fontSize: '72px', fontWeight: 900, fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-2px', lineHeight: '0.95', color: '#e8e0ff', zIndex: 1}}>
          Zaki Akdas Choudhary
        </div>

        {/* Title */}
        <div style={{fontSize: '28px', fontWeight: 700, color: '#a78bfa', letterSpacing: '6px', marginTop: '24px', fontFamily: 'Inter, system-ui, sans-serif', zIndex: 1}}>
          WEB DEVELOPER
        </div>

        {/* Description */}
        <div style={{fontSize: '20px', color: '#6b6880', marginTop: '16px', fontFamily: 'Inter, system-ui, sans-serif', zIndex: 1}}>
          Professional modern websites and digital experiences
        </div>

        {/* URL */}
        <div style={{fontSize: '16px', color: '#4a4760', marginTop: 'auto', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '2px', zIndex: 1}}>
          zakiakdas.vercel.app
        </div>
      </div>
    ),
    {width: 1200, height: 630}
  );
}

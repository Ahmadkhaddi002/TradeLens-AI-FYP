export function GradientMesh({ className = '', opacity = 0.5 }: { className?: string; opacity?: number }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <div
        className="absolute w-[120%] h-[120%] rounded-full"
        style={{
          background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
          filter: 'blur(100px)',
          opacity: opacity,
          top: '40%',
          left: '40%',
          animation: 'drift-1 20s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[120%] h-[120%] rounded-full"
        style={{
          background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
          filter: 'blur(100px)',
          opacity: opacity,
          top: '30%',
          left: '60%',
          animation: 'drift-2 25s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[120%] h-[120%] rounded-full"
        style={{
          background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
          filter: 'blur(100px)',
          opacity: opacity,
          top: '60%',
          left: '30%',
          animation: 'drift-3 30s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[120%] h-[120%] rounded-full"
        style={{
          background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
          filter: 'blur(100px)',
          opacity: opacity,
          top: '70%',
          left: '70%',
          animation: 'drift-4 18s ease-in-out infinite',
        }}
      />
    </div>
  );
}

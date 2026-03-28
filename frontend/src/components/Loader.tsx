import React from 'react';

interface LoaderProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function Loader({ message = 'Generating...', size = 'md' }: LoaderProps) {
    const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-3 h-3' : 'w-2 h-2';

    return (
        <div className="flex flex-col items-center justify-center gap-4 py-6 w-full">
            {/* Animated logo mark */}
            <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <svg
                        className="w-5 h-5 text-accent animate-spin-slow"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                    </svg>
                </div>
                {/* Pulsing ring */}
                <div className="absolute inset-0 rounded-xl border border-accent/20 animate-ping opacity-30" />
            </div>

            {/* Typing dots */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className={`${dotSize} rounded-full bg-accent/60`}
                            style={{
                                animation: 'bounceDot 1.4s ease-in-out infinite',
                                animationDelay: `${i * 0.2}s`,
                            }}
                        />
                    ))}
                </div>
                <span className="text-sm text-gray-500 font-medium">{message}</span>
            </div>

            {/* Shimmer bars */}
            <div className="w-full max-w-xs space-y-2 mt-2">
                {[100, 80, 65].map((w, i) => (
                    <div key={i} className="h-1.5 rounded-full skeleton" style={{ width: `${w}%` }} />
                ))}
            </div>
        </div>
    );
}
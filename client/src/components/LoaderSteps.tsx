import { Sparkles, Brain, Code2, Rocket, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

const steps = [
    { icon: Brain, label: 'Analyzing your blueprint...', color: 'text-indigo-400' },
    { icon: Sparkles, label: 'Generating aesthetic layout...', color: 'text-violet-400' },
    { icon: Code2, label: 'Assembling UI components...', color: 'text-cyan-400' },
    { icon: Rocket, label: 'Igniting production build...', color: 'text-emerald-400' }
]

const STEP_DURATION = 15000 // Speed up for better UX feel (visual change)

const LoaderSteps = () => {
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((s) => (s + 1) % steps.length)
        }, STEP_DURATION)
        return () => clearInterval(interval)
    }, [])

    const ActiveIcon = steps[current].icon

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-background relative overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute top-1/4 left-1/4 w-[200px] h-[200px] bg-violet-500/10 blur-[100px] rounded-full animate-pulse delay-700"></div>

            {/* Central Animation */}
            <div className="relative z-10 w-48 h-48 flex items-center justify-center">
                {/* Rotating Rings */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20 animate-[spin_10s_linear_infinite]"></div>
                <div className="absolute inset-4 rounded-full border border-white/5 animate-[spin_15s_linear_infinite_reverse]"></div>
                <div className="absolute inset-8 rounded-full border-2 border-primary/30 animate-[spin_8s_linear_infinite]"></div>

                {/* Main Orb */}
                <div className="w-24 h-24 rounded-3xl glass flex items-center justify-center shadow-2xl shadow-primary/20 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-transparent"></div>
                    <ActiveIcon className={`w-10 h-10 ${steps[current].color} animate-fade-in drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]`} />
                </div>
            </div>

            {/* Stepper Feedback */}
            <div className="relative z-10 mt-12 flex flex-col items-center max-w-sm px-6">
                <div className="flex items-center gap-1.5 mb-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">System Engine</span>
                </div>
                
                <h3 key={current} className="text-xl md:text-2xl font-bold text-center animate-fade-in tracking-tight">
                    {steps[current].label}
                </h3>
                
                <p className="mt-4 text-sm text-muted-foreground text-center font-medium opacity-60">
                    Our AI is architecting your vision. This masterpiece will be ready momentarily.
                </p>

                {/* Visual Progress Bar */}
                <div className="w-48 h-1 bg-white/5 rounded-full mt-8 overflow-hidden border border-white/5">
                    <div 
                        className="h-full bg-linear-to-r from-primary via-violet-500 to-primary bg-[length:200%_100%] animate-[shimmer_2s_infinite_linear] transition-all duration-700 ease-in-out"
                        style={{ width: `${((current + 1) / steps.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Bottom Decorative Pattern */}
            <div className="absolute bottom-8 flex gap-8 items-center opacity-10">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 bg-foreground rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                ))}
            </div>
        </div>
    )
}

export default LoaderSteps

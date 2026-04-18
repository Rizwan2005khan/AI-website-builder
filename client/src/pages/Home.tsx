import api from '@/configs/axios';
import { authClient } from '@/lib/auth-client';
import { Loader2Icon, Sparkles, Wand2, ArrowRight } from 'lucide-react';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Home = () => {
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!session?.user) {
        return toast.error('Please sign in to create a project')
      } else if (!input.trim()) {
        return toast.error('Please enter a message')
      }

      setLoading(true)
      const { data } = await api.post('/api/user/project', { initial_prompt: input })
      setLoading(false)
      navigate(`/projects/${data.projectId}`)
    } catch (error: any) {
      setLoading(false)
      toast.error(error?.response?.data?.message || error.message)
      console.log(error)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <section className="flex flex-col items-center pt-32 pb-20 px-4 relative z-10">
        
        {/* Floating Badge */}
        <div className="animate-fade-in group cursor-pointer glass px-4 py-1.5 rounded-full flex items-center gap-2 mb-8 hover:bg-white/10 transition-colors border-white/5 shadow-xl">
          <span className="bg-linear-to-r from-indigo-500 to-violet-500 text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-lg">NEW</span>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1">
            v2.0 Beta is now live <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>

        <h1 className="text-center text-4xl leading-tight md:text-7xl md:leading-tight font-extrabold tracking-tight max-w-4xl animate-fade-in">
          Build <span className="text-gradient">Production Apps</span> <br className="hidden md:block" /> with Pure Thought.
        </h1>

        <p className="text-center text-lg md:text-xl text-muted-foreground max-w-2xl mt-6 animate-fade-in delay-100">
          The world's most advanced AI site builder. Generate high-fidelity, interactive websites with full state management in seconds.
        </p>

        <div className="w-full max-w-3xl mt-12 animate-float relative">
          <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 via-violet-500 to-cyan-500 rounded-3xl blur-xl opacity-20"></div>
          
          <form 
            onSubmit={onSubmitHandler} 
            className="relative glass rounded-3xl p-6 shadow-2xl border-white/10 focus-within:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-primary" />
              Project Blueprint
            </div>
            
            <textarea 
              onChange={e => setInput(e.target.value)} 
              className="bg-transparent outline-none text-lg text-foreground placeholder:text-muted-foreground/50 resize-none w-full min-h-[120px]" 
              placeholder="E.g., A luxury watch store with a dark theme, persistent shopping cart, and mock checkout flow..." 
              required 
            />
            
            <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
              <div className="text-[10px] text-muted-foreground italic">
                Press Enter to generate or click the magic wand
              </div>
              
              <button 
                disabled={loading}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white rounded-xl px-6 py-3 font-bold text-sm shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed group transition-all"
              >
                {!loading ? (
                  <>
                    Generate Magic <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  </>
                ) : (
                  <>
                    Architecting <Loader2Icon className="animate-spin w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Trust Badges */}
        <div className="mt-20 flex flex-col items-center gap-6 animate-fade-in delay-300">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground opacity-50">Trusted by modern teams</p>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            <img className="h-6 md:h-8" src="https://placehold.co/120x40/transparent/white?text=FRAMER" alt="Framer" />
            <img className="h-6 md:h-8" src="https://placehold.co/120x40/transparent/white?text=HUAWEI" alt="Huawei" />
            <img className="h-6 md:h-8" src="https://placehold.co/120x40/transparent/white?text=INSTAGRAM" alt="Instagram" />
            <img className="h-6 md:h-8" src="https://placehold.co/120x40/transparent/white?text=MICROSOFT" alt="Microsoft" />
            <img className="h-6 md:h-8" src="https://placehold.co/120x40/transparent/white?text=WALMART" alt="Walmart" />
          </div>
        </div>
      </section>

      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 blur-[120px] rounded-full -z-10 animate-pulse delay-700"></div>
    </div>
  )
}

export default Home

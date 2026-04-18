import {
  Bot,
  Eye,
  Loader2,
  Send,
  User,
  History,
  CheckCircle2,
  RotateCcw
} from "lucide-react"
import type { Project, Message, Version } from "../types"
import { Link } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import api from "@/configs/axios"
import { toast } from "sonner"

interface SidebarProps {
  isMenuOpen: boolean
  project: Project
  setProject: (project: Project) => void
  isGenerating: boolean
  setIsGenerating: (isGenerating: boolean) => void
}

const Sidebar = ({
  isMenuOpen,
  project,
  setProject,
  isGenerating,
  setIsGenerating,
}: SidebarProps) => {
  const messageRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<number | null>(null)

  const [input, setInput] = useState("")

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/api/user/project/${project.id}`)
      setProject(data.project)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  const handleRollback = async (versionId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to rollback to this version? Current changes may be lost."
    )
    if (!confirmed || isGenerating) return

    try {
      setIsGenerating(true)
      await api.get(`/api/project/rollback/${project.id}/${versionId}`)
      await fetchProject()
      toast.success("Project rolled back successfully")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRevision = async (e: React.FormEvent) => {
    e.preventDefault()
    const message = input.trim()
    if (isGenerating || !message) return

    setInput("")
    setIsGenerating(true)

    try {
      intervalRef.current = window.setInterval(fetchProject, 3000)
      const { data } = await api.post(`/api/project/versions/${project.id}`, { message })
      toast.success(data.message)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
    } finally {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      await fetchProject()
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [project.conversation.length, project.versions.length, isGenerating])

  const timeline = [
    ...project.conversation.map((c) => ({ ...c, type: "message" as const })),
    ...project.versions.map((v) => ({ ...v, type: "version" as const })),
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  return (
    <div
      className={`h-full lg:w-[400px] border-r border-white/5 transition-all duration-500 ease-in-out bg-card/20 backdrop-blur-md ${
        isMenuOpen ? "translate-x-0 w-full fixed inset-0 z-[60] lg:relative lg:translate-x-0" : "max-lg:-translate-x-full max-lg:w-0 overflow-hidden"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Activity Timeline</h3>
        </div>

        {/* Timeline Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
          {timeline.map((item) => {
            if (item.type === "message") {
              const msg = item as Message
              const isUser = msg.role === "user"

              return (
                <div key={msg.id} className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                    isUser ? "bg-secondary text-foreground" : "bg-primary text-white"
                  }`}>
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`group relative max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all hover:shadow-md ${
                    isUser 
                        ? "bg-primary text-white rounded-tr-none" 
                        : "bg-white/5 text-foreground rounded-tl-none border border-white/5"
                  }`}>
                    {msg.content}
                    <div className={`absolute bottom-full mb-1 text-[10px] text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? "right-0" : "left-0"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )
            }

            const ver = item as Version
            const isCurrent = project.current_version_index === ver.id

            return (
              <div key={ver.id} className="relative pl-8 pb-1 border-l border-white/5 ml-4">
                <div className={`absolute -left-2.5 top-0 w-5 h-5 rounded-full flex items-center justify-center shadow-lg ${
                    isCurrent ? "bg-green-500/20 text-green-500 border border-green-500/20" : "bg-white/10 text-muted-foreground border border-white/10"
                }`}>
                    {isCurrent ? <CheckCircle2 className="w-3 h-3" /> : <RotateCcw className="w-3 h-3" />}
                </div>

                <div className="glass rounded-2xl p-4 space-y-3 transition-all hover:bg-white/10">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Code Version</span>
                        <span className="text-[10px] text-muted-foreground/50">{new Date(ver.timestamp).toLocaleTimeString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                        {isCurrent ? (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold border border-green-500/10">
                                Active Version
                            </div>
                        ) : (
                            <button
                                onClick={() => handleRollback(ver.id)}
                                className="px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold border border-primary/20 transition-all flex items-center gap-1.5"
                            >
                                <RotateCcw className="w-3 h-3" /> Rollback
                            </button>
                        )}

                        <Link 
                            target="_blank" 
                            to={`/preview/${project.id}/${ver.id}`}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
                        >
                            <Eye className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
              </div>
            )
          })}

          {isGenerating && (
            <div className="flex items-start gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white/5 border border-white/5 text-foreground rounded-2xl rounded-tl-none p-3 flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
              </div>
            </div>
          )}

          <div ref={messageRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/5 bg-card/10 backdrop-blur-sm">
            <form onSubmit={handleRevision} className="relative group">
                <div className="absolute -inset-1 bg-linear-to-r from-primary to-violet-500 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-20 transition-all duration-500"></div>
                
                <div className="relative glass rounded-2xl overflow-hidden shadow-2xl transition-all border-white/10 group-focus-within:border-primary/50">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        rows={3}
                        placeholder="Request specific changes or add features..."
                        className="w-full p-4 pr-14 bg-transparent outline-none text-sm text-foreground placeholder-muted-foreground/50 resize-none min-h-[100px]"
                    />

                    <button
                        disabled={isGenerating || !input.trim()}
                        className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 active:scale-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isGenerating ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        )}
                    </button>
                </div>
            </form>
            <p className="mt-3 text-[10px] text-center text-muted-foreground/50 font-medium uppercase tracking-widest">
                AI Agent is ready for commands
            </p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

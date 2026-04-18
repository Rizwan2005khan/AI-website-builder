import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import type { Project } from "../types"
import { 
  ArrowDownToLine, 
  Eye, 
  EyeOff, 
  Maximize, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Loader2, 
  MessageSquare, 
  Save, 
  X,
  ChevronLeft
} from "lucide-react"
import Sidebar from "../components/Sidebar"
import ProjectPreview, { type ProjectPreviewRef } from "../components/ProjectPreview"
import api from "@/configs/axios"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"

const Projects = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  const [isGenerating, setIsGenerating] = useState(true)
  const [device, setDevice] = useState<'phone' | 'tablet' | 'desktop'>('desktop')

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const previewRef = useRef<ProjectPreviewRef>(null)

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/api/user/project/${projectId}`);
      setProject(data.project)
      setIsGenerating(data.project.current_code ? false : true)
      setLoading(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
      console.log(error)
    }
  }

  const saveProject = async () => {
    if (!previewRef.current) return;
    const code = previewRef.current.getCode();
    if (!code) return
    setIsSaving(true)

    try {
      const { data } = await api.put(`/api/project/save/${projectId}`, { code });
      toast.success(data.message)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
      console.log(error)
    } finally {
      setIsSaving(false)
    }
  }

  const downloadCode = () => {
    const code = previewRef.current?.getCode() || project?.current_code;
    if (!code) return;
    
    const element = document.createElement('a')
    const file = new Blob([code], { type: "text/html" });
    element.href = URL.createObjectURL(file)
    element.download = `${project?.name.replace(/\s+/g, '-').toLowerCase() || 'index'}.html`;
    document.body.appendChild(element)
    element.click();
    document.body.removeChild(element);
  }

  const togglePublish = async () => {
    try {
      const { data } = await api.put(`/api/user/publish-toggle/${projectId}`);
      toast.success(data.message)
      setProject((prev) => prev ? ({ ...prev, isPublished: !prev.isPublished }) : null)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
      console.log(error)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchProject();
    } else if (!isPending && !session?.user) {
      navigate('/')
      toast("Please login to view your projects")
    }
  }, [session?.user])

  useEffect(() => {
    if (project && !project.current_code) {
      const intervalId = setInterval(fetchProject, 8000);
      return () => clearInterval(intervalId)
    }
  }, [project])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Initializing editor environment...</p>
      </div>
    )
  }

  return project ? (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      {/* Editor Header */}
      <header className="h-14 border-b border-white/5 bg-card/30 backdrop-blur-xl px-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/projects')}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="h-8 w-px bg-white/5 hidden sm:block"></div>
          
          <div className="flex flex-col">
            <h1 className="text-sm font-bold truncate max-w-[150px] sm:max-w-xs">{project.name}</h1>
            <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
                    {isGenerating ? 'Building...' : 'Live Preview'}
                </span>
            </div>
          </div>
        </div>

        {/* Device Toggles */}
        <div className="hidden lg:flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/5">
            <DeviceButton active={device === 'desktop'} onClick={() => setDevice('desktop')} icon={<Monitor className="w-4 h-4" />} />
            <DeviceButton active={device === 'tablet'} onClick={() => setDevice('tablet')} icon={<Tablet className="w-4 h-4" />} />
            <DeviceButton active={device === 'phone'} onClick={() => setDevice('phone')} icon={<Smartphone className="w-4 h-4" />} />
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Chat Toggle */}
          <button 
            className="lg:hidden p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <button 
                onClick={saveProject} 
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold border border-white/10 transition-all disabled:opacity-50"
            >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
            </button>

            <Link 
                to={`/preview/${projectId}`} 
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold border border-white/10 transition-all"
            >
                <Maximize className="w-4 h-4" />
                Preview
            </Link>

            <button 
                onClick={downloadCode}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-sm font-bold border border-primary/20 transition-all"
            >
                <ArrowDownToLine className="w-4 h-4" />
                Export
            </button>

            <button 
                onClick={togglePublish}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                    project.isPublished 
                    ? 'bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/20' 
                    : 'bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/20'
                }`}
            >
                {project.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {project.isPublished ? 'Unpublish' : 'Publish'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <Sidebar 
            isMenuOpen={isMenuOpen} 
            project={project} 
            setProject={setProject} 
            isGenerating={isGenerating} 
            setIsGenerating={setIsGenerating} 
        />
        <div className="flex-1 relative bg-black/20 p-2 sm:p-4 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
            <ProjectPreview 
                ref={previewRef} 
                project={project} 
                isGenerating={isGenerating} 
                device={device} 
            />
        </div>
      </main>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <div className="w-16 h-16 rounded-3xl bg-destructive/10 flex items-center justify-center">
        <X className="w-8 h-8 text-destructive" />
      </div>
      <h2 className="text-xl font-bold">Failed to load project</h2>
      <button onClick={() => navigate('/projects')} className="text-primary hover:underline font-medium">Return to dashboard</button>
    </div>
  )
}

const DeviceButton = ({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) => (
    <button 
        onClick={onClick}
        className={`p-2 rounded-lg transition-all ${active ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:bg-white/5'}`}
    >
        {icon}
    </button>
)

export default Projects

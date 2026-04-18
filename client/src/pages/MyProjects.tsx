import { useEffect, useState } from "react"
import type { Project } from "../types"
import { Loader2Icon, PlusIcon, Trash2, ExternalLink, Layout, Calendar } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Footer from "../components/Footer"
import api from "@/configs/axios"
import { toast } from "sonner"

const MyProjects = () => {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const navigate = useNavigate()

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/api/project/my')
      setProjects(data.projects)
      setLoading(false)
    } catch (error: any) {
      console.log(error)
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  const deleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return
    try {
      await api.delete(`/api/project/${projectId}`)
      setProjects(prev => prev.filter(p => p.id !== projectId))
      toast.success('Project deleted successfully')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <Loader2Icon className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : projects.length > 0 ? (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h1 className="text-3xl font-extrabold text-gradient">My Workspace</h1>
                <p className="text-muted-foreground mt-2">Manage and iterate on your AI-generated designs</p>
              </div>
              <button 
                onClick={() => navigate('/')} 
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                <PlusIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Build New Site</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div 
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="group relative glass rounded-3xl overflow-hidden cursor-pointer shadow-xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 border-white/5"
                >
                  {/* Browser-like Mini Preview */}
                  <div className="relative aspect-video bg-black/40 overflow-hidden border-b border-white/5">
                    <div className="absolute top-0 left-0 right-0 h-8 bg-white/5 flex items-center gap-1.5 px-4 z-10 border-b border-white/5">
                        <div className="w-2 h-2 rounded-full bg-red-400/50"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-400/50"></div>
                        <div className="w-2 h-2 rounded-full bg-green-400/50"></div>
                    </div>
                    
                    {project.current_code ? (
                      <div className="w-full h-full pt-8">
                        <iframe 
                          srcDoc={project.current_code}
                          className="w-[1200px] h-[800px] origin-top-left pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                          sandbox="allow-scripts allow-same-origin"
                          style={{ transform: 'scale(0.24)' }} 
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                        <Layout className="w-8 h-8 opacity-20" />
                        <p className="text-xs font-semibold tracking-widest uppercase opacity-20">Draft Mode</p>
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="glass px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            View Editor <ExternalLink className="w-3 h-3" />
                        </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
                        {project.name}
                      </h2>
                    </div>
                    
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-6 min-h-[40px]">
                      {project.initial_prompt}
                    </p>

                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/preview/${project.id}`) }}
                          className="p-2 hover:bg-white/10 rounded-xl transition-colors text-muted-foreground hover:text-foreground"
                          title="Preview Site"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteProject(project.id) }}
                          className="p-2 hover:bg-destructive/10 rounded-xl transition-colors text-muted-foreground hover:text-destructive"
                          title="Delete Project"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
              <Layout className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">No projects yet</h1>
            <p className="text-muted-foreground mt-2 max-w-xs text-center">Start your first AI project and bring your ideas to life.</p>
            <button 
              onClick={() => navigate('/')} 
              className="mt-8 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default MyProjects

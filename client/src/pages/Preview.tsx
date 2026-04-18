import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Loader2 } from "lucide-react"
import ProjectPreview from "../components/ProjectPreview"
import type { Project } from "../types"
import api from "@/configs/axios"
import { toast } from "sonner"

const Preview = () => {

  const {projectId, versionId} = useParams()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchCode = async () => {
    try {
      if (versionId) {
        // Previewing a specific version via project route
        const { data } = await api.get(`/api/project/preview/${projectId}`)
        const version = data.project?.versions?.find((v: any) => v.id === versionId)
        if (version?.code) {
          setCode(version.code)
        } else if (data.project?.current_code) {
          setCode(data.project.current_code)
        }
      } else {
        // Previewing current version — try authenticated route first
        const { data } = await api.get(`/api/project/preview/${projectId}`)
        if (data.project?.current_code) {
          setCode(data.project.current_code)
        }
      }
    } catch {
      // Fallback: try the public published route
      try {
        const { data } = await api.get(`/api/project/published/${projectId}`)
        if (data.code) setCode(data.code)
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load preview')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCode()
  }, [projectId, versionId])

  if(loading){
  return (
    <div className='flex items-center justify-center h-screen'>
      <Loader2 className='size-7 animate-spin text-indigo-200' />
    </div>
  )
 }
  return (
    <div className="h-screen">
       {code && 
       <ProjectPreview project={{current_code: code} as Project} isGenerating={false} showEditorPanel={false} />}
       {!code && !loading && (
        <div className="flex items-center justify-center h-screen text-white">
          <p className="text-xl text-gray-400">Preview not available</p>
        </div>
       )}
    </div>
  )
}

export default Preview

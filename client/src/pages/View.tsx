import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react';
import ProjectPreview from '../components/ProjectPreview';
import type { Project } from '../types';
import api from '@/configs/axios';
import { toast } from 'sonner';

const View = () => {
  const {projectId} = useParams();
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchCode = async () => {
    try {
      // Public route — only works for published projects
      const { data } = await api.get(`/api/project/published/${projectId}`)
      if (data.code) {
        setCode(data.code)
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCode()
  }, [projectId])

 if(loading){
  return (
    <div className='flex items-center justify-center h-screen'>
      <Loader2 className='size-7 animate-spin text-indigo-200' />
    </div>
  )
 }
  return (
    <div className='h-screen'>
       {code && 
       <ProjectPreview project={{current_code: code} as Project} isGenerating={false} showEditorPanel={false} />}
       {!code && !loading && (
        <div className="flex items-center justify-center h-screen text-white">
          <p className="text-xl text-gray-400">This project is not published or doesn't exist.</p>
        </div>
       )}
    </div>
  )
}

export default View

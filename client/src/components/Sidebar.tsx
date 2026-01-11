import {
  BotIcon,
  EyeIcon,
  Loader2,
  SendIcon,
  UserIcon,
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

  /* -------------------- helpers -------------------- */

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/api/user/project/${project.id}`)
      setProject(data.project)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  /* -------------------- rollback -------------------- */

  const handleRollback = async (versionId: string) => {
  const confirmed = window.confirm(
    "Are you sure you want to rollback to this version?"
  )
  if (!confirmed || isGenerating) return

  try {
    setIsGenerating(true)

    await api.get(
      `/api/project/rollback/${project.id}/${versionId}`
    )

    await fetchProject()
    toast.success("Project rolled back successfully")
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error.message)
  } finally {
    setIsGenerating(false)
  }
}


  /* -------------------- revision -------------------- */

  const handleRevision = async (e: React.FormEvent) => {
  e.preventDefault()
  if (isGenerating || !input.trim()) return

  
  setInput("")            
  setIsGenerating(true)

  try {
    intervalRef.current = window.setInterval(fetchProject, 2500)

    const { data } = await api.post(
      `/api/project/versions/${project.id}`
    )

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



  /* -------------------- auto scroll -------------------- */

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [project.conversation.length, project.versions.length, isGenerating])

  /* -------------------- timeline -------------------- */

  const timeline = [
    ...project.conversation.map((c) => ({
      ...c,
      type: "message" as const,
    })),
    ...project.versions.map((v) => ({
      ...v,
      type: "version" as const,
    })),
  ].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() -
      new Date(b.timestamp).getTime()
  )

  /* -------------------- UI -------------------- */

  return (
    <div
      className={`h-full sm:max-w-sm rounded-xl bg-gray-900 border-gray-800 transition-all ${
        isMenuOpen ? "max-sm:w-0 overflow-hidden" : "w-full"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 flex flex-col gap-4">
          {timeline.map((item) => {
            if (item.type === "message") {
              const msg = item as Message
              const isUser = msg.role === "user"

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-600 to-indigo-700 flex items-center justify-center">
                      <BotIcon className="size-5 text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] p-2 px-4 rounded-2xl shadow-sm text-sm mt-5 leading-relaxed ${
                      isUser
                        ? "bg-linear-to-r from-indigo-500 to-indigo-600 text-white rounded-tr-none"
                        : "rounded-tl-none bg-gray-800 text-gray-100"
                    }`}
                  >
                    {msg.content}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                      <UserIcon className="size-5 text-gray-200" />
                    </div>
                  )}
                </div>
              )
            }

            const ver = item as Version

            return (
              <div
                key={ver.id}
                className="w-4/5 mx-auto my-2 p-3 rounded-xl bg-gray-800 text-gray-100 shadow flex flex-col gap-2"
              >
                <div className="text-xs font-medium">
                  Code updated
                  <br />
                  <span className="text-gray-500 text-xs font-normal">
                    {new Date(ver.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  {project.current_version_index === ver.id ? (
                    <button className="px-3 py-1 rounded-md text-xs bg-gray-700">
                      Current version
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRollback(ver.id)}
                      className="px-3 py-1 rounded-md text-xs bg-indigo-500 hover:bg-indigo-600 text-white"
                    >
                      Roll back to this version
                    </button>
                  )}

                  <Link
                    target="_blank"
                    to={`/preview/${project.id}/${ver.id}`}
                  >
                    <EyeIcon className="size-6 p-1 bg-gray-700 hover:bg-indigo-500 transition-colors rounded" />
                  </Link>
                </div>
              </div>
            )
          })}

          {isGenerating && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-600 to-indigo-700 flex items-center justify-center">
                <BotIcon className="size-5 text-white" />
              </div>
              <div className="flex gap-1.5 h-full items-end">
                <span className="size-2 rounded-full animate-bounce bg-gray-600" />
                <span className="size-2 rounded-full animate-bounce bg-gray-600 animation-delay-200" />
                <span className="size-2 rounded-full animate-bounce bg-gray-600 animation-delay-400" />
              </div>
            </div>
          )}

          <div ref={messageRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleRevision} className="m-3 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            placeholder="Describe your website or request changes..."
            // disabled={isGenerating}
            className="w-full p-3 rounded-xl resize-none text-sm outline-none ring ring-gray-700 focus:ring-indigo-500 bg-gray-800 text-gray-100 placeholder-gray-400 transition-all"
          />

          <button
            disabled={isGenerating || !input.trim()}
            className="absolute bottom-2.5 right-2.5 rounded-full bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white transition-colors disabled:opacity-60"
          >
            {isGenerating ? (
              <Loader2 className="size-7 p-1.5 animate-spin" />
            ) : (
              <SendIcon className="size-7 p-1.5" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Sidebar

import { X, Type, Layout, Palette, Settings2, Hash } from "lucide-react"
import { useEffect, useState } from "react"

interface EditorPanelProps {
  selectedElement: {
    tagName: string
    className: string
    text: string
    styles: {
      padding: string
      margin: string
      backgroundColor: string
      color: string
      fontSize: string
    }
  } | null
  onUpdate: (updates: any) => void
  onClose: () => void
}

const EditorPanel = ({
  selectedElement,
  onUpdate,
  onClose,
}: EditorPanelProps) => {
  const [values, setValues] = useState(selectedElement)

  useEffect(() => {
    setValues(selectedElement)
  }, [selectedElement])

  if (!selectedElement || !values) return null

  const handleChange = (field: string, value: any) => {
    const newValues = { ...values, [field]: value }
    if (field in values.styles) {
      newValues.styles = { ...values.styles, [field]: value }
    }
    setValues(newValues)
    onUpdate({ [field]: value })
  }

  const handleStyleChange = (styleName: string, value: string) => {
    const newStyles = { ...values.styles, [styleName]: value }
    setValues({ ...values, styles: newStyles })
    onUpdate({ styles: { [styleName]: value } })
  }

  return (
    <div className="absolute top-4 right-4 w-80 glass-darker rounded-3xl shadow-2xl border-white/10 p-5 z-50 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm uppercase tracking-widest text-foreground">Inspector</h3>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-xl transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Content Section */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            <Type className="w-3 h-3" /> Text Content
          </label>
          <textarea
            value={values.text}
            onChange={(e) => handleChange("text", e.target.value)}
            className="w-full text-sm p-3 bg-white/5 border border-white/5 rounded-2xl focus:border-primary/50 outline-none min-h-[80px] transition-colors"
          />
        </div>

        {/* Classes Section */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            <Hash className="w-3 h-3" /> Tailwind Classes
          </label>
          <input
            type="text"
            value={values.className || ""}
            onChange={(e) => handleChange("className", e.target.value)}
            className="w-full text-sm p-3 bg-white/5 border border-white/5 rounded-2xl focus:border-primary/50 outline-none transition-colors"
          />
        </div>

        {/* Layout Section */}
        <div className="space-y-3">
           <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            <Layout className="w-3 h-3" /> Spacing & Size
          </label>
            <div className="grid grid-cols-2 gap-3">
                <InputGroup 
                    label="Padding" 
                    value={values.styles.padding} 
                    onChange={(v) => handleStyleChange("padding", v)} 
                />
                <InputGroup 
                    label="Margin" 
                    value={values.styles.margin} 
                    onChange={(v) => handleStyleChange("margin", v)} 
                />
            </div>
            <InputGroup 
                label="Font Size" 
                value={values.styles.fontSize} 
                onChange={(v) => handleStyleChange("fontSize", v)} 
            />
        </div>

        {/* Appearance Section */}
        <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                <Palette className="w-3 h-3" /> Colors
            </label>
            <div className="grid grid-cols-2 gap-3">
                <ColorGroup 
                    label="Background" 
                    value={values.styles.backgroundColor === "rgba(0,0,0,0)" ? "#ffffff" : values.styles.backgroundColor} 
                    onChange={(v) => handleStyleChange("backgroundColor", v)} 
                />
                <ColorGroup 
                    label="Text Color" 
                    value={values.styles.color} 
                    onChange={(v) => handleStyleChange("color", v)} 
                />
            </div>
        </div>
      </div>
    </div>
  )
}

const InputGroup = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <div className="space-y-1.5">
        <span className="text-[10px] text-muted-foreground/50 font-medium">{label}</span>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-xs p-2.5 bg-white/5 border border-white/5 rounded-xl focus:border-primary/50 outline-none transition-colors"
        />
    </div>
)

const ColorGroup = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <div className="space-y-1.5">
        <span className="text-[10px] text-muted-foreground/50 font-medium">{label}</span>
        <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl p-1.5 group-focus-within:border-primary/50 transition-colors">
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-5 h-5 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden"
            />
            <span className="text-[10px] text-muted-foreground truncate uppercase font-mono">
                {value}
            </span>
        </div>
    </div>
)

export default EditorPanel

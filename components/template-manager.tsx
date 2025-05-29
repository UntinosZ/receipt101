"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Trash2, Edit, Search, Palette } from "lucide-react"

interface SavedTemplate {
  id: string
  name: string
  backgroundColor: string
  textColor: string
  accentColor: string
  fontFamily: string
  fontSize: number
  showBorder: boolean
  borderColor: string
  headerStyle: string
  logoPosition: string
  logoUrl: string
  logoSize: number
  showLogo: boolean
  createdAt: string
}

interface TemplateManagerProps {
  onSelectTemplate?: (template: SavedTemplate) => void
  onEditTemplate?: (template: SavedTemplate) => void
}

export default function TemplateManager({ onSelectTemplate, onEditTemplate }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<SavedTemplate[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = () => {
    const savedTemplates = JSON.parse(localStorage.getItem("customTemplates") || "[]")
    setTemplates(savedTemplates)
  }

  const deleteTemplate = (id: string) => {
    const updatedTemplates = templates.filter((template) => template.id !== id)
    setTemplates(updatedTemplates)
    localStorage.setItem("customTemplates", JSON.stringify(updatedTemplates))
  }

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelectTemplate = (template: SavedTemplate) => {
    onSelectTemplate?.(template)
    setShowDialog(false)
  }

  const handleEditTemplate = (template: SavedTemplate) => {
    onEditTemplate?.(template)
    setShowDialog(false)
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Palette className="w-4 h-4 mr-2" />
          Load Saved Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Saved Templates</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          {filteredTemplates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  {searchTerm ? "No templates found matching your search." : "No custom templates saved yet."}
                </p>
                {!searchTerm && <p className="text-sm text-gray-400">Create your first template to see it here.</p>}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <p className="text-sm text-gray-600">
                          Created: {new Date(template.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {template.showLogo && <Badge variant="outline">Logo</Badge>}
                        {template.showBorder && <Badge variant="outline">Border</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Template Preview */}
                    <div
                      className="p-4 rounded border text-xs"
                      style={{
                        backgroundColor: template.backgroundColor,
                        color: template.textColor,
                        fontFamily: template.fontFamily,
                        borderColor: template.showBorder ? template.borderColor : "transparent",
                        borderWidth: template.showBorder ? "2px" : "0",
                      }}
                    >
                      <div
                        className={`mb-2 ${template.headerStyle === "center" ? "text-center" : template.headerStyle === "right" ? "text-right" : "text-left"}`}
                      >
                        {template.showLogo && template.logoUrl && (
                          <div
                            className={`mb-2 ${template.logoPosition === "center" || template.headerStyle === "center" ? "flex justify-center" : template.logoPosition === "right" ? "flex justify-end" : "flex justify-start"}`}
                          >
                            <img
                              src={template.logoUrl || "/placeholder.svg"}
                              alt="Logo"
                              style={{ width: "20px", height: "20px" }}
                              className="object-contain"
                            />
                          </div>
                        )}
                        <div className="font-bold" style={{ color: template.accentColor }}>
                          Business Name
                        </div>
                        <div className="opacity-80">Sample Address</div>
                      </div>
                      <div className="border-t my-2" style={{ borderColor: template.borderColor }}></div>
                      <div className="space-y-1">
                        <div>Receipt #: 001</div>
                        <div>Item 1 - $10.00</div>
                        <div className="font-bold" style={{ color: template.accentColor }}>
                          Total: $10.00
                        </div>
                      </div>
                    </div>

                    {/* Template Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Font:</span>
                        <span className="capitalize">{template.fontFamily}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span>{template.fontSize}px</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Style:</span>
                        <span className="capitalize">{template.headerStyle}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSelectTemplate(template)} className="flex-1">
                        Use Template
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditTemplate(template)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

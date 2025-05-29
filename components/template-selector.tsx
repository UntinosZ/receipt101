"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Globe, User, Check, Edit } from "lucide-react"
import { supabase, type Template } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

interface TemplateSelectorProps {
  onSelectTemplate: (template: Template) => void
  onEditTemplate?: (template: Template) => void
  selectedTemplate?: Template | null
}

export default function TemplateSelector({
  onSelectTemplate,
  onEditTemplate,
  selectedTemplate,
}: TemplateSelectorProps) {
  const [myTemplates, setMyTemplates] = useState<Template[]>([])
  const [publicTemplates, setPublicTemplates] = useState<Template[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    setLoading(true)
    try {
      // Load public templates
      const { data: publicData, error: publicError } = await supabase
        .from("templates")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })

      if (publicError) throw publicError
      setPublicTemplates(publicData || [])

      // Load user's templates (for now, we'll use a placeholder user)
      const { data: myData, error: myError } = await supabase
        .from("templates")
        .select("*")
        .eq("created_by", "current_user") // In real app, use actual user ID
        .order("created_at", { ascending: false })

      if (myError) throw myError
      setMyTemplates(myData || [])
    } catch (error) {
      console.error("Error loading templates:", error)
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredMyTemplates = myTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.business_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredPublicTemplates = publicTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.business_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const TemplateCard = ({ template }: { template: Template }) => (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        selectedTemplate?.id === template.id ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div onClick={() => onSelectTemplate(template)} className="flex-1">
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <p className="text-sm text-gray-600">{template.business_name}</p>
          </div>
          <div className="flex flex-col gap-1">
            {selectedTemplate?.id === template.id && (
              <Badge variant="default" className="text-xs">
                <Check className="w-3 h-3 mr-1" />
                Selected
              </Badge>
            )}
            {template.is_public && (
              <Badge variant="outline" className="text-xs">
                <Globe className="w-3 h-3 mr-1" />
                Public
              </Badge>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onEditTemplate?.(template)
              }}
              className="text-xs h-6"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Template Preview */}
        <div
          className="p-3 rounded border text-xs mb-3"
          style={{
            backgroundColor: template.background_color,
            color: template.text_color,
            fontFamily: template.font_family,
            borderColor: template.show_border ? template.border_color : "transparent",
            borderWidth: template.show_border ? "1px" : "0",
          }}
        >
          <div
            className={`mb-2 ${
              template.header_style === "center"
                ? "text-center"
                : template.header_style === "right"
                  ? "text-right"
                  : "text-left"
            }`}
          >
            {template.show_logo && template.logo_url && (
              <div className="mb-1 flex justify-center">
                <img
                  src={template.logo_url || "/placeholder.svg"}
                  alt="Logo"
                  style={{ width: "16px", height: "16px" }}
                  className="object-contain"
                />
              </div>
            )}
            <div className="font-bold" style={{ color: template.accent_color }}>
              {template.business_name}
            </div>
            {template.business_address && (
              <div className="opacity-80 text-xs">{template.business_address.split("\n")[0]}</div>
            )}
          </div>
          <div className="border-t my-1" style={{ borderColor: template.border_color }}></div>
          <div className="space-y-1">
            <div>Receipt #: 001</div>
            <div>Sample Item - $10.00</div>
            <div className="font-bold" style={{ color: template.accent_color }}>
              Total: $10.00
            </div>
          </div>
          {template.show_footer && template.footer_text && (
            <div className="text-center mt-1 opacity-60 text-xs">{template.footer_text}</div>
          )}
        </div>

        <div className="text-xs text-gray-500">Created: {new Date(template.created_at).toLocaleDateString()}</div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading templates...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="public" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="public" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Public Templates ({filteredPublicTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="my" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            My Templates ({filteredMyTemplates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="public" className="space-y-4">
          {filteredPublicTemplates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Globe className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">
                  {searchTerm ? "No public templates found matching your search." : "No public templates available."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPublicTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my" className="space-y-4">
          {filteredMyTemplates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 mb-4">
                  {searchTerm ? "No templates found matching your search." : "You haven't created any templates yet."}
                </p>
                {!searchTerm && (
                  <p className="text-sm text-gray-400">
                    Go to the "Design Templates" tab to create your first template.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMyTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

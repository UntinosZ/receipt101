"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Receipt, Palette, Download, Smartphone, Database } from "lucide-react"
import ReceiptCreator from "@/components/receipt-creator"
import TemplateDesigner from "@/components/template-designer"
import ReceiptGallery from "@/components/receipt-gallery"
import { Toaster } from "@/components/ui/toaster"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("create")
  const [editingTemplate, setEditingTemplate] = useState<any>(null)

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template)
    setActiveTab("templates")
  }

  const handleTemplateUpdated = () => {
    setEditingTemplate(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Receipt Manager Pro</h1>
          <p className="text-lg text-gray-600">Create, design, and share professional receipts with cloud storage</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Receipt
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Design Templates
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              My Receipts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Create New Receipt
                </CardTitle>
                <CardDescription>Select a template and add items to generate a professional receipt</CardDescription>
              </CardHeader>
              <CardContent>
                <ReceiptCreator onEditTemplate={handleEditTemplate} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Template Designer
                </CardTitle>
                <CardDescription>Create and customize business receipt templates with your branding</CardDescription>
              </CardHeader>
              <CardContent>
                <TemplateDesigner editingTemplate={editingTemplate} onTemplateUpdated={handleTemplateUpdated} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Receipt Gallery
                </CardTitle>
                <CardDescription>View and manage your created receipts</CardDescription>
              </CardHeader>
              <CardContent>
                <ReceiptGallery />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Database className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold mb-2">Cloud Storage</h3>
              <p className="text-sm text-gray-600">All templates and receipts saved securely in the cloud</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Smartphone className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-semibold mb-2">Mobile Friendly</h3>
              <p className="text-sm text-gray-600">Responsive design works perfectly on all devices</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Download className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="font-semibold mb-2">High-Quality Images</h3>
              <p className="text-sm text-gray-600">Download receipts as professional PNG images</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Palette className="w-12 h-12 mx-auto mb-4 text-orange-600" />
              <h3 className="font-semibold mb-2">Template Sharing</h3>
              <p className="text-sm text-gray-600">Share templates publicly for others to use</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  )
}

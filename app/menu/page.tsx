"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MenuIcon, Receipt, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import MenuManager from "@/components/menu-manager"
import TemplateSelector from "@/components/template-selector"
import { type Template } from "@/lib/supabase"

export default function MenuManagementPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <MenuIcon className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Menu Management</h1>
            <p className="text-muted-foreground">
              Create and manage menu items for your receipt templates
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Select Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TemplateSelector
                onSelectTemplate={setSelectedTemplate}
                selectedTemplate={selectedTemplate}
                showEditButton={false}
              />
              
              {selectedTemplate && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Selected Template</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedTemplate.business_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedTemplate.name}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Menu Management */}
        <div className="lg:col-span-2">
          <MenuManager 
            selectedTemplate={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
          />
        </div>
      </div>

      {/* Help Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How to Use Menu Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">1. Select Template</h3>
              <p className="text-sm text-muted-foreground">
                Choose the receipt template you want to manage menu items for.
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MenuIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">2. Add Menu Items</h3>
              <p className="text-sm text-muted-foreground">
                Create menu items with names, prices, categories, and descriptions.
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">3. Quick Receipt Creation</h3>
              <p className="text-sm text-muted-foreground">
                Use menu items for quick addition when creating receipts.
              </p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Tips:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use categories to organize your menu items (e.g., "Beverages", "Services", "Products")</li>
              <li>• Set items as inactive to temporarily hide them without deleting</li>
              <li>• Menu items will appear in the receipt creator for quick addition</li>
              <li>• Each template can have its own unique menu items</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

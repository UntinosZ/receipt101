"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Menu as MenuIcon, 
  DollarSign,
  GripVertical,
  Eye,
  EyeOff
} from "lucide-react"
import { supabase, type Template, type MenuItem } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface MenuManagerProps {
  selectedTemplate: Template | null
  onTemplateChange?: (template: Template) => void
}

export default function MenuManager({ selectedTemplate, onTemplateChange }: MenuManagerProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    is_active: true,
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    if (selectedTemplate) {
      loadMenuItems()
    }
  }, [selectedTemplate])

  const loadMenuItems = async () => {
    if (!selectedTemplate) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("template_id", selectedTemplate.id)
        .order("sort_order", { ascending: true })

      if (error) throw error

      setMenuItems(data || [])
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data?.map(item => item.category).filter(Boolean) || [])]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error("Error loading menu items:", error)
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async () => {
    if (!selectedTemplate || !newItem.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in the item name",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("menu_items")
        .insert([{
          template_id: selectedTemplate.id,
          name: newItem.name.trim(),
          description: newItem.description.trim() || null,
          price: newItem.price,
          category: newItem.category.trim() || null,
          is_active: newItem.is_active,
          sort_order: menuItems.length,
        }])
        .select()
        .single()

      if (error) throw error

      setMenuItems(prev => [...prev, data])
      setNewItem({
        name: "",
        description: "",
        price: 0,
        category: "",
        is_active: true,
      })
      setShowAddForm(false)

      toast({
        title: "Success",
        description: "Menu item added successfully",
      })
    } catch (error) {
      console.error("Error adding menu item:", error)
      toast({
        title: "Error",
        description: "Failed to add menu item",
        variant: "destructive",
      })
    }
  }

  const handleUpdateItem = async (itemId: string, updates: Partial<MenuItem>) => {
    try {
      const { error } = await supabase
        .from("menu_items")
        .update(updates)
        .eq("id", itemId)

      if (error) throw error

      setMenuItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        )
      )

      toast({
        title: "Success",
        description: "Menu item updated successfully",
      })
    } catch (error) {
      console.error("Error updating menu item:", error)
      toast({
        title: "Error",
        description: "Failed to update menu item",
        variant: "destructive",
      })
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", itemId)

      if (error) throw error

      setMenuItems(prev => prev.filter(item => item.id !== itemId))

      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting menu item:", error)
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive",
      })
    }
  }

  const toggleItemActive = async (itemId: string, isActive: boolean) => {
    await handleUpdateItem(itemId, { is_active: isActive })
  }

  const EditableItem = ({ item }: { item: MenuItem }) => {
    const [editData, setEditData] = useState({
      name: item.name,
      description: item.description || "",
      price: item.price,
      category: item.category || "",
    })

    const handleSave = async () => {
      await handleUpdateItem(item.id, editData)
      setEditingItem(null)
    }

    const handleCancel = () => {
      setEditingItem(null)
      setEditData({
        name: item.name,
        description: item.description || "",
        price: item.price,
        category: item.category || "",
      })
    }

    if (editingItem === item.id) {
      return (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor={`edit-name-${item.id}`}>Name</Label>
                <Input
                  id={`edit-name-${item.id}`}
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor={`edit-price-${item.id}`}>Price</Label>
                <Input
                  id={`edit-price-${item.id}`}
                  type="number"
                  step="0.01"
                  value={editData.price}
                  onChange={(e) => setEditData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor={`edit-category-${item.id}`}>Category</Label>
                <Input
                  id={`edit-category-${item.id}`}
                  value={editData.category}
                  onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Beverages, Services"
                />
              </div>
            </div>
            <div className="mb-4">
              <Label htmlFor={`edit-description-${item.id}`}>Description</Label>
              <Textarea
                id={`edit-description-${item.id}`}
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className={`mb-4 ${!item.is_active ? 'opacity-60' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">{item.name}</h4>
                {item.category && (
                  <Badge variant="secondary" className="text-xs">
                    {item.category}
                  </Badge>
                )}
                {!item.is_active && (
                  <Badge variant="outline" className="text-xs">
                    Inactive
                  </Badge>
                )}
              </div>
              {item.description && (
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
              )}
              <p className="font-semibold text-lg">
                ${item.price.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => toggleItemActive(item.id, !item.is_active)}
                variant="ghost"
                size="sm"
                title={item.is_active ? "Hide item" : "Show item"}
              >
                {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
              <Button
                onClick={() => setEditingItem(item.id)}
                variant="ghost"
                size="sm"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{item.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!selectedTemplate) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MenuIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Template Selected</h3>
          <p className="text-muted-foreground">
            Please select a template to manage its menu items.
          </p>
        </CardContent>
      </Card>
    )
  }

  const groupedItems = menuItems.reduce((acc, item) => {
    const category = item.category || "Uncategorized"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MenuIcon className="w-5 h-5" />
            Menu Manager
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Managing menu for: <span className="font-medium">{selectedTemplate.business_name}</span>
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {menuItems.length} items
              </Badge>
              <Badge variant="outline">
                {menuItems.filter(item => item.is_active).length} active
              </Badge>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          {/* Add Item Form */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Add New Menu Item</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="new-name">Name *</Label>
                    <Input
                      id="new-name"
                      value={newItem.name}
                      onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Coffee, Service Fee"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-price">Price *</Label>
                    <Input
                      id="new-price"
                      type="number"
                      step="0.01"
                      value={newItem.price}
                      onChange={(e) => setNewItem(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="new-category">Category</Label>
                    <Input
                      id="new-category"
                      value={newItem.category}
                      onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., Beverages, Services"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="new-active"
                      checked={newItem.is_active}
                      onCheckedChange={(checked) => setNewItem(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="new-active">Active</Label>
                  </div>
                </div>
                <div className="mb-4">
                  <Label htmlFor="new-description">Description</Label>
                  <Textarea
                    id="new-description"
                    value={newItem.description}
                    onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddItem}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                  <Button 
                    onClick={() => setShowAddForm(false)} 
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Menu Items List */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading menu items...</p>
            </div>
          ) : menuItems.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Menu Items</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding some menu items for quick receipt creation.
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Item
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    {category}
                    <Badge variant="secondary">
                      {items.length}
                    </Badge>
                  </h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <EditableItem key={item.id} item={item} />
                    ))}
                  </div>
                  {category !== Object.keys(groupedItems)[Object.keys(groupedItems).length - 1] && (
                    <Separator className="my-6" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

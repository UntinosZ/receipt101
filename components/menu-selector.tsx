"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Plus, 
  ShoppingCart, 
  Search,
  Filter,
  DollarSign
} from "lucide-react"
import { supabase, type Template, type MenuItem, type ReceiptItem } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface MenuSelectorProps {
  selectedTemplate: Template | null
  onAddItem: (item: ReceiptItem) => void
  className?: string
}

export default function MenuSelector({ selectedTemplate, onAddItem, className = "" }: MenuSelectorProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    if (selectedTemplate) {
      loadMenuItems()
    } else {
      setMenuItems([])
      setFilteredItems([])
    }
  }, [selectedTemplate])

  useEffect(() => {
    filterItems()
  }, [menuItems, searchTerm, selectedCategory])

  const loadMenuItems = async () => {
    if (!selectedTemplate) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("template_id", selectedTemplate.id)
        .eq("is_active", true)
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

  const filterItems = () => {
    let filtered = menuItems

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => 
        selectedCategory === "uncategorized" 
          ? !item.category 
          : item.category === selectedCategory
      )
    }

    setFilteredItems(filtered)
  }

  const handleAddToReceipt = (menuItem: MenuItem) => {
    const receiptItem: ReceiptItem = {
      id: Date.now().toString(),
      description: menuItem.name,
      quantity: 1,
      price: menuItem.price,
    }
    
    onAddItem(receiptItem)
    
    toast({
      title: "Item Added",
      description: `${menuItem.name} added to receipt`,
    })
  }

  const handleAddToReceiptWithQuantity = (menuItem: MenuItem, quantity: number) => {
    if (quantity <= 0) return

    const receiptItem: ReceiptItem = {
      id: Date.now().toString(),
      description: menuItem.name,
      quantity: quantity,
      price: menuItem.price,
    }
    
    onAddItem(receiptItem)
    
    toast({
      title: "Item Added",
      description: `${quantity}x ${menuItem.name} added to receipt`,
    })
  }

  if (!selectedTemplate) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <ShoppingCart className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Select a template to see menu items
          </p>
        </CardContent>
      </Card>
    )
  }

  const groupedItems = filteredItems.reduce((acc, item) => {
    const category = item.category || "Uncategorized"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Quick Add Menu
        </CardTitle>
        
        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {categories.length > 0 && (
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
                <SelectItem value="uncategorized">Uncategorized</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">Loading menu items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-6">
            <DollarSign className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              {menuItems.length === 0 
                ? "No menu items available" 
                : "No items match your search"
              }
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSearchTerm("")}
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category}>
                {Object.keys(groupedItems).length > 1 && (
                  <h4 className="font-medium text-sm mb-2 text-muted-foreground">
                    {category}
                  </h4>
                )}
                <div className="space-y-2">
                  {items.map((item) => (
                    <MenuItem key={item.id} item={item} onAdd={handleAddToReceipt} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface MenuItemProps {
  item: MenuItem
  onAdd: (item: MenuItem) => void
}

function MenuItem({ item, onAdd }: MenuItemProps) {
  const [quantity, setQuantity] = useState(1)
  const [showQuantityInput, setShowQuantityInput] = useState(false)

  const handleQuickAdd = () => {
    onAdd(item)
  }

  const handleAddWithQuantity = () => {
    if (quantity > 0) {
      for (let i = 0; i < quantity; i++) {
        onAdd(item)
      }
      setQuantity(1)
      setShowQuantityInput(false)
    }
  }

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h5 className="font-medium text-sm truncate">{item.name}</h5>
          {item.category && (
            <Badge variant="secondary" className="text-xs">
              {item.category}
            </Badge>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
            {item.description}
          </p>
        )}
        <p className="font-semibold text-sm">
          ${item.price.toFixed(2)}
        </p>
      </div>
      
      <div className="flex items-center gap-2 ml-3">
        {showQuantityInput ? (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-16 h-8 text-xs"
            />
            <Button
              onClick={handleAddWithQuantity}
              size="sm"
              className="h-8 px-2"
            >
              <Plus className="w-3 h-3" />
            </Button>
            <Button
              onClick={() => setShowQuantityInput(false)}
              variant="ghost"
              size="sm"
              className="h-8 px-2"
            >
              ×
            </Button>
          </div>
        ) : (
          <>
            <Button
              onClick={() => setShowQuantityInput(true)}
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
            >
              Qty
            </Button>
            <Button
              onClick={handleQuickAdd}
              size="sm"
              className="h-8 px-2"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

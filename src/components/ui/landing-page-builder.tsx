import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, MoveHorizontal, Image, Type, Layout, Box } from "lucide-react";

const LandingPageBuilder = () => {
  const [activeTab, setActiveTab] = useState("editor");
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/domains");
  };
  
  return (
    <div className="clay-panel">
      <h2 className="text-2xl font-bold mb-6">Landing Page Builder</h2>
      
      <Tabs defaultValue="editor" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="clay-card">
              <h3 className="font-semibold mb-4">Components</h3>
              <div className="space-y-3">
                {[
                  { name: "Header", icon: <Layout className="h-5 w-5" /> },
                  { name: "Text", icon: <Type className="h-5 w-5" /> },
                  { name: "Image", icon: <Image className="h-5 w-5" /> },
                  { name: "Button", icon: <Box className="h-5 w-5" /> },
                  { name: "Section", icon: <Layout className="h-5 w-5" /> },
                  { name: "Form", icon: <Box className="h-5 w-5" /> },
                ].map((component, index) => (
                  <div 
                    key={index}
                    className="clay-button bg-white text-gray-700 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      {component.icon}
                      <span className="ml-2">{component.name}</span>
                    </div>
                    <PlusCircle className="h-4 w-4 text-indigo-600" />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="md:col-span-3">
              <div className="clay-card bg-gray-50 h-96 flex flex-col items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-gray-400 mb-4">Drag and drop components here</div>
                  <Button variant="ghost" className="clay-button bg-white text-indigo-600">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Add Component
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button 
                  variant="ghost" 
                  className="clay-button bg-white text-gray-700"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button className="clay-button-primary">
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="design">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="clay-card">
              <h3 className="font-semibold mb-4">Design Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Theme
                  </label>
                  <select className="clay-input w-full">
                    <option>Modern</option>
                    <option>Classic</option>
                    <option>Minimal</option>
                    <option>Bold</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Color
                  </label>
                  <div className="flex">
                    <input type="color" className="h-9 w-9 rounded-l-lg border border-gray-300" defaultValue="#6366f1" />
                    <Input className="rounded-l-none clay-input flex-1" defaultValue="#6366f1" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font
                  </label>
                  <select className="clay-input w-full">
                    <option>Poppins</option>
                    <option>Inter</option>
                    <option>Roboto</option>
                    <option>Montserrat</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-8 w-full bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300"></div>
                    <div className="h-8 w-full bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300"></div>
                    <div className="h-8 w-full bg-clay-lavender/30 border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-3">
              <div className="clay-card bg-gray-50 h-96 flex flex-col items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-gray-400 mb-4">Design preview will appear here</div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button variant="ghost" className="clay-button bg-white text-gray-700">
                  Reset
                </Button>
                <Button className="clay-button-primary">
                  Apply Design
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preview">
          <div className="clay-card bg-white p-0 overflow-hidden">
            <div className="bg-gray-100 py-2 px-4 flex items-center">
              <div className="flex space-x-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <div className="mx-auto">
                <div className="bg-white rounded-full px-4 py-1 text-sm text-gray-600 flex items-center">
                  <span>yourdomain.com.channel</span>
                </div>
              </div>
            </div>
            
            <div className="h-96 flex items-center justify-center border-t border-gray-200">
              <div className="text-center p-8">
                <div className="text-gray-400 mb-4">Your page preview will appear here</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <div>
              <Button variant="ghost" className="clay-button bg-white text-gray-700">
                Desktop
              </Button>
              <Button variant="ghost" className="clay-button bg-white text-gray-700 ml-2">
                Mobile
              </Button>
            </div>
            
            <Button className="clay-button-primary">
              Publish
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LandingPageBuilder;

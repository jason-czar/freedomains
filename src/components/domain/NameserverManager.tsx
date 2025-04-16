
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, XCircle } from "lucide-react";

interface NameserverManagerProps {
  nameservers: string[];
  setNameservers: (nameservers: string[]) => void;
}

export const NameserverManager: React.FC<NameserverManagerProps> = ({
  nameservers,
  setNameservers
}) => {
  const handleNameserverChange = (index: number, value: string) => {
    const newNameservers = [...nameservers];
    newNameservers[index] = value;
    setNameservers(newNameservers);
  };

  const addNameserver = () => {
    setNameservers([...nameservers, ""]);
  };

  const removeNameserver = (index: number) => {
    const newNameservers = [...nameservers];
    newNameservers.splice(index, 1);
    setNameservers(newNameservers);
  };

  return (
    <div className="space-y-3 mb-4">
      <label className="block text-sm font-medium text-gray-700">
        Nameservers (at least 2 recommended)
      </label>
      
      {nameservers.map((ns, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={ns}
            onChange={(e) => handleNameserverChange(index, e.target.value)}
            placeholder="ns1.example.com"
            className="flex-grow"
          />
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => removeNameserver(index)}
            disabled={nameservers.length <= 2}
          >
            <XCircle className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ))}
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={addNameserver}
        className="mt-2"
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Nameserver
      </Button>
    </div>
  );
};

export default NameserverManager;

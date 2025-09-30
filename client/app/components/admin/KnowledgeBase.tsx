import React, { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { DataTable as KnowledgeTable } from "~/components/knowledgeBase/table";
import {
  makeKnowledgeColumns,
  type knowledgeBase,
} from "~/components/knowledgeBase/columns";
import { CreateKnowledgeEntryDialog } from "../knowledgeBase/table";
import { getKnowledge } from "services/knowledge";
import { BookOpen, Database } from "lucide-react";

interface KnowledgeBaseProps {
  danielKnowledge: knowledgeBase[];
  tylerKnowledge: knowledgeBase[];
  jennyKnowledge: knowledgeBase[];
  setDanielKnowledge: React.Dispatch<React.SetStateAction<knowledgeBase[]>>;
  setTylerKnowledge: React.Dispatch<React.SetStateAction<knowledgeBase[]>>;
  setJennyKnowledge: React.Dispatch<React.SetStateAction<knowledgeBase[]>>;
}

export function KnowledgeBase({
  danielKnowledge,
  tylerKnowledge,
  jennyKnowledge,
  setDanielKnowledge,
  setTylerKnowledge,
  setJennyKnowledge,
}: KnowledgeBaseProps) {
  const knowledgeBaseColumns = useMemo(() => makeKnowledgeColumns(), []);

  const knowledgeBases = [
    {
      id: "tyler",
      name: "Tyler",
      table: "tylerknowledge",
      data: tylerKnowledge,
      setter: setTylerKnowledge,
      color: "bg-blue-500",
    },
    {
      id: "daniel",
      name: "Daniel",
      table: "danielknowledge",
      data: danielKnowledge,
      setter: setDanielKnowledge,
      color: "bg-green-500",
    },
    {
      id: "jenny",
      name: "Jenny",
      table: "jennyknowledge",
      data: jennyKnowledge,
      setter: setJennyKnowledge,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#B4933F] rounded-lg">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-600">Manage knowledge entries for different personas</p>
          <div className="mt-2 text-sm text-[#B4933F] font-medium">
            ✓ Knowledge Base section is active
          </div>
        </div>
      </div>

      {/* Knowledge Base Management */}
      <div className="bg-white rounded-xl border border-[#CBB06A] shadow-sm">
        <div className="p-6 border-b border-[#CBB06A]">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-[#B4933F]" />
            <h2 className="text-lg font-semibold text-gray-900">Knowledge Entries</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Manage knowledge entries for each AI persona
          </p>
        </div>
        <div className="p-6">
          <Tabs defaultValue="tyler" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              {knowledgeBases.map((kb) => (
                <TabsTrigger 
                  key={kb.id} 
                  value={kb.id}
                  className="flex items-center gap-2"
                >
                  <div className={`w-3 h-3 rounded-full ${kb.color}`}></div>
                  {kb.name}
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {kb.data.length}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {knowledgeBases.map((kb) => (
              <TabsContent key={kb.id} value={kb.id} className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {kb.name}'s Knowledge Base
                    </h3>
                    <p className="text-sm text-gray-600">
                      {kb.data.length} entries available
                    </p>
                  </div>
                  <CreateKnowledgeEntryDialog
                    table={kb.table}
                    onCreated={async () => {
                      const result = await getKnowledge(kb.table);
                      kb.setter(result.data || []);
                    }}
                  />
                </div>
                <div className="border border-[#CBB06A] rounded-lg overflow-hidden">
                  <KnowledgeTable
                    columns={knowledgeBaseColumns}
                    data={kb.data}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
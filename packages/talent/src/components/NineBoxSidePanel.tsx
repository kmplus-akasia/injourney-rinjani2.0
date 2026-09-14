import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { 
  ArrowDown, 
  Edit2, 
  ArrowLeft, 
  ArrowRight,
  Filter,
  Download,
  Search,
  History,
  Star,
} from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";

export interface BoxLimits {
  performance: { lower: number; upper: number; };
  potential: { lower: number; upper: number; };
}

export interface Employee {
  id: string;
  name: string;
  avatar?: string;
  position: string;
  department: string;
  company: string;
  email?: string;
  performanceScore: number;
  potentialScore: number;
  isOverridden?: boolean;
  overrideInfo?: {
    originalBox: string;
    reason: string;
    overriddenBy: string;
    overriddenDate: string;
  };
  /** Separate from High Potential cluster (BR-TC-007). */
  isTopTalent?: boolean;
  priorPeriod?: {
    period: string;
    cell: string;
    clusterName: string;
  };
  onHistoryClick?: () => void;
}

interface NineBoxSidePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boxName: string;
  boxDescription: string;
  boxColor: string;
  employees: Employee[];
  limits: BoxLimits;
  onCalibrateClick?: (employee: Employee) => void;
}

export function NineBoxSidePanel({
  open,
  onOpenChange,
  boxName,
  boxDescription,
  boxColor,
  employees,
  limits,
  onCalibrateClick
}: NineBoxSidePanelProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(employees.length / itemsPerPage);
  
  const currentEmployees = employees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[1000px] sm:max-w-[1000px] overflow-y-auto p-0 gap-0" style={{ backgroundColor: 'var(--color-background)' }}>
        {/* Header Section */}
        <SheetHeader className="bg-card border-b border-border px-6 py-6 sticky top-0 z-10 flex flex-col gap-6 space-y-0 text-left">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg ${boxColor} flex items-center justify-center shadow-sm shrink-0`}>
                <span className="text-sm font-bold text-white">9B</span>
              </div>
              <div className="flex flex-col gap-1">
                <SheetTitle className="text-xl font-semibold text-foreground">{boxName}</SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">{boxDescription}</SheetDescription>
              </div>
            </div>
            <div className="flex gap-2">
               <div className="px-3 py-1 bg-muted rounded-full border border-border flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
                 <span className="text-xs font-medium text-muted-foreground">Total: {employees.length} users</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 rounded-lg bg-muted border border-border">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Performance Range</span>
                 <Badge variant="outline" className="bg-card text-foreground">{limits.performance.lower} - {limits.performance.upper}</Badge>
               </div>
               <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                 <div className="bg-primary h-full rounded-full" style={{ width: '70%' }}></div>
               </div>
             </div>
             <div className="p-4 rounded-lg bg-muted border border-border">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Potential Range</span>
                 <Badge variant="outline" className="bg-card text-foreground">{limits.potential.lower} - {limits.potential.upper}</Badge>
               </div>
               <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                 <div className="bg-emerald-600 h-full rounded-full" style={{ width: '70%' }}></div>
               </div>
             </div>
          </div>

          {/* Table Toolbar */}
          <div className="flex items-center justify-between gap-4">
             <div className="relative flex-1 max-w-sm">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
               <Input placeholder="Search employees..." className="pl-9 bg-input border-border" />
             </div>
             <div className="flex items-center gap-2">
               <Button variant="outline" size="sm" className="bg-card border-border text-foreground hover:bg-muted">
                 <Filter className="w-4 h-4 mr-2" />
                 Filters
               </Button>
               <Button variant="outline" size="sm" className="bg-card border-border text-foreground hover:bg-muted">
                 <Download className="w-4 h-4 mr-2" />
                 Export
               </Button>
             </div>
          </div>
        </SheetHeader>

        {/* Table Section */}
        <div className="p-6">
          <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-border bg-card">
                    <th className="h-[44px] px-6 text-left w-[50px]">
                      <Checkbox className="border-border" />
                    </th>
                    <th className="h-[44px] px-6 text-left text-xs font-medium text-muted-foreground">Name</th>
                    <th className="h-[44px] px-6 text-left text-xs font-medium text-muted-foreground">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                        Status <ArrowDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="h-[44px] px-6 text-left text-xs font-medium text-muted-foreground">Top Talent</th>
                    <th className="h-[44px] px-6 text-left text-xs font-medium text-muted-foreground">Role</th>
                    <th className="h-[44px] px-6 text-left text-xs font-medium text-muted-foreground">Email address</th>
                    <th className="h-[44px] px-6 text-left text-xs font-medium text-muted-foreground">Teams</th>
                    <th className="h-[44px] px-6 text-left w-[120px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentEmployees.length > 0 ? (
                    currentEmployees.map((employee, index) => (
                      <tr 
                        key={employee.id} 
                        className={`h-[72px] border-b border-border hover:bg-muted/50 transition-colors ${index % 2 === 0 ? 'bg-background' : 'bg-card'}`}
                      >
                        <td className="px-6">
                          <Checkbox className="border-border" />
                        </td>
                        <td className="px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border border-border">
                              <AvatarImage src={employee.avatar} />
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-foreground">{employee.name}</span>
                              <span className="text-sm text-muted-foreground">@{employee.name.toLowerCase().replace(/\s+/g, '')}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6">
                          {employee.isOverridden ? (
                            <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-transparent rounded-full px-2.5 py-0.5 font-medium flex w-fit items-center gap-1.5 shadow-none">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Override
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-transparent rounded-full px-2.5 py-0.5 font-medium flex w-fit items-center gap-1.5 shadow-none">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </Badge>
                          )}
                        </td>
                        <td className="px-6">
                          {employee.isTopTalent ? (
                            <Badge className="bg-amber-50 text-amber-800 border-amber-200 gap-1 rounded-full px-2.5 py-0.5 font-medium flex w-fit items-center shadow-none">
                              <Star className="w-3 h-3" />
                              Top Talent
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-6">
                          <span className="text-sm text-muted-foreground">{employee.position}</span>
                        </td>
                        <td className="px-6">
                          <span className="text-sm text-muted-foreground">{employee.email || `${employee.name.toLowerCase().replace(/\s+/g, '.')}@injourney.id`}</span>
                        </td>
                        <td className="px-6">
                          <div className="flex gap-1 flex-wrap">
                            <Badge variant="outline" className="text-muted-foreground border-border bg-background font-normal">
                              {employee.department}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                             <Button
                               variant="ghost"
                               size="icon"
                               className="h-8 w-8 text-muted-foreground hover:text-foreground"
                               title="Movement history"
                               onClick={() => employee.onHistoryClick?.()}
                               disabled={!employee.onHistoryClick}
                             >
                               <History className="w-4 h-4" />
                             </Button>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Calibrate" onClick={() => onCalibrateClick?.(employee)}>
                               <Edit2 className="w-4 h-4" />
                             </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                        No employees found in this category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Footer */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-border bg-card">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-foreground border-border"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map(page => (
                   <Button
                     key={page}
                     variant={currentPage === page ? "secondary" : "ghost"}
                     size="sm"
                     className={`w-9 h-9 ${currentPage === page ? "bg-muted text-foreground" : "text-muted-foreground"}`}
                     onClick={() => setCurrentPage(page)}
                   >
                     {page}
                   </Button>
                ))}
                {totalPages > 3 && <span className="text-muted-foreground px-2">...</span>}
                {totalPages > 3 && (
                   <Button
                     variant={currentPage === totalPages ? "secondary" : "ghost"}
                     size="sm"
                     className={`w-9 h-9 ${currentPage === totalPages ? "bg-muted text-foreground" : "text-muted-foreground"}`}
                     onClick={() => setCurrentPage(totalPages)}
                   >
                     {totalPages}
                   </Button>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-foreground border-border"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

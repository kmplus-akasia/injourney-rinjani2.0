import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { ScoreCard } from '../shared/ScoreCard';
import { KPIListItem } from '../shared/KPIListItem';
import { kpiBersama, kpiUnit, performanceStats, checkInHistory, currentUser } from '../data';
import { CheckInForm } from './CheckInForm';
import { PlanningDashboard } from './PlanningDashboard';
import { GoalSettingForm } from './GoalSettingForm';
import { EvaluationDashboard } from './EvaluationDashboard';
import { YearEndAssessment } from './YearEndAssessment';
import { cn } from '../../ui/utils';
import { usePerformancePrototype } from '../../../lib/performance';
import { PrototypeWorkflowPanel } from '../shared/PrototypeWorkflowPanel';

export function MyKPIDashboard() {
  const [expandedBersama, setExpandedBersama] = useState(true);
  const [expandedUnit, setExpandedUnit] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'check-in' | 'planning' | 'goal-setting' | 'evaluation' | 'year-end-assessment'>('dashboard');
  const { submitPlanning } = usePerformancePrototype();

  if (currentView === 'check-in') {
    return <CheckInForm onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'planning') {
    return <PlanningDashboard onEditKPI={() => setCurrentView('goal-setting')} onSubmit={() => { submitPlanning(); setCurrentView('dashboard'); }} />;
  }

  if (currentView === 'goal-setting') {
    return <GoalSettingForm onBack={() => setCurrentView('planning')} />;
  }

  if (currentView === 'evaluation') {
    return <EvaluationDashboard onStartAssessment={() => setCurrentView('year-end-assessment')} />;
  }

  if (currentView === 'year-end-assessment') {
    return <YearEndAssessment onBack={() => setCurrentView('evaluation')} />;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen relative">
      {/* Simulation Switcher */}
      <div className="flex justify-end">
        <select 
          className="bg-white border border-gray-300 text-gray-700 py-1 px-3 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={
             currentView === 'planning' || currentView === 'goal-setting' ? 'planning' :
             currentView === 'evaluation' || currentView === 'year-end-assessment' ? 'evaluation' : 
             'monitoring'
          }
          onChange={(e) => {
             const val = e.target.value;
             if (val === 'planning') setCurrentView('planning');
             else if (val === 'evaluation') setCurrentView('evaluation');
             else setCurrentView('dashboard');
          }}
        >
          <option value="planning">Phase 1: Goal Setting</option>
          <option value="monitoring">Phase 2: Monitoring (Check-In)</option>
          <option value="evaluation">Phase 3: Year-End Review</option>
        </select>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span>Rinjani</span>
            <span>/</span>
            <span>Performance</span>
            <span>/</span>
            <span className="text-foreground font-medium">My KPI</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">My KPI 2026</h1>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-white px-4 py-2 rounded-lg border shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="text-sm">
                <div className="font-semibold">{currentUser.name}</div>
                <div className="text-xs text-muted-foreground">{currentUser.position}</div>
              </div>
           </div>
        </div>
      </div>

      <PrototypeWorkflowPanel variant="my-kpi" />

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ScoreCard 
          label="PI Score" 
          value={performanceStats.currentPI} 
          subValue="Current" 
          variant="primary" 
        />
        <ScoreCard 
          label="PR Rating" 
          value={performanceStats.currentRating} 
          subValue="(Sementara)" 
          variant="success" 
        />
        <ScoreCard 
          label="Next Action" 
          value="Check-In 2" 
          subValue="1-31 Jul 2026" 
          variant="warning" 
        />
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Assessment Timeline 2026</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative flex justify-between items-center pt-2 pb-6 px-4">
            {/* Connecting Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10 mx-10"></div>
            
            <div className="flex flex-col items-center gap-2 z-0">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white border-4 border-white shadow-sm">
                <CheckCircle2 size={16} />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold">Goal Setting</div>
                <div className="text-xs text-green-600 font-medium">Completed</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 z-0 cursor-pointer" onClick={() => setCurrentView('check-in')}>
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white border-4 border-white shadow-sm hover:scale-110 transition-transform">
                <CheckCircle2 size={16} />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold">Check-In 1</div>
                <div className="text-xs text-green-600 font-medium">Completed</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 z-0">
              <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white border-4 border-white shadow-sm">
                <Circle size={16} fill="currentColor" className="text-yellow-500" />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold">Check-In 2</div>
                <div className="text-xs text-yellow-600 font-medium">Upcoming</div>
              </div>
            </div>

             <div className="flex flex-col items-center gap-2 z-0">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 border-4 border-white shadow-sm">
                <Circle size={16} />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-500">Check-In 3</div>
                <div className="text-xs text-gray-400">Upcoming</div>
              </div>
            </div>

             <div className="flex flex-col items-center gap-2 z-0">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 border-4 border-white shadow-sm">
                <Circle size={16} />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-500">Year-End</div>
                <div className="text-xs text-gray-400">Upcoming</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KPI Bersama */}
        <div className="space-y-4">
            <div 
              className="flex items-center justify-between cursor-pointer group"
              onClick={() => setExpandedBersama(!expandedBersama)}
            >
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">KPI Bersama</h2>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                        {performanceStats.kpiBersamaWeight}%
                    </span>
                </div>
                {expandedBersama ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
            </div>
            
            {expandedBersama && (
                <div className="space-y-3">
                    {kpiBersama.map(kpi => (
                        <KPIListItem key={kpi.id} kpi={kpi} />
                    ))}
                </div>
            )}
        </div>

        {/* KPI Unit */}
        <div className="space-y-4">
             <div 
              className="flex items-center justify-between cursor-pointer group"
              onClick={() => setExpandedUnit(!expandedUnit)}
            >
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">KPI Unit</h2>
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                        {performanceStats.kpiUnitWeight}%
                    </span>
                </div>
                 {expandedUnit ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
            </div>
            
             {expandedUnit && (
                <div className="space-y-3">
                    {kpiUnit.map(kpi => (
                        <KPIListItem key={kpi.id} kpi={kpi} />
                    ))}
                    <Button variant="outline" className="w-full border-dashed text-muted-foreground">
                        + Propose KPI Unit
                    </Button>
                </div>
            )}
        </div>
      </div>

      {/* Check-In History */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Check-In History</h2>
        <Card>
            <div className="divide-y">
                {checkInHistory.map((item, index) => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                             <div className={cn(
                                 "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white",
                                 item.status === 'Completed' ? "bg-green-500" : "bg-gray-200 text-gray-400"
                             )}>
                                 {index + 1}
                             </div>
                             <div>
                                 <div className="font-semibold text-gray-900">Check-In {index + 1} ({item.period})</div>
                                 <div className="text-xs text-muted-foreground">{item.date}</div>
                             </div>
                        </div>
                        <div className="flex items-center gap-6">
                            {item.piScore && (
                                <div className="text-right">
                                    <div className="text-xs text-muted-foreground">PI Score</div>
                                    <div className="font-bold text-gray-900">{item.piScore}</div>
                                </div>
                            )}
                            <div className={cn(
                                "px-3 py-1 rounded-full text-xs font-medium",
                                item.status === 'Completed' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                            )}>
                                {item.status}
                            </div>
                            {item.status === 'Completed' && (
                                <Button variant="ghost" size="sm" className="text-primary" onClick={() => setCurrentView('check-in')}>Lihat Detail</Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
      </div>
    </div>
  );
}

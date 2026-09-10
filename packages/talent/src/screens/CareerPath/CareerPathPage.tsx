/**
 * Career Path Page - Main Entry Point
 * INJ-TMS-001 | Career Path (Aspiration)
 * 
 * Sprint 3: Supervisor Aspiration complete
 * Sprint 4: Job Holder Aspiration complete
 * Sprint 5: Unit Aspiration complete
 * Sprint 6: Admin Consolidation complete
 */

import React from 'react';
import { FilterRail, PageHeader } from "@rinjani/shared-ui";
import { Layout } from '../../components/shell/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { User, Users, Target, Building, BarChart3 } from 'lucide-react';
import { CareerPathProvider } from '../../lib/career-path/CareerPathContext';
import { IndividualAspirationView } from './IndividualAspiration/IndividualAspirationView';
import { SupervisorAspirationView } from './SupervisorAspiration/SupervisorAspirationView';
import { JobHolderAspirationView } from './JobHolderAspiration/JobHolderAspirationView';
import { UnitAspirationView } from './UnitAspiration/UnitAspirationView';
import { AdminDashboardView } from './Admin/AdminDashboardView';

export function CareerAspirationPage({ embedded = false }: { embedded?: boolean }) {
  const tabTriggerClassName =
    "gap-2 rounded-full border border-transparent bg-transparent px-4 py-2 text-muted-foreground transition-colors data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:bg-background/80 hover:text-foreground";
  const contentSurfaceClassName = "rounded-[24px] border border-border bg-card p-4 shadow-sm sm:p-6";

  const content = (
    <CareerPathProvider>
      <div className={embedded ? "flex h-full flex-col gap-6" : "mx-auto flex w-full max-w-[var(--layout-max-width-workspace)] flex-col gap-6 px-4 pb-10 pt-6 md:px-6 lg:px-8"}>
        <PageHeader
          variant="workspace"
          eyebrow="My Talent Journey"
          title="Career Aspiration"
          description="Kelola aspirasi karir karyawan dari berbagai sumber: Individual, Supervisor, Job Holder, dan Unit untuk perencanaan karir yang lebih baik."
        />

        <Tabs defaultValue="individual" className="w-full space-y-6">
          <FilterRail
            title="Aspiration source"
            description="Pilih sumber aspirasi untuk berpindah konteks kerja tanpa meninggalkan route aktif."
            actionsClassName="w-full"
          >
            <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-[20px] bg-muted/70 p-2">
              <TabsTrigger value="individual" className={tabTriggerClassName}>
                <User className="h-4 w-4" />
                <span className="font-medium">Individual</span>
              </TabsTrigger>
              <TabsTrigger value="supervisor" className={tabTriggerClassName}>
                <Users className="h-4 w-4" />
                <span className="font-medium">Supervisor</span>
              </TabsTrigger>
              <TabsTrigger value="jobholder" className={tabTriggerClassName}>
                <Target className="h-4 w-4" />
                <span className="font-medium">Job Holder</span>
              </TabsTrigger>
              <TabsTrigger value="unit" className={tabTriggerClassName}>
                <Building className="h-4 w-4" />
                <span className="font-medium">Unit</span>
              </TabsTrigger>
              <TabsTrigger value="consolidation" className={tabTriggerClassName}>
                <BarChart3 className="h-4 w-4" />
                <span className="font-medium">Aspiration Analytic</span>
              </TabsTrigger>
            </TabsList>
          </FilterRail>

          <TabsContent value="individual" className="mt-0 focus-visible:outline-none">
            <section className={contentSurfaceClassName}>
              <IndividualAspirationView />
            </section>
          </TabsContent>

          <TabsContent value="supervisor" className="mt-0 focus-visible:outline-none">
            <section className={contentSurfaceClassName}>
              <SupervisorAspirationView />
            </section>
          </TabsContent>

          <TabsContent value="jobholder" className="mt-0 focus-visible:outline-none">
            <section className={contentSurfaceClassName}>
              <JobHolderAspirationView />
            </section>
          </TabsContent>

          <TabsContent value="unit" className="mt-0 focus-visible:outline-none">
            <section className={contentSurfaceClassName}>
              <UnitAspirationView />
            </section>
          </TabsContent>

          <TabsContent value="consolidation" className="mt-0 focus-visible:outline-none">
            <section className={contentSurfaceClassName}>
              <AdminDashboardView />
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </CareerPathProvider>
  );

  if (embedded) {
    return content;
  }

  return <Layout>{content}</Layout>;
}

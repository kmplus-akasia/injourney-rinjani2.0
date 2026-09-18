import { NavLink } from "react-router";
import { Bookmark, FileText, Search } from "lucide-react";
import { cn } from "@/components/ui/utils";

const navItems = [
  { label: "Explore Job", icon: Search, to: "/talent/explore", end: true },
  { label: "My Applications", icon: FileText, to: "/talent/my-applications" },
  { label: "Saved Jobs", icon: Bookmark, to: "/talent/saved" },
];

export function JobTenderNav() {
  return (
    <nav aria-label="Job Tender Marketplace" className="flex flex-wrap gap-1 rounded-[24px] border border-border bg-card p-1.5 shadow-sm">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              "inline-flex h-10 items-center gap-2 rounded-2xl px-4 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )
          }
        >
          <item.icon className="size-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

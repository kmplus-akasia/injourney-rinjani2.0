import { Link, useLocation } from "react-router";
import { useState, useRef } from "react";
import { 
  Target, 
  ClipboardList, 
  Briefcase, 
  Users, 
  GitBranch, 
  Grid3X3, 
  FileCheck, 
  PieChart,
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  Home
} from "lucide-react";
import patternBg from "figma:asset/4dfc7b04f7c110e53adb631e9c207269b8e06297.png";
import imgLogo from "figma:asset/c431b6a1465f2d5e74a13b698b185dc831318ab2.png";
import imgAvatar from "figma:asset/2291940396e4817f705a7fe6d36e22fae12fd803.png";
import imgAvatar1 from "figma:asset/974de0e7b8f746cd6c43fe01b8105870ae531cf3.png";
import ProfilePopup from "./ProfilePopup";

interface RinjaniSidebarProps {
  onBackClick?: () => void;
}

function SmeIcon() {
  return (
    <div className="absolute bottom-0 right-0 size-[16px]" data-name="sme icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g>
          <circle cx="10" cy="10" r="9.5" fill="#00A199" />
          <circle cx="10" cy="10" r="9.5" stroke="white" />
          <path d="M14.5 7L8.5 13L5.5 10" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function PatternBackground() {
  return (
    <div 
      className="absolute inset-0 z-0 pointer-events-none opacity-[0.04] mix-blend-plus-lighter"
      style={{
        backgroundImage: `url(${patternBg})`,
        backgroundRepeat: 'repeat',
        backgroundSize: '150px',
        backgroundPosition: 'top center'
      }}
    />
  );
}

// --- Navigation Data & Components ---

type NavItem = {
  label: string;
  path: string;
  icon: React.ElementType;
  description?: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navigationGroups: NavGroup[] = [
  {
    title: "My Talent Journey",
    items: [
      { label: "Home", path: "/talent", icon: Home, description: "Personalized Dashboard" },
      { label: "My Team", path: "/talent/supervisor-portal", icon: Users, description: "Line manager workspace" },
      { label: "Career Aspiration", path: "/talent/career-aspiration", icon: Target, description: "Kelola Aspirasi Karir Pekerja" },
      { label: "Development Plan", path: "/talent/idp", icon: ClipboardList, description: "Individual Development" },
      { label: "360 Assessment", path: "/talent/360-assessment", icon: PieChart, description: "Multi-source Feedback" },
      { label: "Competency Assessment", path: "/talent/competency-assessment", icon: Target, description: "Self Assessment Tools" },
      { label: "Job Tender Marketplace", path: "/talent/explore", icon: Briefcase, description: "Internal Job Opportunities" }
    ]
  },
  {
    title: "Talent Management",
    items: [
      { label: "Talent Pool", path: "/talent/talent-pool", icon: Users, description: "Profiling talent" },
      { label: "Succession Planning", path: "/talent/succession-planning", icon: GitBranch, description: "Longlist Employee" },
      { label: "Talent Classification", path: "/talent/talent-mapping", icon: Grid3X3, description: "Performance Assessment" },
      { label: "Talent Review", path: "/talent/talent-review", icon: FileCheck, description: "Periodic Review" }
    ]
  },
  {
    title: "Administration",
    items: [
      { label: "Job Tender Headquarters", path: "/talent/admin/job-tender", icon: Briefcase, description: "Manage Tenders" },
      { label: "IDP Headquarters", path: "/talent/admin/idp", icon: ClipboardList, description: "IDP Administration" },
      { label: "360 Assessment HQ", path: "/talent/360-assessment-hq", icon: PieChart, description: "Manage Assessments" },
      { label: "Organization Management", path: "/talent/org-management", icon: Briefcase, description: "Position Master" }
    ]
  }
];

function NavLink({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(item.path);

  return (
    <Link
      to={item.path}
      className={`
        relative group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
        ${isActive 
          ? 'bg-sidebar-accent/10 text-sidebar-accent shadow-sm ring-1 ring-sidebar-accent/20' 
          : 'text-sidebar-foreground/80 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground'
        }
      `}
      title={isCollapsed ? item.label : undefined}
    >
      <item.icon 
        size={20} 
        strokeWidth={1.5}
        className={`shrink-0 ${isActive ? 'text-sidebar-accent' : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground'}`} 
      />
      
      {!isCollapsed && (
        <div className="flex flex-col min-w-0">
          <span className="font-sans text-sidebar-foreground font-medium leading-tight truncate">
            {item.label}
          </span>
          {item.description && (
            <span className="font-sans text-xs text-sidebar-foreground/60 leading-tight truncate mt-0.5">
              {item.description}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

// --- Layout Components ---

export function RinjaniSidebar({ onBackClick }: RinjaniSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const [profilePopupPosition, setProfilePopupPosition] = useState({ top: 0, left: 0 });

  const handleCollapseToggle = () => setIsExpanded(!isExpanded);

  const handleProfileClick = () => {
    if (profileButtonRef.current) {
      const rect = profileButtonRef.current.getBoundingClientRect();
      setProfilePopupPosition({
        top: rect.top,
        left: rect.right + 12,
      });
      setShowProfilePopup(!showProfilePopup);
    }
  };

  return (
    <>
      <aside 
        className={`
          relative h-full flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out shadow-xl z-50
          ${isExpanded ? 'w-[250px]' : 'w-[64px]'}
        `}
      >
        {/* Background Pattern */}
        <PatternBackground />
        
        {/* Content Layer (z-10 to sit above pattern) */}
        <div className="relative z-10 flex flex-col h-full w-full">
          
          {/* Header Section */}
          <div className="flex items-center justify-between px-3 py-3 shrink-0">
            {isExpanded ? (
              <div className="flex gap-2 items-center">
                <div className="relative shrink-0 size-[40px]">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="Logo" className="absolute h-[300%] left-[-235.98%] max-w-none top-[-90%] w-[841.96%]" src={imgLogo} />
                  </div>
                </div>
                <div className="flex flex-col">
                  <p className="font-sans font-bold leading-[1.2] text-[16px] text-sidebar-foreground">RINJANI</p>
                  <p className="font-sans font-medium leading-[1.5] text-[8px] text-sidebar-foreground/70 w-[82px]">Integrated Talent Management System</p>
                </div>
              </div>
            ) : (
              <button onClick={handleCollapseToggle} className="relative shrink-0 size-[40px] mx-auto hover:opacity-80 transition-opacity">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="Logo" className="absolute h-[300%] left-[-235.98%] max-w-none top-[-90%] w-[841.96%]" src={imgLogo} />
                </div>
              </button>
            )}
          </div>

          {/* Floating Toggle Button */}
          <button 
            onClick={handleCollapseToggle}
            className="absolute top-24 -right-3 z-50 p-1.5 rounded-full bg-sidebar-accent text-sidebar-accent-foreground shadow-md hover:bg-sidebar-accent/90 transition-colors border-2 border-sidebar"
          >
            {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>

          {/* Back Navigation (If expanded) */}
          {isExpanded && onBackClick && (
            <div className="px-3 mt-2 mb-4">
              <button 
                onClick={onBackClick}
                className="flex items-center gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors group w-full"
              >
                <div className="p-1 rounded-md bg-white/5 group-hover:bg-white/10 transition-colors">
                  <ChevronLeft size={14} />
                </div>
                <span className="font-sans font-semibold text-sm">Back to Main Menu</span>
              </button>
            </div>
          )}

          {/* Navigation Items (Scrollable) */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {navigationGroups.map((group, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                {isExpanded ? (
                  <h3 className="px-3 mb-2 font-sans text-xs font-bold uppercase tracking-wider text-sidebar-foreground/50">
                    {group.title}
                  </h3>
                ) : (
                  <div className="h-px w-8 bg-sidebar-foreground/10 mx-auto mb-2" />
                )}
                
                <div className="flex flex-col gap-1">
                  {group.items.map((item) => (
                    <NavLink key={item.path} item={item} isCollapsed={!isExpanded} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* User Profile Section (Fixed Bottom) */}
          <div className="px-3 pb-4 shrink-0">
            <button
              ref={profileButtonRef}
              onClick={handleProfileClick}
              className={`
                flex items-center gap-2 rounded-lg hover:bg-white/10 transition-colors w-full 
                ${isExpanded ? 'p-2' : 'p-2 justify-center'}
              `}
            >
              <div className="relative shrink-0 size-[40px]">
                <div className="rounded-full overflow-hidden size-full border-2 border-sidebar-ring">
                  <img alt="Profile" className="object-cover size-full" src={imgAvatar} />
                  <img alt="Profile overlay" className="absolute inset-0 object-cover size-full" src={imgAvatar1} />
                </div>
                <SmeIcon />
              </div>
              
              {isExpanded && (
                <>
                  <div className="flex-1 flex flex-col items-start text-left min-w-0">
                    <p className="font-sans font-semibold text-sm text-sidebar-foreground leading-tight truncate w-full">Dimas Sayyid</p>
                    <p className="font-sans font-normal text-xs text-sidebar-foreground/70 leading-tight truncate w-full">dimas@injourney.co.id</p>
                  </div>
                  <MoreVertical className="size-5 text-sidebar-foreground/70 shrink-0" />
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Profile Popup */}
      {showProfilePopup && (
        <ProfilePopup 
          onClose={() => setShowProfilePopup(false)}
          position={profilePopupPosition}
          isAbove={true}
        />
      )}
    </>
  );
}

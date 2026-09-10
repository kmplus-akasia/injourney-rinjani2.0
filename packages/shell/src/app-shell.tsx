import type { ReactNode } from "react";
import { createContext, startTransition, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Bell,
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  FileCheck,
  GitBranch,
  Grid3X3,
  Headphones,
  LayoutGrid,
  LineChart,
  LogOut,
  Mail,
  Search,
  Settings,
  ShieldCheck,
  Target,
  Trophy,
  UserCircle,
  Users,
} from "lucide-react";
import type { ModuleManifest, Notification, PlatformManifest, ShellNavigationState, ShellSearchItem, UserRole } from "@rinjani/shared-types";
import {
  CommandMenu,
  CommandMenuEmpty,
  CommandMenuGroup,
  CommandMenuInput,
  CommandMenuItem,
  CommandMenuList,
  CommandMenuSeparator,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rinjani/shared-ui";

const dimasAvatarUrl = new URL("../../portal/src/assets/7e7006a4927bcec25694136f88b3db870eacf73b.png", import.meta.url).href;
const binaviaAvatarUrl = new URL("../../portal/src/assets/7831b9ec4303df4fbb366388ea0a210b01e2e804.png", import.meta.url).href;

interface AppShellProps {
  children: ReactNode;
  platforms: PlatformManifest[];
  modules: ModuleManifest[];
  globalSearchItems?: ShellSearchItem[];
  notifications: Notification[];
  userRole: UserRole;
  userEmail: string;
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
  /** Rendered in the teal header row (e.g. My KPI phase toggle), outside the white workspace. */
  headerAccessory?: ReactNode;
}

type OpenMenu = "search" | "platforms" | "notifications" | "help" | "sidebarProfile" | null;

const ShellPresenceContext = createContext(false);

const iconMap = {
  analytics: LineChart,
  briefcase: Briefcase,
  clipboard: ClipboardList,
  file: FileCheck,
  git: GitBranch,
  grid: Grid3X3,
  mail: Mail,
  settings: Settings,
  shield: ShieldCheck,
  target: Target,
  trophy: Trophy,
  users: Users,
  workspace: Building2,
} as const;

const fallbackUserProfile = {
  name: "Dimas Sayyid",
  email: "dimas.sayyid@injourney.id",
  title: "VP Human Capital Strategy",
  organization: "Direktorat Human Capital",
  company: "InJourney Holding",
  avatarUrl: dimasAvatarUrl,
};

// Keep the shell chrome persona in sync with the signed-in user shown across the
// modules (profile, dashboard, performance) instead of a single hardcoded identity.
const userProfilesByEmail: Record<string, typeof fallbackUserProfile> = {
  "binavia@injourney.co.id": {
    name: "Binavia Wardhani",
    email: "binavia@injourney.co.id",
    title: "HC Strategy Senior Officer",
    organization: "Direktorat Human Capital",
    company: "InJourney Holding",
    avatarUrl: binaviaAvatarUrl,
  },
};

function resolveUserProfile(email: string) {
  return userProfilesByEmail[email] ?? { ...fallbackUserProfile, email: email || fallbackUserProfile.email };
}

function friendlyDate(date: Date) {
  try {
    return date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

function resolveIcon(iconKey: string) {
  return iconMap[iconKey as keyof typeof iconMap] ?? LayoutGrid;
}

function initialsFor(email: string) {
  return email
    .split("@")[0]
    .split(/[._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function searchValueForItem(item: ShellSearchItem) {
  return [item.label, item.description, item.kind, ...(item.keywords ?? [])].filter(Boolean).join(" ");
}

export function useIntegratedShell() {
  return useContext(ShellPresenceContext);
}

export function AppShell({
  children,
  platforms,
  modules,
  globalSearchItems = [],
  notifications,
  userRole,
  userEmail,
  onRoleChange,
  onLogout,
  headerAccessory,
}: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const userProfile = useMemo(() => resolveUserProfile(userEmail), [userEmail]);
  const greetingName = userProfile.name.split(" ")[0];
  const todayLabel = useMemo(() => friendlyDate(new Date()), []);

  const visiblePlatforms = useMemo(
    () => platforms.filter((platform) => platform.visibleTo.includes(userRole)).sort((left, right) => left.order - right.order),
    [platforms, userRole],
  );

  const visibleModules = useMemo(
    () =>
      modules
        .filter((module) => module.visibleTo.includes(userRole) && !module.hidden)
        .sort((left, right) => left.order - right.order),
    [modules, userRole],
  );

  const currentModule = useMemo(() => {
    return (
      [...visibleModules]
        .sort((left, right) => right.routePath.length - left.routePath.length)
        .find((module) => location.pathname === module.routePath || location.pathname.startsWith(`${module.routePath}/`)) ?? visibleModules[0]
    );
  }, [location.pathname, visibleModules]);

  const currentPlatform =
    visiblePlatforms.find((platform) => platform.id === currentModule?.parentPlatformId) ?? visiblePlatforms[0] ?? platforms[0];

  const unreadNotifications = notifications.filter((notification) => !notification.read);

  const navigationState: ShellNavigationState = {
    currentPlatformId: currentPlatform?.id ?? "portal",
    currentModuleId: currentModule?.id ?? "portal-dashboard",
    isSidebarCollapsed,
    notificationCount: unreadNotifications.length,
    currentPageTitle: currentModule?.label,
    shellVariant: "rinjani-talent-light",
  };

  const sidebarGroups = Array.from(
    visibleModules
      .filter((module) => module.parentPlatformId === currentPlatform?.id)
      .reduce((map, module) => {
        const group = map.get(module.sidebarGroup) ?? [];
        group.push(module);
        map.set(module.sidebarGroup, group);
        return map;
      }, new Map<string, ModuleManifest[]>()),
  );

  const searchPeople = globalSearchItems.filter((item) => item.kind === "person");
  const searchPolicies = globalSearchItems.filter((item) => item.kind === "policy");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearchMenu();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const sidebarWidthCss = isSidebarCollapsed ? "4rem" : "250px";

  useLayoutEffect(() => {
    document.documentElement.style.setProperty("--rinjani-shell-sidebar-width", sidebarWidthCss);
    return () => {
      document.documentElement.style.removeProperty("--rinjani-shell-sidebar-width");
    };
  }, [sidebarWidthCss]);

  function toggleMenu(menu: Exclude<OpenMenu, null>) {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  function openSearchMenu() {
    setSearchQuery("");
    setOpenMenu("search");
  }

  function closeMenu() {
    setOpenMenu(null);
    setSearchQuery("");
  }

  function navigateFromMenu(routePath: string) {
    closeMenu();
    startTransition(() => navigate(routePath));
  }

  function toggleSidebarCollapsed() {
    setIsSidebarCollapsed((value) => !value);
  }

  return (
    <ShellPresenceContext.Provider value>
      <div className="relative flex h-screen overflow-hidden bg-primary text-primary-foreground">
        <aside
          className={`relative z-40 flex h-full shrink-0 flex-col overflow-hidden bg-primary text-sidebar-foreground transition-[width] duration-300 ease-out ${
            isSidebarCollapsed ? "w-16" : "w-[250px]"
          }`}
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/98 via-primary/94 to-primary/98" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundColor: "rgba(226, 232, 240, 0.2)",
              WebkitMaskImage: "url('/brand/kawung-factors/kawung-factor-09-tile-red.svg')",
              maskImage: "url('/brand/kawung-factors/kawung-factor-09-tile-red.svg')",
              WebkitMaskRepeat: "repeat",
              maskRepeat: "repeat",
              WebkitMaskSize: isSidebarCollapsed ? "68px 68px" : "112px 112px",
              maskSize: isSidebarCollapsed ? "68px 68px" : "112px 112px",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-10"
            style={{
              backgroundColor: "rgba(203, 213, 225, 0.16)",
              WebkitMaskImage: "url('/brand/kawung-factors/kawung-factor-09-tile-red.svg')",
              maskImage: "url('/brand/kawung-factors/kawung-factor-09-tile-red.svg')",
              WebkitMaskPosition: "36px 44px",
              maskPosition: "36px 44px",
              WebkitMaskRepeat: "repeat",
              maskRepeat: "repeat",
              WebkitMaskSize: isSidebarCollapsed ? "92px 92px" : "148px 148px",
              maskSize: isSidebarCollapsed ? "92px 92px" : "148px 148px",
            }}
          />

          <div className={`relative flex shrink-0 items-center ${isSidebarCollapsed ? "justify-center px-2 py-3" : "px-4 py-4"}`}>
            <div
              className={`flex items-center overflow-hidden border border-white/65 bg-white/90 shadow-sm shadow-black/10 backdrop-blur-md ${
                isSidebarCollapsed ? "size-11 justify-start rounded-2xl p-0" : "h-16 w-[196px] justify-start gap-3 rounded-[28px] px-4 py-2.5"
              }`}
            >
              <div className={`${isSidebarCollapsed ? "size-11" : "size-14"} shrink-0 overflow-hidden rounded-full`}>
                <img
                  src="/brand/rinjani-logo-transparent.png"
                  alt="Rinjani"
                  className={`${isSidebarCollapsed ? "h-11 w-[84px]" : "h-14 w-[106px]"} max-w-none object-contain object-left`}
                />
              </div>
              {!isSidebarCollapsed ? (
                <div className="min-w-0 leading-none text-foreground/80">
                  <p className="text-[24px] font-semibold leading-none tracking-tight text-foreground">Rinjani</p>
                  <p className="mt-1 whitespace-nowrap text-[11px] font-medium leading-none tracking-[0.08em] text-muted-foreground">InJourney HCMS</p>
                </div>
              ) : null}
            </div>
          </div>

          <nav className="relative min-h-0 flex-1 overflow-y-auto px-3 pb-5 pt-2 [scrollbar-color:rgba(255,255,255,0.24)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/30">
            {sidebarGroups.map(([groupLabel, groupModules]) => (
              <section key={groupLabel} className="mb-6">
                {!isSidebarCollapsed ? (
                  <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-sidebar-foreground/55">{groupLabel}</p>
                ) : (
                  <div className="mx-auto mb-3 h-px w-7 bg-sidebar-foreground/15" />
                )}
                <div className="space-y-1">
                  {groupModules.map((module) => {
                    const isActive = navigationState.currentModuleId === module.id;
                    const Icon = resolveIcon(module.iconKey);
                    const linkTarget = module.defaultChildRoute ?? module.routePath;
                    return (
                      <Link
                        key={module.id}
                        to={linkTarget}
                        className={`group flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2.5 transition-all ${
                          isActive
                            ? "bg-white/15 text-sidebar-foreground shadow-sm ring-1 ring-white/10"
                            : "text-sidebar-foreground/78 hover:bg-white/10 hover:text-sidebar-foreground"
                        } ${isSidebarCollapsed ? "justify-center px-2" : ""}`}
                        title={isSidebarCollapsed ? `${module.label} - ${module.description}` : module.label}
                      >
                        <Icon className={`size-5 shrink-0 ${isActive ? "text-secondary" : "text-sidebar-foreground/60 group-hover:text-white"}`} />
                        {!isSidebarCollapsed ? (
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold leading-5">{module.label}</p>
                            {module.description ? (
                              <p className={`truncate text-xs leading-4 ${isActive ? "text-sidebar-foreground/70" : "text-sidebar-foreground/55"}`}>
                                {module.description}
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </nav>

          <div className={`relative z-10 shrink-0 border-t border-white/10 bg-primary p-3 ${isSidebarCollapsed ? "px-2" : ""}`}>
            <button
              type="button"
              onClick={() => toggleMenu("sidebarProfile")}
              className={`flex w-full items-center gap-3 rounded-2xl bg-white/10 p-2.5 text-left transition-colors hover:bg-white/15 ${
                isSidebarCollapsed ? "justify-center" : ""
              }`}
            >
              <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/95 text-sm font-bold text-sidebar shadow-sm">
                <img src={userProfile.avatarUrl} alt={userProfile.name} className="size-full object-cover" />
                <span className="absolute bottom-0.5 right-0.5 size-2.5 rounded-full border border-white bg-success" />
              </div>
              {!isSidebarCollapsed ? (
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{userProfile.name}</p>
                  <p className="truncate text-xs text-sidebar-foreground/70">{userProfile.title}</p>
                </div>
              ) : null}
            </button>
          </div>
        </aside>

        <button
          type="button"
          className={`absolute top-[96px] z-[70] flex size-8 items-center justify-center rounded-full border border-white/45 bg-secondary text-secondary-foreground shadow-xl shadow-black/25 transition-[left,transform] duration-300 ease-out hover:scale-105 ${
            isSidebarCollapsed ? "left-[50px]" : "left-[236px]"
          }`}
          onClick={toggleSidebarCollapsed}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>

        {openMenu === "sidebarProfile" ? (
          <div
            className={`fixed bottom-20 z-[80] rounded-3xl border border-border bg-card p-4 text-foreground shadow-2xl ${
              isSidebarCollapsed ? "left-3 w-[280px]" : "left-3 w-[224px]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-sm font-bold text-primary">
                <img src={userProfile.avatarUrl} alt={userProfile.name} className="size-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{userProfile.name}</p>
                <p className="text-xs text-muted-foreground">{userProfile.title}</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-muted/60 p-3 text-xs leading-5 text-muted-foreground">
              <p className="font-medium text-foreground">{userProfile.organization}</p>
              <p>{userProfile.company}</p>
              <p className="mt-1">{userProfile.email}</p>
            </div>
            <div className="mt-4 space-y-2">
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <UserCircle className="size-4" />
                Profile settings
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="size-4" />
                Logout
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-primary">
          <header className="relative z-30 h-16 shrink-0 bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex h-full items-center gap-3">
              <div className="hidden min-w-[180px] shrink-0 lg:block">
                <p className="text-base font-semibold leading-5 text-white">Hello, {greetingName}.</p>
                <p className="mt-0.5 text-xs leading-4 text-white/65">{todayLabel}</p>
              </div>
              <button
                type="button"
                className="hidden min-w-0 max-w-[760px] flex-1 items-center rounded-xl bg-white/18 px-4 py-2.5 text-left text-white shadow-sm ring-1 ring-white/20 transition-colors hover:bg-white/25 lg:flex"
                onClick={openSearchMenu}
              >
                <Search className="mr-3 size-4 shrink-0 text-white/80" />
                <span className="truncate text-sm font-medium text-white/90">Search modules, people, or policy</span>
                <span className="ml-auto rounded-lg bg-white/15 px-2 py-1 text-[11px] font-semibold text-white/75">Ctrl K</span>
              </button>

              {headerAccessory ? <div className="flex shrink-0 items-center">{headerAccessory}</div> : null}

              <div className="ml-auto flex items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleMenu("platforms")}
                    className="flex size-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 transition-colors hover:bg-white/20"
                    aria-label="Switch platform"
                  >
                    <LayoutGrid className="size-5" />
                  </button>
                  {openMenu === "platforms" ? (
                    <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[420px] rounded-3xl border border-border bg-card p-5 text-foreground shadow-2xl">
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-foreground">Switch Platform</p>
                        <p className="text-xs leading-5 text-muted-foreground">Move across Rinjani modules while preserving one shell.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {visiblePlatforms.map((platform) => {
                          const Icon = resolveIcon(platform.iconKey);
                          const isActive = platform.id === currentPlatform?.id;
                          return (
                            <button
                              key={platform.id}
                              type="button"
                              onClick={() => {
                                setOpenMenu(null);
                                startTransition(() => navigate(platform.defaultRoute));
                              }}
                              className={`rounded-2xl border p-4 text-left transition-colors ${
                                isActive ? "border-primary/30 bg-primary/10 shadow-sm" : "border-border bg-background hover:bg-muted/60"
                              }`}
                            >
                              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Icon className="size-5" />
                              </div>
                              <p className="text-sm font-semibold text-foreground">{platform.switcherLabel ?? platform.label}</p>
                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{platform.description}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleMenu("notifications")}
                    className="relative flex size-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 transition-colors hover:bg-white/20"
                    aria-label="Notifications"
                  >
                    <Bell className="size-5" />
                    {navigationState.notificationCount > 0 ? (
                      <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[11px] font-bold text-secondary-foreground">
                        {navigationState.notificationCount}
                      </span>
                    ) : null}
                  </button>
                  {openMenu === "notifications" ? (
                    <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[380px] rounded-3xl border border-border bg-card p-5 text-foreground shadow-2xl">
                      <p className="text-sm font-semibold text-foreground">Notifications</p>
                      <div className="mt-3 space-y-2">
                        {unreadNotifications.length > 0 ? (
                          unreadNotifications.slice(0, 4).map((notification) => (
                            <div key={notification.id} className="rounded-2xl bg-muted/60 p-3">
                              <p className="text-sm font-medium text-foreground">{notification.title}</p>
                              <p className="mt-1 text-xs leading-5 text-muted-foreground">{notification.message}</p>
                            </div>
                          ))
                        ) : (
                          <p className="rounded-2xl bg-muted/60 p-3 text-sm text-muted-foreground">No unread notifications.</p>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => toggleMenu("help")}
                  className="flex size-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 transition-colors hover:bg-white/20"
                  aria-label="Help center"
                >
                  <Headphones className="size-5" />
                </button>

                <div className="relative hidden sm:block">
                  <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-primary-foreground/75" />
                  <Select value={userRole} onValueChange={(value) => onRoleChange(value as UserRole)}>
                    <SelectTrigger
                      aria-label="Demo user role"
                      className="h-10 w-[120px] rounded-xl border-white/20 bg-white/15 pl-9 pr-3 text-primary-foreground shadow-none ring-1 ring-white/10 hover:bg-white/20 focus-visible:ring-white/40 [&>svg]:text-primary-foreground"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end" className="z-[90] min-w-[120px]">
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="User">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
            </div>

            {openMenu === "help" ? (
              <div className="absolute right-4 top-[calc(100%+10px)] z-50 w-[360px] rounded-3xl border border-border bg-card p-4 text-foreground shadow-2xl">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <CircleHelp className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Rinjani assistance</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Use search to open modules, people, employees, and HC policy references across the integrated prototype.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

          </header>

          <main className="min-h-0 flex-1 overflow-y-auto bg-primary">
            <div className="relative min-h-full overflow-hidden rounded-tl-[32px] border-l border-white/20 bg-background text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_20px_60px_rgba(16,24,40,0.08)]">
              {children}
            </div>
          </main>
        </div>

        {openMenu === "search" ? (
          <div className="fixed inset-0 z-[100] flex items-start justify-center bg-foreground/35 px-4 pt-[12vh]" onMouseDown={closeMenu}>
            <div
              className="w-full max-w-3xl overflow-hidden rounded-3xl border border-border bg-card text-foreground shadow-2xl"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <CommandMenu className="rounded-3xl">
                <CommandMenuInput
                  autoFocus
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  placeholder="Search modules, people, employees, or policy..."
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      closeMenu();
                    }
                  }}
                />
                <CommandMenuList className="max-h-[440px] p-3">
                  <CommandMenuEmpty>No modules, people, or policies found.</CommandMenuEmpty>

                  <CommandMenuGroup heading="Modules">
                    {visibleModules.map((module) => {
                      const Icon = resolveIcon(module.iconKey);
                      return (
                        <CommandMenuItem
                          key={module.id}
                          value={[module.label, module.description, module.sidebarGroup, module.parentPlatformId].filter(Boolean).join(" ")}
                          onSelect={() => navigateFromMenu(module.routePath)}
                          className="rounded-2xl px-3 py-3"
                        >
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Icon className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{module.label}</p>
                            <p className="truncate text-xs text-muted-foreground">{module.description ?? module.sidebarGroup}</p>
                          </div>
                        </CommandMenuItem>
                      );
                    })}
                  </CommandMenuGroup>

                  <CommandMenuSeparator />

                  <CommandMenuGroup heading="People">
                    {searchPeople.map((item) => (
                      <CommandMenuItem
                        key={item.id}
                        value={searchValueForItem(item)}
                        onSelect={() => navigateFromMenu(item.routePath)}
                        className="rounded-2xl px-3 py-3"
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Users className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{item.label}</p>
                          <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </CommandMenuItem>
                    ))}
                  </CommandMenuGroup>

                  <CommandMenuSeparator />

                  <CommandMenuGroup heading="Policies">
                    {searchPolicies.map((item) => (
                      <CommandMenuItem
                        key={item.id}
                        value={searchValueForItem(item)}
                        onSelect={() => navigateFromMenu(item.routePath)}
                        className="rounded-2xl px-3 py-3"
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <FileCheck className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{item.label}</p>
                          <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </CommandMenuItem>
                    ))}
                  </CommandMenuGroup>
                </CommandMenuList>
              </CommandMenu>
            </div>
          </div>
        ) : null}
      </div>
    </ShellPresenceContext.Provider>
  );
}

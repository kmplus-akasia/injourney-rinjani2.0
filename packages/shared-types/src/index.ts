export type UserRole = "Admin" | "User";

export type NotificationType = "approval" | "deadline" | "announcement";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  sender?: string;
}

export interface UserSession {
  email: string;
  role: UserRole;
  orgCode: string;
  orgName: string;
  entitlements: string[];
}

export interface DesignThemeTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
  radius: string;
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  fontSans: string;
  fontMono: string;
  trackingNormal: string;
}

export type ShellVariant = "rinjani-talent-light";

export interface PlatformManifest {
  id: string;
  label: string;
  basePath: string;
  description: string;
  visibleTo: UserRole[];
  defaultRoute: string;
  iconKey: string;
  order: number;
  switcherLabel?: string;
  hidden?: boolean;
}

export interface ModuleManifest {
  id: string;
  label: string;
  routePath: string;
  parentPlatformId: string;
  visibleTo: UserRole[];
  sidebarGroup: string;
  iconKey: string;
  order: number;
  defaultChildRoute?: string;
  description?: string;
  hidden?: boolean;
}

export interface AppRouteMeta {
  path: string;
  pageTitle: string;
  breadcrumbLabel: string;
  platformId: string;
  moduleId: string;
  navLabel?: string;
  searchScope?: "global" | "platform" | "module";
  requiredEntitlements?: string[];
  hidden?: boolean;
}

export type ShellSearchItemKind = "person" | "policy";

export interface ShellSearchItem {
  id: string;
  kind: ShellSearchItemKind;
  label: string;
  description?: string;
  routePath: string;
  keywords?: string[];
}

export interface ShellNavigationState {
  currentPlatformId: string;
  currentModuleId: string;
  isSidebarCollapsed: boolean;
  notificationCount: number;
  currentPageTitle?: string;
  shellVariant?: ShellVariant;
}

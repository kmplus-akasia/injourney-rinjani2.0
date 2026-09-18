# Design Consistency Audit

Overall three-platform visual QA (saved 18 September 2026): [VISUAL_QA_THREE_PLATFORMS_2026-09-18.html](./VISUAL_QA_THREE_PLATFORMS_2026-09-18.html). Verdict: not consistent yet. Live inner-page screenshots in that file are still pending a logged-in pass.

This checklist tracks the current design-system unification pass.

## Shell and navigation

- [x] One global header across Portal, Talent, and Performance
- [x] One visible sidebar at a time
- [x] Header owns platform switching
- [x] Sidebar is current-platform-only
- [x] Talent no longer renders a second shell when embedded in the integrated host
- [x] Performance pages stay route-based and do not render a package-local shell

## Token system

- [x] Shared token layer created in `packages/shared-ui/src/theme.css`
- [x] Talent token values seeded the integrated theme
- [x] Host shell consumes semantic tokens instead of hardcoded colors
- [x] Package-level conflicting `:root` globals removed from the host app
- [x] Legacy token aliases preserved as a compatibility bridge
- [ ] Remove legacy aliases after copied prototype screens are normalized

## Talent normalization

- [x] Talent mounted under `/talent/*`
- [x] Internal Talent shell imports no longer force a nested sidebar/header
- [x] Major Talent navigation links updated to `/talent/*`
- [x] Legacy Talent paths redirected for compatibility
- [ ] Sweep remaining non-blocking breadcrumb/content references until all internal links are canonical

## Portal and Performance alignment

- [x] Portal runs inside the shared shell
- [x] Performance runs inside the shared shell
- [x] Performance wrapper updated to shared card/container styling
- [ ] Normalize remaining page-level component styles that still carry platform-specific visual language

## Validation

- [ ] Build passes after the design-system consolidation changes
- [ ] Visual check confirms no duplicate shell on Talent pages
- [ ] Visual check confirms platform switcher + current-platform sidebar behavior
- [ ] Visual check confirms token parity across Portal, Talent, and Performance

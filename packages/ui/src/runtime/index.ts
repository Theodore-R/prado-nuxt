// Primitives
export { default as PrButton } from './components/primitives/PrButton.vue'
export { default as PrIconButton } from './components/primitives/PrIconButton.vue'
export { default as PrBadge } from './components/primitives/PrBadge.vue'
export { default as PrTag } from './components/primitives/PrTag.vue'
export { default as PrAvatar } from './components/primitives/PrAvatar.vue'

// Layout
export { default as PrCard } from './components/layout/PrCard.vue'
export { default as PrCardHeader } from './components/layout/PrCardHeader.vue'
export { default as PrCardContent } from './components/layout/PrCardContent.vue'
export { default as PrCardFooter } from './components/layout/PrCardFooter.vue'
export { default as PrDivider } from './components/layout/PrDivider.vue'

// Form
export { default as PrInput } from './components/form/PrInput.vue'
export { default as PrTextarea } from './components/form/PrTextarea.vue'
export { default as PrSelect } from './components/form/PrSelect.vue'
export { default as PrCheckbox } from './components/form/PrCheckbox.vue'
export { default as PrRadio } from './components/form/PrRadio.vue'
export { default as PrSwitch } from './components/form/PrSwitch.vue'
export { default as PrFormField } from './components/form/PrFormField.vue'
export { default as PrTagInput } from './components/form/PrTagInput.vue'
export { default as PrPhoneInput } from './components/form/PrPhoneInput.vue'
export { default as PrMultiSelect } from './components/form/PrMultiSelect.vue'
export { default as PrDatePicker } from './components/form/PrDatePicker.vue'
export { default as PrDateRangePicker } from './components/form/PrDateRangePicker.vue'
export { default as PrFileUpload } from './components/form/PrFileUpload.vue'

// Feedback
export { default as PrDialog } from './components/feedback/PrDialog.vue'
export { default as PrConfirmDialog } from './components/feedback/PrConfirmDialog.vue'
export { default as PrAlert } from './components/feedback/PrAlert.vue'
export { default as PrSkeleton } from './components/feedback/PrSkeleton.vue'
export { default as PrEmptyState } from './components/feedback/PrEmptyState.vue'
export { default as PrProgress } from './components/feedback/PrProgress.vue'

// Navigation
export { default as PrTabs } from './components/navigation/PrTabs.vue'
export { default as PrAccordion } from './components/navigation/PrAccordion.vue'
export { default as PrAccordionItem } from './components/navigation/PrAccordionItem.vue'
export { default as PrBreadcrumb } from './components/navigation/PrBreadcrumb.vue'
export { default as PrPagination } from './components/navigation/PrPagination.vue'
export { default as PrStepper } from './components/navigation/PrStepper.vue'

// Overlay
export { default as PrTooltip } from './components/overlay/PrTooltip.vue'
export { default as PrDropdown } from './components/overlay/PrDropdown.vue'
export { default as PrCommandPalette } from './components/overlay/PrCommandPalette.vue'

// Data
export { default as PrTable } from './components/data/PrTable.vue'
export { default as PrDataTable } from './components/data/PrDataTable.vue'
export { default as PrStatCard } from './components/data/PrStatCard.vue'
export { default as PrTimeline } from './components/data/PrTimeline.vue'
export { default as PrCalendar } from './components/data/PrCalendar.vue'

// Media
export { default as PrImageWithFallback } from './components/media/PrImageWithFallback.vue'
export { default as PrDocumentDownload } from './components/media/PrDocumentDownload.vue'

// Specialty
export { default as PrCookieBanner } from './components/specialty/PrCookieBanner.vue'
export { default as PrScrollExpandHero } from './components/specialty/PrScrollExpandHero.vue'
export { default as PrNewsletterForm } from './components/specialty/PrNewsletterForm.vue'
export { default as PrChatWidget } from './components/specialty/PrChatWidget.vue'

// Types — Primitives
export type { ButtonVariant, ButtonSize } from './components/primitives/PrButton.vue'
export type { BadgeVariant, BadgeSize } from './components/primitives/PrBadge.vue'
export type { AvatarSize } from './components/primitives/PrAvatar.vue'

// Types — Form
export type { PrSelectOption } from './components/form/PrSelect.vue'
export type { PrRadioOption } from './components/form/PrRadio.vue'

// Types — Feedback
export type { DialogVariant } from './components/feedback/PrDialog.vue'
export type { AlertVariant } from './components/feedback/PrAlert.vue'
export type { SkeletonVariant } from './components/feedback/PrSkeleton.vue'
export type { ProgressVariant, ProgressSize } from './components/feedback/PrProgress.vue'

// Types — Navigation
export type { PrTabItem } from './components/navigation/PrTabs.vue'
export type { PrBreadcrumbItem } from './components/navigation/PrBreadcrumb.vue'

// Types — Overlay
export type { TooltipPosition } from './components/overlay/PrTooltip.vue'
export type { PrDropdownItem } from './components/overlay/PrDropdown.vue'

// Types — Data
export type { PrTableColumn } from './components/data/PrTable.vue'
export type { PrDataTableColumn } from './components/data/PrDataTable.vue'
export type { PrTimelineItem } from './components/data/PrTimeline.vue'
export type { PrCalendarEvent } from './components/data/PrCalendar.vue'

// Types — Navigation (Tier 2)
export type { PrStepperStep, PrStepStatus } from './components/navigation/PrStepper.vue'

// Types — Form (Tier 2)
export type { PrDateRange } from './components/form/PrDateRangePicker.vue'

// Types — Overlay (Tier 2)
export type { PrCommandPaletteItem } from './components/overlay/PrCommandPalette.vue'

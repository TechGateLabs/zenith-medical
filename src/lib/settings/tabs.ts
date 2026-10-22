export const SETTINGS_TABS = ['contact', 'announcement', 'system', 'security', 'database'] as const
export type SettingsTab = typeof SETTINGS_TABS[number]

export function getSettingsTab(value: string | null): SettingsTab {
  return SETTINGS_TABS.includes(value as SettingsTab) ? value as SettingsTab : 'contact'
}

import { expect, test } from 'bun:test'
import { getSettingsTab, SETTINGS_TABS } from '../src/lib/settings/tabs'

test('the announcements shortcut selects the popup editor', () => {
  const shortcut = new URL('/admin/settings?tab=announcement', 'https://zenithmedical.ca')
  expect(getSettingsTab(shortcut.searchParams.get('tab'))).toBe('announcement')
})

test('existing tabs remain accessible and unknown values fall back to contact', () => {
  for (const tab of SETTINGS_TABS) expect(getSettingsTab(tab)).toBe(tab)
  for (const invalid of [null, '', 'notifications', 'unknown']) expect(getSettingsTab(invalid)).toBe('contact')
})

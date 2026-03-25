import { create } from 'zustand'

export interface TenantConfig {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  primaryColor: string
  accentColor: string
  faviconUrl: string | null
  isActive: boolean
}

const DEFAULT_TENANT: TenantConfig = {
  id: 'default',
  name: 'ASU Portal Demo University',
  slug: 'demo',
  logoUrl: null,
  primaryColor: '#0D1B3E',
  accentColor: '#F5A623',
  faviconUrl: null,
  isActive: true,
}

interface TenantState {
  tenant: TenantConfig
  loadTenant: (slug?: string) => void
  applyBranding: () => void
}

export const useTenantStore = create<TenantState>()((set, get) => ({
  tenant: DEFAULT_TENANT,

  loadTenant: (slug) => {
    // MVP: use default tenant. Production: fetch from Supabase by slug or hostname
    if (!slug || slug === 'demo') {
      set({ tenant: DEFAULT_TENANT })
    }
    // Apply branding after load
    get().applyBranding()
  },

  applyBranding: () => {
    const { tenant } = get()
    const root = document.documentElement
    root.style.setProperty('--color-primary', tenant.primaryColor)
    root.style.setProperty('--color-accent', tenant.accentColor)

    // Update page title
    document.title = tenant.name

    // Update favicon if provided
    if (tenant.faviconUrl) {
      const link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null
      if (link) link.href = tenant.faviconUrl
    }
  },
}))

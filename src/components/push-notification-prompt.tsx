import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { isPushSupported, getNotificationPermission, requestPushPermission } from '@/lib/service-worker'

const DISMISSED_KEY = 'uniportal_push_prompt_dismissed'

export function PushNotificationPrompt() {
  const [visible, setVisible] = useState(false)
  const [granted, setGranted] = useState(false)

  useEffect(() => {
    if (!isPushSupported()) return
    if (getNotificationPermission() !== 'default') return
    try {
      if (localStorage.getItem(DISMISSED_KEY) === 'true') return
    } catch { /* */ }
    // Show prompt after 3 second delay
    const timer = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleEnable = async () => {
    const result = await requestPushPermission()
    setGranted(result)
    setVisible(false)
  }

  const handleDismiss = () => {
    setVisible(false)
    try { localStorage.setItem(DISMISSED_KEY, 'true') } catch { /* */ }
  }

  if (granted) {
    return (
      <div className="fixed bottom-24 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-80 xl:bottom-4">
        <Card className="border-l-4 border-l-[var(--color-success)] shadow-lg">
          <p className="text-sm text-green-700">Push notifications enabled!</p>
        </Card>
      </div>
    )
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-80 xl:bottom-4">
      <Card className="shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
            <Bell className="h-5 w-5 text-[var(--color-primary)]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              Enable Notifications?
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              Get alerts for grades, payments, deadlines, and announcements.
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="primary" onClick={handleEnable}>Enable</Button>
              <Button variant="secondary" onClick={handleDismiss}>Not Now</Button>
            </div>
          </div>
          <button type="button" onClick={handleDismiss} className="p-1 hover:bg-[var(--color-border)] rounded-[var(--radius-md)]" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      </Card>
    </div>
  )
}

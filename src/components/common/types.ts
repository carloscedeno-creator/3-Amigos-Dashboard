import { ComponentType, ReactNode } from "react"

export interface KPICardProps {
  title: string
  value: string | number
  label?: string
  /**
   * Direction of trend indicator.
   * up: positive, down: negative, neutral: steady
   */
  trend?: "up" | "down" | "neutral"
  /**
   * Color accent for icon and trend indicator.
   * Defaults to "primary".
   */
  color?: "primary" | "success" | "warning" | "danger" | "muted"
  /**
   * Optional leading icon component (Lucide or any React component).
   */
  icon?: ComponentType<{ className?: string }>
  /**
   * Optional tooltip text shown on hover; falls back to title.
   */
  tooltip?: string
  /**
   * Optional additional content below main value/label block.
   */
  children?: ReactNode
}

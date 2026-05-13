import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "group font-sans",
          success: "!bg-emerald-50 !text-emerald-900 !border-emerald-200",
          error: "!bg-red-50 !text-red-900 !border-red-200",
          warning: "!bg-amber-50 !text-amber-900 !border-amber-200",
        },
      }}
      richColors
    />
  )
}

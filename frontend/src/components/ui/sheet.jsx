import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close
const SheetPortal = DialogPrimitive.Portal

function SheetOverlay({ className, ...props }) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({ side = "left", className, children, ...props }) {
  const sideClasses = {
    left: "inset-y-0 left-0 h-full w-72 data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
    right: "inset-y-0 right-0 h-full w-72 data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
    top: "inset-x-0 top-0 data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top",
    bottom: "inset-x-0 bottom-0 data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
  }

  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 bg-sidebar shadow-xl transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-300",
          sideClasses[side],
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </SheetPortal>
  )
}

export { Sheet, SheetTrigger, SheetClose, SheetContent }

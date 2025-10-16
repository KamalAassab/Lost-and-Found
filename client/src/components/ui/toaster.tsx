import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle, XCircle, Info, AlertCircle } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  const getToastIcon = (variant: string) => {
    switch (variant) {
      case 'destructive':
        return <XCircle className="h-5 w-5 text-red-400 animate-pulse" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400 animate-pulse" />
      default:
        return <Info className="h-5 w-5 text-blue-400 animate-pulse" />
    }
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} {...props} className="group border-2 border-white/10">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                {getToastIcon(variant || 'default')}
              </div>
              <div className="flex-1 min-w-0">
                {title && <ToastTitle className="mb-2 text-white font-bold">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="text-white/80 font-medium">
                    {description}
                  </ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

"use client";
import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva } from "class-variance-authority";
import { X, CheckCircle, XCircle, ShoppingCart, Heart, Info } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-0 left-0 right-0 z-[100] flex flex-col gap-2 p-4 sm:bottom-4 sm:left-auto sm:right-4 sm:top-auto sm:max-w-[380px]",
      className
    )}
    {...props} />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border-2 p-4 pr-10 shadow-2xl transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border-zinc-700/50 bg-zinc-900/95 backdrop-blur-xl text-white",
        destructive: "border-red-500/50 bg-gradient-to-r from-red-950/95 to-rose-950/95 backdrop-blur-xl text-white",
        success: "border-green-500/50 bg-gradient-to-r from-green-950/95 to-emerald-950/95 backdrop-blur-xl text-white",
        cart: "border-cyan-500/50 bg-gradient-to-r from-cyan-950/95 to-blue-950/95 backdrop-blur-xl text-white",
        wishlist: "border-pink-500/50 bg-gradient-to-r from-pink-950/95 to-rose-950/95 backdrop-blur-xl text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props} />
  );
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-lg border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props} />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-full p-1.5 text-white/60 transition-all hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20",
      className
    )}
    toast-close=""
    {...props}>
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-bold", className)}
    {...props} />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn("text-sm text-white/80", className)} {...props} />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

// Icon component based on variant
const ToastIcon = ({ variant }) => {
  const iconClasses = "w-6 h-6 flex-shrink-0";
  
  switch (variant) {
    case 'success':
      return (
        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
          <CheckCircle className={cn(iconClasses, "text-green-400")} />
        </div>
      );
    case 'destructive':
      return (
        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
          <XCircle className={cn(iconClasses, "text-red-400")} />
        </div>
      );
    case 'cart':
      return (
        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
          <ShoppingCart className={cn(iconClasses, "text-cyan-400")} />
        </div>
      );
    case 'wishlist':
      return (
        <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
          <Heart className={cn(iconClasses, "text-pink-400 fill-pink-400")} />
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-full bg-zinc-500/20 flex items-center justify-center flex-shrink-0">
          <Info className={cn(iconClasses, "text-zinc-400")} />
        </div>
      );
  }
};

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction, ToastIcon };

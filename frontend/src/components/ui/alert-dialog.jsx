import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = ({ className, ...props }) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
);

const AlertDialogContent = ({ className, children, ...props }) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background p-6 shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </AlertDialogPrimitive.Content>
  </AlertDialogPortal>
);

const AlertDialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col gap-2 mb-4", className)} {...props} />
);

const AlertDialogFooter = ({ className, ...props }) => (
  <div className={cn("flex justify-end gap-2", className)} {...props} />
);

const AlertDialogTitle = ({ className, ...props }) => (
  <AlertDialogPrimitive.Title
    className={cn("font-display text-lg", className)}
    {...props}
  />
);

const AlertDialogDescription = ({ className, ...props }) => (
  <AlertDialogPrimitive.Description
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
);

const AlertDialogAction = ({ className, ...props }) => (
  <AlertDialogPrimitive.Action
    className={cn(
      "inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90",
      className
    )}
    {...props}
  />
);

const AlertDialogCancel = ({ className, ...props }) => (
  <AlertDialogPrimitive.Cancel
    className={cn(
      "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent",
      className
    )}
    {...props}
  />
);

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};

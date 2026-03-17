import { cn } from "@/lib/utils"

type MainProps = React.HTMLAttributes<HTMLDivElement> & {
  fixed?: boolean
}

export function Main({ fixed, className, ...props }: MainProps) {
  return (
    <div
      className={cn(
        fixed && "flex grow flex-col overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

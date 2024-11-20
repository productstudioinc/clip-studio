interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex h-screen mx-auto max-w-3xl flex-col items-center justify-center">
      {children}
    </div>
  )
}

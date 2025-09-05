'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/components/providers/auth-provider'
import {
  Home,
  Briefcase,
  Plus,
  Users,
  User,
  MessageCircle,
  Menu,
  LogOut,
  Settings,
  Bookmark,
  Bell,
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/opportunities', label: 'Opportunities', icon: Briefcase },
  { path: '/create', label: 'Create', icon: Plus },
  { path: '/connections', label: 'Connections', icon: Users },
  { path: '/messages', label: 'Messages', icon: MessageCircle },
  { path: '/profile', label: 'Profile', icon: User },
]

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path: string) => pathname === path

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/80 backdrop-blur-xl border-b border-primary/10 shadow-sm' 
          : 'bg-background/50 backdrop-blur-sm'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-blue flex items-center justify-center shadow-blue group-hover:shadow-blue-lg transition-all duration-300 group-hover:scale-105">
                  <span className="text-primary-foreground font-bold text-xl">A</span>
                </div>
              </div>
              <span className="text-2xl font-bold text-gradient-blue hidden sm:block">
                Artikin
              </span>
            </Link>

            {/* Desktop Navigation Items */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive(item.path) ? 'default' : 'ghost'}
                    size="sm"
                    className={`h-9 px-4 ${
                      isActive(item.path) 
                        ? 'bg-primary text-primary-foreground shadow-blue' 
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt="Profile" />
                      <AvatarFallback className="bg-gradient-blue text-primary-foreground font-semibold">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-3 border-b border-border">
                    <p className="text-sm font-medium leading-none text-foreground">
                      {user?.user_metadata?.display_name || user?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      @{user?.user_metadata?.username || 'user'}
                    </p>
                  </div>
                  
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-3 h-4 w-4" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  
                  
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-3 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-2">
              
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col h-full">
                    {/* Mobile User Info */}
                    <div className="flex items-center space-x-3 p-4 border-b border-border">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user?.user_metadata?.avatar_url} alt="Profile" />
                        <AvatarFallback className="bg-gradient-blue text-primary-foreground">
                          {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">
                          {user?.user_metadata?.display_name || user?.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{user?.user_metadata?.username || 'user'}
                        </p>
                      </div>
                    </div>

                    {/* Mobile Navigation Items */}
                    <div className="flex-1 py-4">
                      {navItems.map((item) => (
                        <Link 
                          key={item.path} 
                          href={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Button
                            variant={isActive(item.path) ? 'default' : 'ghost'}
                            className={`w-full justify-start mb-1 h-12 ${
                              isActive(item.path) 
                                ? 'bg-primary text-primary-foreground shadow-blue' 
                                : 'hover:bg-primary/10'
                            }`}
                          >
                            <item.icon className="h-5 w-5 mr-3" />
                            {item.label}
                          </Button>
                        </Link>
                      ))}
                    </div>

                    {/* Mobile Menu Footer */}
                    <div className="border-t border-border pt-4 space-y-2">
                      <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <Settings className="h-4 w-4 mr-3" />
                          Settings
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setIsMobileMenuOpen(false)
                          signOut()
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/90 backdrop-blur-xl border-t border-primary/10 shadow-lg">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navItems.slice(0, 5).map((item) => (
            <Link key={item.path} href={item.path}>
              <Button
                variant={isActive(item.path) ? 'default' : 'ghost'}
                size="icon"
                className={`h-12 w-full flex-col gap-1 ${
                  isActive(item.path) 
                    ? 'bg-primary text-primary-foreground shadow-blue' 
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </nav>

      {/* Spacer for fixed navigation */}
      <div className="h-16" />
    </>
  )
}
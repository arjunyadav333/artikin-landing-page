import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Navigation from '@/components/layout/navigation'
import HomeFeed from '@/components/home/home-feed'
import LoadingSpinner from '@/components/ui/loading-spinner'

export default async function HomePage() {
  const supabase = createServerComponentClient({ cookies })
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      redirect('/auth')
    }
    
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-accent/5">
        <Navigation />
        <div className="container mx-auto max-w-4xl px-4 pt-20 pb-8">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner size="lg" />
            </div>
          }>
            <HomeFeed />
          </Suspense>
        </div>
      </main>
    )
  } catch (error) {
    redirect('/auth')
  }
}
'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { useToast } from '@/hooks/use-toast'  // Adjust the import based on your project structure
import { User } from '@supabase/supabase-js'
import { useRouter } from "next/navigation"



interface JoinButtonProps {
    user: User | null;
  }

export function JoinButton({ user }: JoinButtonProps) {
    const router = useRouter();
  const [isJoining, setIsJoining] = useState(false)
  const { toast } = useToast()

  const handleJoin = async () => {
    setIsJoining(true)

    try {
      const result = await new Promise<{ message: string }>((resolve) => { //make action, the action sould revalidate tournament data rerender everything
        setTimeout(() => {
          resolve({ message: 'Successfully joined the tournament!' });
        }, 2000);
      })

      // Display success toast message
      toast({
        title: "Success",
        description: result.message,
      })

    } catch (error) {
      // Handle error if needed
    } finally {
      setIsJoining(false)
    }
  }

  const handleLoginRedirect = () => {
    // Redirect to login page
    router.push('/sign-in')
  }

  if (!user) {
    return (
      <div className="text-center">
        <Button 
          onClick={handleLoginRedirect}
          className="w-full sm:w-auto"
        >
          Log in to Join Tournament
        </Button>
        <p className="mt-2 text-sm text-gray-600">
          You must be logged in to join the tournament.
        </p>
      </div>
    )
  }

  return (
    <div className="text-center">
      <Button 
        onClick={handleJoin} 
        disabled={isJoining}
        className="w-full sm:w-auto"
      >
        {isJoining ? 'Joining...' : 'Join Tournament'}
      </Button>
    </div>
  )
}
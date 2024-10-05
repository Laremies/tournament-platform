'use client'

import { useState, useTransition } from 'react'
import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"
import { useToast } from '@/hooks/use-toast' 
import { startTournament } from '@/lib/actions'

interface StartTournamentButtonProps {
    tournamentId: string
    }

export default function StartTournamentButton({ tournamentId }: StartTournamentButtonProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleClick = () => {
    startTransition(async () => {
      const result = await startTournament(tournamentId)
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    })
  }

  return (
    <Button 
      onClick={handleClick} 
      disabled={isPending}
      className="flex items-center space-x-2"
    >
      <Trophy className="w-4 h-4" />
      <span>{isPending ? 'Generating Bracket...' : 'Start Tournament'}</span>
    </Button>
  )
}
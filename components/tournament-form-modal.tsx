"use client"

import { useState, useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
// import { submitName } from "./actions"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitTournament } from "@/lib/actions"
import { createClient } from '@/utils/supabase/client';
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { User } from '@supabase/supabase-js';

const supabase = createClient()

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Submitting..." : "Submit"}
        </Button>
    )
}

export default function TournamentFormModal() {

    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [state, formAction] = useFormState(submitTournament, null)
    
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    //fetch auth data so button can be disabled if user is not logged in
    //TODO, FIX: the button in layout.tsx isn't rerendered when we login so it doesn't update automatically
    //maybe something with onAuthStateChange or context
    useEffect(() => {
        const fetchUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (data.user) {
                setUser(data.user);
            }
        };
        fetchUser();
    }, []);    
    

    //when tournament is created, redirect to the tournament page and toast a success message
    useEffect(() => {
        if (state?.success) {
            setOpen(false);
            router.push(`/tournaments/${state.tournamentId}`);
            toast({
                title: "Tournament Created",
                description: "New tournament has been created successfully",
            })
        }
        if (state?.error) {
            toast({
                title: "Error",
                description: state.error,
            })
        }
    }, [state, toast]);

    //we can add client side validation later
    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {user ? (
                        <Button variant="outline">Create Tournament</Button>
                    ) : (
                        <Button variant="outline" disabled>
                            Login to Create Tournament
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create Tournament</DialogTitle>
                    </DialogHeader>
                    <form action={formAction} className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                className="col-span-3"
                                required
                            />
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Input
                                id="description"
                                name="description"
                                className="col-span-3"
                            />
                            <Label htmlFor="maxPlayers" className="text-right">
                                Max Players
                            </Label>
                            <Input
                                id="maxPlayers"
                                name="maxPlayers"
                                type="number"
                                min="1"
                                className="col-span-3"
                            />
                        </div>
                        <div className="flex justify-end items-center">
                            <SubmitButton />
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
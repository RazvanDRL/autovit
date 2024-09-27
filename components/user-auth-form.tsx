"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoaderCircle } from "lucide-react"
import Image from 'next/image'
import GoogleLogo from '@/public/google_logo.svg'
import { supabase } from '@/lib/supabaseClient'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> { }

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
    const [isLoading, setIsLoading] = React.useState<boolean>(false)

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)

        setTimeout(() => {
            setIsLoading(false)
        }, 3000)
    }

    const handleGoogleLogin = async () => {
        setIsLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        })
        if (error) {
            console.error('Error signing in with Google:', error)
        }
        setIsLoading(false)
    }

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <form onSubmit={onSubmit}>
                <div className="grid gap-2">
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="email">
                            Email
                        </Label>
                        <Input
                            id="email"
                            placeholder="nume@exemplu.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                        />
                    </div>
                    <Button disabled={isLoading}>
                        {isLoading && (
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Creează un cont
                    </Button>
                </div>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        sau
                    </span>
                </div>
            </div>
            <Button variant="outline" type="button" disabled={isLoading} onClick={handleGoogleLogin}>
                {isLoading ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Image src={GoogleLogo} alt="Google logo" className="mr-2 h-4 w-4" />
                )}{" "}
                Continuă cu Google
            </Button>
        </div>
    )
}
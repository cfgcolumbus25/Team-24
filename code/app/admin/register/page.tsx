"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Alert, AlertDescription } from "@/app/components/ui/alert"
import { GraduationCap, Loader2 } from "lucide-react"

export default function AdminRegisterPage() {
    const router = useRouter()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const validateEduEmail = (email: string): boolean => {
        const eduEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu$/
        return eduEmailRegex.test(email)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        // Validation
        if (username.length < 3) {
            setError("Username must be at least 3 characters long")
            return
        }

        if (!validateEduEmail(email)) {
            setError("Please use a valid .edu email address")
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long")
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || "Registration failed")
                setIsLoading(false)
                return
            }

            // Registration successful - redirect to admin dashboard
            router.push("/admin")
            router.refresh()
        } catch (err) {
            setError("An error occurred. Please try again.")
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <GraduationCap className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">University Admin Registration</CardTitle>
                    <CardDescription>
                        Create an account to manage your institution's CLEP credit policies
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={isLoading}
                                minLength={3}
                            />
                            <p className="text-xs text-muted-foreground">
                                Minimum 3 characters
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">University Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@university.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Must be a .edu email address
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                minLength={6}
                            />
                            <p className="text-xs text-muted-foreground">
                                Minimum 6 characters
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                minLength={6}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">Already have an account? </span>
                            <Link href="/admin/login" className="text-primary hover:underline font-medium">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
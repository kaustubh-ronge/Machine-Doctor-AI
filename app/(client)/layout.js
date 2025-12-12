import Header from '@/components/HeaderComponents/Header'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import React from 'react'

const ClientLayout = ({ children }) => {
    return (
        <div>
            <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
            >
                <Header />
                <main className='flex-1 overflow-x-hidden'>{children}</main>
                <Toaster position="top-center" richColors />
            </ThemeProvider>
        </div>
    )
}

export default ClientLayout

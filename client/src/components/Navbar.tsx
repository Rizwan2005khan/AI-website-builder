import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { authClient } from '@/lib/auth-client';
import { UserButton } from '@daveyplate/better-auth-ui'
import api from '@/configs/axios';
import { toast } from 'sonner';
import { Plus, Layout, Users, CreditCard, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const [credits, setCredits] = useState(0)

    const { data: session } = authClient.useSession()

    const getCredits = async () => {
        try {
            const { data } = await api.get('/api/user/credits')
            setCredits(data.credits)
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message)
            console.log(error)
        }
    }

    useEffect(() => {
        if (session?.user) {
            getCredits()
        }
    }, [session?.user])

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-12 lg:px-20">
                <div className="max-w-7xl mx-auto glass rounded-2xl px-6 py-2 flex items-center justify-between shadow-2xl shadow-black/20">
                    <div className="flex items-center gap-10">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-primary p-1.5 rounded-lg group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-primary/20">
                                <Plus className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-gradient hidden sm:block">SiteBuilder</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-1">
                            <NavLink to="/" icon={<Plus className="w-4 h-4" />} label="Home" />
                            <NavLink to="/projects" icon={<Layout className="w-4 h-4" />} label="My Projects" />
                            <NavLink to="/community" icon={<Users className="w-4 h-4" />} label="Community" />
                            <NavLink to="/pricing" icon={<CreditCard className="w-4 h-4" />} label="Pricing" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {session?.user ? (
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-full border border-border shadow-inner">
                                    <CreditCard className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-semibold whitespace-nowrap">
                                        <span className="text-muted-foreground mr-1">Credits:</span> {credits}
                                    </span>
                                </div>
                                <UserButton size="icon" className="shadow-lg hover:scale-105 transition-transform" />
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate('/auth/signin')}
                                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 active:scale-95 transition-all"
                            >
                                Get Started
                            </button>
                        )}

                        <button
                            className="md:hidden glass p-2 rounded-xl active:scale-90 transition-all"
                            onClick={() => setMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-2xl flex flex-col items-center justify-center gap-8 md:hidden animate-fade-in">
                    <button
                        className="absolute top-6 right-6 glass p-3 rounded-2xl active:scale-90 transition-all"
                        onClick={() => setMenuOpen(false)}
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <MobileNavLink to="/" label="Home" onClick={() => setMenuOpen(false)} />
                    <MobileNavLink to="/projects" label="My Projects" onClick={() => setMenuOpen(false)} />
                    <MobileNavLink to="/community" label="Community" onClick={() => setMenuOpen(false)} />
                    <MobileNavLink to="/pricing" label="Pricing" onClick={() => setMenuOpen(false)} />
                </div>
            )}
        </>
    )
}

const NavLink = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => (
    <Link
        to={to}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200"
    >
        {icon}
        {label}
    </Link>
)

const MobileNavLink = ({ to, label, onClick }: { to: string, label: string, onClick: () => void }) => (
    <Link
        to={to}
        onClick={onClick}
        className="text-2xl font-bold text-foreground hover:text-primary transition-colors hover:scale-110 duration-200"
    >
        {label}
    </Link>
)

export default Navbar

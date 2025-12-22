import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';
import PWAInstallButton from '../components/PWAInstallButton';

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col relative">
            <Header />
            <main className="flex-1">
                <HeroSection />
                <FeaturesSection />
            </main>
            <Footer />

            {/* PWA Install Button - shows install prompt when available */}
            <PWAInstallButton />
        </div>
    );
}

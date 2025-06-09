
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useNavigate } from 'react-router-dom';
import CleanTopBar from '@/components/CleanTopBar';
import CleanMobileNavigation from '@/components/CleanMobileNavigation';
import { Loader2 } from 'lucide-react';

interface PageLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, currentPage }) => {
  const { user, userProfile, signOut, loading: authLoading } = useAuth();
  const { households, loading: householdsLoading } = useHouseholds();
  const navigate = useNavigate();

  const selectedHousehold = households.length > 0 ? households[0] : null;

  const handleHouseholdChange = (householdId: string) => {
    // Handle household change logic here
    console.log('Household changed to:', householdId);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleTabChange = (tab: string) => {
    navigate(`/${tab}`);
  };

  if (authLoading || householdsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const showMobileNav = userProfile?.role !== 'child';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <CleanTopBar 
        user={user}
        households={households}
        selectedHousehold={selectedHousehold}
        onHouseholdChange={handleHouseholdChange}
        onSignOut={handleSignOut}
      />

      <main className={`${showMobileNav ? "pb-20 md:pb-4" : "pb-4"} ${showMobileNav ? "md:pt-28" : "md:pt-16"} pt-16`}>
        <div className="max-w-7xl mx-auto px-4">
          {children}
        </div>
      </main>

      {showMobileNav && (
        <CleanMobileNavigation activeTab={currentPage} setActiveTab={handleTabChange} />
      )}
    </div>
  );
};

export default PageLayout;

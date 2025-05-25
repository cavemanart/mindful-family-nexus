import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholds } from '@/hooks/useHouseholds';

export default function CreateHouseholdForm() {
  const { user } = useAuth();
  const { createHousehold, loading } = useHouseholds();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [profileReady, setProfileReady] = useState(false);

  // Check if profile exists for this user
  useEffect(() => {
    if (user?.id) {
      supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setProfileReady(!!data));
    } else {
      setProfileReady(false);
    }
  }, [user?.id]);

  // Only allow create if user is authenticated, profile exists, and not loading
  const canCreate = !!user?.id && profileReady && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;
    await createHousehold({ name, description });
    setName('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Household Name"
        required
      />
      <input
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description"
        required
      />
      <button type="submit" disabled={!canCreate}>
        {loading ? 'Creating...' : 'Create Household'}
      </button>
      {!user?.id && (
        <div style={{ color: 'red', marginTop: 8 }}>
          Please wait, your account is still being set up...
        </div>
      )}
      {user?.id && !profileReady && (
        <div style={{ color: 'orange', marginTop: 8 }}>
          Setting up your profile, please wait...
        </div>
      )}
    </form>
  );
}

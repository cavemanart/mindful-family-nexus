
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useHouseholds } from "@/hooks/useHouseholds";
import { useNavigate } from "react-router-dom";

const avatarOptions = [
  { value: "child-1", emoji: "👶" },
  { value: "child-2", emoji: "🧒" },
  { value: "child-3", emoji: "👧" },
  { value: "child-4", emoji: "👦" },
  { value: "child-5", emoji: "🧑" },
];

export default function JoinHousehold() {
  const { toast } = useToast();
  const [joinCode, setJoinCode] = useState("");
  const [childName, setChildName] = useState("");
  const [childEmail, setChildEmail] = useState("");
  const [childPassword, setChildPassword] = useState("");
  const [avatar, setAvatar] = useState("child-1");
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);

  const { fetchHouseholds } = useHouseholds();
  const navigate = useNavigate();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!childEmail || !childName || !childPassword || !joinCode) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    // 1. Create the child user account via Supabase Auth
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: childEmail.trim(),
      password: childPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          first_name: childName,
          role: 'child',
          avatar_selection: avatar,
        }
      }
    });

    if (signUpErr) {
      toast({ title: "Sign Up Failed", description: signUpErr.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    // Small wait to ensure session sync
    await new Promise(res => setTimeout(res, 600));

    // 2. Use join code to add child profile to household
    const { error: joinError } = await supabase.rpc("join_household_with_code", {
      _code: joinCode.trim(),
      _name: childName.trim(),
      _avatar_selection: avatar,
      _device_id: null,
    });

    if (joinError) {
      // Frontend now shows backend error message to the user and logs the error object deeply for debugging:
      console.error("Join Household Backend Error:", joinError);
      toast({ 
        title: "Join Household Failed",
        description: joinError.message || "An unknown error occurred. Please try again.",
        variant: "destructive"
      });
      setSubmitting(false);
      return;
    }

    // 3. Force refetch of households and check membership before redirecting
    await fetchHouseholds();

    // Find the current user ID: prefer signUpData.user.id, fallback to supabase.auth.getUser()
    let userId = signUpData.user?.id;
    if (!userId) {
      const { data: userResp } = await supabase.auth.getUser();
      userId = userResp?.user?.id ?? null;
    }

    // Check membership
    let householdsData: any[] | null = null;
    let checkError: any = null;
    if (userId) {
      const { data, error } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', userId)
        .limit(1);
      householdsData = data;
      checkError = error;
    }

    if (checkError || !householdsData || householdsData.length === 0) {
      console.error('Household membership check failed:', checkError, householdsData);
      toast({ title: "Error", description: "Joined, but this account is not a member of any household. Please try again or contact support.", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    // 4. Success feedback
    toast({ title: "Success!", description: "You have joined the household!" });
    setFinished(true);

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Join Household</CardTitle>
        </CardHeader>
        <CardContent>
          {submitting && (
            <div className="flex flex-col items-center justify-center mb-4 gap-2">
              <Loader2 className="animate-spin w-6 h-6 text-blue-500" />
              <div className="text-sm text-gray-500">
                Submitting your info…
              </div>
            </div>
          )}
          {finished ? (
            <div className="text-center text-green-700 bg-green-100 rounded p-3 mt-4">
              You have joined a family! Redirecting…
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleJoin}>
              <Input
                placeholder="Enter Join Code (e.g. Blue-Sun-42)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                required
                spellCheck={false}
              />
              <Input
                placeholder="First Name"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                required
              />
              <Input
                placeholder="Email (for login)"
                type="email"
                value={childEmail}
                onChange={(e) => setChildEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Input
                placeholder="Password (for login)"
                type="password"
                value={childPassword}
                onChange={(e) => setChildPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <div className="flex gap-2">
                {avatarOptions.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setAvatar(o.value)}
                    className={`text-2xl p-2 border rounded ${avatar === o.value ? "bg-blue-100 border-blue-500" : "bg-white border-gray-200"}`}
                    aria-label={`Avatar option ${o.emoji}`}
                  >
                    {o.emoji}
                  </button>
                ))}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (<Loader2 className="animate-spin w-4 h-4" />) : "Join Household"}
              </Button>
              <Button 
                type="button" 
                className="w-full mt-2" 
                variant="outline" 
                onClick={() => navigate("/auth")}
              >
                Back to Login
              </Button>
            </form>
          )}
          <div className="text-xs text-muted-foreground mt-4">
            Ask your parent for a <span className="font-semibold">Join Code</span>.<br />
            Enter your code, name, email, password, and choose an avatar to join the household.<br />
            After registering, you'll use this email/password to log in from any device.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

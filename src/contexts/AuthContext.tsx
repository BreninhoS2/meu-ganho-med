import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { PlanType, FEATURE_REQUIRED_PLAN } from '@/lib/stripe';

interface SubscriptionData {
  subscribed: boolean;
  plan: PlanType | null;
  subscriptionEnd: string | null;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  subscription: SubscriptionData;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  checkSubscription: () => Promise<void>;
  hasFeature: (featureKey: string) => boolean;
  getRequiredPlan: (featureKey: string) => PlanType | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    plan: null,
    subscriptionEnd: null,
    isAdmin: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkSubscription = async () => {
    if (!session) {
      setSubscription({ subscribed: false, plan: null, subscriptionEnd: null, isAdmin: false });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      setSubscription({
        subscribed: data.subscribed,
        plan: data.plan as PlanType | null,
        subscriptionEnd: data.subscription_end,
        isAdmin: data.is_admin ?? false,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const updateLastActivity = () => {
    localStorage.setItem('plantaomed_last_activity', Date.now().toString());
  };

  const checkInactivity = () => {
    const lastActivity = localStorage.getItem('plantaomed_last_activity');
    if (lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10);
      if (elapsed > INACTIVITY_TIMEOUT) {
        signOut();
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          updateLastActivity();
          // Defer subscription check
          setTimeout(() => {
            checkSubscription();
          }, 0);
        } else {
          setSubscription({ subscribed: false, plan: null, subscriptionEnd: null, isAdmin: false });
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          updateLastActivity();
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!checkInactivity()) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          updateLastActivity();
          checkSubscription();
        }
      }
      setIsLoading(false);
    });

    // Set up activity listeners
    const handleActivity = () => {
      if (session) {
        updateLastActivity();
      }
    };

    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);

    // Check subscription periodically (every minute)
    const subscriptionInterval = setInterval(() => {
      if (session) {
        checkSubscription();
      }
    }, 60000);

    return () => {
      authSubscription.unsubscribe();
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      clearInterval(subscriptionInterval);
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
        },
      },
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error) {
      updateLastActivity();
    }
    
    return { error };
  };

  const signOut = async () => {
    localStorage.removeItem('plantaomed_last_activity');
    await supabase.auth.signOut();
    setSubscription({ subscribed: false, plan: null, subscriptionEnd: null, isAdmin: false });
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    return { error };
  };

  const hasFeature = (featureKey: string): boolean => {
    // Admin users have all features
    if (subscription.isAdmin) {
      return true;
    }
    
    if (!subscription.subscribed || !subscription.plan) {
      return false;
    }

    const requiredPlan = FEATURE_REQUIRED_PLAN[featureKey];
    
    // If no required plan, feature is available to all
    if (!requiredPlan) {
      return true;
    }

    const planHierarchy: PlanType[] = ['start', 'pro', 'premium'];
    const userPlanIndex = planHierarchy.indexOf(subscription.plan);
    const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);

    return userPlanIndex >= requiredPlanIndex;
  };

  const getRequiredPlan = (featureKey: string): PlanType | null => {
    return FEATURE_REQUIRED_PLAN[featureKey] || null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        subscription,
        isLoading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        checkSubscription,
        hasFeature,
        getRequiredPlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

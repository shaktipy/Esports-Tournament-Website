import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getMonthlyRewards } from '../utils/monthlyRewards';

const getBackendBaseUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  return '';
};

const GameContext = createContext();

export const EXTRA_REWARD_TARGET = 5;

export const DAILY_MISSIONS = [
  // Live Watch Missions
  {
    id: 'daily_live_1',
    category: 'Live Watch Missions',
    title: 'Watch Live for 15 Minutes',
    description: 'Tune into Haarsh XO live stream for 15 minutes.',
    target: 15,
    unit: 'Minutes',
    type: 'live',
    reward: { coins: 30, csTickets: 0, brTickets: 0 },
  },
  {
    id: 'daily_live_2',
    category: 'Live Watch Missions',
    title: 'Watch Live for 30 Minutes',
    description: 'Tune into Haarsh XO live stream for 30 minutes.',
    target: 30,
    unit: 'Minutes',
    type: 'live',
    reward: { coins: 60, csTickets: 0, brTickets: 0 },
  },
  {
    id: 'daily_live_3',
    category: 'Live Watch Missions',
    title: 'Watch Live for 60 Minutes',
    description: 'Watch live stream gameplay for 1 full hour.',
    target: 60,
    unit: 'Minutes',
    type: 'live',
    reward: { coins: 120, csTickets: 0, brTickets: 0 },
  },
  // Video Watch Missions
  {
    id: 'daily_vid_1',
    category: 'Video Watch Missions',
    title: 'Watch Video for 10 Minutes',
    description: 'Watch uploaded videos or highlights for 10 minutes.',
    target: 10,
    unit: 'Minutes',
    type: 'video',
    reward: { coins: 20, csTickets: 0, brTickets: 0 },
  },
  {
    id: 'daily_vid_2',
    category: 'Video Watch Missions',
    title: 'Watch Video for 20 Minutes',
    description: 'Watch tips, tricks, and clutch videos for 20 minutes.',
    target: 20,
    unit: 'Minutes',
    type: 'video',
    reward: { coins: 40, csTickets: 0, brTickets: 0 },
  },
  {
    id: 'daily_vid_3',
    category: 'Video Watch Missions',
    title: 'Watch Video for 30 Minutes',
    description: 'Watch 30 minutes of high skill Free Fire content.',
    target: 30,
    unit: 'Minutes',
    type: 'video',
    reward: { coins: 60, csTickets: 0, brTickets: 0 },
  },
  // Extended Live Watch Missions
  {
    id: 'daily_ext_1',
    category: 'Extended Live Watch Missions',
    title: 'Watch Live for 90 Minutes',
    description: 'Extended watch session for loyal fans (1.5 Hours).',
    target: 90,
    unit: 'Minutes',
    type: 'live',
    reward: { coins: 180, csTickets: 0, brTickets: 0 },
  },
  {
    id: 'daily_ext_2',
    category: 'Extended Live Watch Missions',
    title: 'Watch Live for 120 Minutes',
    description: 'Watch 2 hours of live custom rooms and tournaments.',
    target: 120,
    unit: 'Minutes',
    type: 'live',
    reward: { coins: 250, csTickets: 0, brTickets: 0 },
  },
  {
    id: 'daily_ext_3',
    category: 'Extended Live Watch Missions',
    title: 'Watch Live for 150 Minutes',
    description: 'Marathon live watch: 2.5 hours of stream entertainment.',
    target: 150,
    unit: 'Minutes',
    type: 'live',
    reward: { coins: 350, csTickets: 0, brTickets: 0 },
  },
];

export const WEEKLY_MISSIONS = [
  {
    id: 'weekly_live_1',
    category: 'Weekly Live Grinder',
    title: 'Watch Live for 5 Hours',
    description: 'Accumulate 5 total hours (300 mins) of live stream watch time this week.',
    target: 300,
    unit: 'Hours',
    displayTarget: '5 Hours (300m)',
    type: 'totalLive',
    reward: { coins: 600, csTickets: 1, brTickets: 0 },
  },
  {
    id: 'weekly_live_2',
    category: 'Weekly Live Grinder',
    title: 'Watch Live for 10 Hours',
    description: 'Stay active on live streams for 10 hours (600 mins) this week.',
    target: 600,
    unit: 'Hours',
    displayTarget: '10 Hours (600m)',
    type: 'totalLive',
    reward: { coins: 1200, csTickets: 0, brTickets: 1 },
  },
  {
    id: 'weekly_live_3',
    category: 'Weekly Live Grinder',
    title: 'Watch Live for 15 Hours',
    description: 'Accumulate 15 hours (900 mins) on Haarsh XO live streams.',
    target: 900,
    unit: 'Hours',
    displayTarget: '15 Hours (900m)',
    type: 'totalLive',
    reward: { coins: 1800, csTickets: 2, brTickets: 0 },
  },
  {
    id: 'weekly_live_4',
    category: 'Weekly Live Grinder',
    title: 'Watch Live for 20 Hours',
    description: 'Top weekly grinder: 20 hours (1200 mins) live watch time.',
    target: 1200,
    unit: 'Hours',
    displayTarget: '20 Hours (1200m)',
    type: 'totalLive',
    reward: { coins: 2500, csTickets: 0, brTickets: 2 },
  },
];

export const MONTHLY_MISSIONS = [
  {
    id: 'monthly_live_1',
    category: 'Monthly Champions',
    title: 'Watch Live for 45 Hours',
    description: 'Watch 45 hours (2,700 mins) of Haarsh XO live streams this month.',
    target: 2700,
    unit: 'Hours',
    displayTarget: '45 Hours (2700m)',
    type: 'totalLive',
    reward: { coins: 5000, csTickets: 3, brTickets: 0 },
  },
  {
    id: 'monthly_live_2',
    category: 'Monthly Champions',
    title: 'Watch Live for 50 Hours',
    description: 'Watch 50 hours (3,000 mins) of live streams this month.',
    target: 3000,
    unit: 'Hours',
    displayTarget: '50 Hours (3000m)',
    type: 'totalLive',
    reward: { coins: 6000, csTickets: 0, brTickets: 3 },
  },
  {
    id: 'monthly_live_3',
    category: 'Monthly Champions',
    title: 'Watch Live for 54 Hours',
    description: 'Watch 54 hours (3,240 mins) of live streams this month.',
    target: 3240,
    unit: 'Hours',
    displayTarget: '54 Hours (3240m)',
    type: 'totalLive',
    reward: { coins: 7000, csTickets: 3, brTickets: 2, badge: 'Squad Elite' },
  },
  {
    id: 'monthly_live_4',
    category: 'Monthly Champions',
    title: 'Watch Live for 72 Hours',
    description: 'The Ultimate HAARSH XO Legend: 72 hours (4,320 mins) of stream dedication.',
    target: 4320,
    unit: 'Hours',
    displayTarget: '72 Hours (4320m)',
    type: 'totalLive',
    reward: { coins: 10000, csTickets: 5, brTickets: 5, badge: 'Pro Nexus Pass' },
  },
];

export const ALL_MISSIONS = [...DAILY_MISSIONS, ...WEEKLY_MISSIONS, ...MONTHLY_MISSIONS];

export const GameProvider = ({ children }) => {
  // Persistent state
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('harshxo_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.inGameName === 'HaarshFan_99' || parsed?.uid === '849204812') {
          localStorage.removeItem('harshxo_user');
          return null;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [coins, setCoins] = useState(() => {
    try {
      const saved = localStorage.getItem('harshxo_coins');
      return saved !== null ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [csTickets, setCsTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('harshxo_csTickets');
      return saved !== null ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [brTickets, setBrTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('harshxo_brTickets');
      return saved !== null ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [userStatus, setUserStatus] = useState(() => {
    try {
      return localStorage.getItem('harshxo_user_status') || 'active';
    } catch {
      return 'active';
    }
  });

  const [statusReason, setStatusReason] = useState(() => {
    try {
      return localStorage.getItem('harshxo_user_status_reason') || '';
    } catch {
      return '';
    }
  });

  const [watchStats, setWatchStats] = useState(() => {
    try {
      const saved = localStorage.getItem('harshxo_watchStats');
      return saved ? JSON.parse(saved) : {
        liveMinutes: 20,
        videoMinutes: 15,
        totalLiveMinutes: 65,
      };
    } catch {
      return { liveMinutes: 20, videoMinutes: 15, totalLiveMinutes: 65 };
    }
  });

  const [claimedMissions, setClaimedMissions] = useState(() => {
    try {
      const saved = localStorage.getItem('harshxo_claimedMissions');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [extraRewardClaimed, setExtraRewardClaimed] = useState(() => {
    try {
      const saved = localStorage.getItem('harshxo_extraRewardClaimed');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [registeredTournaments, setRegisteredTournaments] = useState(() => {
    try {
      const saved = localStorage.getItem('harshxo_registeredTournaments');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Daily Login Streak
  // Daily Login Streak with monthly tracking
  const [loginStreak, setLoginStreak] = useState(() => {
    const currentMonthKey = `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;
    try {
      const saved = localStorage.getItem('harshxo_loginStreak');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.monthKey !== currentMonthKey) {
          return {
            streak: parsed.streak || 0,
            lastLoginDate: parsed.lastLoginDate || null,
            totalLogins: parsed.totalLogins || 0,
            claimedToday: parsed.lastLoginDate === new Date().toDateString(),
            monthKey: currentMonthKey,
            claimedDaysThisMonth: [],
          };
        }
        return {
          ...parsed,
          claimedDaysThisMonth: parsed.claimedDaysThisMonth || [],
          monthKey: currentMonthKey,
        };
      }
      return { 
        streak: 0, 
        lastLoginDate: null, 
        totalLogins: 0, 
        claimedToday: false,
        monthKey: currentMonthKey,
        claimedDaysThisMonth: [],
      };
    } catch {
      return { 
        streak: 0, 
        lastLoginDate: null, 
        totalLogins: 0, 
        claimedToday: false,
        monthKey: currentMonthKey,
        claimedDaysThisMonth: [],
      };
    }
  });

  // Wheel Spin State
  const [wheelSpinData, setWheelSpinData] = useState(() => {
    try {
      const saved = localStorage.getItem('harshxo_wheelSpin');
      return saved ? JSON.parse(saved) : { lastSpinDate: null, totalSpins: 0 };
    } catch {
      return { lastSpinDate: null, totalSpins: 0 };
    }
  });

  const [notifications, setNotifications] = useState([]);

  // Persistent Notification Center Inbox
  const [notificationInbox, setNotificationInbox] = useState(() => {
    let baseInbox = [
      {
        id: 'init_welcome',
        message: 'Welcome to HAARSH XO Gaming & Esports Portal!',
        subtitle: 'Play tournaments, spin the lucky wheel, and redeem rewards.',
        type: 'trophy',
        time: 'Today',
        read: false
      },
      {
        id: 'init_cs_br',
        message: 'Clash Squad (4v4) & Battle Royale Tournaments Active',
        subtitle: 'Register your squad using tournament tickets.',
        type: 'ticket',
        time: 'Recent',
        read: true
      }
    ];

    try {
      const saved = localStorage.getItem('haarshxo_notification_inbox');
      if (saved) baseInbox = JSON.parse(saved);
    } catch {}

    // Ingest any existing active admin announcements right away
    try {
      const dismissed = JSON.parse(localStorage.getItem('haarshxo_dismissed_notifs') || '[]');
      const savedAnn = localStorage.getItem('haarshxo_admin_announcements');
      if (savedAnn) {
        const annList = JSON.parse(savedAnn);
        if (Array.isArray(annList)) {
          annList.filter(a => a.active).forEach(ann => {
            const annNotifId = `ann_notif_${ann.id}`;
            if (!dismissed.includes(annNotifId) && !baseInbox.some(n => n.id === annNotifId || n.message === ann.title)) {
              baseInbox.unshift({
                id: annNotifId,
                message: ann.title,
                subtitle: ann.message || 'Global broadcast announcement from HAARSH XO Operations.',
                type: ann.type === 'tournament' ? 'trophy' : (ann.type === 'reward' ? 'gift' : (ann.type === 'alert' ? 'warning' : 'info')),
                time: 'Recent',
                read: false
              });
            }
          });
        }
      }
    } catch {}

    return baseInbox;
  });

  useEffect(() => {
    try {
      localStorage.setItem('haarshxo_notification_inbox', JSON.stringify(notificationInbox));
    } catch {}
  }, [notificationInbox]);

  // Synchronize Announcements & Inboxes across tabs & events
  useEffect(() => {
    const syncFromAnnouncements = (annList) => {
      if (!Array.isArray(annList)) return;
      const activeIds = new Set(annList.filter(a => a.active).map(a => `ann_notif_${a.id}`));
      let dismissed = [];
      try {
        dismissed = JSON.parse(localStorage.getItem('haarshxo_dismissed_notifs') || '[]');
      } catch {}

      setNotificationInbox(prev => {
        // 1. Remove any announcement notifications that were deleted from admin or deactivated
        let updated = prev.filter(n => {
          if (n.id && n.id.startsWith('ann_notif_')) {
            return activeIds.has(n.id);
          }
          return true;
        });

        // 2. Add active announcements (unless user previously deleted/dismissed them)
        annList.filter(a => a.active).forEach(ann => {
          const annNotifId = `ann_notif_${ann.id}`;
          if (!dismissed.includes(annNotifId)) {
            const exists = updated.some(n => n.id === annNotifId || n.message === ann.title);
            if (!exists) {
              updated.unshift({
                id: annNotifId,
                message: ann.title,
                subtitle: ann.message || 'Global broadcast announcement from HAARSH XO Operations.',
                type: ann.type === 'tournament' ? 'trophy' : (ann.type === 'reward' ? 'gift' : (ann.type === 'alert' ? 'warning' : 'info')),
                time: 'Just now',
                read: false
              });
            }
          }
        });
        return updated.slice(0, 50);
      });
    };

    // 1. BroadcastChannel listener
    let bc = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('haarshxo_admin_sync');
        bc.addEventListener('message', (e) => {
          const { type, data } = e.data || {};
          if (type === 'inbox_updated' && Array.isArray(data)) {
            setNotificationInbox(data);
          } else if (type === 'announcements' && Array.isArray(data)) {
            syncFromAnnouncements(data);
          }
        });
      }
    } catch {}

    // 2. Custom window events for same-window updates
    const handleInboxUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setNotificationInbox(e.detail);
      }
    };

    const handleAdminUpdated = (e) => {
      if (e.detail?.type === 'announcements' && Array.isArray(e.detail.data)) {
        syncFromAnnouncements(e.detail.data);
      }
    };

    // 3. Storage event for cross-tab updates
    const handleStorageChange = (e) => {
      if (e.key === 'haarshxo_notification_inbox' && e.newValue) {
        try {
          setNotificationInbox(JSON.parse(e.newValue));
        } catch {}
      } else if (e.key === 'haarshxo_admin_announcements' && e.newValue) {
        try {
          syncFromAnnouncements(JSON.parse(e.newValue));
        } catch {}
      }
    };

    window.addEventListener('haarshxo_inbox_updated', handleInboxUpdate);
    window.addEventListener('haarshxo_admin_updated', handleAdminUpdated);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('haarshxo_inbox_updated', handleInboxUpdate);
      window.removeEventListener('haarshxo_admin_updated', handleAdminUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Helper to sync user session & profile to backend users.db
  const syncUserWithBackend = useCallback(async (userData) => {
    if (!userData || !userData.id) return;
    try {
      const baseUrl = getBackendBaseUrl();
      const primaryUrl = baseUrl ? `${baseUrl}/api/users/upsert` : '/api/users/upsert';
      const body = JSON.stringify({
        supabaseId: userData.id,
        email: userData.email,
        inGameName: userData.inGameName,
        uid: userData.uid,
      });
      const opts = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body };

      let res;
      try {
        res = await fetch(primaryUrl, opts);
      } catch {
        res = await fetch('http://localhost:5001/api/users/upsert', opts);
      }

      if (res && res.ok) {
        const json = await res.json();
        if (json.success && json.user) {
          const dbUser = json.user;
          setCoins(dbUser.coins ?? 0);
          setCsTickets(dbUser.csTickets ?? 0);
          setBrTickets(dbUser.brTickets ?? 0);
          setUserStatus(dbUser.status || 'active');
          setStatusReason(dbUser.statusReason || '');

          localStorage.setItem('harshxo_coins', String(dbUser.coins ?? 0));
          localStorage.setItem('harshxo_csTickets', String(dbUser.csTickets ?? 0));
          localStorage.setItem('harshxo_brTickets', String(dbUser.brTickets ?? 0));
          localStorage.setItem('harshxo_user_status', dbUser.status || 'active');
          localStorage.setItem('harshxo_user_status_reason', dbUser.statusReason || '');

          window.dispatchEvent(new CustomEvent('haarshxo_player_sync', {
            detail: {
              uid: dbUser.uid,
              coins: dbUser.coins,
              csTickets: dbUser.csTickets,
              brTickets: dbUser.brTickets,
              status: dbUser.status,
              statusReason: dbUser.statusReason,
            }
          }));
        }
      }
    } catch (err) {
      console.warn('[GameContext] syncUserWithBackend error:', err);
    }
  }, []);

  // Sync balance changes from GameContext to backend (debounced)
  const syncBalanceTimerRef = useRef(null);
  const syncBalanceToBackend = useCallback((userId, newCoins, newCs, newBr) => {
    if (!userId) return;
    if (syncBalanceTimerRef.current) clearTimeout(syncBalanceTimerRef.current);
    syncBalanceTimerRef.current = setTimeout(async () => {
      try {
        const baseUrl = getBackendBaseUrl();
        const primaryUrl = baseUrl ? `${baseUrl}/api/users/${encodeURIComponent(userId)}/sync-balance` : `/api/users/${encodeURIComponent(userId)}/sync-balance`;
        const body = JSON.stringify({ coins: newCoins, csTickets: newCs, brTickets: newBr });
        const opts = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body };
        try {
          await fetch(primaryUrl, opts);
        } catch {
          await fetch(`http://localhost:5001/api/users/${encodeURIComponent(userId)}/sync-balance`, opts);
        }
      } catch (e) {
        console.warn('[GameContext] syncBalanceToBackend failed:', e);
      }
    }, 600);
  }, []);

  // Helper to sync player state to Admin Users list in localStorage
  const syncGameUserToAdmin = (uid, { coins, csTickets, brTickets, inGameName }) => {
    if (!uid) return;
    try {
      const raw = localStorage.getItem('haarshxo_admin_users');
      let list = raw ? JSON.parse(raw) : [];
      let updated = false;
      list = list.map(u => {
        if (u.uid === uid || u.id === uid || u.supabaseId === user?.id) {
          updated = true;
          return {
            ...u,
            coins: typeof coins !== 'undefined' ? coins : u.coins,
            csTickets: typeof csTickets !== 'undefined' ? csTickets : u.csTickets,
            brTickets: typeof brTickets !== 'undefined' ? brTickets : u.brTickets,
            inGameName: inGameName || u.inGameName,
          };
        }
        return u;
      });
      if (updated) {
        localStorage.setItem('haarshxo_admin_users', JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'users', data: list } }));
      }
    } catch (e) {}
  };

  // Cross-Tab and Admin synchronization listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      try {
        if (e.key === 'harshxo_coins' && e.newValue !== null) {
          setCoins(Number(e.newValue));
        } else if (e.key === 'harshxo_csTickets' && e.newValue !== null) {
          setCsTickets(Number(e.newValue));
        } else if (e.key === 'harshxo_brTickets' && e.newValue !== null) {
          setBrTickets(Number(e.newValue));
        } else if (e.key === 'harshxo_user_status' && e.newValue !== null) {
          setUserStatus(e.newValue);
        } else if (e.key === 'harshxo_user_status_reason' && e.newValue !== null) {
          setStatusReason(e.newValue);
        } else if (e.key === 'haarshxo_admin_users' && e.newValue) {
          const list = JSON.parse(e.newValue);
          const currentUid = user?.uid;
          if (currentUid) {
            const match = list.find(u => u.uid === currentUid || u.id === currentUid || u.supabaseId === user?.id);
            if (match) {
              if (typeof match.coins === 'number') setCoins(match.coins);
              if (typeof match.csTickets === 'number') setCsTickets(match.csTickets);
              if (typeof match.brTickets === 'number') setBrTickets(match.brTickets);
              if (match.status) setUserStatus(match.status);
              if (match.statusReason) setStatusReason(match.statusReason);
            }
          }
        }
      } catch (err) {}
    };

    const handleCustomSync = (e) => {
      const detail = e.detail;
      if (!detail) return;
      if (user && (detail.uid === user.uid || detail.uid === user.id || detail.uid === user.supabaseId)) {
        if (typeof detail.coins !== 'undefined') setCoins(detail.coins);
        if (typeof detail.csTickets !== 'undefined') setCsTickets(detail.csTickets);
        if (typeof detail.brTickets !== 'undefined') setBrTickets(detail.brTickets);
        if (detail.status) {
          setUserStatus(detail.status);
          if (detail.statusReason) setStatusReason(detail.statusReason);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('haarshxo_player_sync', handleCustomSync);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('haarshxo_player_sync', handleCustomSync);
    };
  }, [user]);

  // Sync to LocalStorage & Backend Users
  useEffect(() => {
    localStorage.setItem('harshxo_coins', String(coins));
    if (user?.id) {
      syncBalanceToBackend(user.id, coins, csTickets, brTickets);
      syncGameUserToAdmin(user.uid, { coins, csTickets, brTickets, inGameName: user.inGameName });
    }
  }, [coins, csTickets, brTickets, user, syncBalanceToBackend]);

  useEffect(() => {
    localStorage.setItem('harshxo_csTickets', String(csTickets));
  }, [csTickets]);

  useEffect(() => {
    localStorage.setItem('harshxo_brTickets', String(brTickets));
  }, [brTickets]);

  useEffect(() => {
    localStorage.setItem('harshxo_watchStats', JSON.stringify(watchStats));
  }, [watchStats]);

  useEffect(() => {
    localStorage.setItem('harshxo_claimedMissions', JSON.stringify(claimedMissions));
  }, [claimedMissions]);

  useEffect(() => {
    localStorage.setItem('harshxo_extraRewardClaimed', extraRewardClaimed);
  }, [extraRewardClaimed]);

  useEffect(() => {
    localStorage.setItem('harshxo_registeredTournaments', JSON.stringify(registeredTournaments));
  }, [registeredTournaments]);

  useEffect(() => {
    localStorage.setItem('harshxo_loginStreak', JSON.stringify(loginStreak));
  }, [loginStreak]);

  useEffect(() => {
    localStorage.setItem('harshxo_wheelSpin', JSON.stringify(wheelSpinData));
  }, [wheelSpinData]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('harshxo_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('harshxo_user');
    }
  }, [user]);

  // Supabase Auth listener to sync user session automatically
  useEffect(() => {
    const handleAuthSession = (session) => {
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        const userData = {
          id: session.user.id,
          supabaseId: session.user.id,
          email: session.user.email,
          inGameName: metadata.inGameName || metadata.full_name || session.user.email?.split('@')[0] || 'Survivor',
          uid: metadata.gameUid || 'XO-' + session.user.id.slice(0, 8),
        };
        setUser(userData);
        syncUserWithBackend(userData);
      } else {
        setUser(null);
        setCoins(0);
        setCsTickets(0);
        setBrTickets(0);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthSession(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [syncUserWithBackend]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Supabase logout error:', err);
    }
    setUser(null);
    setCoins(0);
    setCsTickets(0);
    setBrTickets(0);
    setUserStatus('active');
    setStatusReason('');
    localStorage.removeItem('harshxo_user');
    localStorage.removeItem('harshxo_coins');
    localStorage.removeItem('harshxo_csTickets');
    localStorage.removeItem('harshxo_brTickets');
    localStorage.removeItem('harshxo_user_status');
    localStorage.removeItem('harshxo_user_status_reason');
    showNotification('Logged out successfully.');
  };

  const showNotification = (message, type = 'success', subtitle = null) => {
    const id = Date.now() + Math.random();
    // 1. Toast banner
    setNotifications(prev => [...prev.slice(-3), { id, message, type, subtitle }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5500);

    // 2. Persistent notification inbox
    const newInboxItem = {
      id: `inbox_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      message,
      type,
      subtitle,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setNotificationInbox(prev => [newInboxItem, ...prev.slice(0, 49)]);
  };

  const clearNotification = (id) => {
    if (id !== undefined) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    } else {
      setNotifications([]);
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotificationInbox(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    try {
      const allIds = notificationInbox.map(n => n.id);
      const dismissed = JSON.parse(localStorage.getItem('haarshxo_dismissed_notifs') || '[]');
      const combined = Array.from(new Set([...dismissed, ...allIds])).slice(-100);
      localStorage.setItem('haarshxo_dismissed_notifs', JSON.stringify(combined));
      localStorage.setItem('haarshxo_notification_inbox', JSON.stringify([]));
      window.dispatchEvent(new CustomEvent('haarshxo_inbox_updated', { detail: [] }));
    } catch {}
    setNotificationInbox([]);
  };

  const deleteNotification = (id) => {
    setNotificationInbox(prev => {
      const updated = prev.filter(n => n.id !== id);
      try {
        localStorage.setItem('haarshxo_notification_inbox', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('haarshxo_inbox_updated', { detail: updated }));
      } catch {}
      return updated;
    });

    try {
      const dismissed = JSON.parse(localStorage.getItem('haarshxo_dismissed_notifs') || '[]');
      if (!dismissed.includes(id)) {
        dismissed.push(id);
        localStorage.setItem('haarshxo_dismissed_notifs', JSON.stringify(dismissed.slice(-100)));
      }
    } catch {}
  };

  const markNotificationAsRead = (id) => {
    setNotificationInbox(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadNotificationCount = notificationInbox.filter(n => !n.read).length;

  // backwards compat: single notification = last item
  const notification = notifications[notifications.length - 1] || null;

  const addWatchTime = (type, minutes) => {
    setWatchStats(prev => {
      const newStats = { ...prev };
      if (type === 'live') {
        newStats.liveMinutes = (prev.liveMinutes || 0) + minutes;
        newStats.totalLiveMinutes = (prev.totalLiveMinutes || 0) + minutes;
      } else {
        newStats.videoMinutes = (prev.videoMinutes || 0) + minutes;
      }
      return newStats;
    });

    showNotification(`⏱️ Added +${minutes}m watch time (${type.toUpperCase()})! Check your missions.`);
  };

  const claimMission = (missionId) => {
    const mission = ALL_MISSIONS.find(m => m.id === missionId);
    if (!mission || claimedMissions[missionId]) return;

    const reward = mission.reward || {};
    const addC = reward.coins || 0;
    const addCs = reward.csTickets || 0;
    const addBr = reward.brTickets || 0;

    setCoins(prev => prev + addC);
    if (addCs > 0) setCsTickets(prev => prev + addCs);
    if (addBr > 0) setBrTickets(prev => prev + addBr);

    setClaimedMissions(prev => ({ ...prev, [missionId]: true }));

    let rewardText = `+${addC} XO Coins`;
    if (addCs > 0) rewardText += `, +${addCs} CS Ticket`;
    if (addBr > 0) rewardText += `, +${addBr} BR Ticket`;

    showNotification(`🎉 Claimed "${mission.title}": ${rewardText}!`);
  };

  const completedMissionsCount = Object.keys(claimedMissions).filter(k => claimedMissions[k]).length;

  const claimExtraReward = () => {
    if (completedMissionsCount < EXTRA_REWARD_TARGET || extraRewardClaimed) return;

    setExtraRewardClaimed(true);
    setCoins(prev => prev + 500);
    setCsTickets(prev => prev + 1);
    setBrTickets(prev => prev + 1);

    showNotification(
      '🎁 GRAND EXTRA REWARD UNLOCKED: +500 XO Coins, +1 CS Ticket, +1 BR Ticket, & 100 Diamond Code (XO-FF-7729)!',
      'special'
    );
  };

  const registerTournament = (tournamentId, ticketType, cost = 1, tournamentTitle = null) => {
    if (!user) {
      showNotification('Please login to register for tournaments!', 'warning');
      return false;
    }
    if (userStatus === 'banned' || userStatus === 'suspended') {
      showNotification('Account Restricted!', 'error', `Your account is ${userStatus}. Registration is disabled.`);
      return false;
    }

    if (registeredTournaments.includes(tournamentId)) return true;

    if (ticketType === 'CS') {
      if (csTickets < cost) {
        showNotification('Not enough CS Tournament Tickets!', 'warning', 'Watch streams or complete weekly missions to earn tickets.');
        return false;
      }
      setCsTickets(prev => prev - cost);
    } else {
      if (brTickets < cost) {
        showNotification('Not enough BR Tournament Tickets!', 'warning', 'Watch streams or complete weekly missions to earn tickets.');
        return false;
      }
      setBrTickets(prev => prev - cost);
    }

    setRegisteredTournaments(prev => [...prev, tournamentId]);
    showNotification(
      `Registered for ${tournamentTitle || 'Tournament'}!`,
      'success',
      'Room ID & Password will be sent 15 mins before match time.'
    );
    return true;
  };

  const purchaseEsportsPass = (passTitle, xoCoinCost, grantCs = 0, grantBr = 0) => {
    if (coins < xoCoinCost) {
      showNotification(`Not enough XO Coins!`, 'warning', `Need ${xoCoinCost - coins} more XO Coins. Watch streams to earn.`);
      return false;
    }

    setCoins(prev => prev - xoCoinCost);
    if (grantCs > 0) setCsTickets(prev => prev + grantCs);
    if (grantBr > 0) setBrTickets(prev => prev + grantBr);

    showNotification(
      `Pass Claimed: ${passTitle}!`,
      'special',
      `Received +${grantCs} CS & +${grantBr} BR Tickets.`
    );
    return true;
  };

  // Called after backend verifies a successful Razorpay payment
  const addTickets = (csCount = 0, brCount = 0, coinsCount = 0) => {
    if (csCount > 0) setCsTickets(prev => prev + csCount);
    if (brCount > 0) setBrTickets(prev => prev + brCount);
    if (coinsCount > 0) setCoins(prev => prev + coinsCount);
  };

  const redeemWithTickets = (itemTitle, csCost = 0, brCost = 0) => {
    if (csTickets < csCost || brTickets < brCost) {
      showNotification('Insufficient tickets for this reward!', 'warning', 'Earn more tickets by completing weekly missions.');
      return false;
    }

    if (csCost > 0) setCsTickets(prev => prev - csCost);
    if (brCost > 0) setBrTickets(prev => prev - brCost);

    showNotification(
      `Redeemed: ${itemTitle}!`,
      'success',
      'Processing rewards via your connected Free Fire UID.'
    );
    return true;
  };

  const claimDailyLogin = (targetDay = null) => {
    const today = new Date().toDateString();
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const todayDateNumber = now.getDate();
    const dayToClaim = targetDay || todayDateNumber;

    if (loginStreak.claimedToday && loginStreak.lastLoginDate === today) return null;

    const lastDate = loginStreak.lastLoginDate ? new Date(loginStreak.lastLoginDate) : null;
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = 1;
    if (lastDate && lastDate.toDateString() === yesterday.toDateString()) {
      newStreak = (loginStreak.streak || 0) + 1;
    } else if (lastDate && lastDate.toDateString() === today) {
      newStreak = loginStreak.streak;
    }

    const currentClaimedDays = loginStreak.monthKey === currentMonthKey
      ? (loginStreak.claimedDaysThisMonth || [])
      : [];

    const newClaimedDays = Array.from(new Set([...currentClaimedDays, dayToClaim]));

    // Reward from dynamic monthly rewards
    const monthlyList = getMonthlyRewards(now.getFullYear(), now.getMonth());
    const reward = monthlyList[dayToClaim - 1] || monthlyList[0];

    if (reward.coins) setCoins(prev => prev + reward.coins);
    if (reward.csTickets) setCsTickets(prev => prev + reward.csTickets);
    if (reward.brTickets) setBrTickets(prev => prev + reward.brTickets);

    const updatedStreak = {
      streak: newStreak,
      lastLoginDate: today,
      totalLogins: (loginStreak.totalLogins || 0) + 1,
      claimedToday: true,
      monthKey: currentMonthKey,
      claimedDaysThisMonth: newClaimedDays,
    };

    setLoginStreak(updatedStreak);
    return { reward, dayNumber: dayToClaim, newStreak };
  };

  const recordWheelSpin = (rewardLabel) => {
    const today = new Date().toDateString();
    setWheelSpinData(prev => ({
      lastSpinDate: today,
      totalSpins: (prev.totalSpins || 0) + 1,
    }));
    showNotification(`🎡 Wheel Reward: ${rewardLabel}!`, 'special');
  };

  return (
    <GameContext.Provider
      value={{
        user,
        setUser,
        coins,
        setCoins,
        csTickets,
        setCsTickets,
        brTickets,
        setBrTickets,
        watchStats,
        setWatchStats,
        addWatchTime,
        claimedMissions,
        claimMission,
        completedMissionsCount,
        extraRewardClaimed,
        claimExtraReward,
        registeredTournaments,
        registerTournament,
        purchaseEsportsPass,
        addTickets,
        redeemWithTickets,
        notifications,
        notification,
        showNotification,
        clearNotification,
        notificationInbox,
        unreadNotificationCount,
        markAllNotificationsAsRead,
        clearAllNotifications,
        deleteNotification,
        markNotificationAsRead,
        loginStreak,
        claimDailyLogin,
        wheelSpinData,
        recordWheelSpin,
        logout,
        userStatus,
        statusReason,
        isBanned: userStatus === 'banned' || userStatus === 'suspended',
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);

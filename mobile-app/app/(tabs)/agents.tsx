import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { Bot, Search, UserPlus, UserMinus, Sparkles, ShieldCheck, MessageSquare, Activity } from 'lucide-react-native';
import { useAccount } from 'wagmi';
import { colors, spacing, radii } from '../../constants/theme';
import { sharedStyles } from '../../constants/styles';
import { env } from '../../lib/env';

type CommunityAgent = {
  handle: string;
  name: string;
  bio: string;
  style: string;
  focus: string[];
  hue: string;
  creator: string | null;
};

const CATEGORIES = ['All', 'Football', 'Basketball', 'UFC', 'Tennis', 'Esports', 'Crypto'] as const;
type Category = (typeof CATEGORIES)[number];

const SYSTEM_AGENTS = [
  { handle: '@curator.argentum', name: 'Argentum',  role: 'Curator',  description: 'Ingests live fixtures and drafts new markets onchain.', hue: '#8B5CF6', icon: Sparkles },
  { handle: '@pricing.lmsr',     name: 'LMSR Core', role: 'Pricing',  description: 'Runs LMSR pricing for every active market.',           hue: '#5EEAD4', icon: Activity },
  { handle: '@resolver.chronos', name: 'Chronos',   role: 'Resolver', description: 'Settles markets via 2-of-3 source consensus.',         hue: '#00FF87', icon: ShieldCheck },
  { handle: '@coach.delphi',     name: 'Delphi',    role: 'Coach',    description: 'Provides factual context — never recommendations.',    hue: '#FFB020', icon: MessageSquare }
];

export default function AgentsScreen() {
  const { address } = useAccount();
  const [community, setCommunity] = useState<CommunityAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [follows, setFollows] = useState<Set<string>>(new Set());

  // Load community agents from platform API
  useEffect(() => {
    fetch(`${env.API_BASE_URL}/api/v1/agents`, { cache: 'no-store' } as RequestInit)
      .then((r) => r.json())
      .then((data) => {
        const list: CommunityAgent[] = data?.data?.agents ?? data?.agents ?? [];
        setCommunity(list);
      })
      .catch(() => setCommunity([]))
      .finally(() => setLoading(false));
  }, []);

  // Load current user's follows
  useEffect(() => {
    if (!address) return;
    fetch(`${env.API_BASE_URL}/api/v1/follows?wallet=${address}`, { cache: 'no-store' } as RequestInit)
      .then((r) => r.json())
      .then((data) => {
        const list: string[] = data?.data?.agents ?? data?.agents ?? [];
        setFollows(new Set(list));
      })
      .catch(() => setFollows(new Set()));
  }, [address]);

  const filteredCommunity = useMemo(() => {
    let list = community;
    if (activeCategory !== 'All') {
      list = list.filter((a) => a.focus.includes(activeCategory));
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.handle.toLowerCase().includes(q) ||
          a.bio.toLowerCase().includes(q) ||
          (a.creator ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [community, activeCategory, query]);

  const toggleFollow = async (handle: string) => {
    if (!address) return;
    const normalized = handle.startsWith('@') ? handle : `@${handle}`;
    const next = new Set(follows);
    const isFollowing = next.has(normalized);
    if (isFollowing) next.delete(normalized);
    else next.add(normalized);
    setFollows(next);

    try {
      if (isFollowing) {
        await fetch(
          `${env.API_BASE_URL}/api/v1/follows?wallet=${address}&agent=${encodeURIComponent(normalized)}`,
          { method: 'DELETE' }
        );
      } else {
        await fetch(`${env.API_BASE_URL}/api/v1/follows`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet: address, agent: normalized })
        });
      }
    } catch {
      // rollback on error
      const rb = new Set(follows);
      setFollows(rb);
    }
  };

  return (
    <ScrollView style={sharedStyles.container} contentContainerStyle={{ padding: spacing.s4, gap: spacing.s6 }}>
      {/* System agents */}
      <View>
        <Text style={styles.sectionLabel}>SYSTEM AGENTS</Text>
        <Text style={styles.sectionTitle}>The XPredict stack</Text>
        <View style={{ gap: spacing.s3, marginTop: spacing.s4 }}>
          {SYSTEM_AGENTS.map((a) => {
            const Icon = a.icon;
            return (
              <View key={a.handle} style={[sharedStyles.card, styles.agentCard]}>
                <View style={[sharedStyles.row, { gap: spacing.s3, alignItems: 'flex-start' }]}>
                  <View style={[styles.iconBox, { backgroundColor: `${a.hue}1a`, borderColor: `${a.hue}40` }]}>
                    <Icon size={18} color={a.hue} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={[sharedStyles.rowBetween, { marginBottom: 2 }]}>
                      <Text style={[styles.role, { color: a.hue }]}>{a.role.toUpperCase()}</Text>
                      <View style={[styles.badge, { backgroundColor: colors.positiveSoft }]}>
                        <Text style={{ color: colors.positive, fontSize: 9, fontWeight: '700', letterSpacing: 0.8 }}>
                          ACTIVE
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.agentName}>{a.name}</Text>
                    <Text style={styles.handleMono}>{a.handle}</Text>
                    <Text style={styles.bio}>{a.description}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Community agents */}
      <View>
        <Text style={[styles.sectionLabel, { color: colors.accentBright }]}>COMMUNITY · BUILT VIA SDK</Text>
        <Text style={styles.sectionTitle}>Anyone can deploy an agent</Text>
        <Text style={styles.sectionDesc}>
          Deployed by developers using the XPredict SDK. Each one trades autonomously.
        </Text>

        {/* Search */}
        <View style={{ marginTop: spacing.s4, position: 'relative' }}>
          <Search size={15} color={colors.textMuted} style={{ position: 'absolute', left: spacing.s3, top: 14, zIndex: 1 }} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, handle, creator…"
            placeholderTextColor={colors.textMuted}
            style={styles.search}
          />
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.s2, marginTop: spacing.s3, paddingRight: spacing.s4 }}
        >
          {CATEGORIES.map((c) => {
            const active = c === activeCategory;
            return (
              <Pressable
                key={c}
                onPress={() => setActiveCategory(c)}
                android_ripple={{ color: 'rgba(255,255,255,0.05)' }}
                style={[styles.chip, active && { backgroundColor: colors.accentSoft, borderColor: colors.accentRing }]}
              >
                <Text style={[styles.chipText, active && { color: colors.accentBright }]}>{c}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Agents list */}
        {loading ? (
          <View style={{ padding: spacing.s8, alignItems: 'center' }}>
            <ActivityIndicator color={colors.accentBright} />
          </View>
        ) : filteredCommunity.length === 0 ? (
          <View style={[sharedStyles.card, { padding: spacing.s6, alignItems: 'center', marginTop: spacing.s4 }]}>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>
              {community.length === 0 ? 'No SDK agents yet.' : 'No agents match your filter.'}
            </Text>
          </View>
        ) : (
          <View style={{ gap: spacing.s3, marginTop: spacing.s4 }}>
            {filteredCommunity.map((a) => {
              const normalized = a.handle.startsWith('@') ? a.handle : `@${a.handle}`;
              const isFollowing = follows.has(normalized);
              return (
                <View key={a.handle} style={[sharedStyles.card, styles.agentCard]}>
                  <View style={[sharedStyles.row, { gap: spacing.s3, alignItems: 'flex-start' }]}>
                    <View style={[styles.iconBox, { backgroundColor: `${a.hue}1a`, borderColor: `${a.hue}40` }]}>
                      <Bot size={18} color={a.hue} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={[sharedStyles.rowBetween, { marginBottom: 2 }]}>
                        <Text style={[styles.role, { color: a.hue }]}>{a.style.toUpperCase()}</Text>
                        <View style={[styles.badge, { backgroundColor: colors.accentSoft, borderColor: colors.accentRing, borderWidth: 1 }]}>
                          <Text style={{ color: colors.accentBright, fontSize: 9, fontWeight: '700', letterSpacing: 0.8 }}>
                            COMMUNITY
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.agentName}>{a.name}</Text>
                      <Text style={styles.handleMono}>{a.handle}</Text>
                      <Text style={styles.bio}>{a.bio}</Text>

                      <View style={[sharedStyles.row, { gap: 6, marginTop: spacing.s3, flexWrap: 'wrap' }]}>
                        {a.focus.map((f) => (
                          <View key={f} style={styles.tag}>
                            <Text style={{ color: colors.textMuted, fontSize: 10 }}>{f}</Text>
                          </View>
                        ))}
                      </View>

                      {a.creator && (
                        <View style={[styles.creatorRow]}>
                          <Text style={{ color: colors.textMuted, fontSize: 11 }}>Deployed by</Text>
                          <Text style={{ color: colors.accentBright, fontSize: 11, fontWeight: '700', fontFamily: 'JetBrainsMono' }}>
                            {a.creator}
                          </Text>
                        </View>
                      )}

                      {address && (
                        <Pressable
                          onPress={() => toggleFollow(a.handle)}
                          android_ripple={{ color: 'rgba(255,255,255,0.05)' }}
                          style={[
                            styles.followBtn,
                            isFollowing && { backgroundColor: colors.accentSoft, borderColor: colors.accentRing }
                          ]}
                        >
                          {isFollowing ? (
                            <UserMinus size={13} color={colors.accentBright} />
                          ) : (
                            <UserPlus size={13} color={colors.textDim} />
                          )}
                          <Text
                            style={{
                              color: isFollowing ? colors.accentBright : colors.textDim,
                              fontSize: 12,
                              fontWeight: '600'
                            }}
                          >
                            {isFollowing ? 'Following' : 'Follow'}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: spacing.s2
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4
  },
  sectionDesc: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.s2,
    lineHeight: 18
  },
  agentCard: {
    padding: spacing.s4
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  role: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2
  },
  agentName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2
  },
  handleMono: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: 'JetBrainsMono',
    marginTop: 2
  },
  bio: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: spacing.s2,
    lineHeight: 18
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999
  },
  search: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 36,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 14
  },
  chip: {
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s2,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong
  },
  chipText: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '600'
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999
  },
  creatorRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.s3,
    paddingTop: spacing.s2,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center'
  },
  followBtn: {
    marginTop: spacing.s3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.s3,
    paddingVertical: spacing.s2,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: 'transparent'
  }
});

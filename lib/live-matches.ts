export type Sport = 'Football' | 'Basketball' | 'UFC' | 'Tennis' | 'Esports';

export type GoalEvent = {
  id: string;
  minute: number;
  team: 'home' | 'away';
  scorer: string;
  assist?: string;
  x: number; // 0..100
  y: number; // 0..100
};

export type Side = {
  short: string;       // TUN
  name: string;        // Tunisia
  flag: string;        // emoji or unicode
  color: string;
  coach?: string;
};

export type MatchStatus =
  | { kind: 'LIVE'; minute: number }
  | { kind: 'HT' }
  | { kind: 'FT' }
  | { kind: 'SCHEDULED'; kickoff: string };

export type LiveMatch = {
  id: string;
  sport: Sport;
  league: string;
  leagueFlag?: string;
  venue?: string;
  city?: string;
  capacity?: number;
  status: MatchStatus;
  home: Side;
  away: Side;
  scoreHome: number;
  scoreAway: number;
  possessionHome?: number;
  goals: GoalEvent[];
  stats: { label: string; home: number; away: number }[];
};

export const MATCHES: LiveMatch[] = [
  /* ---------------------------- Football ---------------------------- */
  {
    id: 'tun-col',
    sport: 'Football',
    league: 'FIFA World Cup · Group Stage',
    leagueFlag: '🏆',
    venue: 'Rose Bowl Stadium',
    city: 'Pasadena, CA, USA',
    capacity: 88_565,
    status: { kind: 'FT' },
    home: { short: 'TUN', name: 'Tunisia',  flag: '🇹🇳', color: '#E70013', coach: 'Tunisia coach' },
    away: { short: 'COL', name: 'Colombia', flag: '🇨🇴', color: '#FCD116', coach: 'Colombia coach' },
    scoreHome: 0,
    scoreAway: 1,
    possessionHome: 33,
    goals: [
      { id: 'g1', minute: 14, team: 'away', scorer: 'Cuesta', assist: 'Luis Diaz', x: 18, y: 50 }
    ],
    stats: [
      { label: 'Shots on target',  home: 0, away: 2 },
      { label: 'Shots off target', home: 0, away: 2 },
      { label: 'Total shots',      home: 0, away: 4 },
      { label: 'Dangerous attacks',home: 0, away: 7 },
      { label: 'Corner kicks',     home: 0, away: 1 },
      { label: 'Fouls',            home: 6, away: 3 },
      { label: 'Yellow cards',     home: 1, away: 0 }
    ]
  },
  {
    id: 'arg-bra',
    sport: 'Football',
    league: 'FIFA World Cup · Group Stage',
    leagueFlag: '🏆',
    venue: 'MetLife Stadium',
    city: 'East Rutherford, NJ, USA',
    capacity: 82_500,
    status: { kind: 'LIVE', minute: 67 },
    home: { short: 'ARG', name: 'Argentina', flag: '🇦🇷', color: '#75AADB', coach: 'Lionel Scaloni' },
    away: { short: 'BRA', name: 'Brazil',    flag: '🇧🇷', color: '#FEDF00', coach: 'Dorival Jr.'    },
    scoreHome: 2,
    scoreAway: 1,
    possessionHome: 58,
    goals: [
      { id: 'g1', minute: 12, team: 'home', scorer: 'Messi',   assist: 'Di Maria', x: 84, y: 42 },
      { id: 'g2', minute: 38, team: 'away', scorer: 'Vinicius', assist: 'Rodrygo',  x: 12, y: 55 },
      { id: 'g3', minute: 61, team: 'home', scorer: 'Alvarez', assist: 'Mac Allister', x: 88, y: 60 }
    ],
    stats: [
      { label: 'Shots on target',  home: 6, away: 3 },
      { label: 'Shots off target', home: 4, away: 5 },
      { label: 'Total shots',      home: 10, away: 8 },
      { label: 'Dangerous attacks',home: 18, away: 14 },
      { label: 'Corner kicks',     home: 5, away: 4 },
      { label: 'Fouls',            home: 7, away: 11 },
      { label: 'Yellow cards',     home: 1, away: 2 }
    ]
  },
  {
    id: 'mci-liv',
    sport: 'Football',
    league: 'Premier League',
    leagueFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    venue: 'Etihad Stadium',
    city: 'Manchester, UK',
    capacity: 53_400,
    status: { kind: 'HT' },
    home: { short: 'MCI', name: 'Manchester City', flag: '🇲🇨', color: '#6CABDD', coach: 'Pep Guardiola' },
    away: { short: 'LIV', name: 'Liverpool',       flag: '🇱🇮', color: '#C8102E', coach: 'Arne Slot'     },
    scoreHome: 1,
    scoreAway: 1,
    possessionHome: 54,
    goals: [
      { id: 'g1', minute: 23, team: 'home', scorer: 'Haaland', assist: 'De Bruyne', x: 86, y: 50 },
      { id: 'g2', minute: 41, team: 'away', scorer: 'Salah',   assist: 'Szoboszlai', x: 14, y: 48 }
    ],
    stats: [
      { label: 'Shots on target',  home: 4, away: 3 },
      { label: 'Shots off target', home: 3, away: 2 },
      { label: 'Total shots',      home: 7, away: 5 },
      { label: 'Dangerous attacks',home: 12, away: 9 },
      { label: 'Corner kicks',     home: 3, away: 2 },
      { label: 'Fouls',            home: 5, away: 7 },
      { label: 'Yellow cards',     home: 0, away: 1 }
    ]
  },
  {
    id: 'rma-bar',
    sport: 'Football',
    league: 'La Liga',
    leagueFlag: '🇪🇸',
    venue: 'Santiago Bernabéu',
    city: 'Madrid, Spain',
    capacity: 81_044,
    status: { kind: 'SCHEDULED', kickoff: '2026-06-04T19:00:00Z' },
    home: { short: 'RMA', name: 'Real Madrid', flag: '⚪', color: '#FEBE10', coach: 'Carlo Ancelotti' },
    away: { short: 'BAR', name: 'Barcelona',   flag: '🔵', color: '#A50044', coach: 'Hansi Flick'    },
    scoreHome: 0,
    scoreAway: 0,
    goals: [],
    stats: []
  },

  /* --------------------------- Basketball --------------------------- */
  {
    id: 'lal-bos',
    sport: 'Basketball',
    league: 'NBA Finals',
    leagueFlag: '🏀',
    venue: 'Crypto.com Arena',
    city: 'Los Angeles, CA',
    capacity: 19_068,
    status: { kind: 'LIVE', minute: 24 }, // Q3 8:00
    home: { short: 'LAL', name: 'LA Lakers', flag: '💜', color: '#552583', coach: 'JJ Redick'  },
    away: { short: 'BOS', name: 'Boston Celtics', flag: '🍀', color: '#007A33', coach: 'Joe Mazzulla' },
    scoreHome: 78,
    scoreAway: 82,
    goals: [],
    stats: [
      { label: 'Field goal %', home: 47, away: 51 },
      { label: '3-point %',    home: 38, away: 42 },
      { label: 'Free throw %', home: 81, away: 76 },
      { label: 'Rebounds',     home: 32, away: 28 },
      { label: 'Assists',      home: 21, away: 24 },
      { label: 'Steals',       home: 6,  away: 4  },
      { label: 'Turnovers',    home: 11, away: 9  }
    ]
  },
  {
    id: 'gsw-mia',
    sport: 'Basketball',
    league: 'NBA Regular Season',
    leagueFlag: '🏀',
    venue: 'Chase Center',
    city: 'San Francisco, CA',
    status: { kind: 'FT' },
    home: { short: 'GSW', name: 'Golden State Warriors', flag: '💛', color: '#1D428A' },
    away: { short: 'MIA', name: 'Miami Heat',            flag: '🔥', color: '#98002E' },
    scoreHome: 118,
    scoreAway: 109,
    goals: [],
    stats: []
  },

  /* ------------------------------ UFC -------------------------------- */
  {
    id: 'ufc-301',
    sport: 'UFC',
    league: 'UFC 301 · Main Card',
    leagueFlag: '🥊',
    venue: 'T-Mobile Arena',
    city: 'Las Vegas, NV',
    status: { kind: 'LIVE', minute: 2 }, // Round 2
    home: { short: 'JON', name: 'Jon Jones',     flag: '🇺🇸', color: '#B22234' },
    away: { short: 'AAS', name: 'Alex Pereira',  flag: '🇧🇷', color: '#009C3B' },
    scoreHome: 0,
    scoreAway: 0,
    goals: [],
    stats: [
      { label: 'Significant strikes', home: 38, away: 24 },
      { label: 'Strike accuracy %',   home: 56, away: 48 },
      { label: 'Takedowns',           home: 2,  away: 0  },
      { label: 'Control time (s)',    home: 142, away: 38 },
      { label: 'Knockdowns',          home: 1,  away: 0  }
    ]
  },

  /* ----------------------------- Tennis ------------------------------ */
  {
    id: 'rg-djo-alc',
    sport: 'Tennis',
    league: 'Roland Garros · Final',
    leagueFlag: '🎾',
    venue: 'Court Philippe-Chatrier',
    city: 'Paris, France',
    status: { kind: 'LIVE', minute: 0 }, // Set 4
    home: { short: 'DJO', name: 'N. Djokovic', flag: '🇷🇸', color: '#0C4076' },
    away: { short: 'ALC', name: 'C. Alcaraz',  flag: '🇪🇸', color: '#FF6900' },
    scoreHome: 2,
    scoreAway: 1,
    goals: [],
    stats: [
      { label: 'Aces',            home: 9,  away: 14 },
      { label: 'Double faults',   home: 2,  away: 4  },
      { label: '1st serve %',     home: 68, away: 61 },
      { label: 'Break points won',home: 4,  away: 3  },
      { label: 'Winners',         home: 32, away: 41 },
      { label: 'Unforced errors', home: 21, away: 28 }
    ]
  },
  {
    id: 'rg-swiatek-gauff',
    sport: 'Tennis',
    league: 'Roland Garros · Semi-final',
    leagueFlag: '🎾',
    venue: 'Court Philippe-Chatrier',
    city: 'Paris, France',
    status: { kind: 'FT' },
    home: { short: 'SWI', name: 'I. Swiatek', flag: '🇵🇱', color: '#DC143C' },
    away: { short: 'GAU', name: 'C. Gauff',   flag: '🇺🇸', color: '#3C3B6E' },
    scoreHome: 2,
    scoreAway: 0,
    goals: [],
    stats: []
  },

  /* ---------------------------- Esports ------------------------------ */
  {
    id: 'lol-t1-geng',
    sport: 'Esports',
    league: 'LCK Spring Final · BO5',
    leagueFlag: '🎮',
    venue: 'LoL Park',
    city: 'Seoul, South Korea',
    status: { kind: 'LIVE', minute: 28 }, // Game 3
    home: { short: 'T1',  name: 'T1',           flag: '🔴', color: '#E2012D' },
    away: { short: 'GEN', name: 'Gen.G eSports', flag: '🟠', color: '#AA8A30' },
    scoreHome: 2,
    scoreAway: 1,
    goals: [],
    stats: [
      { label: 'Kills',          home: 14, away: 9  },
      { label: 'Gold (k)',       home: 58, away: 51 },
      { label: 'Towers',         home: 7,  away: 4  },
      { label: 'Dragons',        home: 3,  away: 1  },
      { label: 'Barons',         home: 1,  away: 0  }
    ]
  },
  {
    id: 'cs-faze-navi',
    sport: 'Esports',
    league: 'CS2 Major · Quarterfinal',
    leagueFlag: '🎮',
    venue: 'Avicii Arena',
    city: 'Stockholm, Sweden',
    status: { kind: 'SCHEDULED', kickoff: '2026-06-05T17:00:00Z' },
    home: { short: 'FAZ', name: 'FaZe Clan', flag: '🔴', color: '#E20613' },
    away: { short: 'NAV', name: 'NAVI',      flag: '🟡', color: '#FFD500' },
    scoreHome: 0,
    scoreAway: 0,
    goals: [],
    stats: []
  }
];

export function matchById(id: string): LiveMatch | undefined {
  return MATCHES.find((m) => m.id === id);
}

export function statusLabel(s: MatchStatus): string {
  switch (s.kind) {
    case 'LIVE':      return s.minute ? `${s.minute}'` : 'LIVE';
    case 'HT':        return 'HT';
    case 'FT':        return 'FT';
    case 'SCHEDULED': {
      const d = new Date(s.kickoff);
      return d.toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    }
  }
}

export function statusColor(s: MatchStatus): string {
  switch (s.kind) {
    case 'LIVE': return 'var(--positive)';
    case 'HT':   return 'var(--warning)';
    case 'FT':   return 'var(--text-muted)';
    case 'SCHEDULED': return 'var(--text-dim)';
  }
}

export function groupByLeague(matches: LiveMatch[]): { league: string; flag?: string; sport: Sport; matches: LiveMatch[] }[] {
  const map = new Map<string, { league: string; flag?: string; sport: Sport; matches: LiveMatch[] }>();
  for (const m of matches) {
    const key = `${m.sport}::${m.league}`;
    if (!map.has(key)) map.set(key, { league: m.league, flag: m.leagueFlag, sport: m.sport, matches: [] });
    map.get(key)!.matches.push(m);
  }
  return Array.from(map.values());
}

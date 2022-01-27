export enum Force {
    north = 'north',
    spectator = 'spectator',
    south = 'south',
}

export type ConnectedPlayersWithForceCategorization = Record<Force, Array<string>>;

export type PlayerData = {
    name: string;
    force: Force,
    connected: boolean,
    afk_time: number,
    width: number,
    height: number,
    scale: number,
    quickSlots: Object,
}

export type PlayersWithData = Record<string, PlayerData>;


export enum Command {
    test = 'test',
    feed = 'feed',
    players = 'players',
    trust = 'trust',
    untrust = 'untrust',
    ban = 'ban',
    unban = 'unban',
    // jail = 'jail',
    // free = 'free',
    promote = 'promote',
    demote = 'demote',
    trustlist = 'trustlist',
    jaillist = 'jaillist',
}

export type CommandColorScheme = Record<Command, number>;


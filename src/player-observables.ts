
import DiscordJS, { Intents, ThreadChannel } from "discord.js";
import dotenv from "dotenv";
import { networkInterfaces } from "os";
import { Rcon } from "rcon-client/lib";
import { Subject } from "rxjs";
import { registerCommands } from "./discord-commands";
import { simpleEmbeddedResponse } from "./discord-utils";
import { banPlayer, demotePlayer, doesPlayerExist, getConnectedPlayers, getJailList, getTrustList, isPlayerAlreadyTrustedAssert, isPlayerAlreadyUntrustedAssert, promotePlayer, trustPlayer, unbanPlayer, untrustPlayer } from "./factorio-utils";
import { readStreamObservable } from "./tail";
import { Command, Force } from "./types";

enum LogTags {
  noLongerSpectating = '\\[DISCORD-BOLD\\]Team (.*) player (.*) is no longer spectating.',
  spectating = '\\[DISCORD-BOLD\\](.*) is spectating.',
  joinedTeam = '\\[DISCORD-BOLD\\](.*) has joined team (.*)!',
  playerJoin = '\\[PLAYER-JOIN\\](.*)',
  playerChat = '\\[PLAYER-CHAT\\](.*)',
  playerLeave = '\\[PLAYER-LEAVE\\](.*)',
}


// 2532.973 Script @/home/shobhitg/.factorio/temp/currently-playing/utils/print_override.lua:7: [PRINT] [PLAYER-JOIN]yuppydoodles
// 2584.324 Script @/home/shobhitg/.factorio/temp/currently-playing/utils/print_override.lua:7: [PRINT] [DISCORD-BOLD]yuppydoodles has joined team north!
// 2601.557 Script @/home/shobhitg/.factorio/temp/currently-playing/utils/print_override.lua:7: [PRINT] [DISCORD-BOLD]yuppydoodles is spectating.
// 2734.007 Script @/home/shobhitg/.factorio/temp/currently-playing/utils/print_override.lua:7: [PRINT] [DISCORD-BOLD]Team north player yuppydoodles is no longer spectating.
// 2741.507 Script @/home/shobhitg/.factorio/temp/currently-playing/utils/print_override.lua:7: [PRINT] [PLAYER-LEAVE]yuppydoodles
// 2747.807 Script @/home/shobhitg/.factorio/temp/currently-playing/utils/print_override.lua:7: [PRINT] [PLAYER-JOIN]yuppydoodles

export enum PlayerState {
  'joined' = 'joined',
  'left' = 'left',
  'playing' = 'playing',
  'banned' = 'banned',
}

export type PlayerEvent = {
  name: string,
  state: PlayerState,
  timestamp: number,
  // threadId
}


export type PlayerInfo = {
  name: string,
  force: Force,
  prevState?: PlayerState,
  state: PlayerState,
  eventHistory: PlayerEvent[],
  threadChannel?: ThreadChannel,
  futureAction?: Subject<any>,
  // eventObservable: 
  // lastJoinedTime: Date,
  // leftTime
}

export const players: Record<string, PlayerInfo> = {};

export const playerEvents: Subject<PlayerEvent> = new Subject<PlayerEvent>();;


const readStream$: Subject<string> = readStreamObservable;
readStream$.subscribe((logLine) => {
  // console.log(logLine);
  const playerJoinMatch = logLine.match(new RegExp(`${LogTags.playerJoin}`));
  const playerNoLongerSpectating = logLine.match(new RegExp(`${LogTags.noLongerSpectating}`));
  const playerLeaveMatch = logLine.match(new RegExp(`${LogTags.playerLeave}`));
  const playerJoinedTeam = logLine.match(new RegExp(`${LogTags.joinedTeam}`));
  const playerSpectating = logLine.match(new RegExp(`${LogTags.spectating}`));
  // console.log(JSON.stringify(playerJoinMatch, null, 2));
  // console.log(JSON.stringify(playerJoinedTeam, null, 2));
  // console.log(JSON.stringify(playerLeaveMatch, null, 2));
  // console.log(JSON.stringify(playerNoLongerSpectating, null, 2));
  // console.log(JSON.stringify(playerSpectating, null, 2));
  // console.log(logLine);
  if (playerJoinMatch) {
    const playerName = playerJoinMatch[1];
    const playerEvent: PlayerEvent = { name: playerName, state: PlayerState.joined, timestamp: Date.now() };
    playerEvents.next(playerEvent);
  }
  if (playerLeaveMatch) {
    const playerName = playerLeaveMatch[1];
    // if (players[playerName] != null) {
    // const playerName = playerLeaveMatch[1];
    const playerEvent: PlayerEvent = { name: playerName, state: PlayerState.left, timestamp: Date.now() };
    playerEvents.next(playerEvent);
  }
  // console.log(JSON.stringify(playerJoinedTeam, null, 2));
  if (playerJoinedTeam) {
    const playerName = playerJoinedTeam[1];
    // if (players[playerName] != null) {
    const playerEvent: PlayerEvent = { name: playerName, state: PlayerState.playing, timestamp: Date.now() };
    playerEvents.next(playerEvent);
    // }
  }
  if (playerNoLongerSpectating) {
    const playerName = playerNoLongerSpectating[2];
    // if (players[playerName] != null) {
    // const playerName = playerNoLongerSpectating[2];
    const playerEvent: PlayerEvent = { name: playerName, state: PlayerState.playing, timestamp: Date.now() };
    playerEvents.next(playerEvent);
    // }
  }
  if (playerSpectating) {
    const playerName = playerSpectating[1];
    // if (players[playerName] != null) {
    // const playerName = playerSpectating[1];
    const playerEvent: PlayerEvent = { name: playerName, state: PlayerState.joined, timestamp: Date.now() };
    playerEvents.next(playerEvent);
    // }
  }
});


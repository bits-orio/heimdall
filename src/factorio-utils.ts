import { CacheType, CommandInteraction } from "discord.js";
import dotenv from "dotenv";
import { Rcon } from "rcon-client/lib";
import { getBanPlayerCmd, getDemotePlayerCmd, getJailedPlayersCmd, getJailPlayerCmd, getPlayersCmd, getPromotePlayerCmd, getSpecificPlayerCmd, getTrustedPlayersCmd, getTrustPlayerCmd, getUnbanPlayerCmd, getUnjailPlayerCmd, getUntrustPlayerCmd } from "./factorio-commands";
import { ConnectedPlayersWithForceCategorization, Force, PlayerData, PlayersWithData } from "./types";


dotenv.config();
// const rConWrapper = async (cmdStr: string, callback: Function, ...parameters: any[]) => {
//     const rcon = await Rcon.connect({
//         host: "localhost", port: 34197, password: process.env.RCON_PASSWORD
//       })
//       let responses = await rcon.send(cmdStr);
//       const retval = callback.apply(this, parameters);
//       rcon.end();
//       return retval;
// }

// (async () => {
//     const rcon = await Rcon.connect({
//         host: "localhost", port: 34197, password: process.env.RCON_PASSWORD
//       })
//       //@ts-ignore
//       rcon.on('message',() => {
//           console.log('onmessage')
//       })
//     rcon.end();

// })()

// {"name": "yuppydoodles", "force": "spectator", "connected": true, "afk_time": 5}, "width": 1792, "height": 1067, "scale": 0.750000, "quick_slots": {} }


const getPlayersWithData = async ({ connectedOnly }: { connectedOnly: boolean }) => {
    const rcon = await Rcon.connect({
        host: "localhost", port: 34197, password: process.env.RCON_PASSWORD || ''
    })
    let responses = await rcon.send(getPlayersCmd(connectedOnly));
    rcon.end();
    console.log(responses);
    return JSON.parse(responses);
}


export const getSpecificPlayer = async ({ playerName }: { playerName: string }) => {
    const rcon = await Rcon.connect({
        host: "localhost", port: 34197, password: process.env.RCON_PASSWORD || ''
    })
    console.log('getSpecificPlayerCmd :', playerName);
    let responses = await rcon.send(getSpecificPlayerCmd(playerName));
    rcon.end();
    console.log(responses);
    return JSON.parse(responses) as PlayerData;
}

export const getConnectedPlayers = async () => {
    const playersWithData: PlayersWithData = await getPlayersWithData({ connectedOnly: true });
    let playersWithForces: ConnectedPlayersWithForceCategorization = { [Force.north]: [], [Force.spectator]: [], [Force.south]: [] };
    Object.entries(playersWithData).forEach(([playerName, data]) => {
        playersWithForces[data.force].push(playerName);
    })
    return playersWithForces;
}

export const getAllPlayers = async () => {
    const players = getPlayersWithData({ connectedOnly: false });
    return players;
}

export const trustPlayer = async ({ playerName }: { playerName: string }) => {
    const rcon = await Rcon.connect({
        host: "localhost", port: 34197, password: process.env.RCON_PASSWORD || ''
    })
    await rcon.send(getTrustPlayerCmd(playerName));
    rcon.end();
}

export const untrustPlayer = async ({ playerName }: { playerName: string }) => {
    const rcon = await Rcon.connect({
        host: "localhost", port: 34197, password: process.env.RCON_PASSWORD || ''
    })
    await rcon.send(getUntrustPlayerCmd(playerName));
    rcon.end();
}

export const banPlayer = async ({ playerName, reason }: { playerName: string, reason: string }) => {
    const rcon = await Rcon.connect({
        host: "localhost", port: 34197, password: process.env.RCON_PASSWORD || ''
    })
    await rcon.send(getBanPlayerCmd(playerName, reason));
    rcon.end();
}

export const unbanPlayer = async ({ playerName }: { playerName: string }) => {
    const rcon = await Rcon.connect({
        host: "localhost", port: 34197, password: process.env.RCON_PASSWORD || ''
    })
    await rcon.send(getUnbanPlayerCmd(playerName));
    rcon.end();
}

export const jailPlayer = async ({ playerName, reason }: { playerName: string, reason: string }) => {
    const rcon = await Rcon.connect({
        host: "localhost", port: 34197, password: process.env.RCON_PASSWORD || ''
    })
    console.log(getJailPlayerCmd(playerName, reason));
    await rcon.send(getJailPlayerCmd(playerName, reason));
    rcon.end();
}

export const unjailPlayer = async ({ playerName }: { playerName: string }) => {
    const rcon = await Rcon.connect({
        host: "localhost", port: 34197, password: process.env.RCON_PASSWORD || ''
    })
    await rcon.send(getUnjailPlayerCmd(playerName));
    rcon.end();
}

export const promotePlayer = async ({ playerName }: { playerName: string }) => {
    const rcon = await Rcon.connect({
        host: "localhost", port: 34197, password: process.env.RCON_PASSWORD || ''
    })
    await rcon.send(getPromotePlayerCmd(playerName));
    rcon.end();
}

export const demotePlayer = async ({ playerName }: { playerName: string }) => {
    const rcon = await Rcon.connect({
        host: "localhost", port: 34197, password: process.env.RCON_PASSWORD || ''
    })
    await rcon.send(getDemotePlayerCmd(playerName));
    rcon.end();
}

export const doesPlayerExist = async ({ playerName, interaction }: { playerName: string, interaction: CommandInteraction<CacheType> }) => {
    const allPlayerNames = Object.keys(await getAllPlayers());
    const playerExists = allPlayerNames.some(p => p === playerName);
    if (!playerExists) {
        await interaction.reply(`***\`\`\`ERROR: Player ${playerName} does not exist. Operation not complete.\`\`\`***`);
    }
    return playerExists;
}

export const getTrustList = async () => {
    const rcon = await Rcon.connect({
        host: "localhost", port: 34197, password: process.env.RCON_PASSWORD || ''
    })
    let responses = await rcon.send(getTrustedPlayersCmd());
    rcon.end();
    const trustList: Record<string, boolean> = JSON.parse(responses);
    return trustList;
}

export const isPlayerTrusted = async ({ playerName, interaction }: { playerName: string, interaction: CommandInteraction<CacheType> }) => {
    const trustList = await getTrustList();
    const isPlayerTrusted = trustList[playerName];
    console.log(trustList, playerName);
    return isPlayerTrusted;
}

export const isPlayerAlreadyTrustedAssert = async ({ playerName, interaction }: { playerName: string, interaction: CommandInteraction<CacheType> }) => {
    const isPlayerTrustedBool = await isPlayerTrusted({ playerName, interaction })
    if (isPlayerTrustedBool) {
        await interaction.reply(`***\`\`\`ERROR: Player ${playerName} is already trusted. Operation not complete.\`\`\`***`);
    }
    return isPlayerTrustedBool;
}

export const isPlayerAlreadyUntrustedAssert = async ({ playerName, interaction }: { playerName: string, interaction: CommandInteraction<CacheType> }) => {
    const isPlayerUntrustedBool = !(await isPlayerTrusted({ playerName, interaction }))
    console.log(isPlayerUntrustedBool);
    if (isPlayerUntrustedBool) {
        await interaction.reply(`***\`\`\`ERROR: Player ${playerName}is already untrusted. Operation not complete.\`\`\`***`);
    }
    return isPlayerUntrustedBool;
}

export const getJailList = async () => {
    const rcon = await Rcon.connect({
        host: "localhost", port: 34197, password: process.env.RCON_PASSWORD || ''
    })
    let responses = await rcon.send(getJailedPlayersCmd());
    console.log(responses);
    rcon.end();
    const jailList: Record<string, boolean> = JSON.parse(responses);
    return jailList;
}

export const isPlayerJailed = async ({ playerName, interaction }: { playerName: string, interaction: CommandInteraction<CacheType> }) => {
    const jailList = await getJailList();
    const isPlayerJailed = Object.keys(jailList[playerName]).filter(playerName => jailList[playerName]);
    console.log(jailList, playerName);
    return isPlayerJailed;
}

export const isPlayerAlreadyJailedAssert = async ({ playerName, interaction }: { playerName: string, interaction: CommandInteraction<CacheType> }) => {
    const isPlayerJailedBool = await isPlayerJailed({ playerName, interaction })
    if (isPlayerJailedBool) {
        await interaction.reply(`***\`\`\`ERROR: Player ${playerName} is already jailed. Operation not complete.\`\`\`***`);
    }
    return isPlayerJailedBool;
}

export const isPlayerAlreadyUnjailedAssert = async ({ playerName, interaction }: { playerName: string, interaction: CommandInteraction<CacheType> }) => {
    const isPlayerUnjailedBool = !(await isPlayerJailed({ playerName, interaction }))
    console.log(isPlayerUnjailedBool);
    if (isPlayerUnjailedBool) {
        await interaction.reply(`***\`\`\`ERROR: Player ${playerName}is already unjailed. Operation not complete.\`\`\`***`);
    }
    return isPlayerUnjailedBool;
}


const minimum_modifier = 125;
const maximum_modifier = 250;
const player_amount_for_maximum_threat_gain = 20;

export enum ScienceType {
    red = 'red',
    green = 'green',
    mil = 'mil',
    blue = 'blue',
    purple = 'purple',
    yellow = 'yellow',
    white = 'white',
}

const difficulty_vote_value = 1.5; // For Behemoth league

const foodValues: Record<ScienceType, { value: number, name: string, color: string }> = {
    [ScienceType.red]: { value: 0.0010, name: "automation science", color: "255, 50, 50" },
    [ScienceType.green]: { value: 0.0025, name: "logistic science", color: "50, 255, 50" },
    [ScienceType.mil]: { value: 0.0080, name: "military science", color: "105, 105, 105" },
    [ScienceType.blue]: { value: 0.0225, name: "chemical science", color: "100, 200, 255" },
    [ScienceType.purple]: { value: 0.1050, name: "production science", color: "150, 25, 255" },
    [ScienceType.yellow]: { value: 0.1200, name: "utility science", color: "210, 210, 60" },
    [ScienceType.white]: { value: 0.5000, name: "space science", color: "255, 255, 255" },
}


export const FeedScience = async ({ players, type, amount, evo, threat, interaction }: { players: number, type: ScienceType, amount: number, evo: number, threat: number, interaction: CommandInteraction<CacheType> }) => {
    const current_player_count = players
    const food_value = foodValues[type].value * difficulty_vote_value;
    const gain_per_player = (maximum_modifier - minimum_modifier) / player_amount_for_maximum_threat_gain
    let instant_threat_player_count_modifier = minimum_modifier + gain_per_player * current_player_count

    if (instant_threat_player_count_modifier > maximum_modifier) {
        instant_threat_player_count_modifier = maximum_modifier
    }
    evo = evo / 100;
    let bb_evo = evo;
    for (let i = 1; i <=amount; i++) {
        // ---SET EVOLUTION
        const e2 = (evo * 100) + 1
        let diminishing_modifier = (1 / Math.pow(10, (e2 * 0.015))) / (e2 * 0.5)
        console.log(i+ " ---- " + e2 + ":" + diminishing_modifier);
        const evo_gain = (food_value * diminishing_modifier)
        bb_evo = bb_evo + evo_gain
        bb_evo = parseFloat(bb_evo.toFixed(9))
        evo = Math.min(bb_evo, 1);

        // --ADD INSTANT THREAT
        diminishing_modifier = 1 / (0.2 + (e2 * 0.016))
        threat = threat + (food_value * instant_threat_player_count_modifier * diminishing_modifier)
        // threat = math_round(threat, decimals)		    }
        threat = parseFloat(threat.toFixed(9))
    }
    console.log('responding to command');
    await interaction.reply(`***\`\`\`Evo: ${(evo*100).toFixed(2)}%     Threat: ${Math.round(threat)}\`\`\`***`);

}
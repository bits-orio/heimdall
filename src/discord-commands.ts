import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import dotenv from "dotenv";
import { Command } from './types';

dotenv.config();

const commands = {
    [Command.test]: 'temporary command used for testing',
    [Command.feed]: 'Evo Thread calculation for a hypothetical feed',
    [Command.players]: 'get list of connected players',
    [Command.trust]: 'trusts a player',
    [Command.untrust]: 'untrusts a player',
    [Command.ban]: 'bans a player',
    [Command.unban]: 'unbans a player',
    [Command.jail]: 'jails a player',
    [Command.free]: 'frees / unjails a player',
    [Command.promote]: 'promotes a player to be an Admin',
    [Command.demote]: 'demotes a player to be a non-Admin',
    [Command.trustlist]: 'get a list of trusted players',
    [Command.jaillist]: 'get a list of jailed players',
};

const getSlashCommand = (command: Command) => {
    return new SlashCommandBuilder()
    .setName(command)
    .setDescription(commands[command]);
};
const addFeedOption = (slashCommandBuilder: SlashCommandBuilder) => {
    slashCommandBuilder.addNumberOption(option => option.setName('players').setDescription('Enter number of total players in both teams combined').setRequired(true));
    slashCommandBuilder.addNumberOption(option => option.setName('amount').setDescription('Enter amount of science to be sent').setRequired(true));
    slashCommandBuilder.addNumberOption(option => option.setName('evo').setDescription('Enter current Evo of target team').setRequired(true));
    slashCommandBuilder.addNumberOption(option => option.setName('threat').setDescription('Enter current threat of target team').setRequired(true));
    slashCommandBuilder.addStringOption(option =>
		option.setName('type')
			.setDescription('Enter Science category')
			.setRequired(true)
			.addChoice('Red', 'red')
			.addChoice('Green', 'green')
			.addChoice('Military', 'mil')
			.addChoice('Blue', 'blue')
			.addChoice('Purple', 'purple')
			.addChoice('White', 'white'));
    return slashCommandBuilder;
}
const addPlayerOption = (slashCommandBuilder: SlashCommandBuilder) => {
    slashCommandBuilder.addStringOption(option =>
		option.setName('player')
			.setDescription('enter player name')
			.setRequired(true));
            return slashCommandBuilder;
}
const addReasonOption = (slashCommandBuilder: SlashCommandBuilder) => {
    slashCommandBuilder.addStringOption(option =>
		option.setName('reason')
			.setDescription('enter reason')
			.setRequired(true));
            return slashCommandBuilder;
}

const slashCommandMap: Record<Command, SlashCommandBuilder> = {
    [Command.test]: getSlashCommand(Command.test),
    [Command.feed]: addFeedOption(getSlashCommand(Command.feed)),
    [Command.players]: getSlashCommand(Command.players),
    [Command.trust]: addPlayerOption(getSlashCommand(Command.trust)),
    [Command.untrust]: addPlayerOption(getSlashCommand(Command.untrust)),
    [Command.ban]: addReasonOption(addPlayerOption(getSlashCommand(Command.ban))),
    [Command.unban]: addPlayerOption(getSlashCommand(Command.unban)),
    [Command.jail]: addReasonOption(addPlayerOption(getSlashCommand(Command.jail))),
    [Command.free]: addPlayerOption(getSlashCommand(Command.free)),
    [Command.promote]: addPlayerOption(getSlashCommand(Command.promote)),
    [Command.demote]: addPlayerOption(getSlashCommand(Command.demote)),
    [Command.trustlist]: getSlashCommand(Command.trustlist),    
    [Command.jaillist]: getSlashCommand(Command.jaillist),    
}

let commandIdMap: Record<Command, string>;

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN || '');

export const registerCommands = async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        const cmdObjects: any = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID || '', process.env.GUILD_ID || ''),
            { body: Object.values(slashCommandMap) },
        );

        commandIdMap = cmdObjects.reduce((acc: any, item: any) => {
            acc[item.name] = item.id;
            return acc;
        }, {});
        
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}


// export const patchCommand = async (command: Command) => {
//     try {
//         console.log('Started refreshing application (/) commands.');

//         const allPlayers = (await getAllPlayers());

//         let slashCommand = getSlashCommand(command).addStringOption(option => {

//             option.setName('player')
//                 .setDescription('Choose a player to trust')
//                 .setRequired(true);

//                 [...allPlayers.north, ...allPlayers.spectators, ...allPlayers.south].forEach(playerName => option.addChoice(playerName, playerName))
                
//                 return option;

//                     });
//         const cmdObjects: any = await rest.patch(
//             Routes.applicationGuildCommand(process.env.CLIENT_ID || '', process.env.GUILD_ID || '', commandIdMap[command]),
//             { body: [slashCommand] },
//         );

//         commandIdMap = cmdObjects.reduce((acc: any, item: any) => {
//             acc[item.name] = item.id;
//             return acc;
//         }, {});
        
//         console.log('Successfully reloaded application (/) commands.');
//     } catch (error) {
//         console.error(error);
//     }
// }


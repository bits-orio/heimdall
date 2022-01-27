import DiscordJS, { Intents, Message, TextChannel } from "discord.js";
import { Command, CommandColorScheme } from "./types";

import dotenv from "dotenv";
import { exit } from "process";

dotenv.config();


export const commandColorScheme: CommandColorScheme = {
  [Command.test]: 0xB1D8B7,
  [Command.feed]: 0xB1D8B7,
  [Command.players]: 0xB1D8B7,
  [Command.trust]: 0x32CD30,
  [Command.untrust]: 0xAA1945,
  [Command.ban]: 0xAA1945,
  [Command.unban]: 0x32CD30,
  // [Command.jail]: 0xAA1945,
  // [Command.free]: 0x32CD30,
  [Command.promote]: 0x32CD30,
  [Command.demote]: 0xAA1945,
  [Command.trustlist]: 0xB1D8B7,
  [Command.jaillist]: 0xB1D8B7,
}

export const simpleEmbeddedResponse = async ({ command, message, interaction }: { command: Command, message: string, interaction: DiscordJS.CommandInteraction<DiscordJS.CacheType> }) => {
  const channel = interaction.channel;
  if (channel) {
    const embed = {
      color: commandColorScheme[command],
      author: {
        name: 'BB-CON',
        icon_url: 'https://factorio.com/static/img/factorio-wheel.png',
      },
      fields: [
        {
          name: message,
          value: '\u200b',
        },
      ],
      timestamp: new Date(),
    };
    await channel.send({ embeds: [embed] });
  }
}

export const createThread = async ({ channel, name, startMessage }: { channel: TextChannel, name: string, startMessage: Message<boolean>}) => {
  // Create a new public thread
  return channel.threads
    .create({
      name,
      startMessage,
      autoArchiveDuration: 60,
    });
}

export const discordClient = new DiscordJS.Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});


discordClient.on("ready", () => {
  console.log("The bot is ready");
});

discordClient.login(process.env.TOKEN);

import DiscordJS, { Intents, TextChannel } from "discord.js";
import dotenv from "dotenv";
import { exit } from "process";
import { Rcon } from "rcon-client/lib";
import { delay, Subject, take } from "rxjs";
import { registerCommands } from "./discord-commands";
import { createThread, discordClient, simpleEmbeddedResponse } from "./discord-utils";
import { banPlayer, demotePlayer, doesPlayerExist, FeedScience, getConnectedPlayers, getJailList, getSpecificPlayer, getTrustList, isPlayerAlreadyTrustedAssert, isPlayerAlreadyUntrustedAssert, promotePlayer, ScienceType, trustPlayer, unbanPlayer, untrustPlayer } from "./factorio-utils";
import { playerEvents, players, PlayerState } from "./player-observables";
import { readStreamObservable } from "./tail";
import { Command, Force } from "./types";

dotenv.config();

registerCommands();




// if (!process.env.SERVER_CHAT_CHANNEL_ID) {
//   console.error(`Make sure to add environment variable [SERVER_CHAT_CHANNEL_ID] in the .env file`);
// }
// if (!process.env.SERVER_CHAT_CHANNEL_ID) {
//   console.error(`Make sure to add environment variable [SERVER_CHAT_CHANNEL_ID] in the .env file`);
// }

// playerEvents.pipe(delay(500)).subscribe(async (event) => {
//   console.log(JSON.stringify(event, null, 2));
//   if (!process.env.SERVER_ADMIN_CHANNEL_ID) {
//     console.error(`Make sure to add environment variable [SERVER_ADMIN_CHANNEL_ID] in the .env file`);
//     exit(1);
//   }
  
//   const serverAdminChannel = await discordClient.channels.fetch(process.env.SERVER_ADMIN_CHANNEL_ID);
//   if (!serverAdminChannel) {
//     console.error(`Server Admin channel wasn't found`);
//     exit(1);
//   }

//   if (!process.env.SUSPICIOUS_ACCOUNTS_CHANNEL_ID) {
//     console.error(`Make sure to add environment variable [SERVER_ADMIN_CHANNEL_ID] in the .env file`);
//     exit(1);
//   }
  
//   const susChannel = await discordClient.channels.fetch(process.env.SUSPICIOUS_ACCOUNTS_CHANNEL_ID);
//   if (!susChannel) {
//     console.error(`Suspicious accounts channel wasn't found`);
//     exit(1);
//   }
//   // if (channel.isText()) (
//   //   channel
//   // )
//   const SUS_WIDTH = 2048;
//   const SUS_HEIGHT = 1227;
//   const SUS_SCALE = 1.00;
//   const playerData = await getSpecificPlayer({ playerName: event.name });
//   if (playerData.width !== SUS_WIDTH || playerData.height !== SUS_HEIGHT || playerData.scale !== SUS_SCALE) {
//     return;
//   }

//   let prevForce = players[event.name] ? players[event.name].force : null;


//   // console.log(JSON.stringify(players, null, 2));
//   if (players[event.name] == null) {
//     players[event.name] = {
//       name: event.name,
//       force: playerData.force,
//       state: event.state,
//       eventHistory: [event],
//       futureAction: new Subject(),
//     }
//     const minBanDelay = 5;
//     const maxBanDelay = 20;
//     const randomDelay = (Math.floor(Math.random() * (maxBanDelay - minBanDelay + 1) + minBanDelay)) * 60 * 1000;
//     const playerInfo = players[event.name];
//     if (playerInfo.threadChannel != null) {
//       playerInfo.threadChannel.send(`Heads up: Going to ban **${playerInfo.name}** in ${randomDelay / (1000 * 60)} minutes.`);
//     }
//     players[event.name].futureAction?.pipe(
//       take(1),
//     ).subscribe((threadChannel) => {
//       if (threadChannel != null) {
//         threadChannel.send(`Heads up: Going to ban **${playerInfo.name}** in ${randomDelay / (1000 * 60)} minutes.`);
//       }
//     })

//     players[event.name].futureAction?.pipe(
//       take(1),
//       delay(randomDelay)
//     ).subscribe((threadChannel) => {
//       if (threadChannel != null) {
//         (serverAdminChannel as TextChannel).send(`/ban **${playerInfo.name}** Multi-account suspicion. Appeal on discord. Link on biterbattles.org`);
//         threadChannel.send(`BANNED **${playerInfo.name}** !`);
//       }
//     })

//   } else {
//     players[event.name] = {
//       ...players[event.name],
//       force: playerData.force,  
//       prevState: (event.state == players[event.name].state) ? players[event.name].prevState : players[event.name].state,
//       state: event.state,
//       eventHistory: [...players[event.name].eventHistory, event],
//     }
//   }


//   console.log(`PLAYER ${event.name}:`, event.state);
//   // console.log(`PLAYER STATE BEFORE`);
//   // console.log(JSON.stringify(players, null, 2));
//   const playerInfo = players[event.name];
//   if (playerInfo.state == PlayerState.joined) {
//     if (playerInfo.threadChannel == null) {
//       const startMessage = await (susChannel as TextChannel).send(`Suspicious account detected **${playerInfo.name}**`);
//       const threadChannel = await createThread({ channel: susChannel as TextChannel, name: playerInfo.name, startMessage });
//       // console.log(threadChannel.id);
//       players[event.name] = {
//         ...playerInfo,
//         threadChannel
//       };
//       threadChannel.send(`**${playerInfo.name}** just joined.`);
//       threadChannel.send(`**Heimdall** will monitor this player and given enough confidence will ban the player only after he joins a team. Ban timing will be random once ban determination is made, Heimdall will give a heads up before banning.`);
//       // threadChannel.send(`\`\`\`json\n${JSON.stringify(playerInfo, null, 2)}\`\`\``);
//     } else {
//       const threadChannel = playerInfo.threadChannel;
//       if (prevForce && prevForce == Force.spectator) {
//         if (playerInfo.force == Force.spectator) {
//           threadChannel.send(`**${playerInfo.name}** joined again.`);
//         } else {
//           threadChannel.send(`**${playerInfo.name}** is spectating.`);
//         }
//       } else {
//         threadChannel.send(`**${playerInfo.name}** joined back again directly in team ${playerInfo.force}.`);
//         players[event.name].futureAction?.next(threadChannel);
//       }
//     }
//   } else if (playerInfo.state == PlayerState.left) {
//     if (playerInfo.threadChannel != null) {
//       const threadChannel = playerInfo.threadChannel;
//       threadChannel.send(`**${playerInfo.name}** left.`);
//     }
//   } else if (playerInfo.state == PlayerState.playing) {
//     if (playerInfo.threadChannel != null) {
//       const threadChannel = playerInfo.threadChannel;
//       threadChannel.send(`**${playerInfo.name}** is now playing in team ${playerInfo.force}.`);
//       players[event.name].futureAction?.next(threadChannel);
//     }
//   }
//   // console.log(`PLAYER STATE AFTER`);
//   // console.log(JSON.stringify(players, null, 2));

// });

// const channel = discordClient.channels.cache.get(process.env.SERVER_CHAT_CHANNEL_ID);
//       // console.log(players.south.length && players.south.map((player: string) => {return {name: player, inline: true};}));

//         console.log("\`\`\`json\n${JSON.stringify(players,null, 2)}\`\`\`"

//         await channel.send({ embeds: [exampleEmbed] });


// ./bin/x64/factorio --start-server-load-scenario fbb --rcon-bind localhost:34197 --rcon-password=<SOME_PASSWORD_HERE> --server-settings data/server-settings.json 


// if (process.env.SERVER_ADMIN_CHANNEL_ID) {
//   client.channels.fetch(process.env.SERVER_ADMIN_CHANNEL_ID)
//   .then(async (channel) => { console.log(await channel?.fetch()) })
//   .catch(console.error);

//   let MessageObserable: Subject<DiscordJS.Message> = new Subject();

// // client.on("messageCreate", (msg) => {
// //   MessageObserable.next(msg);
// // });

// // MessageObserable.pipe(
// //   filter((msg) => msg.channelId === process.env.SERVER_CHAT_CHANNEL_ID)
// // ).subscribe(async (msg) => {
// //   console.log(new Date(msg.createdTimestamp).toTimeString(),msg.content);

// //   const rcon = await Rcon.connect({
// //     host: "localhost", port: 34197, password: process.env.RCON_PASSWORD
// // })

// // // console.log(await rcon.send("/c rcon.print(1234)"))

// // let responses = await rcon.send('/c rcon.print("1234")');
// // console.log('responses : ', responses)


// // rcon.end()
// // });
// }








discordClient.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  if (interaction.channelId != process.env.SERVER_ADMIN_CHANNEL_ID) {
    interaction.reply(`***\`\`\`${interaction.user.username} attempted to run an admin command (/${interaction.commandName}) from a channel that doesn't have sufficient previlidges.\`\`\`***`);
    return;
  }
  switch (interaction.commandName) {
    case 'feed': {
      // const rcon = await Rcon.connect({
      //   host: "localhost", port: 34197, password: process.env.RCON_PASSWORD || ''
      // })
      // const response = await rcon.send(`/c game.print(game.player)`);
      // rcon.end();
      // await interaction.reply(`***\`\`\`${response}\`\`\`***`);
      console.log('ffeedd command invoked');
      const players = interaction.options.getNumber('players');
      if (players == null) return;

      const typeString = interaction.options.getString('type');
      if (typeString == null) return;
      // @ts-ignore
      const type: ScienceType = ScienceType[typeString];

      const amount = interaction.options.getNumber('amount');
      if (amount == null) return;

      const evo = interaction.options.getNumber('evo');
      if (evo == null) return;

      const threat = interaction.options.getNumber('threat');
      if (threat == null) return;

      await FeedScience({interaction, players, type, amount, evo, threat});
      break;
    }
    case Command.players: {
      const connectedPlayers = await getConnectedPlayers();
      await simpleEmbeddedResponse({ interaction, message: `${interaction.user.username} invoked command ${Command.players}`, command: Command.players })
      await interaction.reply(`***\`\`\`json\n${JSON.stringify(connectedPlayers, null, 2)}\`\`\`***`);
      break;
    }
    case Command.trust: {
      const playerName = interaction.options.getString('player');
      if (playerName == null) return;
      if (!await doesPlayerExist({ playerName, interaction })) return;
      if (await isPlayerAlreadyTrustedAssert({ playerName, interaction })) return;
      await simpleEmbeddedResponse({ interaction, message: `${interaction.user.username} invoked command ${Command.trust}`, command: Command.trust })
      await trustPlayer({ playerName });
      await interaction.reply(`***\`\`\`Player ${playerName} is now trusted.\`\`\`***`);
      break;
    }
    case Command.untrust: {
      const playerName = interaction.options.getString('player');
      if (playerName == null) return;
      if (!await doesPlayerExist({ playerName, interaction })) return;
      if (await isPlayerAlreadyUntrustedAssert({ playerName, interaction })) return;
      await simpleEmbeddedResponse({ interaction, message: `${interaction.user.username} invoked command ${Command.untrust}`, command: Command.untrust })
      await untrustPlayer({ playerName });
      await interaction.reply(`***\`\`\`Player ${playerName} is now un-trusted.\`\`\`***`);
      break;
    }
    case Command.ban: {
      const playerName = interaction.options.getString('player');
      const reason = interaction.options.getString('reason');
      if (playerName == null || reason == null) return;
      if (!await doesPlayerExist({ playerName, interaction })) return;
      await simpleEmbeddedResponse({ interaction, message: `${interaction.user.username} invoked command ${Command.ban} for reason: ${reason}`, command: Command.ban })
      await banPlayer({ playerName, reason });
      await interaction.reply(`***\`\`\`Player ${playerName} is now banned.\`\`\`***`);
      break;
    }
    case Command.unban: {
      const playerName = interaction.options.getString('player');
      if (playerName == null) return;
      if (!await doesPlayerExist({ playerName, interaction })) return;
      await simpleEmbeddedResponse({ interaction, message: `${interaction.user.username} invoked command ${Command.unban}`, command: Command.unban })
      await unbanPlayer({ playerName });
      await interaction.reply(`***\`\`\`Player ${playerName} is now un-baned.\`\`\`***`);
      break;
    }
    // case Command.jail: {
    //   const playerName = interaction.options.getString('player');
    //   const reason = interaction.options.getString('reason');
    //   if (playerName == null || reason == null) return;
    //   if (!await doesPlayerExist({ playerName, interaction })) return;
    //   if (await isPlayerAlreadyJailedAssert({ playerName, interaction })) return;
    //   await simpleEmbeddedResponse({ interaction, message: `${interaction.user.username} invoked command ${Command.jail}`, command: Command.jail })
    //   await jailPlayer({ playerName, reason });
    //   await interaction.reply(`***\`\`\`Player ${playerName} is now jailed.\`\`\`***`);
    //   break;
    // }
    // case Command.free: {
    //     const playerName = interaction.options.getString('player');
    //   if (playerName == null) return;
    //   if (!await doesPlayerExist({ playerName, interaction })) return;
    //   if (await isPlayerAlreadyUnjailedAssert({ playerName, interaction })) return;
    //   await simpleEmbeddedResponse({ interaction, message: `${interaction.user.username} invoked command ${Command.free}`, command: Command.free })
    //   await unjailPlayer({ playerName });
    //   await interaction.reply(`***\`\`\`Player ${playerName} is now un-jailed.\`\`\`***`);
    //   break;
    // }
    case Command.promote: {
      const playerName = interaction.options.getString('player');
      if (playerName == null) return;
      if (!await doesPlayerExist({ playerName, interaction })) return;
      await simpleEmbeddedResponse({ interaction, message: `${interaction.user.username} invoked command ${Command.promote}`, command: Command.promote })
      await promotePlayer({ playerName });
      await interaction.reply(`***\`\`\`Player ${playerName} is now promoted.\`\`\`***`);
      break;
    }
    case Command.demote: {
      const playerName = interaction.options.getString('player');
      if (playerName == null) return;
      if (!await doesPlayerExist({ playerName, interaction })) return;
      await simpleEmbeddedResponse({ interaction, message: `${interaction.user.username} invoked command ${Command.demote}`, command: Command.demote })
      await demotePlayer({ playerName });
      await interaction.reply(`***\`\`\`Player ${playerName} is now demoted.\`\`\`***`);
      break;
    }
    case Command.trustlist: {
      const trustList = await getTrustList();
      await simpleEmbeddedResponse({ interaction, message: `${interaction.user.username} invoked command ${Command.trustlist}`, command: Command.trustlist })
      await interaction.reply(`***\`\`\`json\n${JSON.stringify(trustList, null, 2)}\`\`\`***`);
      break;
    }
    case Command.jaillist: {
      const jailList = await getJailList();
      await simpleEmbeddedResponse({ interaction, message: `${interaction.user.username} invoked command ${Command.jaillist}`, command: Command.jaillist })
      await interaction.reply(`***\`\`\`json\n${JSON.stringify(jailList, null, 2)}\`\`\`***`);
      break;
    }
  }

});



// const channel = client.channels.cache.get(process.env.SERVER_CHAT_CHANNEL_ID);
      // console.log(players.south.length && players.south.map((player: string) => {return {name: player, inline: true};}));

      // const channel = interaction.channel;
      // if (channel){
      //   const exampleEmbed = {
      //     color: 0x00ff00,

      //     fields: [
      //       {
      //         name: interaction.user.username,
      //         value: `requested player list`,
      //       },
      //     ],
      //     timestamp: new Date(),
      //   };
      //   console.log("\`\`\`json\n${JSON.stringify(players,null, 2)}\`\`\`"
      //   );

      //   await channel.send({ embeds: [exampleEmbed] });
      // }

// ./bin/x64/factorio --start-server-load-scenario fbb --rcon-bind localhost:34197 --rcon-password=<SOME_PASSWORD_HERE> --server-settings data/server-settings.json 

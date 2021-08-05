import { Client, Collection } from 'discord.js';
import { readFileSync } from 'fs';
import getCommands from './commandsHandler.js';

const config = JSON.parse(readFileSync('./config.json'));

const client = new Client({
  intents: ['DIRECT_MESSAGES', 'GUILD_MESSAGES', 'GUILDS'],
});

const commandsPromise = getCommands();

let commandsArray = await commandsPromise;

client.once('ready', async () => {
  client.commands = new Collection();

  for (const command of commandsArray)
    client.commands.set(command.name, command);

  commandsArray = commandsArray.map(({ execute, ...data }) => data);

  client.guilds.cache.forEach((guild) => guild.commands.set(commandsArray)); // will be replaced with client.application.commands later

  console.log('ready');
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (!client.commands.has(interaction.commandName)) return;

  try {
    await client.commands.get(interaction.commandName).execute(interaction);
  } catch (err) {
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true,
    });
  }
});

client.login(config.discord.token);

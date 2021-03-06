    'use strict';

// Loading env configuration
require('dotenv').config({path: `${__dirname}/.env`});

const Discord = require("discord.js"),
client = new Discord.Client(),
removeDiacritics = require('diacritics').remove,
moment = require('moment'); 

client.on('ready', () => {
    console.log(`Logged in as ${client.user.username}!`);
});

client.on('voiceStateUpdate', (oldState, newstate) => {

    if (oldState.voiceChannel && newstate.voiceChannel && oldState.voiceChannel.name === newstate.voiceChannel.name) {
        return;
    }

    if (oldState.voiceChannel) {
        const textChannel = oldState.guild.channels.reduce((acc, channel) => {
            const unaccendtedName = removeDiacritics(oldState.voiceChannel.name).replace(/[^a-z0-9_ ]+/gi, '').trim().replace(/ /g, '_').toLowerCase();
            if (!acc && channel.type === "text" && channel.name === unaccendtedName) {
                acc = channel;
            }
            return acc;
        }, null);

        if (textChannel) {
            textChannel.permissionOverwrites.forEach( permission => {
                if (permission.id === oldState.id) {
                    permission.delete().catch((err)=>{
                        textChannel.sendMessage("Can't write permissions !").catch((err) => {
                            console.error("Can't send message");
                        });
                    });
                }
            });
            if (process.env.ANNOUNCE && process.env.ANNOUNCE_LEAVE) {
                const date = process.env.DATE_FORMAT ? moment().format(process.env.DATE_FORMAT) + ' ' : '';
                textChannel.sendMessage(date + process.env.ANNOUNCE_LEAVE.replace(/\$1/g, oldState.user.username)).catch(()=>{});
            }
        }
    }

    if (newstate.voiceChannel) {
        const textChannel = newstate.guild.channels.reduce((acc, channel) => {
            const unaccendtedName = removeDiacritics(newstate.voiceChannel.name).replace(/[^a-z0-9_ ]+/gi, '').trim().replace(/ /g, '_').toLowerCase();
            if (!acc && channel.type === "text" && channel.name === unaccendtedName) {
                acc = channel;
            }
            return acc;
        }, null);
        if (textChannel) {
            textChannel.overwritePermissions(oldState, {"READ_MESSAGES": true}).catch((err)=>{
                textChannel.sendMessage("Can't write permissions !").catch((err) => {
                    console.error("Can't send message");
                });
            });;
            if (process.env.ANNOUNCE && process.env.ANNOUNCE_ENTER) {
                const date = process.env.DATE_FORMAT ? moment().format(process.env.DATE_FORMAT) + ' ' : '';
                textChannel.sendMessage(date + process.env.ANNOUNCE_ENTER.replace(/\$1/g, newstate.user.username)).catch(()=>{});
            }
        }
    }
});

client.login(process.env.TOKEN);

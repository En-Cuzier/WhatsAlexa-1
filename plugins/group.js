let {MessageType, GroupSettingChange} = require('@adiwajshing/baileys');
let WhatsAlexa = require('../events');
let Config = require('../config');
let FilterDb = require('./sql/filters');
let Language = require('../language');
let FLang = Language.getString('filters');
let Lang = Language.getString('admin');
let td = Config.WORKTYPE == 'public' ? false : true

 async function checkUsAdmin(message, user = message.data.participant) {
    var grup = await message.client.groupMetadata(message.jid);
    var sonuc = grup['participants'].map((member) => {     
        if (member.jid.split("@")[0] == user.split("@")[0] && member.isAdmin) return true; else; return false;
    });
    return sonuc.includes(true);
}
async function checkImAdmin(message, user = message.client.user.jid) {
    var grup = await message.client.groupMetadata(message.jid);
    var sonuc = grup['participants'].map((member) => {
        if (member.id.split('@')[0] === user.split('@')[0] && member.isAdmin) return true; else; return false;
    });
    return sonuc.includes(true);
}

WhatsAlexa.addCommand({pattern: 'kick ?(.*)', fromMe: td, onlyGroup: true, desc: Lang.BAN_DESC}, (async (message, match) => {  
    var im = await checkImAdmin(message);
    var us = await checkUsAdmin(message);
    if (!us) return await message.client.sendMessage(message.jid,Lang.USER_NOT_ADMIN ,MessageType.text);
    if (!im) return await message.client.sendMessage(message.jid,Lang.IM_NOT_ADMIN,MessageType.text);

    if (Config.BANMSG == 'default') {
        if (message.reply_message !== false) {
            await message.client.sendMessage(message.jid,'@' + message.reply_message.data.participant.split('@')[0] + '```, ' + Lang.BANNED + '```', MessageType.text, {contextInfo: {mentionedJid: [message.reply_message.data.participant]}});
            await message.client.groupRemove(message.jid, [message.reply_message.data.participant]);
        } else if (message.reply_message === false && message.mention !== false) {
            var etiketler = '';
            message.mention.map(async (user) => {
                etiketler += '@' + user.split('@')[0] + ',';
            });

            await message.client.sendMessage(message.jid,etiketler + '```, ' + Lang.BANNED + '```', MessageType.text, {contextInfo: {mentionedJid: message.mention}});
            await message.client.groupRemove(message.jid, message.mention);
        } else {
            return await message.client.sendMessage(message.jid,Lang.GIVE_ME_USER,MessageType.text);
        }
    }
    else {
        if (message.reply_message !== false) {
            await message.client.sendMessage(message.jid,'@' + message.reply_message.data.participant.split('@')[0] + Config.BANMSG, MessageType.text, {contextInfo: {mentionedJid: [message.reply_message.data.participant]}});
            await message.client.groupRemove(message.jid, [message.reply_message.data.participant]);
        } else if (message.reply_message === false && message.mention !== false) {
            var etiketler = '';
            message.mention.map(async (user) => {
                etiketler += '@' + user.split('@')[0] + ',';
            });

            await message.client.sendMessage(message.jid,etiketler + Config.BANMSG, MessageType.text, {contextInfo: {mentionedJid: message.mention}});
            await message.client.groupRemove(message.jid, message.mention);
        } else {
            return await message.client.sendMessage(message.jid,Lang.GIVE_ME_USER,MessageType.text);
        }
    }
}));

WhatsAlexa.addCommand({pattern: 'add(?: |$)(.*)', fromMe: td, onlyGroup: true, desc: Lang.ADD_DESC}, (async (message, match) => {  
    var im = await checkImAdmin(message);
    var us = await checkUsAdmin(message);
    if (!us) return await message.client.sendMessage(message.jid,Lang.USER_NOT_ADMIN ,MessageType.text);
    if (!im) return await message.client.sendMessage(message.jid,Lang.IM_NOT_ADMIN,MessageType.text);

    if (match[1] !== '') {
        match[1].split(' ').map(async (user) => {
            await message.client.groupAdd(message.jid, [user + "@s.whatsapp.net"]);
            await message.client.sendMessage(message.jid,'```' + user + ' ' + Lang.ADDED +'```');
        });
    } else {
        return await message.client.sendMessage(message.jid,Lang.GIVE_ME_USER,MessageType.text);
    }
}));

WhatsAlexa.addCommand({pattern: 'promote ?(.*)', fromMe: td, onlyGroup: true, desc: Lang.PROMOTE_DESC}, (async (message, match) => {    
    var im = await checkImAdmin(message);
    var us = await checkUsAdmin(message);
    if (!us) return await message.client.sendMessage(message.jid,Lang.USER_NOT_ADMIN ,MessageType.text);
    if (!im) return await message.client.sendMessage(message.jid,Lang.IM_NOT_ADMIN,MessageType.text);

    if (Config.PROMOTEMSG == 'default') {
        if (message.reply_message !== false) {
            var checkAlready = await checkImAdmin(message, message.reply_message.data.participant);
            if (checkAlready) {
                return await message.client.sendMessage(message.jid,Lang.ALREADY_PROMOTED, MessageType.text);
            }

            await message.client.sendMessage(message.jid,'@' + message.reply_message.data.participant.split('@')[0] + Lang.PROMOTED, MessageType.text, {contextInfo: {mentionedJid: [message.reply_message.data.participant]}});
            await message.client.groupMakeAdmin(message.jid, [message.reply_message.data.participant]);
        } else if (message.reply_message === false && message.mention !== false) {
            var etiketler = '';
            message.mention.map(async (user) => {
                var checkAlready = await checkImAdmin(message, user);
                if (checkAlready) {
                    return await message.client.sendMessage(message.jid,Lang.ALREADY_PROMOTED, MessageType.text);
                }

                etiketler += '@' + user.split('@')[0] + ',';
            });

            await message.client.sendMessage(message.jid,etiketler + Lang.PROMOTED, MessageType.text, {contextInfo: {mentionedJid: message.mention}});
            await message.client.groupMakeAdmin(message.jid, message.mention);
        } else {
            return await message.client.sendMessage(message.jid,Lang.GIVE_ME_USER,MessageType.text);
        }
    }
    else {
        if (message.reply_message !== false) {
            var checkAlready = await checkImAdmin(message, message.reply_message.data.participant);
            if (checkAlready) {
                return await message.client.sendMessage(message.jid,Lang.ALREADY_PROMOTED, MessageType.text);
            }

            await message.client.sendMessage(message.jid,'@' + message.reply_message.data.participant.split('@')[0] + Config.PROMOTEMSG, MessageType.text, {contextInfo: {mentionedJid: [message.reply_message.data.participant]}});
            await message.client.groupMakeAdmin(message.jid, [message.reply_message.data.participant]);
        } else if (message.reply_message === false && message.mention !== false) {
            var etiketler = '';
            message.mention.map(async (user) => {
                var checkAlready = await checkImAdmin(message, user);
                if (checkAlready) {
                    return await message.client.sendMessage(message.jid,Lang.ALREADY_PROMOTED, MessageType.text);
                }

                etiketler += '@' + user.split('@')[0] + ',';
            });

            await message.client.sendMessage(message.jid,etiketler + Config.PROMOTEMSG, MessageType.text, {contextInfo: {mentionedJid: message.mention}});
            await message.client.groupMakeAdmin(message.jid, message.mention);
        } else {
            return await message.client.sendMessage(message.jid,Lang.GIVE_ME_USER,MessageType.text);
        }
    }
}));

WhatsAlexa.addCommand({pattern: 'demote ?(.*)', fromMe: td, onlyGroup: true, desc: Lang.DEMOTE_DESC}, (async (message, match) => {    
    var im = await checkImAdmin(message);
    var us = await checkUsAdmin(message);
    if (!us) return await message.client.sendMessage(message.jid,Lang.USER_NOT_ADMIN ,MessageType.text);
    if (!im) return await message.client.sendMessage(message.jid,Lang.IM_NOT_ADMIN);

    if (Config.DEMOTEMSG == 'default') {
        if (message.reply_message !== false) {
            var checkAlready = await checkImAdmin(message, message.reply_message.data.participant.split('@')[0]);
            if (!checkAlready) {
                return await message.client.sendMessage(message.jid,Lang.ALREADY_NOT_ADMIN, MessageType.text);
            }

            await message.client.sendMessage(message.jid,'@' + message.reply_message.data.participant.split('@')[0] + Lang.DEMOTED, MessageType.text, {contextInfo: {mentionedJid: [message.reply_message.data.participant]}});
            await message.client.groupDemoteAdmin(message.jid, [message.reply_message.data.participant]);
        } else if (message.reply_message === false && message.mention !== false) {
            var etiketler = '';
            message.mention.map(async (user) => {
                var checkAlready = await checkImAdmin(message, user);
                if (!checkAlready) {
                    return await message.client.sendMessage(message.jid,Lang.ALREADY_NOT_ADMIN, MessageType.text);
                }

                etiketler += '@' + user.split('@')[0] + ',';
            });

            await message.client.sendMessage(message.jid,etiketler + Lang.DEMOTED, MessageType.text, {contextInfo: {mentionedJid: message.mention}});
            await message.client.groupDemoteAdmin(message.jid, message.mention);
        } else {
            return await message.client.sendMessage(message.jid,Lang.GIVE_ME_USER,MessageType.text);
        }
    }
    else {
        if (message.reply_message !== false) {
            var checkAlready = await checkImAdmin(message, message.reply_message.data.participant.split('@')[0]);
            if (!checkAlready) {
                return await message.client.sendMessage(message.jid,Lang.ALREADY_NOT_ADMIN, MessageType.text);
            }

            await message.client.sendMessage(message.jid,'@' + message.reply_message.data.participant.split('@')[0] + Config.DEMOTEMSG, MessageType.text, {contextInfo: {mentionedJid: [message.reply_message.data.participant]}});
            await message.client.groupDemoteAdmin(message.jid, [message.reply_message.data.participant]);
        } else if (message.reply_message === false && message.mention !== false) {
            var etiketler = '';
            message.mention.map(async (user) => {
                var checkAlready = await checkImAdmin(message, user);
                if (!checkAlready) {
                    return await message.client.sendMessage(message.jid,Lang.ALREADY_NOT_ADMIN, MessageType.text);
                }

                etiketler += '@' + user.split('@')[0] + ',';
            });

            await message.client.sendMessage(message.jid,etiketler + Config.DEMOTEMSG, MessageType.text, {contextInfo: {mentionedJid: message.mention}});
            await message.client.groupDemoteAdmin(message.jid, message.mention);
        } else {
            return await message.client.sendMessage(message.jid,Lang.GIVE_ME_USER,MessageType.text);
        }
    }
}));

WhatsAlexa.addCommand({pattern: 'closegc ?(.*)', fromMe: td, onlyGroup: true, desc: Lang.MUTE_DESC}, (async (message, match) => {    
    var im = await checkImAdmin(message);
    var us = await checkUsAdmin(message);
    if (!us) return await message.client.sendMessage(message.jid,Lang.USER_NOT_ADMIN ,MessageType.text);
    if (!im) return await message.client.sendMessage(message.jid,Lang.IM_NOT_ADMIN,MessageType.text);

    if (Config.MUTEMSG == 'default') {
        await message.client.groupSettingChange(message.jid, GroupSettingChange.messageSend, true);
        await message.client.sendMessage(message.jid,Lang.MUTED,MessageType.text);
    }
    else {
        await message.client.groupSettingChange(message.jid, GroupSettingChange.messageSend, true);
        await message.client.sendMessage(message.jid,Config.MUTEMSG,MessageType.text);
    }
}));

WhatsAlexa.addCommand({pattern: 'opengc ?(.*)', fromMe: td, onlyGroup: true, desc: Lang.UNMUTE_DESC}, (async (message, match) => {    
    var im = await checkImAdmin(message);
    var us = await checkUsAdmin(message);
    if (!us) return await message.client.sendMessage(message.jid,Lang.USER_NOT_ADMIN ,MessageType.text);
    if (!im) return await message.client.sendMessage(message.jid,Lang.IM_NOT_ADMIN,MessageType.text);

    if (Config.UNMUTEMSG == 'default') {
        await message.client.groupSettingChange(message.jid, GroupSettingChange.messageSend, false);
        await message.client.sendMessage(message.jid,Lang.UNMUTED,MessageType.text);
    }
    else {
        await message.client.groupSettingChange(message.jid, GroupSettingChange.messageSend, false);
        await message.client.sendMessage(message.jid,Config.UNMUTEMSG,MessageType.text);
    }
}));

WhatsAlexa.addCommand({pattern: 'linkgc ?(.*)', fromMe: td, onlyGroup: true, desc: Lang.INVITE_DESC}, (async (message, match) => {    
    var im = await checkImAdmin(message);
    var us = await checkUsAdmin(message);
    if (!us) return await message.client.sendMessage(message.jid,Lang.USER_NOT_ADMIN ,MessageType.text);
    if (!im) return await message.client.sendMessage(message.jid,Lang.IM_NOT_ADMIN, MessageType.text);
    
    var invite = await message.client.groupInviteCode(message.jid);
    await message.client.sendMessage(message.jid,Lang.INVITE + ' https://chat.whatsapp.com/' + invite, MessageType.text);
}));

WhatsAlexa.addCommand({pattern: 'filter ?(.*)', fromMe: td, onlyGroup: true, desc: Lang.FILTER_DESC}, (async (message, match) => {
    var us = await checkUsAdmin(message);
    if (!us) return await message.client.sendMessage(message.jid,Lang.USER_NOT_ADMIN ,MessageType.text);
 
    match = match[1].match(/[\'\"\“](.*?)[\'\"\“]/gsm);

    if (match === null) {
        filtreler = await FilterDb.getFilter(message.jid);
        if (filtreler === false) {
            await message.client.sendMessage(message.jid,FLang.NO_FILTER,MessageType.text, {contextInfo: { forwardingScore: 1000, isForwarded: true }, quoted: message.data })
        } else {
            var mesaj = FLang.FILTERS + '\n';
            filtreler.map((filter) => mesaj += '```' + filter.dataValues.pattern + '```\n');
            await message.client.sendMessage(message.jid,mesaj,MessageType.text, {contextInfo: { forwardingScore: 1000, isForwarded: true }, quoted: message.data })
        }
    } else {
        if (match.length < 2) {
            return await message.client.sendMessage(message.jid,FLang.NEED_REPLY + ' ```#filter "Message To be Replied" "Replied Message"',MessageType.text, {contextInfo: { forwardingScore: 1000, isForwarded: true }, quoted: message.data })
        }
        await FilterDb.setFilter(message.jid, match[0].replace(/['"“]+/g, ''), match[1].replace(/['"“]+/g, '').replace(/[#]+/g, '\n'), match[0][0] === "'" ? true : false);
        await message.client.sendMessage(message.jid,FLang.FILTERED.format(match[0].replace(/['"]+/g, '')),MessageType.text, {contextInfo: { forwardingScore: 1000, isForwarded: true }, quoted: message.data })
    }
}));

WhatsAlexa.addCommand({pattern: 'stop ?(.*)', fromMe: td, onlyGroup: true, desc: Lang.STOP_DESC}, (async (message, match) => {
    var us = await checkUsAdmin(message);
    if (!us) return await message.client.sendMessage(message.jid,Lang.USER_NOT_ADMIN ,MessageType.text);
 
    match = match[1].match(/[\'\"\“](.*?)[\'\"\“]/gsm);
    if (match === null) {
        return await message.client.sendMessage(message.jid,FLang.NEED_REPLY + '\n*Example:* ```#stop "Message To be Replied"```',MessageType.text, {contextInfo: { forwardingScore: 1000, isForwarded: true }, quoted: message.data })
    }

    del = await FilterDb.deleteFilter(message.jid, match[0].replace(/['"“]+/g, ''));
    
    if (!del) {
        await message.client.sendMessage(message.jid,FLang.ALREADY_NO_FILTER, MessageType.text, {contextInfo: { forwardingScore: 1000, isForwarded: true }, quoted: message.data })
    } else {
        await message.client.sendMessage(message.jid,FLang.DELETED, MessageType.text, {contextInfo: { forwardingScore: 1000, isForwarded: true }, quoted: message.data })
    }
}));


WhatsAlexa.addCommand({on: 'text', fromMe: false}, (async (message, match) => {
    var filtreler = await FilterDb.getFilter(message.jid);
    if (!filtreler) return; 
    filtreler.map(
        async (filter) => {
            pattern = new RegExp(filter.dataValues.regex ? filter.dataValues.pattern : ('\\b(' + filter.dataValues.pattern + ')\\b'), 'gm');
            if (pattern.test(message.message)) {
                await message.client.sendMessage(message.jid,filter.dataValues.text, MessageType.text, {contextInfo: { forwardingScore: 1000, isForwarded: true }, quoted: message.data })
            }
        }
    );
}));

WhatsAlexa.addCommand({pattern: 'setname ?(.*)', onlyGroup: true, fromMe: td, desc: Lang.SET_NAME_DESC}, (async (message, match) => {
    var im = await checkImAdmin(message);
    var us = await checkUsAdmin(message);
    if (!us) return await message.client.sendMessage(message.jid,Lang.USER_NOT_ADMIN ,MessageType.text);
    if (!im) return await message.client.sendMessage(message.jid,Lang.IM_NOT_ADMIN,MessageType.text);
    
    if (match[1] === '') return await message.client.sendMessage(message.jid,Lang.S_NEED_WORD,MessageType.text);
    await message.client.groupUpdateSubject(message.jid, match[1]);
    await message.client.sendMessage(message.jid,Lang.SUC_SNAME + ` ${match[1]}`,MessageType.text);
    }
));

module.exports = {
    checkImAdmin: checkImAdmin
};

export const getSpecificPlayerCmd = (playerName: string) => {
    return `/sc local player = game.get_player('${playerName}')
    local msg = {};
    if player and player.valid then
        local index = 1
        for i = 1, 40 do
            if (player.get_quick_bar_slot(i) ~= nil) then
                msg[index] = '\"' .. i .. '\"' .. ': \"' ..
                                 player.get_quick_bar_slot(i).name .. '\"'
                index = index + 1;
            end
        end
        game.print('{' .. table.concat(msg, ', ') .. '}')
    end
    
    local playerJson = string.format(
                           '{"name": "%s", "force": "%s", "connected": %s, "afk_time": %s, "width": %d, "height": %d, "scale": %f, "quick_slots": %s }',
                           player.name, player.force.name, player.connected,
                           player.afk_time, player.display_resolution.width,
                           player.display_resolution.height,
                           player.display_scale,
                           '{' .. table.concat(msg, ', ') .. '}')
    game.print(playerJson)
    rcon.print(playerJson)
    
        `;
}

export const getPlayersCmd = (connectedOnly: boolean = false) => {
    return `/sc local players = {}
    for i, player in pairs(game.players) do
        if (${!connectedOnly} or player.connected) then
            table.insert(players,
                         string.format(
                             '"%s":{{"name": "%s", "force": "%s", "connected": %s, "afk_time": %s}',
                             player.name, player.name, player.force.name, player.connected, player.afk_time))
        end
    end
    rcon.print('{' .. table.concat(players, ', ') .. '}')
    `;
}

export const getTrustedPlayersCmd = (connectedOnly: boolean = false) => {
    return `/c Session = require "utils.datastore.session_data"
    local trusted_list = {}
    for k, v in pairs(Session.get_trusted_table()) do
        table.insert(trusted_list, '"' .. k .. '": ' .. tostring(v))
    end
    rcon.print('{' .. table.concat(trusted_list, ", ") .. '}')
    `;
}


export const getJailedPlayersCmd = (connectedOnly: boolean = false) => {
    return `/c Jailed = require "utils.datastore.jail_data"
    local jailed_list = {}
    for k, v in pairs(Jailed.get_jailed_table()) do
        table.insert(jailed_list, '"' .. k .. '": ' .. tostring(v.jailed))
    end
    rcon.print('{' .. table.concat(jailed_list, ", ") .. '}')
    `;
}

export const getTrustPlayerCmd = (playerName: string) => {
    return `/trust ${playerName}`;
}

export const getUntrustPlayerCmd = (playerName: string) => {
    return `/untrust ${playerName}`;
}

export const getBanPlayerCmd = (playerName: string, reason: string) => {
    return `/ban ${playerName} ${reason}`;
}

export const getUnbanPlayerCmd = (playerName: string) => {
    return `/unban ${playerName}`;
}

export const getJailPlayerCmd = (playerName: string, reason: string) => {
    return `/jail ${playerName} ${reason}`;
}

export const getUnjailPlayerCmd = (playerName: string) => {
    return `/free ${playerName}`;
}

export const getPromotePlayerCmd = (playerName: string) => {
    return `/promote ${playerName}`;
}

export const getDemotePlayerCmd = (playerName: string) => {
    return `/demote ${playerName}`;
}

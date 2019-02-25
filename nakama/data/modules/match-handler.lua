local nk = require("nakama")
--local print_r = require("./debug_utils")

local M = {}

function M.match_init(context, setupstate)
    local gamestate = {
        presences = {}
    }
    local tickrate = 1000 -- per sec
    local label = ""
    print("HELP")
    return gamestate, tickrate, label
end

function makematch(context, matched_users)
    -- print matched users
    for _, user in ipairs(matched_users) do
        local presence = user.presence
        print(("Matched user '%s' named '%s'"):format(presence.user_id, presence.username))
        for k, v in pairs(user.properties) do
            print(("Matched on '%s' value '%s'"):format(k, v))
        end
    end

    local modulename = "pingpong"
    local setupstate = { invited = matched_users }
    local matchid = nk.match_create("match", setupstate)
    return matchid
end

nk.register_matchmaker_matched(makematch)

function M.match_join_attempt(context, dispatcher, tick, state, presence, metadata)
    local acceptuser = true
    print("User is %s", presence.session_id)
    return state, acceptuser
end

function M.match_join(context, dispatcher, tick, state, presences)
    for _, presence in ipairs(presences) do
        print("User is %s", presence.session_id)
        state.presences[presence.session_id] = presence
    end
    return state
end

function M.match_leave(context, dispatcher, tick, state, presences)
    for _, presence in ipairs(presences) do
        print("User is %s", presence.session_id)
        state.presences[presence.session_id] = nil
    end
    return state
end

function M.match_loop(context, dispatcher, tick, state, messages)
    print("HELLO ANYONE")
    for _, presence in ipairs(state.presences) do
        print(("Presence %s named %s"):format(presence.user_id, presence.username))
    end
    for _, message in ipairs(messages) do
        print(("Received %s from %s"):format(message.sender.username, message.data))
        local decoded = nk.json_decode(message.data)
        for k, v in pairs(decoded) do
            print(("Message key %s contains value %s"):format(k, v))
            print("HELLLLLO")
        end
        -- PONG message back to sender
        dispatcher.broadcast_message(1, message.data, {message.sender})
    end
    return state
end

function M.match_terminate(context, dispatcher, tick, state, grace_seconds)
    local message = "Server shutting down in " .. grace_seconds .. " seconds"
    dispatcher.broadcast_message(2, message)
    return nil
end

return M


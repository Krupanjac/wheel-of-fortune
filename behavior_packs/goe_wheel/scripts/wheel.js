import { world } from "@minecraft/server";

world.afterEvents.dataDrivenEntityTrigger.subscribe(ev => {
        // Use world.sendMessage instead of world.runCommandAsync (not available)
        world.sendMessage(`[GOE Wheel] DataDrivenEntityTrigger event received`);
    // The DataDrivenEntityTrigger event uses the property `eventId` (not `id`).
    // Using `ev.id` will be undefined, causing the handler to ignore events.
    if (ev.eventId !== "goe:give_reward") {
        const reported = ev.eventId ?? '<unknown>';
            world.sendMessage(`[GOE Wheel] Ignored event: ${reported}`);
        return;
    }

    // Add say that we triggered the event
    world.sendMessage(`[GOE Wheel] Event goe:give_reward triggered`);

    const wheel = ev.entity;
    if (!wheel || wheel.typeId !== "goe:wheel_of_fortune") return;

    // Find nearest player within 6 blocks of the wheel
    const players = world.getPlayers();
    let player = null;
    let minDistSq = Infinity;
    for (const p of players) {
        const dx = p.location.x - wheel.location.x;
        const dy = p.location.y - wheel.location.y;
        const dz = p.location.z - wheel.location.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        if (distSq <= 36 && distSq < minDistSq) {
            minDistSq = distSq;
            player = p;
        }
    }
    if (!player) return;

    // Use randomness to determine reward (visual rotation isn't available here)
    const rot = Math.random() * 360;

    let reward;

    // Normalize rotation to positive
    let normalizedRot = rot;
    if (normalizedRot < 0) normalizedRot += 360;

    if (normalizedRot < 60) reward = "minecraft:emerald 3";
    else if (normalizedRot < 120) reward = "minecraft:diamond 1";
    else if (normalizedRot < 180) reward = "minecraft:iron_ingot 10";
    else if (normalizedRot < 240) reward = "minecraft:gold_ingot 5";
    else if (normalizedRot < 300) reward = "minecraft:cookie 5";
    else reward = "minecraft:netherite_scrap 1";

    // Diagnostics: announce which player and which reward were chosen
    const playerName = player.nameTag || player.name || 'unknown';
    const displayReward = reward.replace(/^minecraft:/, '');
    // Announce to server and to the player for debugging
    // Use tellraw for the player to avoid cluttering global chat when possible
    try {
           player.runCommand(`tellraw @s {"rawtext":[{"text":"[GOE Wheel] You were targeted for reward: ${displayReward}"}]}`);
    } catch (e) {
           try {
              player.runCommand(`say [GOE Wheel] Targeted player: ${playerName}`);
              player.runCommand(`say [GOE Wheel] Reward chosen: ${displayReward}`);
           } catch (e2) {
              // As a last resort, broadcast to world
              world.sendMessage(`[GOE Wheel] Targeted player: ${playerName}`);
              world.sendMessage(`[GOE Wheel] Reward chosen: ${displayReward}`);
           }
    }


    // Give the reward and play effects
           player.runCommand(`give @s ${reward}`);
           player.runCommand(`playsound random.levelup @s`);
           player.runCommand(`particle minecraft:happy_villager ~~~`);
});
           world.sendMessage(`[GOE Wheel] Failed to run reward commands for ${playerName}: ${e}`);

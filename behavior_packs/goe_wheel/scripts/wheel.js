import { world } from "@minecraft/server";

world.afterEvents.dataDrivenEntityTrigger.subscribe(ev => {
    // Only handle our give_reward event
    if (ev.eventId !== "goe:give_reward") return;

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

    // Pick a reward
    const r = Math.random() * 360;
    let reward;
    if (r < 60) reward = "minecraft:emerald 3";
    else if (r < 120) reward = "minecraft:diamond 1";
    else if (r < 180) reward = "minecraft:iron_ingot 10";
    else if (r < 240) reward = "minecraft:gold_ingot 5";
    else if (r < 300) reward = "minecraft:cookie 5";
    else reward = "minecraft:netherite_scrap 1";

    const displayReward = reward.replace(/^minecraft:/, '');

    // Notify the player and give the reward. Keep logging minimal.
    try {
        player.runCommand(`tellraw @s {"rawtext":[{"text":"You won: ${displayReward}"}]}`);
    } catch {}

    try {
        player.runCommand(`give @s ${reward}`);
        player.runCommand(`playsound random.levelup @s`);
        player.runCommand(`particle minecraft:happy_villager ~~~`);
    } catch (e) {
        // Minimal fallback: broadcast an error once
        world.sendMessage(`[GOE Wheel] Failed to give reward to player.`);
    }
});
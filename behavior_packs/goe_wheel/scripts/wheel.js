import { world } from "@minecraft/server";

world.afterEvents.dataDrivenEntityTrigger.subscribe(ev => {
    if (ev.id !== "goe:give_reward") return;

    const wheel = ev.entity;
    if (!wheel || wheel.typeId !== "goe:wheel_of_fortune") return;

    const player = [...world.getPlayers({
        location: wheel.location,
        maxDistance: 6,
        closest: 1
    })][0];
    
    if (!player) return;

    // Generate a random rotation since we can't get visual rotation and entity doesn't rotate on Z
    const rot = Math.random() * 360;

    let reward;

    // Normalize rotation to positive
    let normalizedRot = rot;
    if (normalizedRot < 0) normalizedRot += 360;

    if (normalizedRot < 60) reward = "emerald 3";
    else if (normalizedRot < 120) reward = "diamond 1";
    else if (normalizedRot < 180) reward = "iron_ingot 10";
    else if (normalizedRot < 240) reward = "gold_ingot 5";
    else if (normalizedRot < 300) reward = "cookie 5";
    else reward = "netherite_scrap 1";

    player.runCommandAsync(`give @s ${reward}`);
    player.runCommandAsync(`playsound random.levelup @s`);
    player.runCommandAsync(`particle minecraft:happy_villager ~~~`);
});

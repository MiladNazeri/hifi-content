# Avatar Entity Remover
When this script is attached to an entity as an entity script, the entity serves as an "Avatar Entity Remover", useful for removing avatar entities in a domain.

## Features
- Avatar Entity Remover will prevent new avatar entities from being added by a user when the script is running.
- Avatar Entity Remover will remove existing avatar entities from an avatar when they load the script.
- If a user of a locked avatar entity loads the script, they will be kicked to a user-configurable domain.
- Using a configuration switch, you can enable a feature that will restore all removed avatar entities when the Avatar Entity Remover script is unloaded.

## Exclusions
- You cannot whitelist avatar entity model domains - with that feature, users could simply enlarge approved wearables and use them for griefing purposes.

## Setup
1. Add an entity to your domain.
    - A giant Zone entity would work perfectly. A good place for this entity is centered around your domain's content. Its dimensions should be large enough to encompass the domain's content. You want to ensure that all visitors to your domain load this entity.
    - Note that anyone who can modify the `userData` of this entity will be able to control this script's configurable settings!
2. Add the below `userData` object to the attached entity's `userData`
    1. Set the `enableAvatarEntityRestore` `bool`.
    2. Set the `kickDomain` value in the `userData`.
    3. Set the `enableCollisionlessAvatarEntities` `bool`.
    4. Set the `configURL` value, if necessary.
3. Add a `config.json` file in the same directory as the script. See below for the format of `config.json`.
4. Add the `avatarEntityRemover.js` script to the entity

Here's the object to add to the entity's `userData`:
```
{
    "enableAvatarEntityRestore": <Optional. `true` if you want removed avatar entities to be restored when the script is unloaded; `false` otherwise. Defaults to `false`.>,
    "kickDomain": <Optional. The domain to which you want users of locked avatar entities to be moved. Defaults to "hifi://domain".>,
    "enableCollisionlessAvatarEntities": <Optional. `true` if you want to allow collisionless avatar entities in your domain; `false` otherwise. Defaults to `false`.>,
    "configURL": "<Optional. A URL to a config file, the structure of which is outlined below. >"
}
```

Here's the format of the `config.json` file:
```
{
    "approvedUsernames": [<An array of usernames that are approved to have/rez avatar entities.>]
}
```

# Releases

## 2019-03-15_10-23-00 :: [3963656](https://github.com/highfidelity/hifi-content/commit/3963656)
- Initial release
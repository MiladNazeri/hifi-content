# User Location
When this script is attached to a entity as an entity script, the entity serves as an "User Location" ticker, useful for letting people know where you are **(if you're available to them)**.

## Features
- The User Location ticker will never display the location of a user to someone that isn't able to see that user's location (i.e. the target user's availability is set to disallow location sharing to the reader)
- When a user clicks on the entity to which this script is attached, the clicker will teleport to the user whose location is displayed.

## Setup
1. Rez `userLocation.json`.
2. Modify the User Data of the `userLocation` entity as per the instructions below.

## `userLocation` Entity User Data
```
{
    "targetUsername": "<The username of the user whose location you want to display>",
    "targetDisplayName": "<The way you want the target user's name to appear to others>"
}
```

# Releases

## 2019-04-02_09-52-00 :: [0629519](https://github.com/highfidelity/hifi-content/commit/0629519)
- Initial release
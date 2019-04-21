# Halloween Domains
The content in this directory was created for the 2018 Halloween season. This folder contains code for the following projects:
* An explosion that causes a fire, smoke effect, and mannequin
* Eyes that follow where the user is when they're within a specific range
* A variety of jump-scares that are triggered with an animated model and audio effect when a user enters a specific zone
* Sound emitters with customization to create different effects 
* A flashlight spawner
* A "whisper in your ear" utility
* A ghostly statue scare

## Entities.enterEntity
Much of the halloween content is triggered by a basic [zone or box `enterEntity` call](https://docs.highfidelity.com/api-reference/namespaces/entities#.enterEntity). This API call is triggered when an avatar's collision shape enters within the bounding box of an entity. 

![](https://hifi-content.s3-us-west-1.amazonaws.com/liv/Courses/Zombies/zombies_class2.png) 

The code snippet below illustrates a basic entity script that changes color when someone walks into it.  

```
(function () {
  this.enterEntity = function (entityID) {
      print("Enter entity");
      Entities.editEntity(entityID, {
          color: { red: 255, green: 64, blue: 64 },
      });
  };
  this.leaveEntity = function (entityID) {
      print("Leave entity");
      Entities.editEntity(entityID, {
          color: { red: 128, green: 128, blue: 128 },
      });
  };
});
```

In most cases, users who experience the Halloween domains are not going to have administrative or add ('rez') permissions in our domain server. Additionally, to protect the content as it exists, we also add filters to prevent unauthorized edits. To account for these security initiatives, we offload the creation and deletion of entities to the entity script server via server entity scripts. We use [`callEntityServerMethod`](https://docs.highfidelity.com/api-reference/namespaces/entities#.callEntityServerMethod) to communicate to the entity script server when a specific trigger condition is met by a client.

There are several reasons why you would choose to put these into a server script, rather than a client script:
* A user that doesn't have rez permissions would not be able to spawn an effect
* Clients will not make conflicting synchronous edits to a position, visibility state, or other property 
* The server can maintain the state of the object without having it be different for users who may have not seen the object yet

In this directory, examples of these types of objects include the resources in the /jumpscares/ folder.

## Overlays
Several of the Halloween effects utilize [overlays](https://docs.highfidelity.com/api-reference/namespaces/overlays), which render separately for each individual user (e.g. my overlays don't show up for you). The tablet UI is an example of content built with overlays. These are helpful to use when creating pieces of content that shouldn't be visible or affected by other people in the domain with you. 

There are two main elements in the Halloween content pieces that rely on overlays: 
* Cats / eyes that watch you 
* A ghostly statue that follows you in the haunted forest

Overlays have many similar properties to entities, and can be 2D or 3D, models, shapes, web contexts, images, and text. They can be clicked on, grabbed, and made emissive or transparent. 

![](https://hifi-content.s3-us-west-1.amazonaws.com/liv/Courses/Zombies/overlays-1.png)

The cat eye overlays are added to a cat entity when the user is in a specific range. Each client has its own instance of the client script running on the model, and their own set of eye overlays. When the user is near the cat, a [script interval](https://www.w3schools.com/js/js_timing.asp) updates the rotation of the eyes to look at the user. The snippet below shows how the [Script API](https://docs.highfidelity.com/api-reference/namespaces/script) sets an interval to update the rotations.

```
interval = Script.setInterval(function() {
   Overlays.editOverlay(leftEyeOverlay, {
       rotation: Quat.cancelOutRoll(Quat.lookAtSimple(MyAvatar.getJointPosition("Head"), leftEyePosition))
   });
   Overlays.editOverlay(rightEyeOverlay, {
       rotation: Quat.cancelOutRoll(Quat.lookAtSimple(MyAvatar.getJointPosition("Head"), rightEyePosition))
   });
 }, UPDATE_EYES_INTERVAL_MS);
```

## Audio 
Audio plays a big role in an immersive experience. The Halloween domains, Zombies in particular, make heavy use of audio effects to convery mood and sentiment in the space. This directory contains three types of audio techniques that we used within the Halloween domains: 

* Audio that plays on a random interval
* Audio that loops
* Positional "whispering" audio 

High Fidelity supports the following audio types: 

* WAV: 16-bit uncompressed WAV at any sample rate, with 1 (mono), 2(stereo), or 4 (ambisonic) channels.
* MP3: Mono or stereo, at any sample rate.
* RAW: 48khz 16-bit mono or stereo. Filename must include ".stereo" to be interpreted as stereo.

![](https://hifi-content.s3-us-west-1.amazonaws.com/liv/Courses/Zombies/audio.png)

Audio files in High Fidelity can be ambisonic, stereo, or mono format, which each play back in different ways. They are downloaded and played through an audio injector. Both the sounds and the injector itself have properties that can be set to change the effects of the audio, including things like position, volume, reverb, whether or not the injector should loop the audio clip, and more.

The snippet below taken from `whisperInEar.js` shows how an audio injector plays a sound locally and sets an interval to update the position of the sound to follow a user's head:

```
var sound = SoundCache.getSound(SOUND_URL);
// Play sound
var injector = Audio.playSound(sound, {
    position: position,
    inputVolume: AUDIO_VOLUME_LEVEL,
    localOnly: true
});

// Update sound position using interval
var updatePositionInterval = Script.setInterval(function () {
var position = getPositionFromObject();
    injector.options = {
    position: position,
    inputVolume: AUDIO_VOLUME_LEVEL,
    localOnly: true
    };
}, UPDATE_POSITION_MS);
```

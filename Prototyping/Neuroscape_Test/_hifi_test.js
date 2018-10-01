var beat = 525;
console.log(beat * 1);
console.log(beat * 2);
console.log(beat * 3);
console.log(beat * 4);
console.log(beat * 5);
console.log(beat * 6);
console.log(beat * 7);
console.log(beat * 8);
console.log(beat * 9);
console.log(beat * 10);
console.log(beat * 11);
console.log(beat * 12);

console.log(beat * 11 - beat * 10);
console.log(beat / 2);
console.log( (beat * 10) - (beat / 2));
console.log( (beat * 10) + (beat / 2));

var collisionTime = 4300;
var COUNT_IN = 4;
var currentBeat =  4;
var currentBeat_Count_IN = currentBeat + COUNT_IN;
console.log(currentBeat_Count_IN);
console.log(currentBeat_Count_IN * beat);

var currentLatency = Math.abs(collisionTime - (currentBeat_Count_IN * beat));
var prevLatency = Math.abs(collisionTime - ((currentBeat_Count_IN - 1)  * beat));
var nextLatency = Math.abs(collisionTime - ((currentBeat_Count_IN + 1) * beat))
var finalLatency = Math.min(currentLatency, prevLatency, nextLatency).toFixed(0);
console.log(prevLatency);
console.log(currentLatency);
console.log(nextLatency);
console.log(finalLatency);
var currentLatency = Math.abs((currentBeat_Count_IN * beat) - collisionTime);
var prevLatency = Math.abs(((currentBeat_Count_IN -1)  * beat) - collisionTime);
var nextLatency = Math.abs(((currentBeat_Count_IN + 1) * beat) - collisionTime);
var finalLatency = Math.min(currentLatency, prevLatency).toFixed(0);
console.log(prevLatency);
console.log(currentLatency);
console.log(nextLatency);
console.log(finalLatency);

console.log(currentBeat_Count_IN * beat + currentLatency)
console.log(currentBeat_Count_IN * beat - prevLatency)



var Vector3 = new (function () {
    var self = this;
    this.EPSILON = 0.000001;
    this.EPSILON_SQUARED = self.EPSILON * self.EPSILON;
    this.PI = 3.14159265358979;
    this.ALMOST_ONE = 1.0 - self.EPSILON;
    this.PI_OVER_TWO = 1.57079632679490;

    this.cross = function (A, B) {
        return { x: (A.y * B.z - A.z * B.y), y: (A.z * B.x - A.x * B.z), z: (A.x * B.y - A.y * B.x) };
    };
    this.distance = function (A, B) {
        return Math.sqrt((A.x - B.x) * (A.x - B.x) + (A.y - B.y) * (A.y - B.y) + (A.z - B.z) * (A.z - B.z));
    };
    this.dot = function (A, B) {
        return A.x * B.x + A.y * B.y + A.z * B.z;
    };
    this.length = function (V) {
        return Math.sqrt(V.x * V.x + V.y * V.y + V.z * V.z);
    };
    this.subtract = function (A, B) {
        return { x: (A.x - B.x), y: (A.y - B.y), z: (A.z - B.z) };
    };
    this.sum = function (A, B) {
        return { x: (A.x + B.x), y: (A.y + B.y), z: (A.z + B.z) };
    };
    this.multiply = function (V, scale) {
        return { x: scale * V.x, y: scale * V.y, z: scale * V.z };
    };
    this.multiplyVbyV = function (V, V2) {
        return { x: V2.x * V.x, y: V2.y * V.y, z: V2.z * V.z };
    };
    this.normalize = function (V) {
        var L2 = V.x * V.x + V.y * V.y + V.z * V.z;
        if (L2 < self.EPSILON_SQUARED) {
            return { x: V.x, y: V.y, z: V.z };
        }
        var invL = 1.0 / Math.sqrt(L2);
        return { x: invL * V.x, y: invL * V.y, z: invL * V.z };
    };
    this.multiplyQbyV = function (Q, V) {
        var num = Q.x * 2.0;
        var num2 = Q.y * 2.0;
        var num3 = Q.z * 2.0;
        var num4 = Q.x * num;
        var num5 = Q.y * num2;
        var num6 = Q.z * num3;
        var num7 = Q.x * num2;
        var num8 = Q.x * num3;
        var num9 = Q.y * num3;
        var num10 = Q.w * num;
        var num11 = Q.w * num2;
        var num12 = Q.w * num3;
        var result = { x: 0, y: 0, z: 0 };
        result.x = (1.0 - (num5 + num6)) * V.x + (num7 - num12) * V.y + (num8 + num11) * V.z;
        result.y = (num7 + num12) * V.x + (1.0 - (num4 + num6)) * V.y + (num9 - num10) * V.z;
        result.z = (num8 - num11) * V.x + (num9 + num10) * V.y + (1.0 - (num4 + num5)) * V.z;
        return result;
    };
})();

var Quaternion = new (function () {
    var self = this;

    this.IDENTITY = function () {
        return { x: 0, y: 0, z: 0, w: 1 };
    };

    this.multiply = function (Q, R) {
        // from this page:
        // http://mathworld.wolfram.com/Quaternion.html
        return {
            w: Q.w * R.w - Q.x * R.x - Q.y * R.y - Q.z * R.z,
            x: Q.w * R.x + Q.x * R.w + Q.y * R.z - Q.z * R.y,
            y: Q.w * R.y - Q.x * R.z + Q.y * R.w + Q.z * R.x,
            z: Q.w * R.z + Q.x * R.y - Q.y * R.x + Q.z * R.w
        };
    };

    this.angleAxis = function (angle, axis) {
        var s = Math.sin(0.5 * angle);
        return { w: Math.cos(0.5 * angle), x: s * axis.x, y: s * axis.y, z: s * axis.z };
    };

    this.inverse = function (Q) {
        return { w: -Q.w, x: Q.x, y: Q.y, z: Q.z };
    };

    this.rotationBetween = function (orig, dest) {
        var v1 = Vector3.normalize(orig);
        var v2 = Vector3.normalize(dest);
        var cosTheta = Vector3.dot(v1, v2);
        var rotationAxis;
        if (cosTheta >= 1 - Vector3.EPSILON) {
            return self.IDENTITY();
        }

        if (cosTheta < -1 + Vector3.EPSILON) {
            // special case when vectors in opposite directions :
            // there is no "ideal" rotation axis
            // So guess one; any will do as long as it's perpendicular to start
            // This implementation favors a rotation around the Up axis (Y),
            // since it's often what you want to do.
            rotationAxis = Vector3.cross({ x: 0, y: 0, z: 1 }, v1);
            if (Vector3.length(rotationAxis) < Vector3.EPSILON) { // bad luck, they were parallel, try again!
                rotationAxis = Vector3.cross({ x: 1, y: 0, z: 0 }, v1);
            }
            rotationAxis = Vector3.normalize(rotationAxis);
            return self.angleAxis(Vector3.PI, rotationAxis);
        }
        // Implementation from Stan Melax's Game Programming Gems 1 article
        rotationAxis = Vector3.cross(v1, v2);

        var s = Math.sqrt((1 + cosTheta) * 2);
        var invs = 1 / s;

        return {
            w: s * 0.5,
            x: rotationAxis.x * invs,
            y: rotationAxis.y * invs,
            z: rotationAxis.z * invs
        }
    }
})();
var point1 = { x: 1, y: 0, z: 1 };
var point2 = { x: 4, y: -2, z: 2 };

// Take 2nd point - Point 2

// Subtract point 2 from point 1
var subtractedP2P1 = Vector3.subtract(point2, point1);
console.log(JSON.stringify(subtractedP2P1));
var t = null;

var multipledT = {
    x: point1.x + subtractedP2P1.x * t,
    y: point1.y + subtractedP2P1.y * t,
    z: point1.z + subtractedP2P1.z * t
};

// subtract point 2 from point 1

var normal = { x: 0, y: 1, z: 0 };
var controllerPoint = { x: 0, y: 0, z: 0 };
var subtractedPoints = Vector3.subtract(controllerPoint, point);
var dot = Vector3.dot(normal, subtractedP2P1);
console.log(JSON.stringify(dot));

console.log(JSON.stringify(subtractedPoints));
var d = Vector3.dot(subtractedPoints, normal);
console.log(JSON.stringify(d))


var V1 = { x: 0, y: 5, z: 0 };
var V2 = { x: 0, y: 4, z: 0 };
var P = { x: 0, y: 0, z: 0 };
var N = { x: 0, y: 1, z: 0 };

var pMinusV1 = Vector3.subtract(P, V1);
console.log(JSON.stringify(pMinusV1));
var numeratorNDotPMinusV1 = Vector3.dot(N, pMinusV1);
console.log(JSON.stringify(numeratorNDotPMinusV1));
var V2MinusV1 = Vector3.subtract(V2, V1);
console.log(JSON.stringify(V2MinusV1));
var denomNDotV2MinusV1 = Vector3.dot(N, V2MinusV1);
console.log(JSON.stringify(numeratorNDotPMinusV1));
// solve for u 
var u = numeratorNDotPMinusV1 / denomNDotV2MinusV1;
console.log(JSON.stringify(u));
// Intersection happens when N DOT (P1 + u(p2-p1)) = N Dot P3
// N Dot p3
var nDotP = Vector3.dot(N, P);
console.log(JSON.stringify(nDotP));
// p2 - p1
var V2minusV1 = Vector3.subtract(V2, V1);
console.log(JSON.stringify(V2minusV1));
// Multiply u by subtracting those two
var scaledV2MinusV1Byu = Vector3.multiply(V2minusV1, u);
console.log(JSON.stringify(scaledV2MinusV1Byu));
var V1PlusUScaledV2MinusV1 = Vector3.sum(V1, scaledV2MinusV1Byu);
console.log(JSON.stringify(V1PlusUScaledV2MinusV1))
var nDotV1PlusUScaledV2MinusV1 = Vector3.dot(N, V1PlusUScaledV2MinusV1);
console.log(JSON.stringify(nDotV1PlusUScaledV2MinusV1));
if (nDotV1PlusUScaledV2MinusV1 === nDotP) { console.log(true) };


var V1 = { x: 0, y: 2, z: 0 };
var V2 = { x: 0, y: -2, z: 0 };
var P = { x: 0, y: 0, z: 0};
var N = { x: 0, y: 1, z: 0 };

function findLinePlaneIntersectionCoords(V1, V2, P, N) {
    // Line is V1, V2
    // P is point on plane and N is normal 
    // The equation of a plane 
    // N dot (P - P3) = 0
    // Equation of the line 
    // P = V1 + u (V2 - V1)
    // The intersection of these two occurs when
    // N dot (V1 + u (V2 - V1)) = N dot V3
    // Solve for U
    // If it is necessary to determine the intersection of the line segment between P1 and P2 then just check that u is between 0 and 1.
    var pMinusV1 = Vector3.subtract(P, V1);
    var numeratorNDotPMinusV1 = Vector3.dot(N, pMinusV1);
    var V2MinusV1 = Vector3.subtract(V2, V1);
    var denomNDotV2MinusV1 = Vector3.dot(N, V2MinusV1);
    var u = numeratorNDotPMinusV1 / denomNDotV2MinusV1;
    var nDotP = Vector3.dot(N, P);
    var V2minusV1 = Vector3.subtract(V2, V1);
    var scaledV2MinusV1Byu = Vector3.multiply(V2minusV1, u);
    var V1PlusUScaledV2MinusV1 = Vector3.sum(V1, scaledV2MinusV1Byu);
    var nDotV1PlusUScaledV2MinusV1 = Vector3.dot(N, V1PlusUScaledV2MinusV1);
    var doLineAndPlaneIntersect = nDotV1PlusUScaledV2MinusV1 === nDotP;
    return {
        doLineAndPlaneIntersect: doLineAndPlaneIntersect,
        u: u
    };
}


console.log(JSON.stringify(findLinePlaneIntersectionCoords(V1, V2, P, N)));

var V1 = { x: 0, y: 2, z: 0 };
var V2 = { x: 0, y: -2, z: 0 };
var P = { x: 0, y: 0, z: 0};
var N = { x: 0, y: 1, z: 0 };

function findLinePlaneIntersectionCoords(V1, V2, P, N) {
    // Line is V1, V2
    // P is point on plane and N is normal 
    // The equation of a plane 
    // N dot (P - P3) = 0
    // Equation of the line 
    // P = V1 + u (V2 - V1)
    // The intersection of these two occurs when
    // N dot (V1 + u (V2 - V1)) = N dot V3
    // Solve for U
    // If it is necessary to determine the intersection of the line segment between P1 and P2 then just check that u is between 0 and 1.
    var numeratorNDotPMinusV1 = Vector3.dot(N, Vector3.subtract(P, V1));
    var denomNDotV2MinusV1 = Vector3.dot(N, Vector3.subtract(V2, V1));
    var u = numeratorNDotPMinusV1 / denomNDotV2MinusV1;
    var nDotOfPlane = Vector3.dot(N, P);
    var nDotofLine = Vector3.dot(N, Vector3.sum(V1, Vector3.multiply(Vector3.subtract(V2, V1), u)));
    var doLineAndPlaneIntersect = nDotOfPlane === nDotofLine;
    return {
        doLineAndPlaneIntersect: doLineAndPlaneIntersect,
        u: u
    };
}


console.log(JSON.stringify(findLinePlaneIntersectionCoords(V1, V2, P, N)));

var L0 = { x: 3, y: 5, z: 3 };
var L1 = { x: 2, y: -2, z: 3 };
var P0 = { x: 0, y: 0, z: 0};
var N = { x: 0, y: 1, z: 1 };

function findLinePlaneIntersectionCoords(L0, L1, P0, N) {
    // Line is L0, L1
    // Plane is point P0 with normal N
    // The equation of a plane 
    //     N dot (P0 - P) = 0
    // Equation of the line 
    //     L = L0 + u (L1 - L0)
    // The intersection of these two occurs when L = P
    //     L0 + u ( L1 - L0) = P
    // Subtrac both sides from P0 and dot with N:
    //     N dot (L0 - P0 + u(L1 - L0)) = N dot (P0 - P) = 0
    // Solve for u:
    //     u (N dot (L1 - L0)) = N dot (P0 - L0)
    //     u = (N dot (P0 - L0)) / (N dot (L1 - L0))

    var denominator = Vector3.dot(N, Vector3.subtract(L1, L0));
    if (denominator != 0.0) {
        var numerator = Vector3.dot(N, Vector3.subtract(P0, L0));
        return numerator / denominator;
    }
    return null; // or some other invalid value that can signal failure
}

console.log(JSON.stringify(findLinePlaneIntersectionCoords(L0, L1, P0, N)))
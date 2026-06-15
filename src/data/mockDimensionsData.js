// // Each door: start/end in local XZ space, plus a width label
// export function getDoors(floor) {
//     const doors = {
//       1: [
//         { id: 'd1', x1: -5.2, z1: 3.0, x2: -3.8, z2: 3.0, width: 1.4 }, //next to main stairs left 
//         { id: 'd2', x1:  2.0, z1: -6.5, x2: 2.0, z2: -5.1, width: 1.4 }, 
//         { id: 'd3', x1:  5.3, z1:  9.4, x2: 5.3, z2:  7.5, width: 0.9 }, //stairs right
//       ],
//       2: [
//         { id: 'd4', x1: -2.0, z1: 1.0, x2: 0.0, z2: 1.0, width: 2.0 },
//       ],
//     }
//     return doors[floor] ?? []
//   }

// // Helper: create a door from start position, direction axis, and length
// function door(id, x, z, length, axis = 'x', width = null, labelLength=1.0, y = null) {
//     const w = width ?? Math.abs(length)
//     const base = y !== null ? { y } : {}
//     if (axis === 'x') {
//       return { id, ...base, x1: x, z1: z, x2: x + length, z2: z, width: w, labelLen:labelLength }
//     } else {
//       return { id, ...base, x1: x, z1: z, x2: x, z2: z + length, width: w, labelLen:labelLength }
//     }
//   }

function door(id, x, z, length, options = {}) {
    const { 
      axis = 'x', 
      width = null, 
      labelLength = 1.0,
      y = null 
    } = options;
    
    const w = width ?? Math.abs(length)
    const base = y !== null ? { y } : {}
    
    if (axis === 'x') {
      return { id, ...base, x1: x, z1: z, x2: x + length, z2: z, width: w, labelLen: labelLength }
    } else {
      return { id, ...base, x1: x, z1: z, x2: x, z2: z + length, width: w, labelLen: labelLength }
    }
  }



export function getDoors(floor) {
const doors = {
    1: [
    door('d1', -4.3, 1.8, 1.3, {axis: 'z',  labelLength: 0.9 }), // next to main stairs left
    door('d2', 3.0, 1.8, 1.3, {axis: 'z',  labelLength: 0.9 }), 
    door('d3',  2.4, -2.5, 2.6, { axis: 'z', labelLength: 1.4}), // behind to main stairs left
    door('d4',  -3.9, -2.5, 2.8, { axis: 'z', labelLength: 1.4}),// behind to main stairs right
    door('d5',  -0.6, -10, 2.0, { axis: 'z'}), //private room door

    door('d6', -10.2, 1.6, 1.8, {axis: 'z',  labelLength: 1.3 }), // elevator left
    door('d7', -10.5, 5.6, 1.6, {axis: 'z',  labelLength: 1.0 , y: 2.2}), // elevator left
    door('d8', -12.7, 5.6, 1.6, {axis: 'z',  labelLength: 1.0 , y: 2.2}), // stairs next to elevator left

    door('d9', 8.8 , 1.6, 1.8, {axis: 'z',  labelLength: 1.3 }), // elevator rigth
    door('d10', 11.3 , 5.6, 1.6, {axis: 'z',  labelLength: 1.0, y: 2.2 }), // elevator right
    door('d11', 9.0, 5.6, 1.6, {axis: 'z',  labelLength: 1.0, y: 2.2 }), // stairs next to elevator right

    door('d12',  5.1, -2.2, 2.1, { axis: 'z', labelLength: 1.2}), // lockers right
    door('d13',  7.4, -1.6, 1.0, { axis: 'z', labelLength: 0.6}), // between locker + accessible toilet right
    door('d14',  10.8, -1.6, 1.1, { axis: 'z', labelLength: 1.0}), // accessible toilet right
    door('d15',  5.7, -7.9, 1.0, { axis: 'x', labelLength: 0.6}), // normal toilet w
    door('d16',  5.7, -6.2, 1.0, { axis: 'x', labelLength: 0.6}), // normal toilet m

    
    door('d46', -7.7, 8.5, 1.8, {axis: 'x',  labelLength: 1.}), // door from entry hall to elevaotr area left 
    door('d47', 4.7, 8.5, 1.8, {axis: 'x',  labelLength: 1. }), // door from entry hall to elevaotr area right 



    door('d17', -0.8 , 12.8, 3.2, {axis: 'z',  labelLength: 2.0 }), // entry door 
    door('d18', 9.0 , 10.8, 1.0, {axis: 'z',  labelLength: 0.6 , y: 2.}), // locker wardrobe right front
    door('d19', -10.2 , 10.8, 1.0, {axis: 'z',  labelLength: 0.6, y: 2. }), // empty room left opposite left elevator 

    door('d20', -14.8 , 9., 2.5, {axis: 'x',  labelLength: 1.2, y: 2.2}), // empty room left opposite left elevator 
    door('d21', -28.8 , 9., 2.5, {axis: 'x',  labelLength: 1.2, y: 2.2}), // door left wing between rooms
    door('d22', -34.1 , 1.4, 2.7, {axis: 'y',  labelLength: 1.3, y: 2.2}), // door left wing between rooms
    door('d23', -34.4 , 13.7, 3.6, {axis: 'y',  labelLength: 2.0, y:2.2}), // left front nische

    door('d24', -34.1 , -39.9, 2.7, {axis: 'y',  labelLength: 1., y: 2.2}), // door left wing between rooms
    door('d25', -36.5 , -48.5, 0.7, {axis: 'x',  labelLength: 0.2, y: 2.2}), // last room left stair to column
    door('d26', -33.9 , -49.9, 1.8, {axis: 'x',  labelLength: 1.0, y: 2.2}), // last room left stairs

    // RIGHT WING
    door('d27', 11.0 , 9, 2.5, {axis: 'x',  labelLength: 1.2 , y: 2.}), // door to right wing 
    door('d28', 24.9 , 9, 2.5, {axis: 'x',  labelLength: 1.2 , y: 2.}), // door to right wing  entry aquariums
    door('d29', 32.7 , 1.2, 2.78, {axis: 'y',  labelLength: 1.2 , y: 2.}), // door to right wing shark 
    door('d30', 28.1, -39.2, 1.6, {axis: 'y',  labelLength: 0.9 , y: 2.}), // door to right wing 

    door('d31', 29.5, -43.8, 1.0, {axis: 'y',  labelLength: 0.5 , y: 2.}), // last room column wall right wing
    door('d32', 23.9, -43.8, 1.4, {axis: 'y',  labelLength: 1. , y: 2.}), // last room column wall right wing
    door('d33', 25.2, -43.8, 1.0, {axis: 'y',  labelLength: 0.7 , y: 2.}), // right wing stairs

    door('d34', 24.8, -45.4, 2.2, {axis: 'x',  labelLength: 1.4 , y: 2.}), // last room door to stairs +elevator
    door('d35', 27.2, -47.4, 2.7, {axis: 'y',  labelLength: 1.4 , y:2.}), // last room 

    // aquarium distances:
    door('d36', 36.7 , -7.2, 1.2, {axis: 'y',  labelLength: 0.9 , y: 2.}), // shark  right side
    door('d37', 36.7 , -13.2, 1.2, {axis: 'y',  labelLength: 0.9 , y: 2.}), // shark
    door('d38', 38.3 , -22.4, 0.6, {axis: 'y',  labelLength: 0.3 , y: 2.}), // shark 
    door('d39', 37.3 , -26.4, 0.6, {axis: 'y',  labelLength: 0.5 , y: 2.}), // shark 
    door('d40', 37.3 , -34, 1.2, {axis: 'y',  labelLength: 0.9 , y: 2.}), // shark 

    door('d41', 33.8 , -22.4, 2.2, {axis: 'y',  labelLength: 1.2 , y: 2.}), // shark middle 

    door('d42', 28.7 , -11.2, 1.2, {axis: 'y',  labelLength: 0.9 , y: 2.}), // shark left side
    door('d43', 29. , -15.2, 1.2, {axis: 'y',  labelLength: 0.9 , y: 2.}), // shark 
    door('d44', 28.7 , -22.2, 1.2, {axis: 'y',  labelLength: 0.9 , y: 2.}), // shark 
    door('d45', 29.4 , -26.4, 1.2, {axis: 'y',  labelLength: 0.9 , y: 2.}), // shark 

    ],
    2: [
       
        // door('d1', 1, 16.8, 3.2, {axis: 'z',  labelLength: 2.0 }), // entry door 

        // RIGHT WING
        // door('d1', 15.0 , 9, 2.5, {axis: 'x',  labelLength: 1.2 , y: 2.}), // door to right wing 
        
        // x -2.2 y +4

        //MIDDLE
        door('d1', 0.7, -5.8, 2.7, {axis: 'y',  labelLength: 1.2, y: 2.}), // round stairs door 

        door('d2', 4.7, 5., 2.7, {axis: 'y',  labelLength: 1., y: 2.}), // right
        door('d3', -3.7, 5., 2.7, {axis: 'y',  labelLength: 1., y: 2.}), // right
        door('d4', 7., 1.7, 1.0, {axis: 'x',  labelLength: 0.7, y: 2.}), // toilets

        door('d24', 9.2, 2.2, 0.7, {axis: 'x',  labelLength: 0.6, y: 2.}), // toilet w
        door('d25', 9.2, 3.7, 0.7, {axis: 'x',  labelLength: 0.6, y: 2.}), // toilet m

        door('d26', -11 , 9., 1.6, {axis: 'y',  labelLength: 1 , y: 2.}), // stairs left
        door('d27', -6.4 , 9., 1.6, {axis: 'y',  labelLength: 1 , y: 2.}), // stairs left
        door('d28', -8.8 , 9., 1.6, {axis: 'y',  labelLength: 1.0 , y: 2.}), // elevator left


        door('d29', 12.8 , 9., 1.6, {axis: 'y',  labelLength: 1 , y: 2.}), // stairs right
        door('d30', 10.7 , 9., 1.6, {axis: 'y',  labelLength: 1 , y: 2.}), //  elevator right stairs right
        door('d31', 8.2 , 9., 1.6, {axis: 'y',  labelLength: 1.0 , y: 2.}), // stairs right




        //LEFT WING
        door('d5', -6.9 , 12.9, 2.9, {axis: 'x',  labelLength: 1.2 , y: 2.}), // door to left wing 
        door('d6', -9.5 , 14.2, 2.3, {axis: 'y',  labelLength: 1 , y: 2.}), // door to left wing 
        door('d7', -13.7 , 12.7, 2.9, {axis: 'x',  labelLength: 1.2, y: 2.}), // door to left wing 
        door('d8', -27.6 , 12.7, 2.9, {axis: 'x',  labelLength: 1.2 , y: 2.}), // door to left wing 
        
        door('d9', -32.9 , 5., 2.9, {axis: 'y',  labelLength: 1.2 , y: 2.}), // door to left wing
        door('d10', -32.7 , -36.6, 2.9, {axis: 'y',  labelLength: 1.2 , y: 2.}), // door to left wing 

        door('d11', -32.7 , -45, 1.9, {axis: 'x',  labelLength: 1. , y: 2.}), // last room stairs
        // door('d12', -31.3 , -45.3, 2.3, {axis: 'y',  labelLength: 1. , y: 2.}), // last room  col to stairs



        // RIGHT WING
        door('d13', 5.6 , 13, 2.5, {axis: 'x',  labelLength: 1.2 , y: 2.}), // door to right wing 
        door('d14', 10.5 , 14.4, 1.7, {axis: 'y',  labelLength: 1 , y: 2.}), // door to right wing 


        door('d15', 12.6 , 12.7, 2.9, {axis: 'x',  labelLength: 1.2 , y: 2.}), // door to right wing 
        door('d16', 26.6 , 12.7, 2.9, {axis: 'x',  labelLength: 1.2 , y: 2.}), // 
        
        door('d17', 34.5 , 5., 2.9, {axis: 'y',  labelLength: 1.2 , y: 2.}), // 
        door('d18', 34.7 , -28.2, 2., {axis: 'y',  labelLength: 1.2 , y: 2.}), // 

        //last rooms
        door('d19', 29.7 , -28.2, 1.7, {axis: 'y',  labelLength: 1. , y: 2.}), // 
        door('d20', 27 , -41.2, 1.0, {axis: 'y',  labelLength: 0.7 , y: 2.}), // stairs right behind 
        door('d21', 25.7 , -40.2, 1.5, {axis: 'y',  labelLength: 1.0 , y: 2.}), // stairs right behind 

        door('d22', 31.7 , -40.2, 1.3, {axis: 'y',  labelLength: 0.5 , y: 2.}), // last room right winf col-> wall
        door('d23', 29.2 , -44.6, 2.7, {axis: 'y',  labelLength: 1.2 , y: 2.}), // last room right winf col-> wall
    
    ],
}
return doors[floor] ?? []
}
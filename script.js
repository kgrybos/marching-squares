const width = window.innerWidth;
const height = window.innerHeight;
const scale = 300;
const square_size = 10;
const cutoff = 0;

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
ctx.canvas.width  = width;
ctx.canvas.height = height;

noise.seed(Math.random());

const imageData = ctx.createImageData(width, height);
for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const i = (x + y * width) * 4;
      const value = (noise.simplex2(x/scale, y/scale) + 1) * 128;
      imageData.data[i] = value;
      imageData.data[i + 1] = value;
      imageData.data[i + 2] = value;
      imageData.data[i + 3] = 255;
    }
  }
ctx.putImageData(imageData, 0, 0);

function square_side_coord(side, weights) {
    switch(side) {
        case 0:
            return [weights[0], 0]
        case 1:
            return [1, weights[1]]
        case 2:
            return [weights[2], 1]
        case 3:
            return [0, weights[3]]
    }
}

function draw_line(ctx, a, b) {
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke(); 
}

function draw_square(ctx, square, weights, position, size) {
    // console.log(square)
    for(line of square) {
        line = line.map(side =>
            square_side_coord(side, weights)    
        )
        console.log(line)
        line = line.map(point => 
            [
                point[0]*size + position[0],
                point[1]*size + position[1]
            ]
        )
        draw_line(ctx, line[0], line[1])
    }
}

let samples = []
for(let x = 0; x < width; x += square_size){
    row = []
    for(let y = 0; y < height; y += square_size) {
        const value = noise.simplex2(x/scale, y/scale)
        row.push(value)
    }
    samples.push(row)
}

function interpolation(a, b) {
    const value = Math.abs(a+b)/2
    // console.log(values)
    const direction = b > a ? 1 : -1
    return 0.5 + direction*value
}

// console.log(samples)
for(let x = 0; x < samples.length-2; x += 1) {
    for(let y = 0; y < samples[x].length-2; y += 1) {
        let mask = 0
        mask |= (samples[x][y] > cutoff ? 1 : 0)*8
        mask |= (samples[x+1][y] > cutoff ? 1 : 0)*4
        mask |= (samples[x+1][y+1] > cutoff ? 1 : 0)*2
        mask |= (samples[x][y+1] > cutoff ? 1 : 0)
        square = squares_table[mask]

        weights = [ 
            interpolation(samples[x][y], samples[x+1][y]),
            interpolation(samples[x+1][y], samples[x+1][y+1]),
            interpolation(samples[x][y+1], samples[x+1][y+1]),
            interpolation(samples[x][y], samples[x][y+1]),
        ]
        // console.log(weights)

        position = [
            x*square_size,
            y*square_size
        ]
        draw_square(ctx, square, weights, position, square_size)
    }
}

// TEST
// const MARGIN = 50
// const SIZE = 100
// for(let y = 0; y < 4; y++) {
//     for(let x = 0; x < 4; x++) {
//         square = squares_table[x + y*4]
//         position = [
//             x*SIZE + x*MARGIN + 100,
//             y*SIZE + y*MARGIN + 100
//         ]
//         console.log(position)
//         ctx.beginPath();
//         ctx.rect(position[0], position[1], SIZE, SIZE);
//         ctx.stroke();
//         draw_square(ctx, square, position, SIZE)
//     }
// }
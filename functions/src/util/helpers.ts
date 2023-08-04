import { CanvasRenderingContext2D, createCanvas, loadImage, registerFont } from 'canvas';
import * as path from 'path';

export async function createThumbnail(imageUrl: string, title: string, subtitle: string): Promise<Buffer> {
    // Step 1: Pre-load font
    registerFont(path.join(__dirname, '../assets/fonts/Poppins-Black.ttf'), { family: 'Poppins', weight: '900' });
    registerFont(path.join(__dirname, '../assets/fonts/Poppins-Regular.ttf'), { family: 'Poppins', weight: '500' });

    // Step 2: Create a canvas and load the image
    // Note: 1200x630 is the recommended resolution for thumbnails
    const canvas = createCanvas(1200, 630);
    const ctx = canvas.getContext('2d');
    const image = await loadImage(imageUrl);

    // Step 3: Draw the background image on the canvas, scaling it to cover the entire area
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imageAspectRatio = image.width / image.height;
    const canvasAspectRatio = canvas.width / canvas.height;

    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;

    if (imageAspectRatio > canvasAspectRatio) {
        scale = canvas.height / image.height;
        offsetX = (canvas.width - image.width * scale) / 2;
    } else {
        scale = canvas.width / image.width;
        offsetY = (canvas.height - image.height * scale) / 2;
    }

    ctx.drawImage(image, offsetX, offsetY, image.width * scale, image.height * scale);

    // Step 4: Create a dark linear gradient and fill the entire canvas
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#000000B3'); // Start color
    gradient.addColorStop(0.5, '#00000059'); // Middle color
    gradient.addColorStop(1, '#000000E6'); // End color

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Step 5: Define font style for the subtitle and draw it
    ctx.font = `500 30px 'Poppins'`; // fontWeight fontSize fontFamily
    ctx.fillStyle = '#FFFFFFCC'; // color
    // Draw the title at (50, 550) with max width of 1000 and fontSize of 30
    const subtitleEndY = drawWrappedText(ctx, subtitle, 50, 550, 900, 30);

    // Step 6: Define font style for the title and draw it
    ctx.font = `900 60px 'Poppins'`;
    ctx.fillStyle = '#FFFFFF';
    // Draw the title on top of subtitle (with 15px spacing) with max width of 1000 and fontSize of 60
    drawWrappedText(ctx, title.toUpperCase(), 50, subtitleEndY - 15, 900, 60);

    // Step 7: Draw the overlay logo in the top left corner
    const overlayLogo = await loadImage(path.join(__dirname, '../assets/images/invertase.svg'));
    ctx.drawImage(overlayLogo, 50, 50, overlayLogo.width, overlayLogo.height);

    // Step 8: Compress the resulting image and return it as a buffer
    return canvas.toBuffer('image/jpeg', { quality: 0.75 });
}

function drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, fontSize: number) {
    const words = text.split(' ');
    let line = '';
    const lineHeight = 10;

    for (let i = words.length - 1; i >= 0; i--) {
        const testLine = words[i] + ' ' + line;
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth) {
            ctx.fillText(line, x, y);
            line = words[i] + ' ';
            y -= fontSize + lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);

    // Returns the Y-position of the text so we know where to put the next element
    return y - fontSize - lineHeight;
}
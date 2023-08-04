import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getStorage, getDownloadURL } from 'firebase-admin/storage';
import * as fs from "fs";
import * as path from 'path';
import * as queryString from 'query-string';

import { createThumbnail } from "./util/helpers";

const app = admin.initializeApp();
const firestore = admin.firestore(app);

exports.post = functions.https.onRequest(async (req, res) => {
    // Get post ID from url params
    const params = req.url.split('/');
    const postID = params[params.length - 1].trim();
    if (!postID) {
        res.status(404).send('Post not found.');
    }

    // Get the post snapshot from Firestore
    const postSnapshot = await firestore.doc(`posts/${postID}`).get();

    // Check if the post exists
    if (!postSnapshot.exists) {
        res.status(404).send('Post not found.');
        return;
    }

    // Extract the data from the post
    const postData = postSnapshot.data()!;

    // Create query params for the thumbnail
    const queryParams = queryString.stringify({
        imagePath: postData.imagePath,
        title: postData.title,
        subtitle: postData.subtitle
    });
    const imageUrl = `https://${req.headers.host}/thumbnail?${queryParams}`;

    // Return HTML file with metadata variables
    const templatePath = path.join(__dirname, './assets/html/post.html');
    var source = fs.readFileSync(templatePath, { encoding: 'utf-8' })
        .replaceAll('{{title}}', postData.title)
        .replaceAll('{{subtitle}}', postData.subtitle)
        .replaceAll('{{imageUrl}}', imageUrl);

    res.status(200).send(source);
});

exports.thumbnail = functions.https.onRequest(async (req, res) => {
    const { imagePath, title, subtitle } = req.query;

    try {
        // Get post image url from Storage
        const imageRef = getStorage(app).bucket().file(imagePath as string);
        const imageUrl = await getDownloadURL(imageRef);

        // Create post thumbnail
        const thumbnail = await createThumbnail(imageUrl, title as string, subtitle as string);

        // Attach created thumbnail to the response
        res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': Buffer.byteLength(thumbnail)
        }).end(thumbnail);

    } catch (error) {
        console.error("Error fetching object: ", error);
        res.status(500).send("Error fetching object");
    }
});
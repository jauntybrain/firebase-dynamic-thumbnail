# Creating Dynamic Thumbnails with Firebase
![Alt text](public/thumbnail-example.jpeg)
This project aims to demonstrate how to generate and serve dynamic image thumbnails using Firestore, Cloud Storage, Hosting, and Cloud Functions.

# Installation
To get started with this project, follow these simple steps:

## Clone the repository:

```
git clone https://github.com/jauntybrain/firebase-dynamic-thumbnail.git
```

## Install the required dependencies:
```
cd firebase-dynamic-thumbnail/functions
npm install
```

## Configure Firebase: 
Ensure you have set up a Firebase project and initialized it in the Firebase CLI.
> To find out more, follow the [tutorial](coming-soon.com).

## Additional setup:
If you are using macOS, you have to follow additional steps for node-canvas to work. Run the following commands:
```
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
xcode-select --install
```

## Deploy the Firebase Cloud Functions:
```
npm run deploy
```

const path = require("path");

const folders = {
    LOGOS: "logos",
    AVATARS: "avatars",
    SIGNATURES: "signatures"
}
const storages = {
    logo: require("./logo.storage"),
    avatar: require("./avatar.storage"),
    signature: require("./signature.storage")
}
const makeFilePathFromService = (fileName, bucket = folders.LOGOS) => {
    return `/uploads/${bucket}/${fileName}`;
}
const getRouteFromFolder = (folder) => {
    return `/uploads/${folder}`;
}
const getStoragePath = (url) => {
    const storageRoot = process.env.NETWORK_STORAGE_PATH || path.join(process.cwd(), "uploads");
    if (url) {
        const relativePath = url.replace(/^\/?uploads\//, "");
        return path.join(storageRoot, relativePath);
    }
    return storageRoot;
}
module.exports = { makeFilePathFromService, folders, storages, getRouteFromFolder, getStoragePath }
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
module.exports = { makeFilePathFromService, folders, storages, getRouteFromFolder }